const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'proposalController.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Starting fixes...');

// Step 1: Add import at the top
const importLine = "const { statePhoneNumbers } = require('../config/stateOfficers');";
const lines = content.split('\r\n');

// Find the line with sendWhatsAppMessage import (line 2, index 1)
if (!lines[2].includes('statePhoneNumbers')) {
    lines.splice(2, 0, importLine);
    console.log('✅ Added statePhoneNumbers import');
}

content = lines.join('\r\n');

// Step 2: Fix State approval message (around line 502-506)
// Find the State approval WhatsApp section
const stateApprovalPattern = /const message = `✅ \*Proposal Approved by State\*\\n\\n` \+[\s\S]*?`~ PM-AJAY Portal`;/;
const stateApprovalReplacement = "const message = 'Your file has been approved by the State Government. Proposal \"' + proposalData.project_name + '\" (Component: ' + proposalData.component + ') from ' + districtData.name + ' district has been approved and forwarded to the Ministry. - PM-AJAY Portal';";

if (stateApprovalPattern.test(content)) {
    content = content.replace(stateApprovalPattern, stateApprovalReplacement);
    console.log('✅ Fixed State approval message');
} else {
    console.log('⚠️ Could not find State approval message pattern');
}

// Step 3: Fix Ministry approval and add State officer notification
// Find Ministry approval section
const ministryPattern = /const message = `Proposal Approved by Ministry - Your proposal[^;]+;[\s\S]*?const sent = await sendWhatsAppMessage\(proposalData\.phone_number, \{[\s\S]*?message_body: message,[\s\S]*?\}\);[\s\S]*?if \(sent\) notificationSent = true;/;

const ministryReplacement = `const districtMessage = 'Your file has been approved by the Ministry. Proposal "' + proposalData.project_name + '" (Component: ' + proposalData.component + ') from ' + districtData.name + ' district, ' + stateName + ' has been APPROVED by the Ministry of Social Justice and Empowerment. - PM-AJAY Portal';

                            const sent = await sendWhatsAppMessage(proposalData.phone_number, {
                                message_body: districtMessage,
                                broadcast_name: 'Ministry Approval - District Notification'
                            });

                            if (sent) notificationSent = true;

                            // Also send WhatsApp to State Officer
                            const statePhoneNumber = statePhoneNumbers[stateName];
                            if (statePhoneNumber) {
                                console.log(\`📱 Sending WhatsApp notification to State Admin (\${stateName}) at \${statePhoneNumber}\`);

                                const stateMessage = 'Your file has been approved by the Ministry. Proposal "' + proposalData.project_name + '" (Component: ' + proposalData.component + ') from ' + districtData.name + ' district in your state has been APPROVED by the Ministry. - PM-AJAY Portal';

                                await sendWhatsAppMessage(statePhoneNumber, {
                                    message_body: stateMessage,
                                    broadcast_name: 'Ministry Approval - State Notification'
                                });
                            }`;

if (ministryPattern.test(content)) {
    content = content.replace(ministryPattern, ministryReplacement);
    console.log('✅ Fixed Ministry approval and added State officer notification');
} else {
    console.log('⚠️ Could not find Ministry approval message pattern');
}

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('\n✅ All fixes applied successfully!');
console.log('File updated: controllers/proposalController.js');
