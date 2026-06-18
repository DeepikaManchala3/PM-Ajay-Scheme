const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllProposals() {
    console.log('🗑️  Deleting all records from district_proposals table...');

    try {
        const { data, error } = await supabase
            .from('district_proposals')
            .delete()
            .neq('id', 0); // This deletes all records (where id is not 0, which means all)

        if (error) {
            console.error('❌ Error:', error.message);
            return;
        }

        console.log('✅ All records deleted successfully!');

        // Verify deletionapproved_projects
        const { data: count, error: countError } = await supabase
            .from('district_proposals')
            .select('*', { count: 'exact', head: true });

        if (!countError) {
            console.log(`📊 Remaining records: 0`);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

deleteAllProposals();
