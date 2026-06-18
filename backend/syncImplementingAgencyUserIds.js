const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncImplementingAgencyUserIds() {
    try {
        console.log('🔄 Syncing implementing agency user_ids with auth users...\n');

        // Get all auth users
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('❌ Error fetching auth users:', authError);
            return;
        }

        console.log(`✅ Found ${users.length} auth users\n`);

        // Get all implementing agencies
        const { data: agencies, error: agencyError } = await supabase
            .from('implementing_agencies')
            .select('*');

        if (agencyError) {
            console.error('❌ Error fetching agencies:', agencyError);
            return;
        }

        console.log(`✅ Found ${agencies.length} implementing agencies\n`);
        console.log('='.repeat(100));

        const updates = [];

        // Match agencies with users by email
        for (const agency of agencies) {
            const matchingUser = users.find(u => u.email === agency.email);

            if (matchingUser) {
                if (agency.user_id !== matchingUser.id) {
                    updates.push({
                        agencyId: agency.id,
                        agencyName: agency.agency_name,
                        email: agency.email,
                        oldUserId: agency.user_id,
                        newUserId: matchingUser.id
                    });
                }
            } else {
                console.warn(`⚠️ No auth user found for: ${agency.email}`);
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Total agencies: ${agencies.length}`);
        console.log(`   Need user_id update: ${updates.length}`);
        console.log('\n' + '='.repeat(100));

        if (updates.length > 0) {
            console.log('\n🔄 Agencies that need user_id updates:\n');

            updates.forEach((update, index) => {
                console.log(`${index + 1}. ${update.agencyName}`);
                console.log(`   Email: ${update.email}`);
                console.log(`   Old user_id: ${update.oldUserId || 'NULL'}`);
                console.log(`   New user_id: ${update.newUserId}`);
                console.log('');
            });

            console.log('='.repeat(100));
            console.log('\n🔄 Applying updates...\n');

            let successCount = 0;
            let errorCount = 0;

            for (const update of updates) {
                const { error: updateError } = await supabase
                    .from('implementing_agencies')
                    .update({ user_id: update.newUserId })
                    .eq('id', update.agencyId);

                if (updateError) {
                    console.error(`❌ Error updating ${update.agencyName}:`, updateError);
                    errorCount++;
                } else {
                    console.log(`✅ Updated: ${update.agencyName}`);
                    successCount++;
                }
            }

            console.log('\n' + '='.repeat(100));
            console.log(`\n✅ Updates complete!`);
            console.log(`   Success: ${successCount}`);
            console.log(`   Errors: ${errorCount}`);
            console.log('\n' + '='.repeat(100));
        } else {
            console.log('\n✅ All agencies already have correct user_ids!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the script
syncImplementingAgencyUserIds();
