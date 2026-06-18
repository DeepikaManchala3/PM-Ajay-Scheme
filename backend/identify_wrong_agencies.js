const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function identifyWrongAgencies() {
    console.log('=== Identifying Which Agencies Have Wrong IDs ===\n');

    const wrongIds = [
        { id: '4a336902-deb0-43b1-b3df-63376a64b4a4', workOrder: 'WO-4: hostel building', intendedFor: 'Seva Corp' },
        { id: '3b5eb38e-c47b-4ec1-8bea-bc1b26912cb3', workOrder: 'WO-5: road construction', intendedFor: 'Seva Services' },
        { id: '7686902a-53ea-4a26-a9b4-b0ff7b80bd68', workOrder: 'WO-3: hall construction', intendedFor: 'Sarthak Services' }
    ];

    for (const item of wrongIds) {
        console.log(`\n${item.workOrder} (intended for: ${item.intendedFor})`);
        console.log(`Current executing_agency_id: ${item.id}`);

        const { data: agency, error } = await supabase
            .from('executing_agencies')
            .select('id, agency_name, email')
            .eq('id', item.id)
            .single();

        if (error) {
            console.log(`  ❌ No agency found with this ID!`);
        } else {
            console.log(`  📋 Actually assigned to: ${agency.agency_name} (${agency.email || 'no email'})`);
        }
    }

    // Now show the CORRECT IDs
    console.log('\n\n=== CORRECT Agency IDs ===\n');

    const correctNames = ['Seva Services', 'Seva Corp', 'Sarthak Services'];

    for (const name of correctNames) {
        const { data: agencies, error } = await supabase
            .from('executing_agencies')
            .select('id, agency_name, email')
            .ilike('agency_name', `%${name}%`);

        if (error) {
            console.error(`Error fetching ${name}:`, error);
        } else if (agencies && agencies.length > 0) {
            console.log(`${name}:`);
            agencies.forEach((a, idx) => {
                console.log(`  ${idx + 1}. ID: ${a.id}`);
                console.log(`     Name: ${a.agency_name}`);
                console.log(`     Email: ${a.email || 'NULL'}`);
            });
        } else {
            console.log(`${name}: NOT FOUND`);
        }
        console.log('');
    }
}

identifyWrongAgencies()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
