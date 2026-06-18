const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to create district code from district name
function createDistrictCode(districtName) {
    if (!districtName) return 'unknown';

    // Remove common words and create abbreviation
    const cleaned = districtName
        .toLowerCase()
        .replace(/\s+district$/i, '')
        .replace(/\s+and\s+/g, '-')
        .trim();

    // Split into words and take first letters or use full name if short
    const words = cleaned.split(/[\s-]+/);

    if (words.length === 1) {
        // Single word - take first 2-3 letters
        return words[0].substring(0, Math.min(3, words[0].length));
    } else {
        // Multiple words - take first letter of each
        return words.map(w => w[0]).join('');
    }
}

async function updateImplementingAgencyEmails() {
    try {
        console.log('🔄 Updating Implementing Agency emails to district-based format...\n');

        // Fetch all implementing agencies with their district and state info
        const { data: agencies, error } = await supabase
            .from('implementing_agencies')
            .select(`
                id,
                agency_name,
                email,
                district_id,
                districts (
                    id,
                    name,
                    state_id,
                    states (
                        code,
                        name
                    )
                )
            `);

        if (error) {
            console.error('❌ Error fetching agencies:', error);
            return;
        }

        if (!agencies || agencies.length === 0) {
            console.log('⚠️ No implementing agencies found.');
            return;
        }

        console.log(`✅ Found ${agencies.length} agencies to update\n`);
        console.log('='.repeat(100));

        let updated = 0;
        let skipped = 0;
        const updates = [];

        for (const agency of agencies) {
            const stateCode = agency.districts?.states?.code?.toLowerCase() || 'xx';
            const stateName = agency.districts?.states?.name || 'Unknown';
            const districtName = agency.districts?.name || 'Unknown';
            const districtCode = createDistrictCode(districtName);

            // New email format: {state-code}-{district-code}.district@pmajay.gov.in
            const newEmail = `${stateCode}-${districtCode}.district@pmajay.gov.in`;

            if (agency.email !== newEmail) {
                updates.push({
                    id: agency.id,
                    oldEmail: agency.email,
                    newEmail: newEmail,
                    agency: agency.agency_name,
                    location: `${districtName}, ${stateName}`
                });
                updated++;
            } else {
                skipped++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   To Update: ${updated}`);
        console.log(`   Already Correct: ${skipped}`);
        console.log('\n' + '='.repeat(100));

        if (updates.length > 0) {
            console.log('\n📝 Proposed Email Changes:\n');
            updates.forEach((update, index) => {
                console.log(`${index + 1}. ${update.agency}`);
                console.log(`   Location: ${update.location}`);
                console.log(`   Old: ${update.oldEmail}`);
                console.log(`   New: ${update.newEmail}`);
                console.log('');
            });

            console.log('='.repeat(100));
            console.log('\n⚠️  Applying changes to database...');
            console.log('\n' + '='.repeat(100));

            // UPDATE THE DATABASE
            console.log('\n🔄 Applying updates to database...\n');

            for (const update of updates) {
                const { error: updateError } = await supabase
                    .from('implementing_agencies')
                    .update({ email: update.newEmail })
                    .eq('id', update.id);

                if (updateError) {
                    console.error(`❌ Error updating ${update.agency}:`, updateError);
                } else {
                    console.log(`✅ Updated: ${update.newEmail}`);
                }
            }

            console.log('\n✅ All updates completed!');
        } else {
            console.log('\n✅ All emails are already in the correct format!');
        }

        // Show sample of new format
        console.log('\n\n📧 Sample New Email Format:\n');
        console.log('State: Andhra Pradesh (AP)');
        console.log('District: West Godavari');
        console.log('Email: ap-wg.district@pmajay.gov.in');
        console.log('\nState: Karnataka (KA)');
        console.log('District: Bengaluru Urban');
        console.log('Email: ka-bu.district@pmajay.gov.in');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the script
updateImplementingAgencyEmails();
