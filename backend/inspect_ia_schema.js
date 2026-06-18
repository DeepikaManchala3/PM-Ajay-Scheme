const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectSchema() {
    console.log('🔍 Inspecting implementing_agencies schema...\n');

    try {
        // Fetch one record to see all available columns
        const { data, error } = await supabase
            .from('implementing_agencies')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error:', error);
        } else if (data && data.length > 0) {
            console.log('📊 Available columns:');
            console.log(Object.keys(data[0]));
            console.log('\n📝 Sample record:');
            console.log(data[0]);
        } else {
            console.log('No data found');
        }
    } catch (err) {
        console.error('Fatal Error:', err);
    }
}

inspectSchema();
