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

async function deleteWrongStateIAs() {
  console.log('\n🗑️  DELETING WRONG STATE IAs');
  console.log('======================================================================\n');

  try {
    // Find "GOV - Tamil Nadu" and "GOV - Madhya Pradesh"
    const { data: wrongIAs, error: fetchError } = await supabase
      .from('implementing_agencies')
      .select('*, districts(name, states(name))')
      .or('agency_name.ilike.%GOV - Tamil Nadu%,agency_name.ilike.%GOV - Madhya Pradesh%');

    if (fetchError) throw fetchError;

    console.log(`📊 Found ${wrongIAs.length} IAs to delete:\n`);
    
    wrongIAs.forEach(ia => {
      console.log(`   - ${ia.agency_name}`);
      console.log(`     District: ${ia.districts?.name || 'NULL'}`);
      console.log(`     State: ${ia.districts?.states?.name || 'NULL'}`);
      console.log(`     Email: ${ia.email}\n`);
    });

    if (wrongIAs.length > 0) {
      const idsToDelete = wrongIAs.map(ia => ia.id);

      // Unassign projects
      console.log('🔓 Unassigning projects...\n');
      
      const { data: updated, error: updateError } = await supabase
        .from('district_proposals')
        .update({ 
          implementing_agency_id: null,
          assigned_to_ea_at: null 
        })
        .in('implementing_agency_id', idsToDelete)
        .select('id');

      if (updateError) throw updateError;
      console.log(`   ✅ Unassigned ${updated?.length || 0} projects\n`);

      // Delete IAs
      console.log('🗑️  Deleting IAs...\n');
      
      const { error: deleteError } = await supabase
        .from('implementing_agencies')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) throw deleteError;

      console.log(`   ✅ Deleted ${wrongIAs.length} IAs\n`);
    }

    // Verify remaining IAs
    const { data: remaining, error: remainingError } = await supabase
      .from('implementing_agencies')
      .select('*, districts(name, states(name))');

    if (remainingError) throw remainingError;

    console.log('\n======================================================================');
    console.log('✅ CLEANUP COMPLETE');
    console.log('======================================================================\n');
    console.log(`📊 Remaining IAs: ${remaining.length}\n`);

    // Group by state
    const byState = {};
    remaining.forEach(ia => {
      const state = ia.districts?.states?.name || 'UNKNOWN';
      if (!byState[state]) byState[state] = [];
      byState[state].push(ia);
    });

    Object.keys(byState).sort().forEach(state => {
      console.log(`\n${state}: ${byState[state].length} IAs`);
      byState[state].forEach(ia => {
        console.log(`   - ${ia.districts?.name || 'UNKNOWN'}: ${ia.agency_name}`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

deleteWrongStateIAs()
  .then(() => {
    console.log('\n✅ Script finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
