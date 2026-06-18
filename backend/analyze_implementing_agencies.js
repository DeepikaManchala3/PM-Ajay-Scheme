const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function analyzeImplementingAgencies() {
    console.log('\n🔍 ANALYZING IMPLEMENTING AGENCIES DATA\n');
    console.log('='.repeat(70));

    try {
        // 1. Fetch all implementing agencies
        console.log('\n📦 Step 1: Fetching all implementing agencies...');
        const { data: agencies, error: agenciesError } = await supabase
            .from('implementing_agencies')
            .select('*')
            .order('created_at', { ascending: true });

        if (agenciesError) throw agenciesError;

        console.log(`✅ Found ${agencies.length} implementing agencies\n`);

        // 2. Group by district
        const byDistrict = {};
        const byState = {};
        
        agencies.forEach(agency => {
            const district = agency.district_name || 'UNKNOWN';
            const state = agency.state_name || agency.state || 'UNKNOWN';
            
            if (!byDistrict[district]) {
                byDistrict[district] = [];
            }
            byDistrict[district].push(agency);

            if (!byState[state]) {
                byState[state] = 0;
            }
            byState[state]++;
        });

        console.log('📊 Breakdown by State:');
        Object.entries(byState).forEach(([state, count]) => {
            console.log(`   ${state}: ${count} agencies`);
        });

        console.log('\n📊 Districts with Multiple IAs:');
        const duplicateDistricts = Object.entries(byDistrict)
            .filter(([district, agencies]) => agencies.length > 1)
            .sort((a, b) => b[1].length - a[1].length);

        if (duplicateDistricts.length > 0) {
            duplicateDistricts.forEach(([district, agencies]) => {
                console.log(`\n   🔴 ${district}: ${agencies.length} IAs`);
                agencies.forEach((agency, idx) => {
                    console.log(`      ${idx + 1}. ${agency.agency_name}`);
                    console.log(`         ID: ${agency.id}`);
                    console.log(`         Email: ${agency.email}`);
                    console.log(`         Created: ${new Date(agency.created_at).toLocaleString()}`);
                });
            });
        } else {
            console.log('   ✅ No duplicate districts found!');
        }

        console.log('\n📊 Districts with Single IA:');
        const singleDistricts = Object.entries(byDistrict)
            .filter(([district, agencies]) => agencies.length === 1);
        console.log(`   ✅ ${singleDistricts.length} districts have exactly 1 IA`);

        // 3. Identify seeded/test data
        console.log('\n\n⚠️  Step 2: Identifying Seeded/Test Data...');
        console.log('-'.repeat(70));

        const suspiciousPatterns = [
            { pattern: /test|dummy|sample|seed/i, name: 'Test keywords' },
            { pattern: /@test\.com|@example\.com|@dummy\.com/i, name: 'Test email domains' },
            { pattern: /^IA-\d+|^Agency-\d+/i, name: 'Generic naming pattern' }
        ];

        const seededAgencies = agencies.filter(agency => {
            return suspiciousPatterns.some(({ pattern }) => 
                pattern.test(agency.agency_name) || 
                pattern.test(agency.email)
            );
        });

        console.log(`\n🔴 Found ${seededAgencies.length} potentially seeded agencies:`);
        seededAgencies.forEach(agency => {
            console.log(`   - ${agency.agency_name} (${agency.email})`);
            console.log(`     District: ${agency.district_name}, State: ${agency.state_name}`);
        });

        // 4. Recommend cleanup actions
        console.log('\n\n' + '='.repeat(70));
        console.log('🧹 CLEANUP RECOMMENDATIONS');
        console.log('='.repeat(70));

        console.log('\n1️⃣  REMOVE SEEDED DATA:');
        console.log(`   ❌ Delete ${seededAgencies.length} test/seeded agencies`);

        console.log('\n2️⃣  HANDLE DUPLICATE DISTRICTS:');
        if (duplicateDistricts.length > 0) {
            console.log(`   ❌ ${duplicateDistricts.length} districts have multiple IAs`);
            console.log('   📝 Action: Keep newest, rename & delete others');
            console.log('\n   Suggested naming convention:');
            duplicateDistricts.forEach(([district, agencies]) => {
                console.log(`\n   ${district}:`);
                const sorted = [...agencies].sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                sorted.forEach((agency, idx) => {
                    if (idx === 0) {
                        console.log(`      ✅ KEEP: ${agency.agency_name}`);
                    } else {
                        const newName = `${district}-IA-${idx}`;
                        console.log(`      ❌ RENAME & DELETE: ${agency.agency_name} → ${newName}`);
                    }
                });
            });
        } else {
            console.log('   ✅ No duplicate districts to handle');
        }

        console.log('\n3️⃣  ADD DUPLICATE VALIDATION:');
        console.log('   ✅ Backend: Check if district already has IA before insert');
        console.log('   ✅ Frontend: Show error "IA already exists for this district"');

        // 5. Generate cleanup SQL
        console.log('\n\n' + '='.repeat(70));
        console.log('📝 CLEANUP PREVIEW');
        console.log('='.repeat(70));

        const toDelete = [...seededAgencies];
        
        // Add duplicate IAs (keep newest per district)
        duplicateDistricts.forEach(([district, agencies]) => {
            const sorted = [...agencies].sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
            // Delete all except the first (newest)
            toDelete.push(...sorted.slice(1));
        });

        const uniqueToDelete = [...new Map(toDelete.map(a => [a.id, a])).values()];
        
        console.log(`\n📊 Summary:`);
        console.log(`   Total IAs: ${agencies.length}`);
        console.log(`   To Delete: ${uniqueToDelete.length}`);
        console.log(`   Remaining: ${agencies.length - uniqueToDelete.length}`);
        console.log(`   Districts: ${Object.keys(byDistrict).length - 1}`); // -1 for UNKNOWN

        console.log('\n\n✅ Analysis complete! Run cleanup script to execute changes.\n');

        return {
            agencies,
            duplicateDistricts,
            seededAgencies,
            toDelete: uniqueToDelete
        };

    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
        console.error(error);
    }
}

analyzeImplementingAgencies();
