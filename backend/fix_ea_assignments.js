const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function fixAgencyAssignments() {
    console.log('=== Fixing Executing Agency Assignments ===\n');

    // Step 1: Get the correct agency IDs
    console.log('Step 1: Finding correct agency IDs...\n');

    const agenciesToFind = [
        { name: 'Seva Services', email: 'seva3@gov.in' },
        { name: 'Seva Corp', email: null },
        { name: 'Sarthak Services', email: null }
    ];

    const correctIds = {};

    for (const agencyInfo of agenciesToFind) {
        let query = supabase
            .from('executing_agencies')
            .select('id, agency_name, email');

        if (agencyInfo.email) {
            query = query.eq('email', agencyInfo.email);
        } else {
            query = query.ilike('agency_name', `%${agencyInfo.name}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error(`❌ Error finding ${agencyInfo.name}:`, error);
            continue;
        }

        if (data && data.length > 0) {
            const agency = data[0];
            correctIds[agencyInfo.name] = agency.id;
            console.log(`✅ ${agencyInfo.name}: ${agency.id}`);
            console.log(`   Email: ${agency.email || 'NULL'}\n`);
        } else {
            console.log(`⚠️ ${agencyInfo.name}: NOT FOUND\n`);
        }
    }

    // Step 2: Show current work order assignments
    console.log('\nStep 2: Current work order assignments:\n');

    const { data: workOrders, error: woError } = await supabase
        .from('work_orders')
        .select('id, title, executing_agency_id')
        .not('executing_agency_id', 'is', null);

    if (woError) {
        console.error('❌ Error fetching work orders:', woError);
        return;
    }

    for (const wo of workOrders) {
        console.log(`WO-${wo.id}: ${wo.title}`);
        console.log(`  Current ID: ${wo.executing_agency_id}`);

        const { data: currentAgency } = await supabase
            .from('executing_agencies')
            .select('agency_name')
            .eq('id', wo.executing_agency_id)
            .single();

        if (currentAgency) {
            console.log(`  Currently: ${currentAgency.agency_name}`);
        } else {
            console.log(`  Currently: UNKNOWN (ID not found in executing_agencies)`);
        }
        console.log('');
    }

    // Step 3: Fix the assignments based on the screenshot
    console.log('\nStep 3: Fixing assignments...\n');

    const fixes = [
        { workOrderId: 5, title: 'road construction', correctAgency: 'Seva Services' },
        { workOrderId: 4, title: 'hostel building', correctAgency: 'Seva Corp' },
        { workOrderId: 3, title: 'hall construction', correctAgency: 'Sarthak Services' }
    ];

    for (const fix of fixes) {
        const correctId = correctIds[fix.correctAgency];

        if (!correctId) {
            console.log(`⚠️ Skipping WO-${fix.workOrderId} (${fix.title}) - correct ID for ${fix.correctAgency} not found`);
            continue;
        }

        console.log(`Updating WO-${fix.workOrderId} (${fix.title}) to ${fix.correctAgency} (${correctId})...`);

        const { error: updateError } = await supabase
            .from('work_orders')
            .update({ executing_agency_id: correctId })
            .eq('id', fix.workOrderId);

        if (updateError) {
            console.error(`  ❌ Error:`, updateError);
        } else {
            console.log(`  ✅ Updated successfully\n`);
        }
    }

    // Step 4: Verify the fixes
    console.log('\nStep 4: Verifying fixes...\n');

    const { data: updatedWorkOrders } = await supabase
        .from('work_orders')
        .select('id, title, executing_agency_id')
        .not('executing_agency_id', 'is', null);

    for (const wo of updatedWorkOrders) {
        const { data: agency } = await supabase
            .from('executing_agencies')
            .select('agency_name, email')
            .eq('id', wo.executing_agency_id)
            .single();

        console.log(`WO-${wo.id}: ${wo.title}`);
        console.log(`  ✅ Assigned to: ${agency?.agency_name || 'UNKNOWN'} (${agency?.email || 'no email'})`);
        console.log('');
    }

    console.log('✅ All assignments fixed!\n');
}

fixAgencyAssignments()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
