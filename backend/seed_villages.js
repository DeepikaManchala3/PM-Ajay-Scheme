const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Try loading from root .env
const rootEnvPath = path.resolve(__dirname, '..', '.env');
const backendEnvPath = path.resolve(__dirname, '.env');

console.log('🔍 Looking for .env at:', rootEnvPath);
if (fs.existsSync(rootEnvPath)) {
    require('dotenv').config({ path: rootEnvPath });
    console.log('✅ Found .env in root');
} else if (fs.existsSync(backendEnvPath)) {
    require('dotenv').config({ path: backendEnvPath });
    console.log('✅ Found .env in backend');
} else {
    require('dotenv').config(); // Fallback
    console.log('⚠️ using default dotenv location');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Debug - URL found:', !!supabaseUrl);
console.log('Debug - Key found:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Checked VITE_SUPABASE_URL, SUPABASE_URL, etc.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const westGodavariVillages = [
    'Narasimhapuram', 'Yanamadurru', 'Komarada', 'Anacoderu', 'Losarigutlapadu',
    'Dirusumarru', 'Bethapudi', 'Thundurru', 'Vempa', 'Kovvada', 'Annavaram',
    'Chinamiram', 'Rayalam', 'Bhimavaram', 'Gunupudi', 'Taderu', 'Akividu',
    'Kolleru', 'Pedakapavaram', 'Chinakapavaram', 'Gummuluru', 'Taratava',
    'Kollaparru', 'Siddapuram', 'Dumpagadapa', 'Ajjamuru', 'Kuppanapudi',
    'Ai-Bhimavaram', 'Cherukumilli', 'Dharmapuram', 'Madiwada', 'Kalla',
    'Elurupadu', 'Kallakuru', 'Kolanapalle', 'Seesali', 'Jakkaram', 'Pedamiram',
    'Vempadu', 'Kopalle', 'Bondada', 'Doddanapudi', 'Prathallameraka', 'Kalavapudi'
];

const eastGodavariVillages = [
    'ELAKOLANU', 'G. DONTHAMURU', 'KOTAPADU', 'MARRIPUDI', 'MUKUNDAVARAM',
    'NALLAMILLI', 'PATHA DODDIGUNTA', 'PEDARAYAVARAM', 'RANGAMPETA', 'SINGAMPALLE',
    'BAYYAVARAM (U.I)', 'THADIPUDI', 'RAGOLAPALLE', 'THUPAKULAGUDEM', 'POCHAVARAM',
    'PAIDIMETTA', 'PRAKKILANKA', 'GAJJARAM'
];

async function seedVillages() {
    console.log('🌱 Starting village data seeding...');

    // Prepare data for insertion
    const villageData = [];

    // West Godavari
    westGodavariVillages.forEach((name, index) => {
        // Simple deduplication for names that appear twice in the list (e.g. Akividu, Kalla)
        // We'll give them unique codes
        villageData.push({
            village_code: `WG${String(index + 1).padStart(3, '0')}`,
            village_name: name,
            district_name: 'West Godavari',
            state_name: 'Andhra Pradesh',
            state_code: 'AP',
            district_code: 'WG'
        });
    });

    // East Godavari
    eastGodavariVillages.forEach((name, index) => {
        villageData.push({
            village_code: `EG${String(index + 1).padStart(3, '0')}`,
            village_name: name,
            district_name: 'East Godavari',
            state_name: 'Andhra Pradesh',
            state_code: 'AP',
            district_code: 'EG'
        });
    });

    console.log(`📦 Prepared ${villageData.length} villages for insertion.`);

    // 2. Insert Data
    const { data, error } = await supabase
        .from('villages')
        .upsert(villageData, { onConflict: 'village_code' })
        .select();

    if (error) {
        console.error('❌ Error inserting villages:', error);
        // If table doesn't exist error, we let user know
        if (error.code === '42P01') {
            console.error('⚠️ Table "villages" does not exist. Please run the migration script first.');
        }
    } else {
        console.log(`✅ Successfully inserted/updated ${data.length} villages!`);
    }
}

seedVillages();
