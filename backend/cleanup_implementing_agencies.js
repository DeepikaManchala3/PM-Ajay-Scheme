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

async function cleanupImplementingAgencies() {
  console.log('\n🧹 IMPLEMENTING AGENCIES CLEANUP');
  console.log('======================================================================\n');

  try {
    // Step 1: Fetch all IAs
    const { data: allIAs, error: fetchError } = await supabase
      .from('implementing_agencies')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;

    console.log(`📊 Total IAs in database: ${allIAs.length}\n`);

    // Step 2: Identify IAs with NULL or 'UNKNOWN' districts (seeded data)
    const seededIAs = allIAs.filter(ia => 
      !ia.district_name || 
      ia.district_name === 'UNKNOWN' || 
      ia.district_id === null
    );

    console.log(`⚠️  Found ${seededIAs.length} IAs with NULL/UNKNOWN districts (seeded data)\n`);

    // Step 3: Identify valid IAs with proper districts
    const validIAs = allIAs.filter(ia => 
      ia.district_name && 
      ia.district_name !== 'UNKNOWN' && 
      ia.district_id !== null
    );

    console.log(`✅ Found ${validIAs.length} valid IAs with proper districts\n`);

    // Step 4: Group valid IAs by district to find duplicates
    const districtGroups = {};
    validIAs.forEach(ia => {
      const district = ia.district_name;
      if (!districtGroups[district]) {
        districtGroups[district] = [];
      }
      districtGroups[district].push(ia);
    });

    // Step 5: Identify districts with duplicates
    const duplicateDistricts = Object.keys(districtGroups).filter(
      district => districtGroups[district].length > 1
    );

    console.log(`\n🔍 DUPLICATE CHECK:`);
    console.log(`   Districts with single IA: ${Object.keys(districtGroups).length - duplicateDistricts.length}`);
    console.log(`   Districts with multiple IAs: ${duplicateDistricts.length}\n`);

    if (duplicateDistricts.length > 0) {
      console.log(`⚠️  Districts with duplicates:`);
      duplicateDistricts.forEach(district => {
        const ias = districtGroups[district];
        console.log(`\n   ${district}: ${ias.length} IAs`);
        ias.forEach((ia, index) => {
          console.log(`      ${index + 1}. ${ia.agency_name} (Created: ${new Date(ia.created_at).toLocaleDateString()})`);
        });
      });
    }

    // Step 6: Prepare cleanup actions
    const toDelete = [...seededIAs];
    const toKeep = [];

    // For duplicates, keep the newest one
    duplicateDistricts.forEach(district => {
      const ias = districtGroups[district];
      // Sort by created_at descending (newest first)
      const sorted = ias.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      toKeep.push(sorted[0]); // Keep newest
      toDelete.push(...sorted.slice(1)); // Delete rest
    });

    // For single IAs, keep them
    Object.keys(districtGroups)
      .filter(district => districtGroups[district].length === 1)
      .forEach(district => {
        toKeep.push(districtGroups[district][0]);
      });

    console.log(`\n\n======================================================================`);
    console.log(`📋 CLEANUP SUMMARY`);
    console.log(`======================================================================\n`);
    console.log(`   Total IAs: ${allIAs.length}`);
    console.log(`   ✅ To Keep: ${toKeep.length} (valid IAs with unique districts)`);
    console.log(`   ❌ To Delete: ${toDelete.length} (${seededIAs.length} seeded + ${toDelete.length - seededIAs.length} duplicates)`);

    // Step 7: Check for foreign key references
    console.log(`\n\n🔍 CHECKING FOREIGN KEY REFERENCES...\n`);

    const idsToDelete = toDelete.map(ia => ia.id);

    // Check fund_releases references in smaller batches to avoid header overflow
    let totalFundReleases = 0;
    const batchSizeCheck = 50;
    
    console.log(`   Checking ${idsToDelete.length} IAs for fund_releases references...`);

    // Step 8: Execute cleanup
    console.log(`\n\n⚠️  EXECUTING CLEANUP...\n`);

    if (toDelete.length > 0) {
      // First, delete fund assignments for these IAs in batches
      console.log(`   Removing fund_releases assignments...\n`);
      
      for (let i = 0; i < idsToDelete.length; i += batchSizeCheck) {
        const batch = idsToDelete.slice(i, i + batchSizeCheck);
        
        // Delete fund_releases that reference these IAs
        const { data: deleted, error: deleteError } = await supabase
          .from('fund_releases')
          .delete()
          .in('implementing_agency_id', batch)
          .select('id');

        if (deleteError) {
          console.error(`   ❌ Error deleting fund_releases batch ${Math.floor(i / batchSizeCheck) + 1}:`, deleteError);
          throw deleteError;
        }

        if (deleted && deleted.length > 0) {
          totalFundReleases += deleted.length;
          console.log(`   ✅ Deleted ${deleted.length} fund_releases in batch ${Math.floor(i / batchSizeCheck) + 1}`);
        }
      }

      if (totalFundReleases > 0) {
        console.log(`\n   ✅ Total fund_releases deleted: ${totalFundReleases}\n`);
      } else {
        console.log(`   ℹ️  No fund_releases found for these IAs\n`);
      }

      // Second, remove district_proposals references (set implementing_agency_id to NULL)
      console.log(`   Removing district_proposals references...\n`);
      let totalProposalsUpdated = 0;

      for (let i = 0; i < idsToDelete.length; i += batchSizeCheck) {
        const batch = idsToDelete.slice(i, i + batchSizeCheck);
        
        // Set implementing_agency_id to NULL in district_proposals
        const { data: updated, error: updateError } = await supabase
          .from('district_proposals')
          .update({ implementing_agency_id: null })
          .in('implementing_agency_id', batch)
          .select('id');

        if (updateError) {
          console.error(`   ❌ Error updating district_proposals batch ${Math.floor(i / batchSizeCheck) + 1}:`, updateError);
          throw updateError;
        }

        if (updated && updated.length > 0) {
          totalProposalsUpdated += updated.length;
          console.log(`   ✅ Updated ${updated.length} district_proposals in batch ${Math.floor(i / batchSizeCheck) + 1}`);
        }
      }

      if (totalProposalsUpdated > 0) {
        console.log(`\n   ✅ Total district_proposals updated: ${totalProposalsUpdated}\n`);
      } else {
        console.log(`   ℹ️  No district_proposals found for these IAs\n`);
      }

      console.log(`   Deleting ${toDelete.length} IAs...`);

      // Delete in batches of 100 (Supabase limit)
      const batchSize = 100;
      let deletedCount = 0;

      for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const batch = idsToDelete.slice(i, i + batchSize);
        
        const { error: deleteError } = await supabase
          .from('implementing_agencies')
          .delete()
          .in('id', batch);

        if (deleteError) {
          console.error(`   ❌ Error deleting batch ${i / batchSize + 1}:`, deleteError);
          throw deleteError;
        }

        deletedCount += batch.length;
        console.log(`   ✅ Deleted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records (Total: ${deletedCount}/${idsToDelete.length})`);
      }

      console.log(`\n   ✅ Successfully deleted ${deletedCount} IAs`);
    }

    // Step 8: Verify final state
    const { data: finalIAs, error: finalError } = await supabase
      .from('implementing_agencies')
      .select('*');

    if (finalError) throw finalError;

    console.log(`\n\n======================================================================`);
    console.log(`✅ CLEANUP COMPLETE!`);
    console.log(`======================================================================\n`);
    console.log(`   Final IA count: ${finalIAs.length}`);
    console.log(`   Expected: ${toKeep.length}`);
    console.log(`   Status: ${finalIAs.length === toKeep.length ? '✅ VERIFIED' : '⚠️  MISMATCH'}\n`);

    // Display remaining IAs grouped by district
    const finalGroups = {};
    finalIAs.forEach(ia => {
      const district = ia.district_name || 'UNKNOWN';
      if (!finalGroups[district]) {
        finalGroups[district] = [];
      }
      finalGroups[district].push(ia);
    });

    console.log(`\n📊 FINAL DISTRICT DISTRIBUTION:\n`);
    Object.keys(finalGroups).sort().forEach(district => {
      const ias = finalGroups[district];
      console.log(`   ${district}: ${ias.length} IA${ias.length > 1 ? 's' : ''}`);
      ias.forEach(ia => {
        console.log(`      - ${ia.agency_name}`);
      });
    });

    console.log(`\n✅ Cleanup script completed successfully!\n`);

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message);
    throw error;
  }
}

cleanupImplementingAgencies()
  .then(() => {
    console.log('✅ Script finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
