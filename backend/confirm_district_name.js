
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function confirmDistrictName() {
    console.log('--- Checking district_name ---');

    const { error: woError } = await supabase.from('work_orders').select('district_name').limit(1);
    if (woError) console.log('WO Error:', woError.message);
    else console.log('WO: district_name exists');

    const { error: iaError } = await supabase.from('implementing_agencies').select('district_name').limit(1);
    if (iaError) console.log('IA Error:', iaError.message);
    else console.log('IA: district_name exists');
}

confirmDistrictName();
