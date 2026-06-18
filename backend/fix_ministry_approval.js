const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'proposalController.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find the Ministry approval section and add State officer notification
// We need to find the line with "const message = `Proposal Approved by Ministry"
// and replace it with district/state messages

const oldPattern = /const message = `Proposal Approved by Ministry[^;]+;/s;

const newCode = `const districtMessage = 'Your file has been approved by the Ministry. Proposal "' + proposalData.project_name + '" (Component: ' + proposalData.component + ') from ' + districtData.name + ' district, ' + stateName + ' has been APPROVED by the Ministry of Social Justice and Empowerment. - PM-AJAY Portal';

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

// Also need to replace the sendWhatsAppMessage call
const oldSendPattern = /const sent = await sendWhatsAppMessage\(proposalData\.phone_number, \{[^}]+message_body: message,[^}]+\}\);[\s\S]*?if \(sent\) notificationSent = true;/;

content = content.replace(oldSendPattern, newCode);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Ministry approval notifications updated!');
console.log('Added State officer WhatsApp notification');
