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

async function fixExecutingAgencies() {
    console.log('🔧 Fixing executing agencies (Target: 10 per state)...\n');

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

        // 2. Get all executing agencies
        const { data: agencies, error: agenciesError } = await supabase
            .from('executing_agencies')
            .select('id, agency_name, state_name, district_name');

        if (agenciesError) {
            console.error('Error fetching agencies:', agenciesError);
            return;
        }

        // Group by state
        const stateAgencies = {};
        allStates.forEach(s => stateAgencies[s.name] = []);

        agencies.forEach(a => {
            if (a.state_name) {
                if (!stateAgencies[a.state_name]) stateAgencies[a.state_name] = [];
                stateAgencies[a.state_name].push(a);
            }
        });

        const TARGET_COUNT = 10;
        let totalDeleted = 0;
        let totalAdded = 0;

        for (const state of allStates) {
            const currentAgencies = stateAgencies[state.name] || [];
            const count = currentAgencies.length;

            console.log(`\nProcessing ${state.name} (Current: ${count})...`);

            if (count > TARGET_COUNT) {
                // DELETE EXCESS
                const toDelete = currentAgencies.slice(TARGET_COUNT);
                const deleteIds = toDelete.map(a => a.id);

                console.log(`   🗑️ Deleting ${deleteIds.length} excess agencies...`);

                const { error: deleteError } = await supabase
                    .from('executing_agencies')
                    .delete()
                    .in('id', deleteIds);

                if (deleteError) {
                    console.error(`   ❌ Error deleting:`, deleteError.message);
                } else {
                    console.log(`   ✅ Deleted ${deleteIds.length} records.`);
                    totalDeleted += deleteIds.length;
                }
            } else if (count < TARGET_COUNT) {
                // ADD MISSING
                const needed = TARGET_COUNT - count;
                console.log(`   ➕ Adding ${needed} new agencies...`);

                // Get a district for this state to use as default
                const { data: districts } = await supabase
                    .from('districts')
                    .select('name')
                    .eq('state_id', state.id)
                    .limit(1);

                const districtName = districts && districts.length > 0 ? districts[0].name : 'State Level';

                for (let i = 0; i < needed; i++) {
                    const typeIndex = (count + i) % AGENCY_TYPES.length;
                    const agencyType = AGENCY_TYPES[typeIndex];
                    const uniqueSuffix = Math.floor(Math.random() * 10000);
                    const agencyName = `EA - ${state.name} ${agencyType} ${uniqueSuffix}`;

                    // Clean codes
                    const stateCode = state.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');
                    const email = `ea.${stateCode}.${uniqueSuffix}@pmajay.gov.in`;
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
                        // Ignore profile errors for now as they might be duplicates or minor
                    }

                    // 3. Create Agency Record
                    const agencyData = {
                        agency_name: agencyName,
                        state_name: state.name,
                        district_name: districtName,
                        email: email,
                        user_id: userId,
                        status: 'Active',
                        agency_officer: `${state.name} EA Officer`
                    };

                    const { error: insertError } = await supabase
                        .from('executing_agencies')
                        .insert([agencyData]);

                    if (insertError) {
                        console.error(`   ❌ Error inserting:`, insertError.message);
                    } else {
                        console.log(`   ✅ Added: ${agencyName}`);
                        totalAdded++;
                    }
                }
            } else {
                console.log(`   ✅ Count is exactly 10. No changes.`);
            }
        }

        console.log(`\n🎉 Process Complete!`);
        console.log(`   Deleted: ${totalDeleted}`);
        console.log(`   Added: ${totalAdded}`);

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

fixExecutingAgencies();
