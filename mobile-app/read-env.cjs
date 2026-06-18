const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '..', '.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  
  let url = '';
  let key = '';
  
  lines.forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      url = line.substring('VITE_SUPABASE_URL='.length).trim().replace(/"/g, '');
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      key = line.substring('VITE_SUPABASE_ANON_KEY='.length).trim().replace(/"/g, '');
    }
  });
  
  console.log(JSON.stringify({ url, key }));
} catch (e) {
  console.error('Error:', e.message);
}
