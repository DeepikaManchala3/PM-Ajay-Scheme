const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Release funds to villages
const releaseVillageFunds = async (req, res) => {
    try {
        const {
            village_code,
            village_name,
            district_name,
            state_name,
            component,
            projects,
            amount_allocated,
            amount_released,
            release_date,
            sanction_order_no,
            remarks
        } = req.body;

        const { data, error } = await supabase
            .from('village_fund_releases')
            .insert([{
                village_code,
                village_name,
                district_name,
                state_name,
                component,
                projects: projects || [],
                amount_allocated,
                amount_released,
                amount_utilized: 0,
                release_date,
                sanction_order_no,
                released_by: req.user?.id,
                remarks,
                status: 'Released'
            }])
            .select();

        if (error) throw error;

        console.log('✅ Village fund release saved successfully');

        // Send WhatsApp notification to State Admin
        try {
            console.log('📱 Fetching State Admin details for:', state_name);

            const { data: stateAdmin, error: adminError } = await supabase
                .from('state_assignment')
                .select('phone_no, admin_name, email, status, state_name')
                .ilike('state_name', state_name)
                .eq('status', 'Activated')
                .single();

            console.log('📱 State Admin query result:', stateAdmin, 'Error:', adminError);

            if (adminError || !stateAdmin) {
                console.log('⚠️ No activated State Admin found for:', state_name);
            } else {
                console.log('📱 Found State Admin:', stateAdmin.admin_name, 'Phone:', stateAdmin.phone_no);

                // Format phone number for WATI
                let formattedPhone = stateAdmin.phone_no.replace(/\D/g, '');
                if (formattedPhone.startsWith('91')) {
                    formattedPhone = formattedPhone.substring(2);
                }
                formattedPhone = `91${formattedPhone}`;

                const watiApiBaseUrl = process.env.WATI_API_URL;
                const watiApiKey = process.env.WATI_API_KEY;
                const tenantId = process.env.TENANT_ID;
                const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

                if (watiApiBaseUrl && watiApiKey && tenantId) {
                    const messageContent =
                        `VILLAGE FUND RELEASE NOTIFICATION - ` +
                        `Dear ${stateAdmin.admin_name}, ` +
                        `The Ministry has released ₹${amount_released.toLocaleString('en-IN')} to ${village_name} village in ${district_name} district. ` +
                        `Release Date: ${release_date}. ` +
                        `Components: ${Array.isArray(component) ? component.join(', ') : component || 'N/A'}. ` +
                        `Projects: ${Array.isArray(projects) ? projects.join(', ') : projects || 'N/A'}. ` +
                        `Sanction Order: ${sanction_order_no || 'N/A'}. ` +
                        `Please login to the PM-AJAY portal to view details. ` +
                        `Thank you, Ministry of Social Justice & Empowerment`;

                    const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;
                    const payload = {
                        template_name: templateName,
                        broadcast_name: 'Village Fund Release Notification',
                        parameters: [{ name: "message_body", value: messageContent }]
                    };

                    console.log('📱 Sending WhatsApp notification to:', formattedPhone);

                    await axios.post(endpoint, payload, {
                        headers: {
                            'Authorization': `Bearer ${watiApiKey}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log('✅ WhatsApp notification sent successfully to State Admin!');

                    // Store notification in database
                    try {
                        await supabase
                            .from('notifications')
                            .insert([{
                                recipient_phone: formattedPhone,
                                recipient_name: stateAdmin.admin_name,
                                message_body: messageContent,
                                notification_type: 'WHATSAPP',
                                status: 'SENT',
                                related_entity_type: 'VILLAGE_FUND_RELEASE',
                                related_entity_id: data[0].id.toString()
                            }]);
                        console.log('✅ Notification stored in database');
                    } catch (dbError) {
                        console.error('⚠️ Failed to store notification in DB:', dbError.message);
                    }
                } else {
                    console.log('⚠️ WATI configuration missing, skipping WhatsApp notification');
                }
            }
        } catch (whatsappError) {
            console.error('❌ Error sending WhatsApp notification:', whatsappError.message);
            // Don't fail the release if WhatsApp fails
        }

        res.status(201).json({
            success: true,
            message: 'Village funds released successfully and notification sent',
            data: data[0]
        });
    } catch (error) {
        console.error('Error releasing village funds:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to release village funds',
            error: error.message
        });
    }
};

// Get village funds by state
const getVillageFundsByState = async (req, res) => {
    try {
        const { state } = req.params;

        const { data, error } = await supabase
            .from('village_fund_releases')
            .select('*')
            .eq('state_name', state)
            .order('release_date', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Error fetching village funds by state:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch village funds',
            error: error.message
        });
    }
};

// Get village funds by district
const getVillageFundsByDistrict = async (req, res) => {
    try {
        const { district } = req.params;

        const { data, error } = await supabase
            .from('village_fund_releases')
            .select('*')
            .eq('district_name', district)
            .order('release_date', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Error fetching village funds by district:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch village funds',
            error: error.message
        });
    }
};

// Get all villages by district
const getVillagesByDistrict = async (req, res) => {
    try {
        const { district } = req.params;
        console.log(`🔍 [API] Fetching villages for district: "${district}"`);

        const { data, error } = await supabase
            .from('villages')
            .select('*')
            .ilike('district_name', district.trim())
            .order('village_name');

        if (error) {
            console.error('❌ [API] DB Error:', error.message);
            throw error;
        }

        console.log(`✅ [API] Found ${data ? data.length : 0} villages for "${district}"`);

        res.status(200).json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Error fetching villages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch villages',
            error: error.message
        });
    }
};

// Get specific village details
const getVillageDetails = async (req, res) => {
    try {
        const { villageCode } = req.params;

        const { data: village, error: villageError } = await supabase
            .from('villages')
            .select('*')
            .eq('village_code', villageCode)
            .single();

        if (villageError) throw villageError;

        const { data: funds, error: fundsError } = await supabase
            .from('village_fund_releases')
            .select('*')
            .eq('village_code', villageCode)
            .order('release_date', { ascending: false });

        if (fundsError) throw fundsError;

        res.status(200).json({
            success: true,
            data: {
                village,
                fundReleases: funds || []
            }
        });
    } catch (error) {
        console.error('Error fetching village details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch village details',
            error: error.message
        });
    }
};

// Release installment for village fund
const releaseInstallment = async (req, res) => {
    try {
        const { village_fund_id, installment_amount, release_date } = req.body;

        if (!village_fund_id || !installment_amount) {
            return res.status(400).json({
                success: false,
                message: 'Village fund ID and installment amount are required'
            });
        }

        // Get current village fund details
        const { data: currentFund, error: fetchError } = await supabase
            .from('village_fund_releases')
            .select('*')
            .eq('id', village_fund_id)
            .single();

        if (fetchError || !currentFund) {
            return res.status(404).json({
                success: false,
                message: 'Village fund not found'
            });
        }

        // Calculate new released amount
        const currentReleased = currentFund.amount_released || 0;
        const newReleased = currentReleased + parseFloat(installment_amount);
        const remainingAllocation = (currentFund.amount_allocated || 0) - newReleased;

        // Validate installment amount against allocation
        if (newReleased > (currentFund.amount_allocated || 0)) {
            return res.status(400).json({
                success: false,
                message: `Installment amount exceeds remaining allocation. Available: ${(currentFund.amount_allocated || 0) - currentReleased}`
            });
        }

        // Update the village fund release with new released amount
        const { data, error } = await supabase
            .from('village_fund_releases')
            .update({
                amount_released: newReleased,
                updated_at: new Date().toISOString()
            })
            .eq('id', village_fund_id)
            .select();

        if (error) throw error;

        console.log(`✅ Released installment of ₹${installment_amount} to ${currentFund.village_name}`);

        // Send WhatsApp notification to State Admin
        try {
            console.log('📱 Fetching State Admin details for:', currentFund.state_name);

            const { data: stateAdmin, error: adminError } = await supabase
                .from('state_assignment')
                .select('phone_no, admin_name, email, status, state_name')
                .ilike('state_name', currentFund.state_name)
                .eq('status', 'Activated')
                .single();

            if (adminError || !stateAdmin) {
                console.log('⚠️ No activated State Admin found for:', currentFund.state_name);
            } else {
                console.log('📱 Found State Admin:', stateAdmin.admin_name, 'Phone:', stateAdmin.phone_no);

                // Format phone number for WATI
                let formattedPhone = stateAdmin.phone_no.replace(/\D/g, '');
                if (formattedPhone.startsWith('91')) {
                    formattedPhone = formattedPhone.substring(2);
                }
                formattedPhone = `91${formattedPhone}`;

                const watiApiBaseUrl = process.env.WATI_API_URL;
                const watiApiKey = process.env.WATI_API_KEY;
                const tenantId = process.env.TENANT_ID;
                const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

                if (watiApiBaseUrl && watiApiKey && tenantId) {
                    const messageContent =
                        `VILLAGE FUND INSTALLMENT RELEASE NOTIFICATION - ` +
                        `Dear ${stateAdmin.admin_name}, ` +
                        `The Ministry has released an installment of ₹${parseFloat(installment_amount).toLocaleString('en-IN')} to ${currentFund.village_name} village in ${currentFund.district_name} district. ` +
                        `Total Released: ₹${newReleased.toLocaleString('en-IN')}. ` +
                        `Release Date: ${release_date || new Date().toISOString().slice(0, 10)}. ` +
                        `Sanction Order: ${currentFund.sanction_order_no || 'N/A'}. ` +
                        `Please login to the PM-AJAY portal to view details. ` +
                        `Thank you, Ministry of Social Justice & Empowerment`;

                    const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;
                    const payload = {
                        template_name: templateName,
                        broadcast_name: 'Village Fund Installment Notification',
                        parameters: [{ name: "message_body", value: messageContent }]
                    };

                    console.log('📱 Sending WhatsApp notification to:', formattedPhone);

                    await axios.post(endpoint, payload, {
                        headers: {
                            'Authorization': `Bearer ${watiApiKey}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log('✅ WhatsApp notification sent successfully to State Admin!');

                    // Store notification in database
                    try {
                        await supabase
                            .from('notifications')
                            .insert([{
                                recipient_phone: formattedPhone,
                                recipient_name: stateAdmin.admin_name,
                                message_body: messageContent,
                                notification_type: 'WHATSAPP',
                                status: 'SENT',
                                related_entity_type: 'VILLAGE_FUND_INSTALLMENT',
                                related_entity_id: village_fund_id.toString()
                            }]);
                        console.log('✅ Notification stored in database');
                    } catch (dbError) {
                        console.error('⚠️ Failed to store notification in DB:', dbError.message);
                    }
                } else {
                    console.log('⚠️ WATI configuration missing, skipping WhatsApp notification');
                }
            }
        } catch (whatsappError) {
            console.error('❌ Error sending WhatsApp notification:', whatsappError.message);
            // Don't fail the release if WhatsApp fails
        }

        res.status(200).json({
            success: true,
            message: 'Installment released successfully',
            data: {
                ...data[0],
                remaining_funds: remainingAllocation
            }
        });
    } catch (error) {
        console.error('Error releasing installment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to release installment',
            error: error.message
        });
    }
};

// Update village fund utilization
const updateVillageFundUtilization = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount_utilized, remarks, status } = req.body;

        const { data, error } = await supabase
            .from('village_fund_releases')
            .update({
                amount_utilized,
                remarks,
                status: status || 'Utilized',
                updated_at: new Date()
            })
            .eq('id', id)
            .select();

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Village fund utilization updated successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error updating village fund utilization:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update village fund utilization',
            error: error.message
        });
    }
};

