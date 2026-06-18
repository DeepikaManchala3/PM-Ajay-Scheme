const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Random Coordinate Generator within approx India bounds (or specific states if needed)
// India Lat: 8.4 to 37.6, Long: 68.7 to 97.25
// Let's keep it tighter to populated areas for demo: Lat 12-28, Long 74-88
function getRandomCoordinates() {
    const lat = 12 + Math.random() * 16;
    const long = 74 + Math.random() * 14;
    return {
        lat: parseFloat(lat.toFixed(4)),
        long: parseFloat(long.toFixed(4))
    };
}

const financialYears = ['2024-2025', '2023-2024', '2022-2023'];

async function seedTrackingData() {
    console.log('🌱 Seeding Project Tracking Data...');

    // 1. Fetch all approved projects
    const { data: projects, error } = await supabase
        .from('approved_projects')
        .select('*');

    if (error) {
        console.error('❌ Error fetching projects:', error.message);
        return;
    }

    console.log(`Found ${projects.length} projects. Assigning random coordinates and years...`);

    let updatedCount = 0;

    for (const project of projects) {
        const { lat, long } = getRandomCoordinates();
        // Assign a random financial year
        const year = financialYears[Math.floor(Math.random() * financialYears.length)];

        // Update the project
        const { error: updateError } = await supabase
            .from('approved_projects')
            .update({
                latitude: lat,
                longitude: long,
                financial_year: year
            })
            .eq('id', project.id);

        if (updateError) {
            if (updateError.message.includes('column "latitude" of relation "approved_projects" does not exist')) {
                console.error('🛑 Schema Alert: Columns missing! Please run the `update_schema_tracking.sql` script in Supabase first.');
                process.exit(1);
            }
            console.error(`❌ Failed to update project ${project.id}:`, updateError.message);
        } else {
            updatedCount++;
        }
    }

    console.log(`✅ Successfully updated ${updatedCount} projects with Mock Tracking Data.`);
}

seedTrackingData();
