const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncApprovedProjects() {
    console.log('🔄 Syncing approved projects to approved_projects table...');

    try {
        // 1. Fetch all proposals with status APPROVED_BY_MINISTRY
        const { data: proposals, error: fetchError } = await supabase
            .from('district_proposals')
            .select('*')
            .eq('status', 'APPROVED_BY_MINISTRY');

        if (fetchError) {
            console.error('❌ Error fetching proposals:', fetchError.message);
            return;
        }

        console.log(`📊 Found ${proposals.length} approved proposals.`);

        for (const p of proposals) {
            console.log(`Processing: ${p.project_name} (ID: ${p.id})`);

            // Fetch district and state info manually
            let districtName = 'Unknown';
            let stateName = 'Unknown';

            if (p.district_id) {
                const { data: districtInfo } = await supabase
                    .from('districts')
                    .select('name, state_id')
                    .eq('id', p.district_id)
                    .single();

                if (districtInfo) {
                    districtName = districtInfo.name;

                    const { data: stateInfo } = await supabase
                        .from('states')
                        .select('name')
                        .eq('id', districtInfo.state_id)
                        .single();

                    if (stateInfo) {
                        stateName = stateInfo.name;
                    }
                }
            }

            const approvedProjectData = {
                proposal_id: p.id,
                state_name: stateName,
                district_name: districtName,
                project_name: p.project_name,
                component: p.component,
                estimated_cost: p.estimated_cost,
                allocated_amount: p.allocated_amount || p.estimated_cost, // Fallback
                total_amount: p.allocated_amount || p.estimated_cost, // Also set total_amount
                minimum_allocation: p.allocated_amount || p.estimated_cost, // Also set minimum_allocation
                released_amount: p.released_amount || 0,
                remaining_fund: (p.allocated_amount || p.estimated_cost) - (p.released_amount || 0),
                approved_at: p.approved_at || new Date().toISOString()
            };

            // Upsert into approved_projects
            const { error: upsertError } = await supabase
                .from('approved_projects')
                .upsert(approvedProjectData, { onConflict: 'proposal_id' });

            if (upsertError) {
                console.error(`❌ Failed to sync ${p.project_name}:`, upsertError.message);
            } else {
                console.log(`✅ Synced: ${p.project_name}`);
            }
        }

        console.log('✨ Sync complete!');

    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

syncApprovedProjects();
