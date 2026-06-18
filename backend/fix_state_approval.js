const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'proposalController.js');
let content = fs.readFileSync(filePath, 'utf8');

// Split into lines
const lines = content.split('\r\n');

// Find and replace lines 502-506 (index 501-505)
const startIndex = 501;
const endIndex = 505;

// New single line message
const newMessage = "                            const message = 'Your file has been approved by the State Government. Proposal \"' + proposalData.project_name + '\" (Component: ' + proposalData.component + ') from ' + districtData.name + ' district has been approved and forwarded to the Ministry. - PM-AJAY Portal';";

// Remove old lines and insert new one
lines.splice(startIndex, endIndex - startIndex + 1, newMessage);

// Write back
fs.writeFileSync(filePath, lines.join('\r\n'), 'utf8');

console.log('✅ State approval message fixed!');
console.log('Replaced lines 502-506 with single-line message');
