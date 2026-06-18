import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env manually as before
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
} catch (e) { }

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixLogin() {
    console.log('🔧 Fixing West Godavari Login...');

    const TEST_EMAIL = 'ap-wg.district@pmajay.gov.in'; // Must include .district@pmajay.gov.in for role detection
    const TEST_PASSWORD = 'Password@123';

    // 1. Try to Sign Up the user
    console.log(`👤 Attempting to create user: ${TEST_EMAIL}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
    });

    let userId = authData?.user?.id;

    if (authError) {
        console.log(`ℹ️ Auth Notice: ${authError.message}`);
        if (authError.message.includes('already registered')) {
            // If already registered, we can't get the ID easily without logging in.
            // Let's try to sign IN to get the ID.
            console.log('🔄 User exists. Attempting login to retrieve ID...');
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });

            if (loginError) {
                console.error('❌ Could not login to existing test user. You might need to delete this user from Supabase Auth manually or pick a new email.', loginError.message);
                return;
            }
            userId = loginData.user.id;
            console.log('✅ Logged in successfully. ID retrieved.');
        } else {
            console.error('❌ Failed to create user:', authError);
            return;
        }
    } else {
        console.log('✅ User created successfully!');
    }

    if (!userId) {
        console.error('❌ Could not obtain User ID.');
        return;
    }

    console.log(`🆔 User ID: ${userId}`);

    // 2. Find West Godavari Agency
    const { data: agencies, error: findError } = await supabase
        .from('implementing_agencies')
        .select('id, agency_name')
        .ilike('district_name', '%West Godavari%');

    if (findError || !agencies || agencies.length === 0) {
        console.error('❌ Could not find West Godavari agency.');
        return;
    }

    const agency = agencies[0];
    console.log(`🏢 Linking to Agency: ${agency.agency_name}`);

    // 3. Clear any existing link for this email/user (to be safe)
    // Actually, we just want to update this specific agency to this user.
    // But if this user is linked elsewhere, we might want to clear it? 
    // Let's just update the target agency. Prior scripts handled cleanup if needed.

    const { error: updateError } = await supabase
        .from('implementing_agencies')
        .update({
            user_id: userId,
            email: TEST_EMAIL
        })
        .eq('id', agency.id);

    if (updateError) {
        console.error('❌ Error updating agency:', updateError.message);
    } else {
        console.log('--------------------------------------------------');
        console.log('✅ FIX COMPLETE!');
        console.log('   Agency: ' + agency.agency_name);
        console.log('   User Linked: ' + TEST_EMAIL);
        console.log('   Password: ' + TEST_PASSWORD);
        console.log('--------------------------------------------------');
        console.log('👉 Please try logging in now with these credentials.');
    }
}

fixLogin();
