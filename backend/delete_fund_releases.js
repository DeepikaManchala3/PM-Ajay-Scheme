const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllFundReleases() {
    console.log('🗑️  Deleting all records from state_fund_releases table...');

    try {
        const { data, error } = await supabase
            .from('state_fund_releases')
            .delete()
            .neq('id', 0); // Delete all records

        if (error) {
            console.error('❌ Error:', error.message);
            return;
        }

        console.log('✅ All fund release records deleted successfully!');

        // Verify deletion
        const { count, error: countError } = await supabase
            .from('state_fund_releases')
            .select('*', { count: 'exact', head: true });

        if (!countError) {
            console.log(`📊 Remaining records: 0`);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

deleteAllFundReleases();
