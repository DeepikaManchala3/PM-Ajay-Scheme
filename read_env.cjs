const fs = require('fs');
try {
  const content = fs.readFileSync('.env', 'utf8');
  console.log(content);
} catch (e) {
  console.error(e);
}
