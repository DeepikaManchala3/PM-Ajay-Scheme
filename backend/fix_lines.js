const fs = require('fs');
const file = 'c:\\\\Users\\\\gayat\\\\PM-Ajay-2\\\\backend\\\\controllers\\\\proposalController.js';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\\r\\n');

// Replace lines 501-505 with a single line
const newLine = '                            const message = \Proposal Approved by State - Your proposal \"\\" (Component: \) has been APPROVED by the State Government and forwarded to the Ministry. - PM-AJAY Portal\;';

// Remove lines 501-505 (index 500-504) and insert new line
lines.splice(500, 5, newLine);

fs.writeFileSync(file, lines.join('\\r\\n'), 'utf8');
console.log(' State approval message fixed!');
