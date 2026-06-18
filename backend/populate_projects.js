const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PROJECT_TITLES = [
    'Road Construction Phase 1',
    'Community Hall Construction',
    'Water Supply Pipeline',
    'School Building Renovation',
    'Solar Street Lights Installation',
    'Drainage System Upgrade',
    'Health Center Construction',
    'Public Park Development',
    'Anganwadi Center Repair',
    'Market Complex Construction'
];

const LOCATIONS = [
    'North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Area',
    'Village A', 'Village B', 'Block C', 'Sector 5', 'Main Road'
];

const STATUSES = ['Pending', 'In Progress', 'Completed', 'Not Started'];

async function populateProjects() {
    console.log('🚀 Starting project population...');

    try {
        // 1. Get all Implementing Agencies (grouped by state)
        const { data: agencies, error: agencyError } = await supabase
            .from('implementing_agencies')
            .select('id, state_name, district_name, agency_name');

        if (agencyError) throw agencyError;

        console.log(`Found ${agencies.length} implementing agencies.`);

        // 2. Get all Executing Agencies (to assign randomly)
        const { data: executingAgencies, error: eaError } = await supabase
            .from('executing_agencies')
            .select('id, state_name');

        if (eaError) throw eaError;

        // Group EAs by state for correct assignment
        const eaByState = {};
        executingAgencies.forEach(ea => {
            if (!eaByState[ea.state_name]) eaByState[ea.state_name] = [];
            eaByState[ea.state_name].push(ea.id);
        });

        let totalAdded = 0;

        // 3. Create projects for each agency
        // We'll limit to creating 2-3 projects per agency to avoid explosion, 
        // but ensure every state gets good coverage.

        const projectsToInsert = [];

        for (const agency of agencies) {
            // Skip if no EAs in this state (shouldn't happen after our previous fix)
            const stateEAs = eaByState[agency.state_name] || [];
            if (stateEAs.length === 0) continue;

            // Create 2 random projects for this agency
            for (let i = 0; i < 2; i++) {
                const randomEA = stateEAs[Math.floor(Math.random() * stateEAs.length)];
                const title = PROJECT_TITLES[Math.floor(Math.random() * PROJECT_TITLES.length)];
                const location = `${LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]} - ${agency.district_name || 'District'}`;
                const amount = Math.floor(Math.random() * 9000000) + 1000000; // 10L to 1Cr
                const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];

                projectsToInsert.push({
                    title: title,
                    location: location,
                    implementing_agency_id: agency.id,
                    executing_agency_id: randomEA,
                    amount: amount,
                    status: status,
                    funds_released: status === 'Not Started' ? 0 : Math.floor(amount * 0.4),
                    created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(), // Random past date
                    deadline: new Date(Date.now() + Math.floor(Math.random() * 10000000000)).toISOString() // Random future date
                });
            }
        }

        console.log(`Preparing to insert ${projectsToInsert.length} projects...`);

        // Insert in batches of 100
        for (let i = 0; i < projectsToInsert.length; i += 100) {
            const batch = projectsToInsert.slice(i, i + 100);
            const { error: insertError } = await supabase
                .from('work_orders')
                .insert(batch);

            if (insertError) {
                console.error('Error inserting batch:', insertError.message);
            } else {
                totalAdded += batch.length;
                process.stdout.write('.');
            }
        }

        console.log(`\n✅ Successfully added ${totalAdded} projects!`);

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

populateProjects();
