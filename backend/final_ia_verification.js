const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

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

async function finalVerification() {
  console.log('\n✅ FINAL VERIFICATION - IMPLEMENTING AGENCIES');
  console.log('======================================================================\n');

  try {
    // 1. Check all implementing agencies
    const { data: allIAs, error: iaError } = await supabase
      .from('implementing_agencies')
      .select('*, districts(name, states(name))');

    if (iaError) throw iaError;

    console.log(`📊 Total Implementing Agencies: ${allIAs.length}\n`);

    // 2. Group by state
    const byState = {};
    allIAs.forEach(ia => {
      const state = ia.districts?.states?.name || 'UNKNOWN';
      if (!byState[state]) byState[state] = [];
      byState[state].push(ia);
    });

    console.log('📍 DISTRIBUTION BY STATE:\n');
    Object.keys(byState).sort().forEach(state => {
      console.log(`   ${state}: ${byState[state].length} IAs`);
    });

    // 3. Check for issues
    console.log('\n\n🔍 VALIDATION CHECKS:\n');

    const noDistrict = allIAs.filter(ia => !ia.districts || !ia.districts.name);
    console.log(`   ${noDistrict.length === 0 ? '✅' : '❌'} IAs without valid district: ${noDistrict.length}`);

    const wrongState = allIAs.filter(ia => {
      const iaName = ia.agency_name.toLowerCase();
      const districtState = ia.districts?.states?.name || '';
      if (iaName.includes('tamil nadu') && districtState !== 'Tamil Nadu') return true;
      if (iaName.includes('madhya pradesh') && districtState !== 'Madhya Pradesh') return true;
      return false;
    });
    console.log(`   ${wrongState.length === 0 ? '✅' : '❌'} IAs in wrong state: ${wrongState.length}`);

    // 4. Check for duplicates
    const districtCount = {};
    allIAs.forEach(ia => {
      const districtName = ia.districts?.name;
      if (districtName) {
        districtCount[districtName] = (districtCount[districtName] || 0) + 1;
      }
    });

    const duplicates = Object.keys(districtCount).filter(d => districtCount[d] > 1);
    console.log(`   ${duplicates.length === 0 ? '✅' : '❌'} Districts with multiple IAs: ${duplicates.length}`);

    // 5. Check project assignments
    const { data: assignedProjects, error: projectError } = await supabase
      .from('district_proposals')
      .select('id')
      .not('executing_agency_id', 'is', null);

    if (projectError) throw projectError;

    console.log(`   ${assignedProjects.length === 0 ? '✅' : '⚠️ '} Projects with assignments: ${assignedProjects.length}`);

    // 6. List all IAs
    console.log('\n\n📋 ALL IMPLEMENTING AGENCIES:\n');
    
    Object.keys(byState).sort().forEach(state => {
      console.log(`\n${state}:`);
      byState[state]
        .sort((a, b) => (a.districts?.name || '').localeCompare(b.districts?.name || ''))
        .forEach(ia => {
          console.log(`   - ${ia.districts?.name || 'UNKNOWN'}: ${ia.agency_name}`);
          console.log(`     Email: ${ia.email}`);
        });
    });

    console.log('\n\n======================================================================');
    console.log('✅ VERIFICATION COMPLETE');
    console.log('======================================================================\n');

    if (noDistrict.length === 0 && wrongState.length === 0 && duplicates.length === 0) {
      console.log('✅ ALL CHECKS PASSED! Database is clean.\n');
    } else {
      console.log('⚠️  ISSUES FOUND - Please review above\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

finalVerification()
  .then(() => {
    console.log('✅ Script finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
