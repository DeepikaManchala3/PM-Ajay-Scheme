const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
const REMINDER_INTERVAL_MS = 5 * 60 * 1000; // 5 Minutes
const MAX_REMINDERS = 5;
const STATE_FILE_PATH = path.join(__dirname, 'reminder_state.json');

const WATI_API_URL = process.env.WATI_API_URL;
const WATI_API_KEY = process.env.WATI_API_KEY;
const TENANT_ID = process.env.TENANT_ID;
const TEMPLATE_NAME = process.env.WATI_TEMPLATE_NAME || 'sih';

// State cache to avoid repeated DB calls
const stateAdminCache = {};

// Helper to read/write reminder state
function getReminderState() {
    try {
        if (fs.existsSync(STATE_FILE_PATH)) {
            const data = fs.readFileSync(STATE_FILE_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading reminder state:', error);
    }
    return {};
}

function saveReminderState(state) {
    try {
        fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2));
    } catch (error) {
        console.error('Error saving reminder state:', error);
    }
}

async function sendWhatsAppReminder(phone, adminName, proposalDetails) {
    if (!WATI_API_URL || !WATI_API_KEY || !TENANT_ID) {
        console.log('⚠️ WATI configuration missing, skipping WhatsApp reminder');
        return false;
    }

    try {
        // Format phone number
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('91')) {
            formattedPhone = formattedPhone.substring(2);
        }
        formattedPhone = `91${formattedPhone}`;

        const messageContent =
            `PROPOSAL REMINDER - ` +
            `Dear ${adminName}, ` +
            `The proposal "${proposalDetails.projectName}" from ${proposalDetails.districtName} ` +
            `(Component: ${proposalDetails.component}, Cost: ₹${proposalDetails.estimatedCost} Lakhs) ` +
            `is still PENDING your approval. ` +
            `Please login to the PM-AJAY portal to review and take action immediately. ` +
            `Thank you, PM-AJAY Administration`;

        const endpoint = `${WATI_API_URL}/${TENANT_ID}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;
        const payload = {
            template_name: TEMPLATE_NAME,
            broadcast_name: 'Proposal Pending Reminder',
            parameters: [{ name: "message_body", value: messageContent }]
        };

        const response = await axios.post(endpoint, payload, {
            headers: {
                'Authorization': `Bearer ${WATI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ Reminder sent to ${adminName} (${formattedPhone})`);
        // console.log('👉 WATI Response:', JSON.stringify(response.data, null, 2));
        return true;

    } catch (error) {
        console.error(`❌ Error sending WhatsApp reminder to ${adminName}:`, error.message);
        return false;
    }
}

async function checkAndRemindPendingProposals() {
    console.log('⏰ Checking for pending proposals to send reminders...');

    try {
        // 1. Fetch all SUBMITTED proposals
        const { data: proposals, error } = await supabase
            .from('district_proposals')
            .select('id, project_name, component, estimated_cost, district_id, created_at')
            .eq('status', 'SUBMITTED');

        if (error) {
            console.error('Error fetching pending proposals:', error);
            return;
        }

        if (!proposals || proposals.length === 0) {
            console.log('No pending proposals found.');
            return;
        }

        console.log(`Found ${proposals.length} pending proposals.`);

        // Load current state
        const reminderState = getReminderState();
        let stateChanged = false;

        // 2. Process each proposal
        for (const proposal of proposals) {
            try {
                const proposalId = proposal.id;
                const currentCount = reminderState[proposalId] || 0;

                if (currentCount >= MAX_REMINDERS) {
                    console.log(`⏭️ Max reminders (${MAX_REMINDERS}) reached for proposal ${proposalId}. Skipping.`);
                    continue;
                }

                // Check if proposal has been pending for at least 1 minute
                const createdAt = new Date(proposal.created_at);
                const now = new Date();
                const minutesPending = (now - createdAt) / (1000 * 60);

                if (minutesPending < 1) {
                    console.log(`⏳ Proposal ${proposalId} (${proposal.project_name}) is too recent (${minutesPending.toFixed(1)} min). Skipping.`);
                    continue;
                }

                // Get District and State info
                const { data: districtData } = await supabase
                    .from('districts')
                    .select('name, state_id, states(name)')
                    .eq('id', proposal.district_id)
                    .single();

                if (!districtData || !districtData.states) continue;

                const stateName = districtData.states.name;
                const districtName = districtData.name;

                // Find State Admin (check cache first)
                let stateAdmin = stateAdminCache[stateName];

                if (!stateAdmin) {
                    const { data: adminData } = await supabase
                        .from('state_assignment')
                        .select('admin_name, phone_no')
                        .ilike('state_name', stateName)
                        .eq('status', 'Activated')
                        .limit(1)
                        .maybeSingle();

                    if (adminData) {
                        stateAdmin = adminData;
                        stateAdminCache[stateName] = stateAdmin; // Cache it
                    }
                }

                if (stateAdmin) {
                    const sent = await sendWhatsAppReminder(stateAdmin.phone_no, stateAdmin.admin_name, {
                        projectName: proposal.project_name,
                        districtName: districtName,
                        component: proposal.component,
                        estimatedCost: proposal.estimated_cost
                    });

                    if (sent) {
                        reminderState[proposalId] = currentCount + 1;
                        stateChanged = true;
                        console.log(`📊 Reminder count for proposal ${proposalId}: ${reminderState[proposalId]}/${MAX_REMINDERS}`);

                        // USER REQUEST: Send only 1 message per interval.
                        // Stop processing other proposals for this cycle.
                        // break; // Removed to allow sending reminders for all pending proposals
                    }
                } else {
                    console.log(`⚠️ No active State Admin found for ${stateName} to send reminder.`);
                }

            } catch (innerError) {
                console.error(`Error processing proposal ${proposal.id}:`, innerError);
            }
        }

        if (stateChanged) {
            saveReminderState(reminderState);
        }

    } catch (err) {
        console.error('Critical error in reminder service:', err);
    }
}

function startScheduler() {
    console.log(`🚀 Proposal Reminder Service started (Interval: 1 minute, Max Reminders: ${MAX_REMINDERS})`);

    // Run immediately on start
    checkAndRemindPendingProposals();

    // Set interval
    setInterval(checkAndRemindPendingProposals, REMINDER_INTERVAL_MS);
}

module.exports = { startScheduler, checkAndRemindPendingProposals };
