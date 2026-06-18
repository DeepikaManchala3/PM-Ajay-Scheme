const fs = require('fs');
const path = require('path');

const STATE_FILE_PATH = path.join(__dirname, 'services', 'reminder_state.json');

console.log('--- Resetting Reminder Counters ---');
fs.writeFileSync(STATE_FILE_PATH, '{}');
console.log('✅ Reset complete! Reminders will restart for all pending proposals.');
console.log('📱 Make sure phone numbers have initiated contact with your WhatsApp Business number first!');
