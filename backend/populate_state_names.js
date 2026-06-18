const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function populateStateNames() {
    console.log('🔄 Starting to populate state_name for implementing agencies...\n');

    try {
        // 1. Get all agencies without state_name but with district_id
        const { data: agencies, error: fetchError } = await supabase
            .from('implementing_agencies')
            .select('id, agency_name, district_id, district_name, state_name')
            .not('district_id', 'is', null);

        if (fetchError) {
            console.error('Error fetching agencies:', fetchError);
            return;
        }

        console.log(`Found ${agencies.length} agencies with district_id`);

        // 2. Get all districts with their state info
        const { data: districts, error: distError } = await supabase
            .from('districts')
            .select('id, name, state_id, states(name)');

        if (distError) {
            console.error('Error fetching districts:', distError);
            return;
        }

        // Create a map of district_id -> state_name
        const districtMap = {};
        districts.forEach(d => {
            if (d.states && d.states.name) {
                districtMap[d.id] = d.states.name;
            }
        });

        console.log(`Found ${Object.keys(districtMap).length} districts with state info\n`);

        // 3. Update agencies
        let updated = 0;
        let skipped = 0;

        for (const agency of agencies) {
            if (!agency.district_id || agency.state_name) {
                skipped++;
                continue;
            }

            const stateName = districtMap[agency.district_id];
            if (!stateName) {
                console.log(`⚠️  No state found for district_id: ${agency.district_id} (${agency.agency_name})`);
                skipped++;
                continue;
            }

            // Update the agency
            const { error: updateError } = await supabase
                .from('implementing_agencies')
                .update({ state_name: stateName })
                .eq('id', agency.id);

            if (updateError) {
                console.error(`❌ Error updating ${agency.agency_name}:`, updateError.message);
            } else {
                console.log(`✅ Updated: ${agency.agency_name} -> ${stateName}`);
                updated++;
            }
        }

        console.log(`\n✅ Update complete!`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Total: ${agencies.length}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

populateStateNames();
