const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchLocations() {
    try {
        const { data, error } = await supabase
            .from('work_orders')
            .select('location')
            .order('location');

        if (error) throw error;

        // Extract distinct locations
        const locations = [...new Set(data.map(item => item.location).filter(l => l))];

        console.log('\n📍 Locations found in `work_orders` table:');
        console.log('----------------------------------------');
        locations.forEach((loc, index) => {
            console.log(`${index + 1}. ${loc}`);
        });
        console.log('----------------------------------------');
        console.log(`Total Unique Locations: ${locations.length}\n`);

    } catch (error) {
        console.error('Error fetching locations:', error.message);
    }
}

fetchLocations();
