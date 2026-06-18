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

async function checkMismatch() {
    console.log('🔍 Checking for Data Mismatches...');

    // 1. Get District Name from 'districts' table for West Godavari
    const { data: districtsData, error: districtsError } = await supabase
        .from('districts')
        .select('name');
    //.ilike('name', '%Godavari%');

    if (districtsError) {
        console.error('❌ Error fetching districts:', districtsError.message);
    } else {
        const godavariDistricts = districtsData ? districtsData.filter(d => d.name.includes('Godavari')) : [];
        console.log('📋 Districts in DB (districts table):');
        godavariDistricts.forEach(d => console.log(`   - "${d.name}"  <-- length: ${d.name.length}`));
    }

    // 2. Get Distinct District Names from 'villages' table
    const { data: villageDistricts, error: villageError } = await supabase
        .from('villages')
        .select('district_name');

    if (villageError) {
        console.error('❌ Error fetching village districts:', villageError.message);
    } else {
        // Unique names
        const uniqueNames = [...new Set(villageDistricts.map(v => v.district_name))];
        console.log('📋 District Names in Villages Table:');
        uniqueNames.forEach(name => console.log(`   - "${name}"  <-- length: ${name ? name.length : 0}`));
    }
}

checkMismatch();
