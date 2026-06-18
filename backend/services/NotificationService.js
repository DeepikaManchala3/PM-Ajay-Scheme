const axios = require('axios');
require('dotenv').config();

const WATI_API_URL = process.env.WATI_API_URL;
const WATI_API_KEY = process.env.WATI_API_KEY;
const TENANT_ID = process.env.TENANT_ID;
const TEMPLATE_NAME = process.env.WATI_TEMPLATE_NAME || 'sih';

const sendWhatsAppMessage = async (phoneNumber, templateParams) => {
    if (!WATI_API_URL || !WATI_API_KEY || !TENANT_ID) {
        console.log('⚠️ WATI configuration missing, skipping WhatsApp message');
        console.log('Params:', templateParams);
        return false;
    }

    if (!phoneNumber) {
        console.log('⚠️ No phone number provided for WhatsApp message');
        return false;
    }

    try {
        // Format phone number
        let formattedPhone = phoneNumber.replace(/\D/g, '');
        if (formattedPhone.startsWith('91')) {
            formattedPhone = formattedPhone.substring(2);
        }
        if (formattedPhone.length === 10) {
            formattedPhone = `91${formattedPhone}`;
        } else {
            console.log(`⚠️ Invalid phone number format: ${phoneNumber}`);
            return false;
        }

        const endpoint = `${WATI_API_URL}/${TENANT_ID}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;

        // Construct message body from params if not provided explicitly?
        // The WATI API typically takes 'parameters' which are variables in the template.
        // Based on cronService.js, it uses a single 'message_body' parameter for the 'sih' template.

        let messageBody = templateParams.message_body;
        if (!messageBody && templateParams.message) {
            messageBody = templateParams.message;
        }

        const payload = {
            template_name: TEMPLATE_NAME,
            broadcast_name: templateParams.broadcast_name || 'System Notification',
            parameters: [{ name: "message_body", value: messageBody }]
        };

        const response = await axios.post(endpoint, payload, {
            headers: {
                'Authorization': `Bearer ${WATI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        
        console.log(`✅ WhatsApp message sent to ${formattedPhone}`);
        console.log('👉 WATI Response:', JSON.stringify(response.data, null, 2));
        return true;

    } catch (error) {
        console.error(`❌ Error sending WhatsApp message to ${phoneNumber}:`, error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        return false;
    }
};

module.exports = {
    sendWhatsAppMessage
};
