const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'proposalController.js');

console.log('Reading file:', filePath);
let content = fs.readFileSync(filePath, 'utf8');

// Fix State Approval Message (lines 501-505)
const oldStateMessage = `const message = \`✅ *Proposal Approved by State*\\\\n\\\\n\` +
                                \`Dear District Admin,\\\\n\\\\n\` +
                                \`Your proposal \\"*\${proposalData.project_name}*\\" (Component: \${proposalData.component}) has been *APPROVED* by the State Government.\\\\n\\\\n\` +
                                \`It has now been forwarded to the Ministry for final approval.\\\\n\\\\n\` +
                                \`~ PM-AJAY Portal\`;`;

const newStateMessage = `const message = \`Proposal Approved by State - Your proposal "\${proposalData.project_name}" (Component: \${proposalData.component}) has been APPROVED by the State Government and forwarded to the Ministry for final approval. - PM-AJAY Portal\`;`;

if (content.includes(oldStateMessage)) {
    content = content.replace(oldStateMessage, newStateMessage);
    console.log('✅ Fixed State approval message');
} else {
    console.log('⚠️ State approval message pattern not found - may already be fixed');
}

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ File updated successfully!');
console.log('\nPlease test by:');
console.log('1. Creating a proposal with phone number');
console.log('2. Approving it as State');
console.log('3. Check backend logs for WhatsApp confirmation');
