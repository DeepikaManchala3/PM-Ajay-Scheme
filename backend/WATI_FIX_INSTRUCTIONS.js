// Manual fix instructions for proposalController.js

/*
FIND these lines (501-505):

                            const message = `✅ *Proposal Approved by State*\\n\\n` +
                                `Dear District Admin,\\n\\n` +
                                `Your proposal \"*${proposalData.project_name}*\" (Component: ${proposalData.component}) has been *APPROVED* by the State Government.\\n\\n` +
                                `It has now been forwarded to the Ministry for final approval.\\n\\n` +
                                `~ PM-AJAY Portal`;

REPLACE WITH this single line:

                            const message = `Proposal Approved - Your proposal "${proposalData.project_name}" (Component: ${proposalData.component}) has been APPROVED by State and forwarded to Ministry. - PM-AJAY Portal`;

*/

// The issue: WATI API doesn't allow:
// 1. Newline characters (\n)
// 2. Tab characters (\t)
// 3. More than 4 consecutive spaces
// 4. Some special formatting like asterisks for bold

// Solution: Use a simple single-line message without special characters
