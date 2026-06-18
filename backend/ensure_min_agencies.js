const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Agency types and suffixes for realistic names
const AGENCY_TYPES = [
    'Welfare Department',
    'Development Corporation',
    'SC/ST Development Corp',
    'Rural Development Agency',
    'Urban Development Authority',
    'Social Justice Dept',
    'Tribal Welfare Society',
    'Minority Finance Corp',
    'Housing Board',
    'Infrastructure Corp'
];

async function ensureMinAgencies() {
    console.log('🔍 Checking agency counts per state...\n');

    try {
        // 1. Get all states
        const { data: allStates, error: statesError } = await supabase
            .from('states')
            .select('id, name')
            .order('name');

        if (statesError) {
            console.error('Error fetching states:', statesError);
            return;
        }

        // 2. Get all agencies
        const { data: agencies, error: agenciesError } = await supabase
            .from('implementing_agencies')
            .select('id, state_name');

        if (agenciesError) {
            console.error('Error fetching agencies:', agenciesError);
            return;
        }

        // Count agencies per state
        const stateCounts = {};
        allStates.forEach(s => stateCounts[s.name] = 0);

        agencies.forEach(a => {
            if (a.state_name) {
                stateCounts[a.state_name] = (stateCounts[a.state_name] || 0) + 1;
            }
        });

        // 3. Add missing agencies
        let totalAdded = 0;
        const MIN_AGENCIES = 5;

        for (const state of allStates) {
            const currentCount = stateCounts[state.name] || 0;
            const needed = MIN_AGENCIES - currentCount;

            if (needed <= 0) {
                console.log(`✅ ${state.name}: Has ${currentCount} agencies (OK)`);
                continue;
            }

            console.log(`\n📝 ${state.name}: Has ${currentCount}, adding ${needed} more...`);

            for (let i = 0; i < needed; i++) {
                // Generate realistic name
                const typeIndex = (currentCount + i) % AGENCY_TYPES.length;
                const agencyType = AGENCY_TYPES[typeIndex];
                const agencyName = `GOV - ${state.name} ${agencyType}`;

                // Create clean code for email
                const stateCode = state.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');
                const uniqueSuffix = Math.floor(Math.random() * 10000);
                const email = `ia.${stateCode}.${uniqueSuffix}@pmajay.gov.in`;
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
                        role: 'implementing_agency',
                        updated_at: new Date()
                    });

                if (profileError) {
                    console.error(`   ❌ Error updating profile:`, profileError.message);
                }

                // 3. Create Agency Record
                const agencyData = {
                    agency_name: agencyName,
                    state_name: state.name,
                    state_id: state.id,
                    agency_type: 'Govt Body',
                    district_name: null,
                    district_id: null,
                    email: email,
                    user_id: userId
                };

                const { error: insertError } = await supabase
                    .from('implementing_agencies')
                    .insert([agencyData]);

                if (insertError) {
                    console.error(`   ❌ Error inserting agency:`, insertError.message);
                } else {
                    console.log(`   ✅ Added: ${agencyName}`);
                    totalAdded++;
                }
            }
        }

        console.log(`\n🎉 Process Complete! Added ${totalAdded} new agencies.`);

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

ensureMinAgencies();
