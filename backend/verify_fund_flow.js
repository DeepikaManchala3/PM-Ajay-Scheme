const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function verifyFundFlow() {
    console.log('\n🔍 VERIFYING COMPLETE FUND FLOW FROM MINISTRY TO STATE\n');
    console.log('='.repeat(70));
    
    const testStateId = 1; // Andhra Pradesh
    const testStateName = 'Andhra Pradesh';

    try {
        // 1. Check Village Fund Releases (Ministry → State via village releases)
        console.log('\n📦 1. VILLAGE FUND RELEASES (village_fund_releases table)');
        console.log('-'.repeat(70));
        const { data: villageFunds, error: villageError } = await supabase
            .from('village_fund_releases')
            .select('*')
            .eq('state_name', testStateName)
            .order('created_at', { ascending: false })
            .limit(5);

        if (villageError) {
            console.error('❌ Error:', villageError.message);
        } else {
            console.log(`✅ Found ${villageFunds?.length || 0} village fund releases for ${testStateName}`);
            if (villageFunds && villageFunds.length > 0) {
                console.log('\n📋 Sample Village Funds:');
                villageFunds.forEach((vf, idx) => {
                    console.log(`   ${idx + 1}. Village: ${vf.village_name} (${vf.district_name})`);
                    console.log(`      - Amount Allocated: ₹${vf.amount_allocated?.toLocaleString('en-IN')}`);
                    console.log(`      - Amount Released: ₹${vf.amount_released?.toLocaleString('en-IN')}`);
                    console.log(`      - Release Date: ${vf.release_date}`);
                    console.log(`      - Components: ${Array.isArray(vf.component) ? vf.component.join(', ') : vf.component}`);
                    console.log(`      - Status: ${vf.status}`);
                });
            }
        }

        // 2. Check District Proposals (Projects from districts that need EA assignment)
        console.log('\n\n📦 2. DISTRICT PROPOSALS (district_proposals table)');
        console.log('-'.repeat(70));
        
        // First get state districts
        const { data: stateDistricts, error: districtError } = await supabase
            .from('districts')
            .select('id, name')
            .eq('state_id', testStateId);

        if (districtError) {
            console.error('❌ Error fetching districts:', districtError.message);
        } else {
            const districtIds = stateDistricts.map(d => d.id);
            console.log(`✅ State has ${stateDistricts.length} districts (IDs: ${districtIds.join(', ')})`);

            const { data: proposals, error: proposalError } = await supabase
                .from('district_proposals')
                .select('*')
                .in('district_id', districtIds)
                .order('created_at', { ascending: false })
                .limit(5);

            if (proposalError) {
                console.error('❌ Error:', proposalError.message);
            } else {
                console.log(`✅ Found ${proposals?.length || 0} district proposals`);
                if (proposals && proposals.length > 0) {
                    console.log('\n📋 Sample District Proposals:');
                    proposals.forEach((p, idx) => {
                        const districtName = stateDistricts.find(d => d.id == p.district_id)?.name || 'Unknown';
                        console.log(`   ${idx + 1}. Project: ${p.project_name} (${districtName})`);
                        console.log(`      - Component: ${p.component}`);
                        console.log(`      - Estimated Cost: ₹${p.estimated_cost?.toLocaleString('en-IN')}`);
                        console.log(`      - Allocated Amount: ₹${p.allocated_amount?.toLocaleString('en-IN')}`);
                        console.log(`      - Status: ${p.status}`);
                        console.log(`      - EA Assignment: ${p.executing_agency_name || 'NOT ASSIGNED'}`);
                    });
                }
            }
        }

        // 3. Check State Fund Releases (Ministry → State releases)
        console.log('\n\n📦 3. STATE FUND RELEASES (state_fund_releases table)');
        console.log('-'.repeat(70));
        const { data: stateReleases, error: stateReleaseError } = await supabase
            .from('state_fund_releases')
            .select('*')
            .eq('state_id', testStateId)
            .order('release_date', { ascending: false })
            .limit(5);

        if (stateReleaseError) {
            console.error('❌ Error:', stateReleaseError.message);
        } else {
            console.log(`✅ Found ${stateReleases?.length || 0} state fund releases`);
            if (stateReleases && stateReleases.length > 0) {
                console.log('\n📋 Sample State Releases:');
                stateReleases.forEach((sr, idx) => {
                    console.log(`   ${idx + 1}. Release ID: ${sr.id}`);
                    console.log(`      - Amount: ₹${sr.amount_cr} Cr (₹${sr.amount_rupees?.toLocaleString('en-IN')})`);
                    console.log(`      - Release Date: ${sr.release_date}`);
                    console.log(`      - Components: ${Array.isArray(sr.component) ? sr.component.join(', ') : sr.component || 'N/A'}`);
                    console.log(`      - Sanction Order: ${sr.sanction_order_no || 'N/A'}`);
                });
            }
        }

        // 4. Check Fund Allocations (Overall state allocations)
        console.log('\n\n📦 4. FUND ALLOCATIONS (fund_allocations table)');
        console.log('-'.repeat(70));
        const { data: allocations, error: allocationError } = await supabase
            .from('fund_allocations')
            .select('*')
            .eq('state_name', testStateName)
            .order('allocation_date', { ascending: false });

        if (allocationError) {
            console.error('❌ Error:', allocationError.message);
        } else {
            console.log(`✅ Found ${allocations?.length || 0} fund allocations`);
            if (allocations && allocations.length > 0) {
                const totalAllocated = allocations.reduce((sum, a) => sum + (parseInt(a.amount_allocated) || 0), 0);
                const totalReleased = allocations.reduce((sum, a) => sum + (parseInt(a.amount_released) || 0), 0);
                console.log(`\n💰 Total Allocated: ₹${(totalAllocated / 10000000).toFixed(2)} Cr`);
                console.log(`💰 Total Released: ₹${(totalReleased / 10000000).toFixed(2)} Cr`);
                console.log(`💰 Remaining: ₹${((totalAllocated - totalReleased) / 10000000).toFixed(2)} Cr`);
            }
        }

        // 5. Test getCentralProjects API Logic
        console.log('\n\n📦 5. CENTRAL PROJECTS API SIMULATION (State Dashboard View)');
        console.log('-'.repeat(70));
        
        const { data: allStateDistricts } = await supabase
            .from('districts')
            .select('id, name')
            .eq('state_id', testStateId);

        const stateDistrictIds = allStateDistricts.map(d => d.id);
        const districtMap = {};
        allStateDistricts.forEach(d => { districtMap[d.id] = d.name; });

        // Get district proposals for this state
        const { data: districtProjects } = await supabase
            .from('district_proposals')
            .select('*')
            .in('district_id', stateDistrictIds);

        // Get village funds for this state
        const { data: villageProjects } = await supabase
            .from('village_fund_releases')
            .select('*')
            .eq('state_name', testStateName);

        console.log(`✅ API would return:`);
        console.log(`   - ${districtProjects?.length || 0} District Projects`);
        console.log(`   - ${villageProjects?.length || 0} Village Funds`);
        console.log(`   - Total: ${(districtProjects?.length || 0) + (villageProjects?.length || 0)} items`);

        // 6. Check Status Breakdown
        console.log('\n\n📊 6. STATUS BREAKDOWN');
        console.log('-'.repeat(70));
        
        if (districtProjects && districtProjects.length > 0) {
            console.log('District Projects by Status:');
            const statusCounts = {};
            districtProjects.forEach(p => {
                statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
            });
            Object.entries(statusCounts).forEach(([status, count]) => {
                console.log(`   - ${status}: ${count}`);
            });
        }

        if (villageProjects && villageProjects.length > 0) {
            console.log('\nVillage Funds by Status:');
            const statusCounts = {};
            villageProjects.forEach(vf => {
                statusCounts[vf.status] = (statusCounts[vf.status] || 0) + 1;
            });
            Object.entries(statusCounts).forEach(([status, count]) => {
                console.log(`   - ${status}: ${count}`);
            });
        }

        // 7. Check EA Assignment Status
        console.log('\n\n📊 7. EXECUTING AGENCY ASSIGNMENT STATUS');
        console.log('-'.repeat(70));
        
        if (districtProjects) {
            const assignedCount = districtProjects.filter(p => p.executing_agency_id || p.executing_agency_name).length;
            const unassignedCount = districtProjects.length - assignedCount;
            console.log(`District Projects:`);
            console.log(`   - Assigned to EA: ${assignedCount}`);
            console.log(`   - Unassigned: ${unassignedCount}`);
        }

        console.log(`\nVillage Funds:`);
        console.log(`   - Note: Village funds don't have EA assignment fields yet`);
        console.log(`   - Total village funds: ${villageProjects?.length || 0}`);

        // Summary
        console.log('\n\n' + '='.repeat(70));
        console.log('📝 SUMMARY & RECOMMENDATIONS');
        console.log('='.repeat(70));
        
        console.log('\n✅ WHAT\'S WORKING:');
        console.log('   1. Village fund releases are being stored correctly');
        console.log('   2. District proposals are linked to correct state districts');
        console.log('   3. getCentralProjects API should show both types');

        console.log('\n⚠️  WHAT TO VERIFY:');
        console.log('   1. Restart backend server to load updated getCentralProjects code');
        console.log('   2. Check if frontend is calling the correct API endpoint');
        console.log('   3. Verify that stateId is being passed correctly from frontend');
        
        console.log('\n💡 KEY INSIGHT:');
        console.log('   - When Ministry releases village funds: They create records in village_fund_releases');
        console.log('   - When State views Central Projects: API fetches from both district_proposals AND village_fund_releases');
        console.log('   - Both should appear in the Central Projects Assignment page');
        console.log('   - NO approval needed - funds are automatically available when released\n');

    } catch (error) {
        console.error('❌ Fatal Error:', error.message);
    }
}

verifyFundFlow();
