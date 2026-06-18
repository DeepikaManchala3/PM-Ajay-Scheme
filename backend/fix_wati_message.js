const fs = require('fs');

const filePath = 'c:\\Users\\gayat\\PM-Ajay-2\\backend\\controllers\\proposalController.js';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// The old pattern (with escaped backslashes as they appear in the file)
const oldMessage = `const message = \`✅ *Proposal Approved by State*\\\\n\\\\n\` +
                                \`Dear District Admin,\\\\n\\\\n\` +
                                \`Your proposal \\"*\${proposalData.project_name}*\\" (Component: \${proposalData.component}) has been *APPROVED* by the State Government.\\\\n\\\\n\` +
                                \`It has now been forwarded to the Ministry for final approval.\\\\n\\\\n\` +
                                \`~ PM-AJAY Portal\`;`;

// The new single-line message
const newMessage = `const message = \`Proposal Approved by State - Dear District Admin, Your proposal "\${proposalData.project_name}" (Component: \${proposalData.component}) has been APPROVED by the State Government and forwarded to the Ministry for final approval. - PM-AJAY Portal\`;`;

// Replace
content = content.replace(oldMessage, newMessage);

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ File updated successfully!');