// Get village fund statistics
const getVillageFundStats = async (req, res) => {
    try {
        const { state } = req.query;

        let query = supabase
            .from('village_fund_releases')
            .select('amount_allocated, amount_released, amount_utilized, status');

        if (state) {
            query = query.eq('state_name', state);
        }

        const { data, error } = await query;

        if (error) throw error;

        const stats = {
            totalAllocated: data.reduce((sum, item) => sum + parseFloat(item.amount_allocated || 0), 0),
            totalReleased: data.reduce((sum, item) => sum + parseFloat(item.amount_released || 0), 0),
            totalUtilized: data.reduce((sum, item) => sum + parseFloat(item.amount_utilized || 0), 0),
            totalVillages: data.length,
            byStatus: {
                Released: data.filter(item => item.status === 'Released').length,
                Utilized: data.filter(item => item.status === 'Utilized').length,
                Completed: data.filter(item => item.status === 'Completed').length,
                Pending: data.filter(item => item.status === 'Pending').length
            }
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching village fund stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch village fund statistics',
            error: error.message
        });
    }
};

module.exports = {
    releaseVillageFunds,
    getVillageFundsByState,
    getVillageFundsByDistrict,
    getVillagesByDistrict,
    getVillageDetails,
    updateVillageFundUtilization,
    getVillageFundStats,
    releaseInstallment
};
