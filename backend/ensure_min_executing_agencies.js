const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const AGENCY_TYPES = [
    'Construction Ltd',
    'Infrastructure Pvt Ltd',
    'Builders Group',
    'Engineering Works',
    'Projects Ltd',
    'Solutions Pvt Ltd',
    'Developers',
    'Contractors Association',
    'Civil Works',
    'Tech Services'
];

async function ensureMinExecutingAgencies() {
    console.log('🔍 Checking executing agency counts per district...\n');

    try {
        // 1. Get all districts with state info
        const { data: districts, error: districtsError } = await supabase
            .from('districts')
            .select('id, name, state_id, states(name)')
            .order('name');

        if (districtsError) {
            console.error('Error fetching districts:', districtsError);
            return;
        }

        console.log(`Found ${districts.length} districts.`);

        // 2. Get all executing agencies
        const { data: agencies, error: agenciesError } = await supabase
            .from('executing_agencies')
            .select('id, district_name, state_name');

        if (agenciesError) {
            console.error('Error fetching agencies:', agenciesError);
            return;
        }

        // Count agencies per district (using district_name + state_name as key to be safe)
        const districtCounts = {};
        agencies.forEach(a => {
            if (a.district_name && a.state_name) {
                const key = `${a.district_name}|${a.state_name}`;
                districtCounts[key] = (districtCounts[key] || 0) + 1;
            }
        });

        // 3. Add missing agencies
        let totalAdded = 0;
        const MIN_AGENCIES = 5;
        let processedDistricts = 0;

        for (const district of districts) {
            const stateName = district.states?.name;
            if (!stateName) continue;

            const key = `${district.name}|${stateName}`;
            const currentCount = districtCounts[key] || 0;
            const needed = MIN_AGENCIES - currentCount;

            if (needed <= 0) {
                // console.log(`✅ ${district.name}, ${stateName}: Has ${currentCount} agencies (OK)`);
                continue;
            }

            console.log(`\n📝 ${district.name}, ${stateName}: Has ${currentCount}, adding ${needed} more...`);

            for (let i = 0; i < needed; i++) {
                const typeIndex = (currentCount + i) % AGENCY_TYPES.length;
                const agencyType = AGENCY_TYPES[typeIndex];
                const agencyName = `EA - ${district.name} ${agencyType}`;

                // Clean codes
                const districtCode = district.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');
                const stateCode = stateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');
                const uniqueSuffix = Math.floor(Math.random() * 100000);
                const email = `ea.${stateCode}.${districtCode}.${uniqueSuffix}@pmajay.gov.in`;
                const password = process.env.DEFAULT_AGENCY_PASSWORD || 'Temp@' + Math.random().toString(36).slice(-8);

                // 1. Create Auth User
                let userId;
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                    email: email,
                    password: password,
                    email_confirm: true
                });

                if (authError) {
                    console.error(`   ❌ Error creating user ${email}:`, authError.message);
                    continue;
                }
                userId = authData.user.id;

                // 2. Create/Update Profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: userId,
                        full_name: agencyName,
                        role: 'executing_agency',
                        username: email.split('@')[0],
                        updated_at: new Date()
                    });

                if (profileError) {
                    console.error(`   ❌ Error updating profile:`, profileError.message);
                }

                // 3. Create Executing Agency Record
                const agencyData = {
                    agency_name: agencyName,
                    state_name: stateName,
                    district_name: district.name,
                    email: email,
                    user_id: userId,
                    status: 'Active',
                    agency_officer: `${district.name} EA Officer`
                };

                const { error: insertError } = await supabase
                    .from('executing_agencies')
                    .insert([agencyData]);

                if (insertError) {
                    console.error(`   ❌ Error inserting agency:`, insertError.message);
                } else {
                    console.log(`   ✅ Added: ${agencyName}`);
                    totalAdded++;
                }
            }

            processedDistricts++;
            if (processedDistricts % 10 === 0) {
                console.log(`...Processed ${processedDistricts} districts...`);
            }
        }

        console.log(`\n🎉 Process Complete! Added ${totalAdded} new executing agencies.`);

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

ensureMinExecutingAgencies();
