const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function analyzeAndCleanup() {
    console.log('\n🔍 ANALYZING DATABASE FOR SEEDED/DUPLICATE DATA\n');
    console.log('='.repeat(70));

    try {
        // 1. Analyze Village Fund Releases
        console.log('\n📦 1. VILLAGE FUND RELEASES');
        console.log('-'.repeat(70));
        
        const { data: villageFunds, error: vfError } = await supabase
            .from('village_fund_releases')
            .select('*')
            .order('created_at', { ascending: false });

        if (vfError) {
            console.error('❌ Error:', vfError.message);
        } else {
            console.log(`Total village fund releases: ${villageFunds?.length || 0}`);
            
            // Group by state
            const byState = {};
            villageFunds?.forEach(vf => {
                byState[vf.state_name] = (byState[vf.state_name] || 0) + 1;
            });
            
            console.log('\nBreakdown by state:');
            Object.entries(byState).forEach(([state, count]) => {
                console.log(`   ${state}: ${count} releases`);
            });

            // Check for suspicious patterns (likely seeded data)
            console.log('\n⚠️  Suspicious patterns (possible seeded data):');
            const suspicious = villageFunds?.filter(vf => 
                !vf.sanction_order_no || 
                vf.amount_allocated === 0 ||
                vf.amount_released === 0 ||
                vf.status === 'Pending'
            );
            console.log(`   - Records without sanction orders: ${villageFunds?.filter(vf => !vf.sanction_order_no).length || 0}`);
            console.log(`   - Records with zero allocated: ${villageFunds?.filter(vf => vf.amount_allocated === 0).length || 0}`);
            console.log(`   - Records with zero released: ${villageFunds?.filter(vf => vf.amount_released === 0).length || 0}`);
            console.log(`   - Records with Pending status: ${villageFunds?.filter(vf => vf.status === 'Pending').length || 0}`);
        }

        // 2. Analyze District Proposals
        console.log('\n\n📦 2. DISTRICT PROPOSALS');
        console.log('-'.repeat(70));
        
        const { data: proposals, error: propError } = await supabase
            .from('district_proposals')
            .select('*')
            .order('created_at', { ascending: false });

        if (propError) {
            console.error('❌ Error:', propError.message);
        } else {
            console.log(`Total district proposals: ${proposals?.length || 0}`);
            
            // Group by status
            const byStatus = {};
            proposals?.forEach(p => {
                byStatus[p.status] = (byStatus[p.status] || 0) + 1;
            });
            
            console.log('\nBreakdown by status:');
            Object.entries(byStatus).forEach(([status, count]) => {
                console.log(`   ${status}: ${count} proposals`);
            });

            // Check for suspicious patterns
            console.log('\n⚠️  Suspicious patterns (possible seeded/test data):');
            console.log(`   - Records with allocated_amount = 0: ${proposals?.filter(p => !p.allocated_amount || p.allocated_amount === 0).length || 0}`);
            console.log(`   - Records in SUBMITTED status (not processed): ${proposals?.filter(p => p.status === 'SUBMITTED').length || 0}`);
            console.log(`   - Records without district_id: ${proposals?.filter(p => !p.district_id).length || 0}`);
            
            // Show sample of each status
            console.log('\n📋 Sample proposals by status:');
            const statuses = Object.keys(byStatus);
            for (const status of statuses) {
                const sample = proposals.filter(p => p.status === status).slice(0, 2);
                console.log(`\n   ${status}:`);
                sample.forEach(p => {
                    console.log(`      - ID ${p.id}: ${p.project_name} (District ID: ${p.district_id}, Allocated: ₹${p.allocated_amount?.toLocaleString('en-IN') || 0})`);
                });
            }
        }

        // 3. Analyze State Fund Releases
        console.log('\n\n📦 3. STATE FUND RELEASES');
        console.log('-'.repeat(70));
        
        const { data: stateReleases, error: srError } = await supabase
            .from('state_fund_releases')
            .select('*')
            .order('release_date', { ascending: false });

        if (srError) {
            console.error('❌ Error:', srError.message);
        } else {
            console.log(`Total state fund releases: ${stateReleases?.length || 0}`);
            
            // Group by state_id
            const byStateId = {};
            stateReleases?.forEach(sr => {
                byStateId[sr.state_id] = (byStateId[sr.state_id] || 0) + 1;
            });
            
            console.log('\nBreakdown by state_id:');
            Object.entries(byStateId).forEach(([stateId, count]) => {
                console.log(`   State ID ${stateId}: ${count} releases`);
            });

            // Check for project releases (PROJ- prefix)
            const projectReleases = stateReleases?.filter(sr => sr.sanction_order_no?.startsWith('PROJ-'));
            console.log(`\n   Project-specific releases (PROJ-*): ${projectReleases?.length || 0}`);
            
            if (projectReleases?.length > 0) {
                console.log('\n   Sample project releases:');
                projectReleases.slice(0, 5).forEach(sr => {
                    console.log(`      - ${sr.sanction_order_no}: ₹${sr.amount_cr} Cr (Date: ${sr.release_date})`);
                });
            }
        }

        // 4. Analyze Fund Allocations
        console.log('\n\n📦 4. FUND ALLOCATIONS');
        console.log('-'.repeat(70));
        
        const { data: allocations, error: allocError } = await supabase
            .from('fund_allocations')
            .select('*')
            .order('allocation_date', { ascending: false });

        if (allocError) {
            console.error('❌ Error:', allocError.message);
        } else {
            console.log(`Total fund allocations: ${allocations?.length || 0}`);
            
            allocations?.forEach(a => {
                const releasedPct = (parseInt(a.amount_released) / parseInt(a.amount_allocated) * 100).toFixed(2);
                console.log(`   - ${a.state_name}: Allocated ₹${(parseInt(a.amount_allocated) / 10000000).toFixed(2)} Cr, Released ₹${(parseInt(a.amount_released) / 10000000).toFixed(2)} Cr (${releasedPct}%)`);
            });
        }

        // 5. Provide cleanup recommendations
        console.log('\n\n' + '='.repeat(70));
        console.log('🧹 CLEANUP RECOMMENDATIONS');
        console.log('='.repeat(70));

        console.log('\n💡 Based on analysis, here are recommended cleanup actions:\n');

        console.log('1️⃣  VILLAGE FUND RELEASES:');
        console.log('   ❌ DELETE: Records without sanction orders (likely seeded)');
        console.log('   ❌ DELETE: Records with Pending status (incomplete)');
        console.log('   ❌ DELETE: Records with zero amounts (test data)');
        console.log('   ✅ KEEP: Records with proper sanction orders and non-zero amounts');

        console.log('\n2️⃣  DISTRICT PROPOSALS:');
        console.log('   ❌ DELETE: Records in SUBMITTED status without allocation');
        console.log('   ❌ DELETE: Records with allocated_amount = 0 (not properly processed)');
        console.log('   ✅ KEEP: Records with APPROVED_BY_MINISTRY or ASSIGNED_TO_EA status');
        console.log('   ✅ KEEP: Records with non-zero allocated_amount');

        console.log('\n3️⃣  STATE FUND RELEASES:');
        console.log('   ⚠️  REVIEW: Project-specific releases (PROJ-*) - verify against district_proposals');
        console.log('   ✅ KEEP: All state fund releases (part of fund flow tracking)');

        console.log('\n4️⃣  FUND ALLOCATIONS:');
        console.log('   ✅ KEEP: All fund allocations (master records for state funding)');

        // Interactive cleanup
        console.log('\n\n' + '='.repeat(70));
        console.log('🚀 READY TO CLEANUP?');
        console.log('='.repeat(70));
        console.log('\nThis script will now perform the cleanup based on the recommendations above.');
        console.log('Type "yes" to proceed or "no" to cancel:\n');

        // For now, just show what would be deleted
        console.log('\n📊 PREVIEW OF DELETIONS:\n');

        // Village funds to delete
        const vfToDelete = villageFunds?.filter(vf => 
            !vf.sanction_order_no || 
            vf.amount_allocated === 0 ||
            vf.amount_released === 0 ||
            vf.status === 'Pending'
        );
        console.log(`Village Fund Releases to DELETE: ${vfToDelete?.length || 0}`);
        if (vfToDelete?.length > 0) {
            console.log('   Sample records:');
            vfToDelete.slice(0, 5).forEach(vf => {
                console.log(`      - ID ${vf.id}: ${vf.village_name} (${vf.district_name}) - Reason: ${!vf.sanction_order_no ? 'No sanction order' : vf.amount_allocated === 0 ? 'Zero allocated' : vf.status === 'Pending' ? 'Pending status' : 'Zero released'}`);
            });
        }

        // District proposals to delete
        const propsToDelete = proposals?.filter(p => 
            (p.status === 'SUBMITTED' && (!p.allocated_amount || p.allocated_amount === 0)) ||
            (!p.allocated_amount || p.allocated_amount === 0)
        );
        console.log(`\nDistrict Proposals to DELETE: ${propsToDelete?.length || 0}`);
        if (propsToDelete?.length > 0) {
            console.log('   Sample records:');
            propsToDelete.slice(0, 5).forEach(p => {
                console.log(`      - ID ${p.id}: ${p.project_name} (District ID: ${p.district_id}) - Reason: ${p.status === 'SUBMITTED' ? 'Submitted but not allocated' : 'Zero allocation'}`);
            });
        }

        console.log('\n\n⚠️  TO EXECUTE CLEANUP, uncomment the deletion code at the end of this script.\n');

        // CLEANUP EXECUTION (UNCOMMENT TO RUN)
        /*
        console.log('\n\n' + '='.repeat(70));
        console.log('🧹 EXECUTING CLEANUP...');
        console.log('='.repeat(70));

        // Delete village funds
        if (vfToDelete?.length > 0) {
            const vfIds = vfToDelete.map(vf => vf.id);
            const { error: deleteVFError } = await supabase
                .from('village_fund_releases')
                .delete()
                .in('id', vfIds);
            
            if (deleteVFError) {
                console.error('❌ Error deleting village funds:', deleteVFError.message);
            } else {
                console.log(`✅ Deleted ${vfIds.length} village fund releases`);
            }
        }

        // Delete district proposals
        if (propsToDelete?.length > 0) {
            const propIds = propsToDelete.map(p => p.id);
            const { error: deletePropError } = await supabase
                .from('district_proposals')
                .delete()
                .in('id', propIds);
            
            if (deletePropError) {
                console.error('❌ Error deleting proposals:', deletePropError.message);
            } else {
                console.log(`✅ Deleted ${propIds.length} district proposals`);
            }
        }

        console.log('\n✅ CLEANUP COMPLETED!\n');
        */

    } catch (error) {
        console.error('❌ Fatal Error:', error.message);
    }
}

analyzeAndCleanup();
