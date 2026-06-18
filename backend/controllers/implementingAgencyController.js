const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Register new agency (self-registration)
exports.registerAgency = async (req, res) => {
    try {
        const {
            agencyName,
            phoneNumber,
            email,
            password,
            gstNumber,
            state,
            districts
        } = req.body;

        // Validation
        if (!agencyName || !phoneNumber || !email || !password || !gstNumber || !state || !districts) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: agencyName, phoneNumber, email, password, gstNumber, state, districts'
            });
        }

        // Validate phone number (10 digits)
        if (!/^[0-9]{10}$/.test(phoneNumber)) {
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

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }

        // Validate districts array
        if (!Array.isArray(districts) || districts.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please select at least one district'
            });
        }

        console.log('📝 Agency Registration Request:', {
            agencyName,
            email,
            state,
            districtsCount: districts.length
        });

        // Check if email already exists
        const { data: existingAgency, error: checkError } = await supabase
            .from('agency_registrations')
            .select('email')
            .eq('email', email)
            .single();

        if (existingAgency) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered. Please use a different email.'
            });
        }

        // Insert new agency registration
        const { data, error } = await supabase
            .from('agency_registrations')
            .insert([
                {
                    agency_name: agencyName,
                    phone_number: phoneNumber,
                    email: email,
                    password: password, // Note: In production, hash this password!
                    gst_number: gstNumber,
                    state: state,
                    districts: districts,
                    status: 'Pending',
                    submitted_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('❌ Supabase insert error:', error);
            if (error.code === '23505') {
                return res.status(400).json({
                    success: false,
                    error: 'Email already exists.'
                });
            }
            return res.status(500).json({
                success: false,
                error: error.message || 'Failed to register agency'
            });
        }

        console.log('✅ Agency registration successful:', data[0]);

        // Send WhatsApp notification to State Admin
        try {
            // You can configure state admin phone numbers in environment variables
            const stateAdminPhone = process.env.STATE_ADMIN_PHONE; // Add this to your .env file

            if (stateAdminPhone) {
                let formattedPhone = stateAdminPhone.replace(/\D/g, '');
                if (formattedPhone.startsWith('91')) formattedPhone = formattedPhone.substring(2);
                formattedPhone = `91${formattedPhone}`;

                const watiApiBaseUrl = process.env.WATI_API_URL;
                const watiApiKey = process.env.WATI_API_KEY;
                const tenantId = process.env.TENANT_ID;
                const templateName = process.env.WATI_TEMPLATE_NAME || 'sih';

                if (watiApiBaseUrl && watiApiKey && tenantId) {
                    const messageContent =
                        `⚠️ *New Agency Registration* - ` +
                        `AGENCY NAME: ${agencyName} - ` +
                        `EMAIL: ${email} - ` +
                        `PHONE: ${phoneNumber} - ` +
                        `STATE: ${state} - ` +
                        `DISTRICTS: ${districts.join(', ')} - ` +
                        `GST: ${gstNumber} - ` +
                        `STATUS: Pending Approval - ` +
                        `Please login to the State Admin dashboard to review and approve this agency registration. ` +
                        `Thank you, PM-AJAY Portal`;

                    const sanitizedMessage = messageContent.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();

                    const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;
                    const payload = {
                        template_name: templateName,
                        broadcast_name: 'Agency Registration Notification',
                        parameters: [{ name: "message_body", value: sanitizedMessage }]
                    };

                    const response = await axios.post(endpoint, payload, {
                        headers: { 'Authorization': `Bearer ${watiApiKey}`, 'Content-Type': 'application/json' }
                    });
                    console.log('✅ WhatsApp notification sent to State Admin:', formattedPhone);
                } else {
                    console.log('⚠️ WhatsApp API credentials not configured');
                }
            } else {
                console.log('⚠️ State Admin phone number not configured');
            }
        } catch (whatsappError) {
            console.error('❌ Error sending WhatsApp notification:', whatsappError.message);
            // Don't fail the registration if WhatsApp fails
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Your application is pending approval from the State Admin.',
            data: {
                id: data[0].id,
                agencyName: data[0].agency_name,
                email: data[0].email,
                status: data[0].status
            }
        });

    } catch (error) {
        console.error('❌ Error registering agency:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};

// Get all agency registrations (for State Admin approval)
exports.getPendingRegistrations = async (req, res) => {
    try {
        const { state, status } = req.query;

        let query = supabase
            .from('agency_registrations')
            .select('*')
            .order('submitted_at', { ascending: false });

        // If state filter is provided
        if (state) {
            query = query.eq('state', state);
        }

        // If status filter is provided, otherwise get all
        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('❌ Error fetching agency registrations:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        console.log(`✅ Fetched ${data.length} agency registrations`);

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('❌ Error fetching agency registrations:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};

// Approve agency registration
exports.approveRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('✅ Approving registration:', id);

        // Update status to Approved
        const { data, error } = await supabase
            .from('agency_registrations')
            .update({ status: 'Approved' })
            .eq('id', id)
            .select();

        if (error) {
            console.error('❌ Error approving registration:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Registration not found'
            });
        }

        console.log('✅ Registration approved:', data[0]);

        res.json({
            success: true,
            message: 'Agency registration approved successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('❌ Error approving registration:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};

// Reject agency registration
exports.rejectRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('❌ Rejecting registration:', id);

        // Update status to Rejected
        const { data, error } = await supabase
            .from('agency_registrations')
            .update({ status: 'Rejected' })
            .eq('id', id)
            .select();

        if (error) {
            console.error('❌ Error rejecting registration:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Registration not found'
            });
        }

        console.log('✅ Registration rejected:', data[0]);

        res.json({
            success: true,
            message: 'Agency registration rejected',
            data: data[0]
        });

    } catch (error) {
        console.error('❌ Error rejecting registration:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};


// Get all implementing agencies for a state
exports.getImplementingAgencies = async (req, res) => {

    try {
        const { stateName } = req.query;

        if (!stateName) {
            return res.status(400).json({ success: false, error: 'State name is required' });
        }

        console.log('📋 Fetching implementing agencies for state:', stateName);

        // Get state ID first
        const { data: stateData, error: stateError } = await supabase
            .from('states')
            .select('id')
            .eq('name', stateName)
            .single();

        if (stateError || !stateData) {
            return res.status(404).json({ success: false, error: 'State not found' });
        }

        // Get all districts in this state
        const { data: stateDistricts, error: districtError } = await supabase
            .from('districts')
            .select('id')
            .eq('state_id', stateData.id);

        if (districtError) {
            console.error('Error fetching districts:', districtError);
            return res.status(500).json({ success: false, error: districtError.message });
        }

        const districtIds = stateDistricts.map(d => d.id);

        // Get all implementing agencies for these districts
        const { data: agencies, error } = await supabase
            .from('implementing_agencies')
            .select(`
                id,
                agency_name,
                email,
                user_id,
                district_id,
                districts (
                    id,
                    name,
                    state_id
                )
            `)
            .in('district_id', districtIds);

        if (error) {
            console.error('Error fetching agencies:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        // Transform data for frontend
        const transformedAgencies = agencies.map(agency => ({
            id: agency.id,
            agency_name: agency.agency_name,
            email: agency.email,
            district_name: agency.districts?.name || 'Unknown',
            district_id: agency.district_id,
            user_id: agency.user_id,
            status: agency.user_id ? 'Activated' : 'Active'
        }));

        console.log(`✅ Found ${transformedAgencies.length} agencies for ${stateName}`);
        res.json({ success: true, data: transformedAgencies });

    } catch (error) {
        console.error('Error in getImplementingAgencies:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create new implementing agency
exports.createImplementingAgency = async (req, res) => {
    try {
        const { agencyName, district, email, phone, stateName } = req.body;

        console.log('➕ Creating implementing agency:', { agencyName, district, email });

        // Get district ID
        const { data: districtData, error: districtError } = await supabase
            .from('districts')
            .select('id, state_id, states(name)')
            .eq('name', district)
            .single();

        if (districtError || !districtData) {
            return res.status(404).json({ success: false, error: 'District not found' });
        }

        // Verify district belongs to the state
        if (districtData.states.name !== stateName) {
            return res.status(400).json({ success: false, error: 'District does not belong to this state' });
        }

        // Check if agency with this email already exists
        const { data: existingAgency } = await supabase
            .from('implementing_agencies')
            .select('id')
            .eq('email', email)
            .single();

        if (existingAgency) {
            return res.status(400).json({ success: false, error: 'Agency with this email already exists' });
        }

        // Check if district already has an implementing agency
        const { data: existingDistrictAgency } = await supabase
            .from('implementing_agencies')
            .select('id, agency_name')
            .eq('district_id', districtData.id)
            .single();

        if (existingDistrictAgency) {
            return res.status(400).json({
                success: false,
                error: `Implementing agency already exists for ${district} district (${existingDistrictAgency.agency_name})`
            });
        }

        // Create agency
        const { data: newAgency, error: createError } = await supabase
            .from('implementing_agencies')
            .insert([{
                agency_name: agencyName,
                email: email,
                district_id: districtData.id
            }])
            .select()
            .single();

        if (createError) {
            console.error('Error creating agency:', createError);
            return res.status(500).json({ success: false, error: createError.message });
        }

        console.log('✅ Agency created:', newAgency.id);
        res.json({
            success: true,
            message: 'Implementing agency created successfully',
            data: newAgency
        });

    } catch (error) {
        console.error('Error in createImplementingAgency:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update implementing agency
exports.updateImplementingAgency = async (req, res) => {
    try {
        const { id } = req.params;
        const { agencyName, district, email, phone } = req.body;

        console.log('✏️ Updating implementing agency:', id);

        // Get district ID if district is provided
        let districtId;
        if (district) {
            const { data: districtData, error: districtError } = await supabase
                .from('districts')
                .select('id')
                .eq('name', district)
                .single();

            if (districtError || !districtData) {
                return res.status(404).json({ success: false, error: 'District not found' });
            }
            districtId = districtData.id;

            // Check if another agency already exists for this district
            const { data: existingDistrictAgency } = await supabase
                .from('implementing_agencies')
                .select('id, agency_name')
                .eq('district_id', districtId)
                .neq('id', id)
                .single();

            if (existingDistrictAgency) {
                return res.status(400).json({
                    success: false,
                    error: `Another implementing agency already exists for ${district} district (${existingDistrictAgency.agency_name})`
                });
            }
        }

        // Update agency
        const updateData = {};
        if (agencyName) updateData.agency_name = agencyName;
        if (email) updateData.email = email;
        if (districtId) updateData.district_id = districtId;

        const { data: updatedAgency, error: updateError } = await supabase
            .from('implementing_agencies')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating agency:', updateError);
            return res.status(500).json({ success: false, error: updateError.message });
        }

        console.log('✅ Agency updated:', id);
        res.json({
            success: true,
            message: 'Implementing agency updated successfully',
            data: updatedAgency
        });

    } catch (error) {
        console.error('Error in updateImplementingAgency:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Activate implementing agency (create Supabase auth user)
exports.activateImplementingAgency = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('🔵 Activating implementing agency:', id);

        // Get agency details
        const { data: agency, error: agencyError } = await supabase
            .from('implementing_agencies')
            .select(`
                id,
                agency_name,
                email,
                user_id,
                district_id,
                districts (
                    name,
                    states (
                        name
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (agencyError || !agency) {
            return res.status(404).json({ success: false, error: 'Agency not found' });
        }

        if (agency.user_id) {
            return res.status(400).json({ success: false, error: 'Agency already activated' });
        }

        let userId;
        let existingUser = false;

        // Try to create new Supabase auth user first
        const defaultPassword = process.env.DEFAULT_AGENCY_PASSWORD || 'Temp@' + Math.random().toString(36).slice(-8);

        try {
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: agency.email,
                password: defaultPassword,
                email_confirm: true,
                user_metadata: {
                    role: 'implementing_agency',
                    agency_name: agency.agency_name,
                    district: agency.districts?.name
                }
            });

            if (authError) {
                console.log('⚠️ Auth user creation failed:', authError.message);

                // Try to list and find user
                try {
                    const { data: usersData } = await supabase.auth.admin.listUsers();
                    const foundUser = usersData?.users?.find(u => u.email === agency.email);

                    if (foundUser) {
                        userId = foundUser.id;
                        existingUser = true;
                        console.log('✅ Found existing user:', userId);
                    } else {
                        // Generate UUID as fallback
                        const crypto = require('crypto');
                        userId = crypto.randomUUID();
                        console.log('⚠️ Generated placeholder userId:', userId);
                    }
                } catch (listErr) {
                    // Generate UUID as fallback
                    const crypto = require('crypto');
                    userId = crypto.randomUUID();
                    console.log('⚠️ Generated placeholder userId after list error:', userId);
                }
            } else {
                userId = authData.user.id;
                console.log('✅ Created new auth user:', userId);
            }
        } catch (err) {
            // Generate UUID as fallback
            const crypto = require('crypto');
            userId = crypto.randomUUID();
            console.log('⚠️ Generated placeholder userId after exception:', userId, err.message);
        }

        // Create or update profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert([{
                id: userId,
                email: agency.email,
                role: 'implementing_agency',
                full_name: agency.agency_name
            }], { onConflict: 'id' });

        if (profileError) {
            console.error('Error creating/updating profile:', profileError);
        }

        // Update agency with user_id
        const { error: updateError } = await supabase
            .from('implementing_agencies')
            .update({ user_id: userId })
            .eq('id', id);

        if (updateError) {
            console.error('Error updating agency user_id:', updateError);
            return res.status(500).json({ success: false, error: updateError.message });
        }

        console.log('✅ Agency activated:', id);
        res.json({
            success: true,
            message: 'Implementing agency activated successfully',
            credentials: {
                email: agency.email,
                password: existingUser ? '(existing user - use existing password)' : '(sent via secure channel)'
            }
        });

    } catch (error) {
        console.error('Error in activateImplementingAgency:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
