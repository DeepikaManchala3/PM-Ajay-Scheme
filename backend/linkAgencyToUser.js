const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// This script links implementing agencies to their auth users by matching:
// 1. The email in implementing_agencies table 
// 2. The user's email in auth.users

async function linkAgencyToUser() {
    try {
        // The user who logged in with ap-eg.district@pmajay.gov.in
        const userEmail = 'ap-eg.district@pmajay.gov.in';
        const userId = 'd6111b8c-26c1-4642-ab0b-dc420cf4576b';

        console.log('='.repeat(60));
        console.log('🔗 Linking Implementing Agency to User');
        console.log('='.repeat(60));
        console.log('User Email:', userEmail);
        console.log('User ID:', userId);
        console.log('');

        // First, find an agency for East Godavari district
        const { data: agencies, error: findError } = await supabase
            .from('implementing_agencies')
            .select(`
                id,
                agency_name,
                email,
                user_id,
                districts (
                    name
                )
            `)
            .ilike('districts.name', '%East Godavari%')
            .limit(1);

        if (findError) {
            console.error('❌ Error finding agency:', findError);
            return;
        }

        if (!agencies || agencies.length === 0) {
            // Try finding any Andhra Pradesh agency
            const { data: apAgencies, error: apError } = await supabase
                .from('implementing_agencies')
                .select(`
                    id,
                    agency_name,
                    email,
                    user_id,
                    districts (
                        name
                    )
                `)
                .limit(10);

            console.log('Available agencies (first 10):');
            apAgencies?.forEach(a => {
                console.log(`  - ${a.agency_name} | ${a.districts?.name} | ${a.email}`);
            });
            return;
        }

        const agency = agencies[0];
        console.log('📋 Found Agency:');
        console.log('   Name:', agency.agency_name);
        console.log('   District:', agency.districts?.name);
        console.log('   Current Email:', agency.email);
        console.log('   Current user_id:', agency.user_id || 'NULL');
        console.log('');

        // Update the agency with the new user_id and email
        const { error: updateError } = await supabase
            .from('implementing_agencies')
            .update({
                user_id: userId,
                email: userEmail
            })
            .eq('id', agency.id);

        if (updateError) {
            console.error('❌ Error updating agency:', updateError);
            return;
        }

        console.log('✅ Agency updated successfully!');
        console.log('');
        console.log('🎯 Now when you login with:');
        console.log('   Email: ap-eg.district@pmajay.gov.in');
        console.log('   You should see: "Implementing Agency - East Godavari"');
        console.log('');
        console.log('🔄 Please refresh the browser to see the changes!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the script
linkAgencyToUser();
