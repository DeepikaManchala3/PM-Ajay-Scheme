const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all district admins
exports.getAllDistrictAdmins = async (req, res) => {
    try {
        const { stateName } = req.query;
        let query = supabase
            .from('district_assignment')
            .select('*')
            .order('created_at', { ascending: false });

        if (stateName) {
            // First get state ID
            const { data: stateData, error: stateError } = await supabase
                .from('states')
                .select('id')
                .eq('name', stateName)
                .single();

            if (stateError || !stateData) {
                // If state not found, return empty or error. Let's return empty for safety.
                return res.json({ success: true, data: [] });
            }

            // Get districts for this state
            const { data: districtsData, error: districtsError } = await supabase
                .from('districts')
                .select('name')
                .eq('state_id', stateData.id);

            if (districtsError) {
                return res.status(500).json({ success: false, error: districtsError.message });
            }

            const districtNames = districtsData.map(d => d.name);

            if (districtNames.length > 0) {
                query = query.in('district_name', districtNames);
            } else {
                return res.json({ success: true, data: [] });
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            // If table doesn't exist, return empty array instead of error to avoid breaking frontend
            if (error.code === '42P01') { // undefined_table
                return res.json({ success: true, data: [] });
            }
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({ success: true, data });

    } catch (error) {
        console.error('Error fetching district admins:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Add new district admin
exports.addDistrictAdmin = async (req, res) => {
    try {
        const {
            name,
            district,
            phone,
            email,
            bank_account_number
        } = req.body;

        // Validation
        if (!name || !district || !phone || !email || !bank_account_number) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: name, district, phone, email, bank_account_number'
            });
        }

        // Validate phone number (10 digits)
        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                error: 'Phone number must be 10 digits'
            });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Insert new district admin
        const { data, error } = await supabase
            .from('district_assignment')
            .insert([
                {
                    admin_name: name,
                    district_name: district,
                    phone_no: phone,
                    email: email,
                    bank_account_number: bank_account_number,
                    status: 'Active'
                }
            ])
            .select();

        if (error) {
            console.error('Supabase insert error:', error);
            if (error.code === '23505') {
                return res.status(400).json({
                    success: false,
                    error: 'Email already exists.'
                });
            }
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({
            success: true,
            message: 'District admin added successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Error adding district admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update district admin
exports.updateDistrictAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            district,
            phone,
            email,
            bank_account_number
        } = req.body;

        const { data, error } = await supabase
            .from('district_assignment')
            .update({
                admin_name: name,
                district_name: district,
                phone_no: phone,
                email: email,
                bank_account_number: bank_account_number
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase update error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({
            success: true,
            message: 'District admin updated successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Error updating district admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Activate district admin
exports.activateDistrictAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch admin details
        const { data: adminData, error: fetchError } = await supabase
            .from('district_assignment')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !adminData) {
            return res.status(404).json({ success: false, error: 'District admin not found' });
        }

        if (adminData.status !== 'Active') {
            return res.status(400).json({ success: false, error: 'Admin is not in Active state' });
        }

        // Update status
        const { data, error } = await supabase
            .from('district_assignment')
            .update({ status: 'Activated' })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }

        // Send WhatsApp notification
        try {
            let formattedPhone = adminData.phone_no.replace(/\D/g, '');
            if (formattedPhone.startsWith('91')) formattedPhone = formattedPhone.substring(2);
            formattedPhone = `91${formattedPhone}`;

            const watiApiBaseUrl = process.env.WATI_API_URL;
            const watiApiKey = process.env.WATI_API_KEY;
            const tenantId = process.env.TENANT_ID;
            const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

            if (watiApiBaseUrl && watiApiKey && tenantId) {
                const messageContent =
                    `⚠️ *Important Notification* - ` +
                    `DISTRICT ADMIN ACTIVATION - ` +
                    `Dear ${adminData.admin_name}, ` +
                    `Your account has been successfully ACTIVATED as District Admin for ${adminData.district_name}. ` +
                    `Email: ${adminData.email}. ` +
                    `Status: Activated. ` +
                    `You can now access the PM-AJAY Dashboard and manage your district's fund allocations. ` +
                    `Please login to the portal to view your dashboard. ` +
                    `Thank you, Ministry of Social Justice & Empowerment`;

                // Sanitize message content to remove any newlines or tabs that might have slipped in
                const sanitizedMessage = messageContent.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();

                const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;
                const payload = {
                    template_name: templateName,
                    broadcast_name: 'District Admin Activation',
                    parameters: [{ name: "message_body", value: sanitizedMessage }]
                };

                const response = await axios.post(endpoint, payload, {
                    headers: { 'Authorization': `Bearer ${watiApiKey}`, 'Content-Type': 'application/json' }
                });
                console.log('✅ WATI API Response Status:', response.status);
                console.log('✅ WATI API Response Data:', JSON.stringify(response.data, null, 2));
                console.log('✅ WhatsApp notification sent successfully!');
            }
        } catch (whatsappError) {
            console.error('❌ Error sending WhatsApp:', whatsappError.message);
        }

        res.json({
            success: true,
            message: 'District admin activated successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Error activating district admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
