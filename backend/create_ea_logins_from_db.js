const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const PASSWORD = "Test123!";

async function createLoginCredentialsForExistingAgencies() {
    console.log('🚀 Fetching all executing agencies from database...\n');

    // Fetch all executing agencies from the database
    const { data: agencies, error: fetchError } = await supabase
        .from('executing_agencies')
        .select('*')
        .order('agency_name');

    if (fetchError) {
        console.error('❌ Error fetching executing agencies:', fetchError.message);
        process.exit(1);
    }

    if (!agencies || agencies.length === 0) {
        console.log('⚠️  No executing agencies found in the database.');
        process.exit(0);
    }

    console.log(`✅ Found ${agencies.length} executing agencies in the database\n`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const agency of agencies) {
        try {
            console.log(`\n📝 Processing: ${agency.agency_name}`);

            // Generate email if not present
            let email = agency.email;
            if (!email) {
                // Create email from agency name
                const emailPrefix = agency.agency_name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '.')
                    .replace(/^\.+|\.+$/g, '');
                email = `${emailPrefix}@pmajay.gov.in`;
                console.log(`   📧 Generated email: ${email}`);
            } else {
                console.log(`   📧 Using existing email: ${email}`);
            }

            // Check if user already exists
            if (agency.user_id) {
                console.log(`   ⏭️  User already exists with ID: ${agency.user_id}`);
                skippedCount++;
                continue;
            }

            // Create user in auth.users
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: email,
                password: PASSWORD,
                email_confirm: true,
                user_metadata: {
                    role: 'executing_agency',
                    agency_name: agency.agency_name,
                    agency_type: agency.agency_type,
                    phone_number: agency.phone_number
                }
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    console.log(`   ⚠️  Email already registered, skipping...`);
                    skippedCount++;
                    continue;
                }
                console.error(`   ❌ Error creating auth user: ${authError.message}`);
                errorCount++;
                continue;
            }

            const userId = authData.user.id;
            console.log(`   ✅ Auth user created with ID: ${userId}`);

            // Create profile in profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: email,
                    role: 'executing_agency',
                    full_name: agency.agency_name,
                    phone_number: agency.phone_number
                });

            if (profileError) {
                console.error(`   ⚠️  Error creating profile: ${profileError.message}`);
            } else {
                console.log(`   ✅ Profile created`);
            }

            // Update executing_agencies record with user_id and email
            const { error: updateError } = await supabase
                .from('executing_agencies')
                .update({
                    user_id: userId,
                    email: email
                })
                .eq('id', agency.id);

            if (updateError) {
                console.error(`   ⚠️  Error updating executing agency record: ${updateError.message}`);
            } else {
                console.log(`   ✅ Executing agency record updated with user_id`);
            }

            successCount++;
            console.log(`   ✅ Successfully created login for ${agency.agency_name}`);

        } catch (error) {
            console.error(`   ❌ Unexpected error for ${agency.agency_name}:`, error.message);
            errorCount++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`   Total agencies processed: ${agencies.length}`);
    console.log(`   ✅ Successfully created: ${successCount} logins`);
    console.log(`   ⏭️  Skipped (already exist): ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));
    console.log(`\n🔑 All new users created with password: ${PASSWORD}`);
    console.log('\n💾 Login credentials saved to profiles table');
}

createLoginCredentialsForExistingAgencies()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
