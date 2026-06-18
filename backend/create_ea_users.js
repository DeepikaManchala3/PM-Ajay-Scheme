require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// List of 20 executing agencies
const executingAgencies = [
    { id: 'ea-001', agency_name: 'Patel Construction Company', agency_type: 'Construction', email: 'patel.construction@pmajay.gov.in', phone_number: '+91 9876543210' },
    { id: 'ea-002', agency_name: 'Aneel Infrastructure Ltd', agency_type: 'Infrastructure', email: 'aneel.infra@pmajay.gov.in', phone_number: '+91 9876543211' },
    { id: 'ea-003', agency_name: 'BuildPro Contractors', agency_type: 'Construction', email: 'buildpro@pmajay.gov.in', phone_number: '+91 9876543212' },
    { id: 'ea-004', agency_name: 'Metro Engineering Services', agency_type: 'Engineering', email: 'metro.eng@pmajay.gov.in', phone_number: '+91 9876543213' },
    { id: 'ea-005', agency_name: 'Prime Builders Association', agency_type: 'Construction', email: 'prime.builders@pmajay.gov.in', phone_number: '+91 9876543214' },
    { id: 'ea-006', agency_name: 'Global Infrastructure Group', agency_type: 'Infrastructure', email: 'global.infra@pmajay.gov.in', phone_number: '+91 9876543215' },
    { id: 'ea-007', agency_name: 'Elite Engineering Solutions', agency_type: 'Engineering', email: 'elite.eng@pmajay.gov.in', phone_number: '+91 9876543216' },
    { id: 'ea-008', agency_name: 'Skyline Builders', agency_type: 'Construction', email: 'skyline.builders@pmajay.gov.in', phone_number: '+91 9876543217' },
    { id: 'ea-009', agency_name: 'Urban Development Corp', agency_type: 'Infrastructure', email: 'urban.dev@pmajay.gov.in', phone_number: '+91 9876543218' },
    { id: 'ea-010', agency_name: 'Precision Engineering Ltd', agency_type: 'Engineering', email: 'precision.eng@pmajay.gov.in', phone_number: '+91 9876543219' },
    { id: 'ea-011', agency_name: 'Apex Construction Services', agency_type: 'Construction', email: 'apex.const@pmajay.gov.in', phone_number: '+91 9876543220' },
    { id: 'ea-012', agency_name: 'National Infrastructure Partners', agency_type: 'Infrastructure', email: 'national.infra@pmajay.gov.in', phone_number: '+91 9876543221' },
    { id: 'ea-013', agency_name: 'TechBuild Engineering', agency_type: 'Engineering', email: 'techbuild@pmajay.gov.in', phone_number: '+91 9876543222' },
    { id: 'ea-014', agency_name: 'Royal Contractors', agency_type: 'Construction', email: 'royal.contractors@pmajay.gov.in', phone_number: '+91 9876543223' },
    { id: 'ea-015', agency_name: 'Smart Infrastructure Solutions', agency_type: 'Infrastructure', email: 'smart.infra@pmajay.gov.in', phone_number: '+91 9876543224' },
    { id: 'ea-016', agency_name: 'Advanced Engineering Works', agency_type: 'Engineering', email: 'advanced.eng@pmajay.gov.in', phone_number: '+91 9876543225' },
    { id: 'ea-017', agency_name: 'Diamond Builders Group', agency_type: 'Construction', email: 'diamond.builders@pmajay.gov.in', phone_number: '+91 9876543226' },
    { id: 'ea-018', agency_name: 'Mega Infrastructure Ltd', agency_type: 'Infrastructure', email: 'mega.infra@pmajay.gov.in', phone_number: '+91 9876543227' },
    { id: 'ea-019', agency_name: 'Innovative Engineering Co', agency_type: 'Engineering', email: 'innovative.eng@pmajay.gov.in', phone_number: '+91 9876543228' },
    { id: 'ea-020', agency_name: 'Supreme Construction Works', agency_type: 'Construction', email: 'supreme.const@pmajay.gov.in', phone_number: '+91 9876543229' },
];

const PASSWORD = "Test123!";

async function createExecutingAgencyUsers() {
    console.log('🚀 Starting to create executing agency users...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const agency of executingAgencies) {
        try {
            console.log(`📝 Creating user for: ${agency.agency_name}`);
            console.log(`   Email: ${agency.email}`);

            // Create user in auth.users
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: agency.email,
                password: PASSWORD,
                email_confirm: true,
                user_metadata: {
                    role: 'executing_agency',
                    agency_name: agency.agency_name,
                    agency_type: agency.agency_type,
                    phone_number: agency.phone_number
                }
            });

            if (authError) {
                console.error(`   ❌ Error creating auth user: ${authError.message}`);
                errorCount++;
                continue;
            }

            const userId = authData.user.id;
            console.log(`   ✅ Auth user created with ID: ${userId}`);

            // Create profile in profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: agency.email,
                    role: 'executing_agency',
                    full_name: agency.agency_name,
                    phone_number: agency.phone_number
                });

            if (profileError) {
                console.error(`   ⚠️ Error creating profile: ${profileError.message}`);
            } else {
                console.log(`   ✅ Profile created`);
            }

            // Create or update executing_agencies record
            const { error: eaError } = await supabase
                .from('executing_agencies')
                .upsert({
                    user_id: userId,
                    agency_name: agency.agency_name,
                    agency_type: agency.agency_type,
                    email: agency.email,
                    phone_number: agency.phone_number,
                    state_name: 'Karnataka', // Default state
                    district_name: 'Bengaluru Urban', // Default district
                    status: 'Activated'
                }, {
                    onConflict: 'email'
                });

            if (eaError) {
                console.error(`   ⚠️ Error creating executing agency record: ${eaError.message}`);
            } else {
                console.log(`   ✅ Executing agency record created`);
            }

            successCount++;
            console.log(`   ✅ Successfully created user for ${agency.agency_name}\n`);

        } catch (error) {
            console.error(`   ❌ Unexpected error for ${agency.agency_name}:`, error.message);
            errorCount++;
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully created: ${successCount} users`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`\n🔑 All users created with password: ${PASSWORD}`);
}

createExecutingAgencyUsers()
    .then(() => {
        console.log('\n✅ Script completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
