const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Try loading from root .env or local .env
const rootEnvPath = path.resolve(__dirname, '..', '.env');
const localEnvPath = path.resolve(__dirname, '.env');

if (fs.existsSync(rootEnvPath)) {
    require('dotenv').config({ path: rootEnvPath });
} else {
    require('dotenv').config({ path: localEnvPath });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyCleanup() {
  console.log('\n✅ VERIFICATION AFTER CLEANUP');
  console.log('======================================================================\n');

  try {
    // Check total IAs
    const { data: allIAs, error: iaError } = await supabase
      .from('implementing_agencies')
      .select('*');

    if (iaError) throw iaError;

    console.log(`📊 Total Implementing Agencies: ${allIAs.length}\n`);

    // Group by district
    const byDistrict = {};
    allIAs.forEach(ia => {
      const district = ia.district_name || 'UNKNOWN';
      if (!byDistrict[district]) {
        byDistrict[district] = [];
      }
      byDistrict[district].push(ia);
    });

    // Check for duplicates
    const duplicates = Object.keys(byDistrict).filter(d => byDistrict[d].length > 1);

    console.log(`✅ Districts with exactly 1 IA: ${Object.keys(byDistrict).length - duplicates.length}`);
    console.log(`❌ Districts with multiple IAs: ${duplicates.length}\n`);

    if (duplicates.length > 0) {
      console.log('⚠️  Duplicate districts found:');
      duplicates.forEach(district => {
        console.log(`   ${district}: ${byDistrict[district].length} IAs`);
      });
    }

    // Check for NULL/UNKNOWN districts
    const nullDistricts = allIAs.filter(ia => !ia.district_name || ia.district_name === 'UNKNOWN' || !ia.district_id);
    console.log(`\n📊 IAs with NULL/UNKNOWN districts: ${nullDistricts.length}`);

    if (nullDistricts.length > 0) {
      console.log('⚠️  Warning: Found IAs with NULL/UNKNOWN districts:');
      nullDistricts.forEach(ia => {
        console.log(`   - ${ia.agency_name} (Email: ${ia.email})`);
      });
    }

    // List all valid IAs
    console.log('\n\n📋 VALID IMPLEMENTING AGENCIES:\n');
    const validIAs = allIAs.filter(ia => ia.district_name && ia.district_name !== 'UNKNOWN' && ia.district_id);
    
    // Sort by district name
    validIAs.sort((a, b) => a.district_name.localeCompare(b.district_name));

    validIAs.forEach((ia, index) => {
      console.log(`   ${index + 1}. ${ia.district_name}: ${ia.agency_name}`);
      console.log(`      Email: ${ia.email}`);
      console.log(`      Created: ${new Date(ia.created_at).toLocaleString()}\n`);
    });

    console.log('\n✅ Verification complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyCleanup()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
