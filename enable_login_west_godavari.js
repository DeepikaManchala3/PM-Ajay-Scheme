import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const [key, ...values] = line.split('=');
            if (key) process.env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
} catch(e) {}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function linkUser() {
    console.log('🔗 Linking West Godavari Agency to Test User...');

    const TEST_USER_ID = 'd6111b8c-26c1-4642-ab0b-dc420cf4576b';
    const TEST_USER_EMAIL = 'ap-eg.district@pmajay.gov.in';

    // 1. Detach email/user from any existing agency to avoid Unique constraints
    console.log('🧹 Clearing existing assignment for ' + TEST_USER_EMAIL);
    const { error: clearError } = await supabase
        .from('implementing_agencies')
        .update({ 
            email: `detached.${Date.now()}@pmajay.gov.in`, // Temporary unique email
            user_id: null 
        })
        .eq('email', TEST_USER_EMAIL);

    if (clearError) console.log('Notice (Clear):', clearError.message);


    // 2. Find the West Godavari Agency
    const { data: agencies, error: findError } = await supabase
        .from('implementing_agencies')
        .select('id, agency_name')
        .ilike('district_name', '%West Godavari%');

    if (findError || !agencies || agencies.length === 0) {
        console.error('❌ Could not find West Godavari agency.');
        return;
    }

    const agency = agencies[0];
    console.log(`📋 Found Agency: ${agency.agency_name} (${agency.id})`);

    // 3. Update the agency to link to the test user
    const { error: updateError } = await supabase
        .from('implementing_agencies')
        .update({
            user_id: TEST_USER_ID,
            email: TEST_USER_EMAIL
        })
        .eq('id', agency.id);

    if (updateError) {
        console.error('❌ Error updating agency:', updateError.message);
    } else {
        console.log('✅ Successfully linked West Godavari to the test account!');
        console.log('👉 You can now login with:');
        console.log(`   Email: ${TEST_USER_EMAIL}`);
        console.log(`   (Use your existing password)`);
    }
}

linkUser();
