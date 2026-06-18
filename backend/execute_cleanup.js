const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function executeCleanup() {
    console.log('\n🧹 EXECUTING DATABASE CLEANUP\n');
    console.log('='.repeat(70));
    console.log('This will remove:');
    console.log('  1. Village fund releases without sanction orders (seeded data)');
    console.log('  2. District proposals with zero allocation (test data)');
    console.log('  3. District proposals with invalid district IDs (not in districts table)');
    console.log('  4. Duplicate/test fund allocations for same states');
    console.log('='.repeat(70));

    try {
        // Step 1: Get valid district IDs
        console.log('\n📋 Step 1: Fetching valid district IDs...');
        const { data: districts, error: districtError } = await supabase
            .from('districts')
            .select('id, name, state_id, states(name)');

        if (districtError) throw districtError;

        const validDistrictIds = districts.map(d => d.id);
        console.log(`✅ Found ${validDistrictIds.length} valid districts`);
        console.log(`   Valid IDs range: ${Math.min(...validDistrictIds)} to ${Math.max(...validDistrictIds)}`);

        // Step 2: Clean Village Fund Releases
        console.log('\n\n🧹 Step 2: Cleaning Village Fund Releases...');
        console.log('-'.repeat(70));

        const { data: villageFunds, error: vfFetchError } = await supabase
            .from('village_fund_releases')
            .select('*');

        if (vfFetchError) throw vfFetchError;

        // Delete village funds without sanction orders
        const vfToDelete = villageFunds.filter(vf => !vf.sanction_order_no);
        
        if (vfToDelete.length > 0) {
            console.log(`\n📝 Found ${vfToDelete.length} village funds without sanction orders:`);
            vfToDelete.forEach(vf => {
                console.log(`   - ID ${vf.id}: ${vf.village_name} (${vf.district_name})`);
            });

            const vfIds = vfToDelete.map(vf => vf.id);
            const { error: deleteVFError } = await supabase
                .from('village_fund_releases')
                .delete()
                .in('id', vfIds);

            if (deleteVFError) {
                console.error('❌ Error deleting village funds:', deleteVFError.message);
            } else {
                console.log(`\n✅ Successfully deleted ${vfIds.length} village fund releases`);
            }
        } else {
            console.log('✅ No village funds to delete');
        }

        // Step 3: Clean District Proposals
        console.log('\n\n🧹 Step 3: Cleaning District Proposals...');
        console.log('-'.repeat(70));

        const { data: proposals, error: propFetchError } = await supabase
            .from('district_proposals')
            .select('*');

        if (propFetchError) throw propFetchError;

        // Identify proposals to delete
        const propsToDelete = proposals.filter(p => {
            // Delete if: zero allocation OR invalid district_id
            const hasZeroAllocation = !p.allocated_amount || p.allocated_amount === 0;
            const hasInvalidDistrict = !validDistrictIds.includes(parseInt(p.district_id));
            
            return hasZeroAllocation || hasInvalidDistrict;
        });

        if (propsToDelete.length > 0) {
            console.log(`\n📝 Found ${propsToDelete.length} proposals to delete:`);
            propsToDelete.forEach(p => {
                const reason = !p.allocated_amount || p.allocated_amount === 0 
                    ? 'Zero allocation' 
                    : 'Invalid district ID';
                console.log(`   - ID ${p.id}: ${p.project_name} (District ID: ${p.district_id}) - ${reason}`);
            });

            const propIds = propsToDelete.map(p => p.id);
            const { error: deletePropError } = await supabase
                .from('district_proposals')
                .delete()
                .in('id', propIds);

            if (deletePropError) {
                console.error('❌ Error deleting proposals:', deletePropError.message);
            } else {
                console.log(`\n✅ Successfully deleted ${propIds.length} district proposals`);
            }
        } else {
            console.log('✅ No proposals to delete');
        }

        // Step 4: Clean State Fund Releases (orphaned project releases)
        console.log('\n\n🧹 Step 4: Cleaning State Fund Releases...');
        console.log('-'.repeat(70));

        const { data: stateReleases, error: srFetchError } = await supabase
            .from('state_fund_releases')
            .select('*');

        if (srFetchError) throw srFetchError;

        // Find project releases (PROJ-*) that don't have corresponding proposals
        const projectReleases = stateReleases.filter(sr => sr.sanction_order_no?.startsWith('PROJ-'));
        const remainingProposalIds = proposals
            .filter(p => !propsToDelete.find(d => d.id === p.id))
            .map(p => p.id);

        const orphanedReleases = projectReleases.filter(sr => {
            const projectId = parseInt(sr.sanction_order_no.replace('PROJ-', ''));
            return !remainingProposalIds.includes(projectId);
        });

        if (orphanedReleases.length > 0) {
            console.log(`\n📝 Found ${orphanedReleases.length} orphaned project releases:`);
            orphanedReleases.forEach(sr => {
                console.log(`   - ID ${sr.id}: ${sr.sanction_order_no} - ₹${sr.amount_cr} Cr`);
            });

            const releaseIds = orphanedReleases.map(sr => sr.id);
            const { error: deleteReleaseError } = await supabase
                .from('state_fund_releases')
                .delete()
                .in('id', releaseIds);

            if (deleteReleaseError) {
                console.error('❌ Error deleting state releases:', deleteReleaseError.message);
            } else {
                console.log(`\n✅ Successfully deleted ${releaseIds.length} orphaned state fund releases`);
            }
        } else {
            console.log('✅ No orphaned state releases to delete');
        }

        // Step 5: Clean Fund Allocations (duplicates)
        console.log('\n\n🧹 Step 5: Cleaning Duplicate Fund Allocations...');
        console.log('-'.repeat(70));

        const { data: allocations, error: allocFetchError } = await supabase
            .from('fund_allocations')
            .select('*')
            .order('allocation_date', { ascending: false });

        if (allocFetchError) throw allocFetchError;

        // Group by state_name and keep only the most recent one
        const stateGroups = {};
        allocations.forEach(a => {
            if (!stateGroups[a.state_name]) {
                stateGroups[a.state_name] = [];
            }
            stateGroups[a.state_name].push(a);
        });

        const duplicatesToDelete = [];
        Object.entries(stateGroups).forEach(([stateName, allocs]) => {
            if (allocs.length > 1) {
                // Keep the most recent (first one), delete the rest
                const toDelete = allocs.slice(1);
                duplicatesToDelete.push(...toDelete);
            }
        });

        if (duplicatesToDelete.length > 0) {
            console.log(`\n📝 Found ${duplicatesToDelete.length} duplicate fund allocations:`);
            const deleteGroups = {};
            duplicatesToDelete.forEach(a => {
                if (!deleteGroups[a.state_name]) deleteGroups[a.state_name] = 0;
                deleteGroups[a.state_name]++;
            });
            Object.entries(deleteGroups).forEach(([state, count]) => {
                console.log(`   - ${state}: ${count} duplicate(s)`);
            });

            const allocIds = duplicatesToDelete.map(a => a.id);
            const { error: deleteAllocError } = await supabase
                .from('fund_allocations')
                .delete()
                .in('id', allocIds);

            if (deleteAllocError) {
                console.error('❌ Error deleting fund allocations:', deleteAllocError.message);
            } else {
                console.log(`\n✅ Successfully deleted ${allocIds.length} duplicate fund allocations`);
            }
        } else {
            console.log('✅ No duplicate fund allocations to delete');
        }

        // Final Summary
        console.log('\n\n' + '='.repeat(70));
        console.log('✅ CLEANUP COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(70));
        console.log('\n📊 Summary:');
        console.log(`   - Village funds deleted: ${vfToDelete?.length || 0}`);
        console.log(`   - District proposals deleted: ${propsToDelete?.length || 0}`);
        console.log(`   - Orphaned state releases deleted: ${orphanedReleases?.length || 0}`);
        console.log(`   - Duplicate allocations deleted: ${duplicatesToDelete?.length || 0}`);
        console.log(`\n   Total records deleted: ${(vfToDelete?.length || 0) + (propsToDelete?.length || 0) + (orphanedReleases?.length || 0) + (duplicatesToDelete?.length || 0)}`);

        // Show what remains
        console.log('\n\n📦 REMAINING DATA:');
        console.log('-'.repeat(70));

        const { data: remainingVF } = await supabase
            .from('village_fund_releases')
            .select('id', { count: 'exact' });
        console.log(`   Village fund releases: ${remainingVF?.length || 0}`);

        const { data: remainingProps } = await supabase
            .from('district_proposals')
            .select('id', { count: 'exact' });
        console.log(`   District proposals: ${remainingProps?.length || 0}`);

        const { data: remainingSR } = await supabase
            .from('state_fund_releases')
            .select('id', { count: 'exact' });
        console.log(`   State fund releases: ${remainingSR?.length || 0}`);

        const { data: remainingAlloc } = await supabase
            .from('fund_allocations')
            .select('id', { count: 'exact' });
        console.log(`   Fund allocations: ${remainingAlloc?.length || 0}`);

        console.log('\n✅ Database cleanup complete! All seeded/test data has been removed.\n');

    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
        console.error(error);
    }
}

executeCleanup();
