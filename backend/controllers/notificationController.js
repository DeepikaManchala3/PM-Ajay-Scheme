const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get notifications for a user based on role and filters
 */
exports.getNotifications = async (req, res) => {
    try {
        const { userRole, stateName, districtName, limit = 20 } = req.query;

        if (!userRole) {
            return res.status(400).json({
                success: false,
                error: 'userRole is required'
            });
        }

        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_role', userRole)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        if (stateName) {
            query = query.eq('state_name', stateName);
        }

        if (districtName) {
            query = query.eq('district_name', districtName);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching notifications:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            data: data || []
        });

    } catch (error) {
        console.error('Error in getNotifications:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            message: 'Notification marked as read'
        });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Create test notification (for testing purposes)
 */
exports.createTestNotification = async (req, res) => {
    try {
        const { userRole, stateName, districtName, title, message, type = 'info' } = req.body;

        if (!userRole || !title || !message) {
            return res.status(400).json({
                success: false,
                error: 'userRole, title, and message are required'
            });
        }

        const notification = {
            user_role: userRole,
            title,
            message,
            type,
            read: false,
            created_at: new Date().toISOString()
        };

        if (stateName) notification.state_name = stateName;
        if (districtName) notification.district_name = districtName;

        const { data, error } = await supabase
            .from('notifications')
            .insert([notification])
            .select();

        if (error) {
            console.error('Error creating notification:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            message: 'Test notification created',
            data: data[0]
        });

    } catch (error) {
        console.error('Error creating test notification:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Send WhatsApp notification for fund allocation using WATI API
 * Format based on working WATI integration pattern
 */
exports.sendAllocationNotification = async (req, res) => {
    try {
        const {
            allocatorPhone,
            allocatorName,
            allocatorRole,
            stateName,
            amount,
            component,
            date,
            officerId
        } = req.body;

        // Validate required fields
        if (!allocatorPhone || !allocatorName || !stateName || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: allocatorPhone, allocatorName, stateName, amount'
            });
        }

        // Format phone number to international format (remove +91 if present, then add it)
        let formattedPhone = allocatorPhone.replace(/\D/g, ''); // Remove non-digits
        if (formattedPhone.startsWith('91')) {
            formattedPhone = formattedPhone.substring(2);
        }
        formattedPhone = `91${formattedPhone}`; // WATI expects format: 91XXXXXXXXXX

        // Validate phone number length (should be 10 digits after country code)
        if (formattedPhone.length !== 12) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format. Expected 10 digits.'
            });
        }

        // Get WATI configuration from environment variables
        const watiApiBaseUrl = process.env.WATI_API_URL;
        const watiApiKey = process.env.WATI_API_KEY;
        const tenantId = process.env.TENANT_ID;
        const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

        if (!watiApiBaseUrl || !watiApiKey || !tenantId) {
            return res.status(500).json({
                success: false,
                error: 'WATI API credentials not configured. Please check .env file (WATI_API_URL, WATI_API_KEY, TENANT_ID).'
            });
        }

        // Prepare template parameters for 'sih' template
        // Template has only ONE parameter: 'message_body'
        // WATI doesn't accept \n newlines, so format as single text with spacing
        console.log('📱 Sending WhatsApp notification to:', formattedPhone);
        console.log('📋 Using template:', templateName);

        const messageContent =
            `FUND ALLOCATION NOTIFICATION - ` +
            `Dear ${allocatorName}, ` +
            `A new fund allocation has been made for your state. ` +
            `State: ${stateName}. ` +
            `Amount Allocated: Rs ${amount} Crore. ` +
            `Scheme Component: ${Array.isArray(component) ? component.join(', ') : component || 'N/A'}. ` +
            `Allocation Date: ${date || new Date().toISOString().slice(0, 10)}. ` +
            `Your Role: ${allocatorRole || 'State Official'}. ` +
            `Officer ID: ${officerId || 'N/A'}. ` +
            `Please acknowledge receipt of this notification. ` +
            `Thank you, Ministry of Social Justice & Empowerment`;

        // Sanitize message content
        const sanitizedMessage = messageContent.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();

        const templateParams = [
            { name: "message_body", value: sanitizedMessage }
        ];

        console.log('📱 Sending WhatsApp notification to:', messageContent);
        console.log('📋 Using template:', templateName);
        // WATI API endpoint with tenant ID and whatsappNumber as query parameter
        const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;

        // Prepare request payload
        const payload = {
            template_name: templateName,
            broadcast_name: 'Fund Allocation Notification',
            parameters: templateParams
        };

        console.log('🔗 WATI Endpoint:', endpoint);
        console.log('📝 Payload:', JSON.stringify(payload, null, 2));

        // Make API call to WATI
        const response = await axios.post(endpoint, payload, {
            headers: {
                'Authorization': `Bearer ${watiApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ WATI API Response Status:', response.status);
        console.log('✅ WATI API Response Data:', JSON.stringify(response.data, null, 2));

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'WhatsApp notification sent successfully',
            data: {
                phone: formattedPhone,
                allocatorName,
                stateName,
                amount
            },
            watiResponse: response.data
        });

    } catch (error) {
        console.error('❌ Error sending WhatsApp notification:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        return res.status(500).json({
            success: false,
            error: 'Failed to send WhatsApp notification',
            details: error.response?.data || error.message
        });
    }
};

/**
 * Send WhatsApp notification for fund release
 */
exports.sendReleaseNotification = async (req, res) => {
    try {
        const {
            allocatorPhone,
            allocatorName,
            stateName,
            amount,
            component,
            date,
            officerId,
            remarks,
            remainingBalance
        } = req.body;

        // Validate required fields
        if (!allocatorPhone || !stateName || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: allocatorPhone, stateName, amount'
            });
        }

        // Format phone number
        let formattedPhone = allocatorPhone.replace(/\D/g, '');
        if (formattedPhone.startsWith('91')) {
            formattedPhone = formattedPhone.substring(2);
        }
        formattedPhone = `91${formattedPhone}`;

        if (formattedPhone.length !== 12) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format. Expected 10 digits.'
            });
        }

        const watiApiBaseUrl = process.env.WATI_API_URL;
        const watiApiKey = process.env.WATI_API_KEY;
        const tenantId = process.env.TENANT_ID;
        const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

        if (!watiApiBaseUrl || !watiApiKey || !tenantId) {
            return res.status(500).json({
                success: false,
                error: 'WATI API credentials not configured.'
            });
        }

        const messageContent =
            `FUND RELEASE NOTIFICATION - ` +
            `Dear ${allocatorName || 'State Officer'}, ` +
            `Funds have been released for your state. ` +
            `State: ${stateName}. ` +
            `Amount Released: Rs ${amount} Crore. ` +
            `Remaining Balance: Rs ${remainingBalance || 'N/A'} Crore. ` +
            `Scheme Component: ${Array.isArray(component) ? component.join(', ') : component || 'N/A'}. ` +
            `Release Date: ${date || new Date().toISOString().slice(0, 10)}. ` +
            `Released By Officer ID: ${officerId || 'Ministry Admin'}. ` +
            `Remarks: ${remarks || 'None'}. ` +
            `Please check your dashboard for details. ` +
            `Thank you, Ministry of Social Justice & Empowerment`;

        // Sanitize message content
        const sanitizedMessage = messageContent.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();

        const templateParams = [
            { name: "message_body", value: sanitizedMessage }
        ];

        const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;

        const payload = {
            template_name: templateName,
            broadcast_name: 'Fund Release Notification',
            parameters: templateParams
        };

        console.log('📱 Sending Fund Release WhatsApp notification...');
        console.log('📞 Phone:', formattedPhone);
        console.log('💰 Amount Released:', amount, 'Cr');
        console.log('💵 Remaining Balance:', remainingBalance, 'Cr');

        const response = await axios.post(endpoint, payload, {
            headers: {
                'Authorization': `Bearer ${watiApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ WATI API Response Status:', response.status);
        console.log('✅ WATI API Response Data:', JSON.stringify(response.data, null, 2));
        console.log('✅ WhatsApp notification sent successfully!');

        return res.status(200).json({
            success: true,
            message: 'WhatsApp notification sent successfully',
            data: response.data
        });

    } catch (error) {
        console.error('❌ Error sending Release WhatsApp notification:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to send WhatsApp notification',
            details: error.response?.data || error.message
        });
    }
};

/**
 * Send WhatsApp notification for agency activation
 */
exports.sendActivationWhatsApp = async (req, res) => {
    console.log('🚀 sendActivationWhatsApp called with body:', req.body);
    try {
        const {
            name,
            phone,
            work_assigned,
            agency_officer
        } = req.body;

        // Validate required fields
        if (!phone || !name) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: phone, name'
            });
        }

        const safeName = name ? name.trim() : '';
        const safeOfficer = agency_officer ? agency_officer.trim() : 'N/A';
        const safeWork = work_assigned ? work_assigned.trim() : 'N/A';

        // Format phone number robustly
        let cleaned = phone.replace(/\D/g, ''); // Remove non-digits

        // Handle leading '0' if present (e.g. 09876543210)
        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }

        // Handle '91' prefix if present (e.g. 919876543210)
        // Be careful: a valid number could start with 91 (e.g. 91XXXXXX)
        // Best guess: if length is 12 and starts with 91, assume it includes country code
        if (cleaned.length === 12 && cleaned.startsWith('91')) {
            cleaned = cleaned.substring(2);
        }

        // Now we expect a 10-digit number
        if (cleaned.length !== 10) {
            console.error(`❌ Invalid phone number length: ${cleaned.length} (Input: ${phone})`);
            return res.status(400).json({
                success: false,
                error: `Invalid phone number. Expected 10 digits, got ${cleaned.length}. Input: ${phone}`
            });
        }

        const formattedPhone = `91${cleaned}`; // Always add 91 for WATI

        const watiApiBaseUrl = process.env.WATI_API_URL;
        const watiApiKey = process.env.WATI_API_KEY;
        const tenantId = process.env.TENANT_ID;
        const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

        if (!watiApiBaseUrl || !watiApiKey || !tenantId) {
            return res.status(500).json({
                success: false,
                error: 'WATI API credentials not configured.'
            });
        }

        const messageContent =
            `AGENCY ACTIVATION NOTIFICATION - ` +
            `Dear ${safeName}, ` +
            `Your agency has been successfully ACTIVATED in the PM-AJAY Dashboard. ` +
            `Officer In-Charge: ${safeOfficer}. ` +
            `Work Assigned: ${safeWork}. ` +
            `Status: Active. ` +
            `You can now proceed with your assigned tasks. ` +
            `Thank you, PM-AJAY Portal`;

        // Sanitize message content
        const sanitizedMessage = messageContent.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();

        const templateParams = [
            { name: "message_body", value: sanitizedMessage }
        ];

        const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;

        const payload = {
            template_name: templateName,
            broadcast_name: 'Agency Activation Notification',
            parameters: templateParams
        };

        console.log('🔗 WATI Endpoint:', endpoint);
        console.log('📝 Payload (masked):', JSON.stringify({ ...payload, parameters: '...' }, null, 2));

        const response = await axios.post(endpoint, payload, {
            headers: {
                'Authorization': `Bearer ${watiApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ WATI API Response Status:', response.status);
        console.log('✅ WATI API Response Data:', JSON.stringify(response.data, null, 2));

        return res.status(200).json({
            success: true,
            message: 'WhatsApp notification sent successfully',
            data: response.data
        });

    } catch (error) {
        console.error('❌ Error sending Activation WhatsApp notification:', error.message);
        if (error.response) {
            console.error('❌ WATI Error Response Data:', JSON.stringify(error.response.data, null, 2));
            console.error('❌ WATI Error Response Status:', error.response.status);
        }
        return res.status(500).json({
            success: false,
            error: 'Failed to send WhatsApp notification',
            details: error.response?.data || error.message
        });
    }
};
