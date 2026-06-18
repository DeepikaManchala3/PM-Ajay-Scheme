const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMissingStateAgencies() {
    console.log('🔍 Checking for states without implementing agencies...\n');

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

        console.log(`Found ${allStates.length} states in database\n`);

        // 2. Get states that already have agencies
        const { data: agencies, error: agenciesError } = await supabase
            .from('implementing_agencies')
            .select('state_name');

        if (agenciesError) {
            console.error('Error fetching agencies:', agenciesError);
            return;
        }

        const statesWithAgencies = new Set(agencies.map(a => a.state_name));
        console.log(`States with agencies (${statesWithAgencies.size}):`, Array.from(statesWithAgencies).sort());

        // 3. Find states without agencies
        const statesWithoutAgencies = allStates.filter(s => !statesWithAgencies.has(s.name));
        console.log(`\nStates WITHOUT agencies (${statesWithoutAgencies.length}):`, statesWithoutAgencies.map(s => s.name));

        if (statesWithoutAgencies.length === 0) {
            console.log('\n✅ All states already have implementing agencies!');
            return;
        }

        console.log(`\n📝 Adding nodal agencies for ${statesWithoutAgencies.length} states...\n`);

        // 4. Add a state-level nodal agency for each missing state
        let added = 0;
        let errors = 0;

        for (const state of statesWithoutAgencies) {
            // Create a clean state code from state name
            const stateCode = state.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');
            const email = `nodal.${stateCode}@pmajay.gov.in`;
            const password = process.env.DEFAULT_AGENCY_PASSWORD || 'Temp@' + Math.random().toString(36).slice(-8);

            console.log(`Creating user for ${state.name} (${email})...`);

            // 1. Create Auth User
            let userId;
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true
            });

            if (authError) {
                if (authError.message.includes('already been registered')) {
                    console.log(`   User already exists, fetching ID...`);
                    // Fetch existing user
                    // Since we are admin, we can list users or just try to sign in? 
                    // Better to use listUsers with filter if possible, or just assume we can't get ID easily without listUsers permission?
                    // Actually, supabase.auth.admin.listUsers() is available.

                    // But simpler: just use a known password or try to get user by email if possible.
                    // Unfortunately getByEmail isn't a direct method on admin.
                    // We can use listUsers.
                    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
                    if (listError) {
                        console.error(`❌ Error listing users to find ${email}:`, listError.message);
                        errors++;
                        continue;
                    }
                    const existingUser = listData.users.find(u => u.email === email);
                    if (existingUser) {
                        userId = existingUser.id;
                        console.log(`   Found existing user: ${userId}`);
                    } else {
                        console.error(`❌ Could not find existing user for ${email}`);
                        errors++;
                        continue;
                    }
                } else {
                    console.error(`❌ Error creating user for ${state.name}:`, authError.message);
                    errors++;
                    continue;
                }
            } else {
                userId = authData.user.id;
                console.log(`   User created: ${userId}`);
            }

            // 2. Create/Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    full_name: `${state.name} Nodal Agency`,
                    role: 'implementing_agency',
                    updated_at: new Date()
                });

            if (profileError) {
                console.error(`❌ Error updating profile for ${state.name}:`, profileError.message);
                // Continue anyway, might have worked via trigger
            }

            // 3. Create Implementing Agency Record
            const agencyData = {
                agency_name: `GOV - ${state.name} (Nodal Agency)`,
                state_name: state.name,
                state_id: state.id,
                agency_type: 'Nodal Agency',
                district_name: null,
                district_id: null,
                email: email,
                user_id: userId
            };

            const { error: insertError } = await supabase
                .from('implementing_agencies')
                .insert([agencyData]);

            if (insertError) {
                console.error(`❌ Error adding agency for ${state.name}:`, JSON.stringify(insertError, null, 2));
                errors++;
            } else {
                console.log(`✅ Added agency: ${agencyData.agency_name}`);
                added++;
            }
        }

        console.log(`\n✅ Complete!`);
        console.log(`   Added: ${added}`);
        console.log(`   Errors: ${errors}`);
        console.log(`   Total states: ${allStates.length}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

addMissingStateAgencies();
