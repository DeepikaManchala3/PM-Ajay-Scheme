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

async function unassignAllProjects() {
  console.log('\n🔓 UNASSIGNING ALL CENTRAL PROJECTS');
  console.log('======================================================================\n');

  try {
    // Check current assignments in district_proposals
    const { data: assignedProjects, error: fetchError } = await supabase
      .from('district_proposals')
      .select('id, project_name, executing_agency_id')
      .not('executing_agency_id', 'is', null);

    if (fetchError) throw fetchError;

    console.log(`📊 Found ${assignedProjects?.length || 0} assigned district projects\n`);

    if (assignedProjects && assignedProjects.length > 0) {
      assignedProjects.forEach(project => {
        console.log(`   - ${project.project_name}`);
      });

      // Unassign all
      console.log('\n🔓 Unassigning all projects...\n');

      const { data: updated, error: updateError } = await supabase
        .from('district_proposals')
        .update({ 
          executing_agency_id: null,
          executing_agency_name: null,
          assigned_to_ea_at: null 
        })
        .not('executing_agency_id', 'is', null)
        .select('id');

      if (updateError) throw updateError;

      console.log(`   ✅ Unassigned ${updated?.length || 0} district projects\n`);
    }

    console.log('ℹ️  Village projects don\'t have implementing_agency assignments\n');

    // Verify final state
    const { data: stillAssigned, error: verifyError } = await supabase
      .from('district_proposals')
      .select('id')
      .not('executing_agency_id', 'is', null);

    if (verifyError) throw verifyError;

    console.log('\n======================================================================');
    console.log('✅ UNASSIGNMENT COMPLETE');
    console.log('======================================================================\n');
    console.log(`📊 Remaining assigned projects: ${stillAssigned?.length || 0}\n`);

    if (stillAssigned && stillAssigned.length > 0) {
      console.log('⚠️  Warning: Some projects still have assignments');
    } else {
      console.log('✅ All projects successfully unassigned');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

unassignAllProjects()
  .then(() => {
    console.log('\n✅ Script finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
