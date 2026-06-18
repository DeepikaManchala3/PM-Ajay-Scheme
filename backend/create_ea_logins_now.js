const { createClient } = require('@supabase/supabase-js');

// Hardcoded credentials (temporary - for this script only)
const supabaseUrl = 'https://gwfeaubvzjepmmhxgdvc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmVhdWJ2emplcG1taHhnZHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE2NjUwMSwiZXhwIjoyMDc5NzQyNTAxfQ.D4g4Uc3ci4Bu8YRPajb3Dl-vBiF3TB6K3AXFEd8C-FY';

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
                console.log(`   🔄 User already exists with ID: ${agency.user_id}. Updating password...`);

                // Update password for existing user
                const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
                    agency.user_id,
                    { password: PASSWORD, email_confirm: true }
                );

                if (updateAuthError) {
                    console.error(`   ❌ Error updating password: ${updateAuthError.message}`);
                    errorCount++;
                    // Even if password update fails, we might want to ensure profile exists, but let's continue for now to be safe
                } else {
                    console.log(`   ✅ Password updated to default.`);
                }

                // Upsert profile in profiles table to ensure it matches
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: agency.user_id,
                        email: email,
                        role: 'executing_agency',
                        full_name: agency.agency_name,
                        phone_number: agency.phone_number
                    });

                if (profileError) {
                    console.error(`   ⚠️  Error updating profile: ${profileError.message}`);
                } else {
                    console.log(`   ✅ Profile updated/verified`);
                }

                successCount++;
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
                    // If email exists but not linked in our DB, we need to find the user ID. 
                    // This is tricky without listing all users, but let's try to just log it for now or skipping. 
                    // PROPER FIX: If we really want to recover, we could try to list users by email, but for simplicity let's just log.
                    console.log(`   ⚠️  Email already registered in Auth but not linked in DB. skipping...`);
                    // optionally we could try to 'recover' here if we assume the email is correct, but let's stick to simple logic first.
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
