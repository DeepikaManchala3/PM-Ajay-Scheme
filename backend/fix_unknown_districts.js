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

async function fixUnknownDistricts() {
  console.log('\n🔧 FIXING UNKNOWN DISTRICTS');
  console.log('======================================================================\n');

  try {
    // Get all IAs
    const { data: allIAs, error: iaError } = await supabase
      .from('implementing_agencies')
      .select('*, districts(id, name, state_id)');

    if (iaError) throw iaError;

    console.log(`📊 Total IAs: ${allIAs.length}\n`);

    // Identify IAs with missing or NULL district_id
    const invalidIAs = allIAs.filter(ia => !ia.district_id || !ia.districts);
    const validIAs = allIAs.filter(ia => ia.district_id && ia.districts);

    console.log(`✅ Valid IAs (with district_id): ${validIAs.length}`);
    console.log(`❌ Invalid IAs (no district_id): ${invalidIAs.length}\n`);

    if (invalidIAs.length > 0) {
      console.log('🗑️  IAs to be removed (no valid district):');
      invalidIAs.forEach(ia => {
        console.log(`   - ${ia.agency_name} (Email: ${ia.email})`);
      });

      // Unassign all projects from these IAs
      console.log('\n🔓 Unassigning projects from invalid IAs...\n');
      
      const invalidIds = invalidIAs.map(ia => ia.id);
      
      // Update district_proposals
      const { data: updatedProposals, error: updateError } = await supabase
        .from('district_proposals')
        .update({ 
          implementing_agency_id: null,
          assigned_to_ea_at: null 
        })
        .in('implementing_agency_id', invalidIds)
        .select('id');

      if (updateError) throw updateError;

      console.log(`   ✅ Unassigned ${updatedProposals?.length || 0} district projects`);

      // Delete invalid IAs
      console.log('\n🗑️  Deleting invalid IAs...\n');

      const { error: deleteError } = await supabase
        .from('implementing_agencies')
        .delete()
        .in('id', invalidIds);

      if (deleteError) throw deleteError;

      console.log(`   ✅ Deleted ${invalidIAs.length} invalid IAs`);
    }

    // Verify final state
    const { data: finalIAs, error: finalError } = await supabase
      .from('implementing_agencies')
      .select('*, districts(id, name)');

    if (finalError) throw finalError;

    console.log('\n\n======================================================================');
    console.log('✅ CLEANUP COMPLETE');
    console.log('======================================================================\n');
    console.log(`📊 Final IA count: ${finalIAs.length}\n`);

    console.log('📋 Remaining IAs:\n');
    finalIAs
      .sort((a, b) => a.districts.name.localeCompare(b.districts.name))
      .forEach((ia, index) => {
        console.log(`   ${index + 1}. ${ia.districts.name}: ${ia.agency_name}`);
        console.log(`      Email: ${ia.email}\n`);
      });

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

fixUnknownDistricts()
  .then(() => {
    console.log('✅ Script finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
