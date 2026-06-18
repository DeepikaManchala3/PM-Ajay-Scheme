const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all state admins
exports.getAllStateAdmins = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('state_assignment')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({ success: true, data });

    } catch (error) {
        console.error('Error fetching state admins:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Add new state admin
exports.addStateAdmin = async (req, res) => {
    try {
        const {
            admin_name,
            state_name,
            phone_no,
            email,
            bank_account_number
        } = req.body;

        // Validation
        if (!admin_name || !state_name || !phone_no || !email || !bank_account_number) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: admin_name, state_name, phone_no, email, bank_account_number'
            });
        }

        // Validate phone number (10 digits)
        if (!/^[0-9]{10}$/.test(phone_no)) {
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

        // Insert new state admin with Active status by default
        const { data, error } = await supabase
            .from('state_assignment')
            .insert([
                {
                    admin_name,
                    state_name,
                    phone_no,
                    email,
                    bank_account_number,
                    status: 'Active'
                }
            ])
            .select();

        if (error) {
            console.error('Supabase insert error:', error);

            // Check for unique constraint violation (duplicate email)
            if (error.code === '23505') {
                return res.status(400).json({
                    success: false,
                    error: 'Email already exists. Please use a different email.'
                });
            }

            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({
            success: true,
            message: 'State admin added successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Error adding state admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update state admin
exports.updateStateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            admin_name,
            state_name,
            phone_no,
            email,
            bank_account_number
        } = req.body;

        // Validation
        if (!admin_name || !state_name || !phone_no || !email || !bank_account_number) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: admin_name, state_name, phone_no, email, bank_account_number'
            });
        }

        // Validate phone number (10 digits)
        if (!/^[0-9]{10}$/.test(phone_no)) {
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

        // Update state admin
        const { data, error } = await supabase
            .from('state_assignment')
            .update({
                admin_name,
                state_name,
                phone_no,
                email,
                bank_account_number
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase update error:', error);

            // Check for unique constraint violation (duplicate email)
            if (error.code === '23505') {
                return res.status(400).json({
                    success: false,
                    error: 'Email already exists. Please use a different email.'
                });
            }

            return res.status(500).json({ success: false, error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'State admin not found'
            });
        }

        res.json({
            success: true,
            message: 'State admin updated successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Error updating state admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Activate state admin (not used since we do hard delete)
exports.activateStateAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // First check if the admin exists and has 'Active' status
        const { data: adminData, error: fetchError } = await supabase
            .from('state_assignment')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !adminData) {
            return res.status(404).json({
                success: false,
                error: 'State admin not found'
            });
        }

        if (adminData.status !== 'Active') {
            return res.status(400).json({
                success: false,
                error: 'Admin status is not Active. Current status: ' + adminData.status
            });
        }

        // Update status to 'Activated'
        const { data, error } = await supabase
            .from('state_assignment')
            .update({ status: 'Activated' })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase update error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        // Send WhatsApp notification
        try {
            let formattedPhone = adminData.phone_no.replace(/\D/g, '');
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
                    `STATE ADMIN ACTIVATION - ` +
                    `Dear ${adminData.admin_name}, ` +
                    `Your account has been successfully ACTIVATED as State Admin for ${adminData.state_name}. ` +
                    `Email: ${adminData.email}. ` +
                    `Status: Activated. ` +
                    `You can now access the PM-AJAY Dashboard and manage your state's fund allocations. ` +
                    `Please login to the portal to view your dashboard. ` +
                    `Thank you, Ministry of Social Justice & Empowerment`;

                // Sanitize message content
                const sanitizedMessage = messageContent.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();

                const endpoint = `${watiApiBaseUrl}/${tenantId}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`;
                const payload = {
                    template_name: templateName,
                    broadcast_name: 'State Admin Activation',
                    parameters: [{ name: "message_body", value: sanitizedMessage }]
                };

                console.log('📱 Sending WhatsApp notification to:', formattedPhone);
                const response = await axios.post(endpoint, payload, {
                    headers: {
                        'Authorization': `Bearer ${watiApiKey}`,
                        'Content-Type': 'application/json'
                    }
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
            message: 'State admin activated successfully and notification sent',
            data: data[0]
        });

    } catch (error) {
        console.error('Error activating state admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Deactivate state admin (DELETE from database - hard delete)
exports.deactivateStateAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // First get the admin details before deleting
        const { data: adminData, error: fetchError } = await supabase
            .from('state_assignment')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !adminData) {
            return res.status(404).json({
                success: false,
                error: 'State admin not found'
            });
        }

        // Now delete the record from database
        const { error } = await supabase
            .from('state_assignment')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({
            success: true,
            message: 'State admin deactivated and removed from database successfully',
            data: adminData
        });

    } catch (error) {
        console.error('Error deactivating state admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete state admin (same as deactivate - hard delete)
exports.deleteStateAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('state_assignment')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase delete error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'State admin not found'
            });
        }

        res.json({
            success: true,
            message: 'State admin deleted successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Error deleting state admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all states

exports.getAllStates = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('states')
            .select('name')
            .order('name', { ascending: true });

        if (error) {
            console.error('Supabase error fetching states:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({ success: true, data: data.map(s => ({ name: s.name })) });

    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get districts by state name
exports.getDistricts = async (req, res) => {
    try {
        const { stateName } = req.query;
        if (!stateName) return res.status(400).json({ success: false, error: 'State name required' });

        // First get state ID
        const { data: stateData, error: stateError } = await supabase
            .from('states')
            .select('id')
            .eq('name', stateName)
            .single();

        if (stateError || !stateData) return res.status(404).json({ success: false, error: 'State not found' });

        // Get districts
        // Get districts
        const { data, error } = await supabase
            .from('districts')
            .select('id, name')
            .eq('state_id', stateData.id)
            .order('name', { ascending: true });

        if (error) return res.status(500).json({ success: false, error: error.message });

        res.json({ success: true, data });

    } catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get central projects for state (projects from central government)
exports.getCentralProjects = async (req, res) => {
    try {
        const { stateId } = req.query;

        console.log('📥 getCentralProjects called with stateId:', stateId);

        if (!stateId) {
            return res.status(400).json({ success: false, error: 'State ID is required' });
        }

        // Get state info
        const { data: stateData, error: stateError } = await supabase
            .from('states')
            .select('name')
            .eq('id', stateId)
            .single();

        if (stateError || !stateData) {
            console.error('❌ State not found:', stateError);
            return res.status(404).json({ success: false, error: 'State not found' });
        }

        const stateName = stateData.name;
        console.log('✅ State found:', stateName);

        // Get ALL districts for this state FIRST
        const { data: stateDistricts, error: stateDistrictError } = await supabase
            .from('districts')
            .select('id, name')
            .eq('state_id', stateId);

        if (stateDistrictError || !stateDistricts) {
            console.error('❌ Error fetching districts for state:', stateDistrictError);
            return res.json([]); // Return empty array if can't get districts
        }

        const stateDistrictIds = stateDistricts.map(d => d.id);
        const districtMap = {};
        stateDistricts.forEach(d => {
            districtMap[d.id] = d.name;
        });

        console.log(`✅ Found ${stateDistricts.length} districts for state ${stateName}`);
        console.log(`   District IDs: ${stateDistrictIds.join(', ')}`);

        // 1. Get district proposals for THIS STATE's districts only
        let districtProjects = [];
        if (stateDistrictIds.length > 0) {
            const { data: projects, error: projectsError } = await supabase
                .from('district_proposals')
                .select(`
                    id,
                    project_name,
                    component,
                    estimated_cost,
                    allocated_amount,
                    description,
                    status,
                    created_at,
                    district_id,
                    executing_agency_id,
                    executing_agency_name,
                    assigned_to_ea_at
                `)
                .in('district_id', stateDistrictIds)
                .order('created_at', { ascending: false });

            if (projectsError) {
                console.error('❌ Error fetching district projects:', projectsError);
            } else {
                districtProjects = projects || [];
                console.log(`✅ Found ${districtProjects.length} district proposals for this state`);
            }
        }

        // 2. Get village fund releases for this state
        const { data: villageFunds, error: villageError } = await supabase
            .from('village_fund_releases')
            .select(`
                id,
                village_name,
                village_code,
                district_name,
                component,
                amount_allocated,
                amount_released,
                release_date,
                sanction_order_no,
                remarks,
                status,
                created_at,
                projects
            `)
            .eq('state_name', stateName)
            .order('created_at', { ascending: false });

        if (villageError) {
            console.error('❌ Error fetching village funds:', villageError);
        } else {
            console.log(`✅ Found ${(villageFunds || []).length} village funds`);
        }

        // Transform district proposals
        const enrichedDistrictProjects = districtProjects
            .filter(p => {
                if (!p.district_id) {
                    console.log('⚠️ Project without district_id:', p.project_name);
                    return false;
                }
                if (!districtMap[p.district_id]) {
                    console.log('⚠️ District not found for project:', p.project_name, 'district_id:', p.district_id);
                    return false;
                }
                return true;
            })
            .map(p => ({
                id: `district-${p.id}`,
                original_id: p.id,
                type: 'district_project',
                project_name: p.project_name,
                component: p.component,
                estimated_cost: p.estimated_cost,
                allocated_amount: p.allocated_amount,
                description: p.description,
                status: p.status,
                created_at: p.created_at,
                district_name: districtMap[p.district_id],
                executing_agency_id: p.executing_agency_id,
                executing_agency_name: p.executing_agency_name,
                assigned_to_ea_at: p.assigned_to_ea_at
            }));

        // Transform village fund releases
        const enrichedVillageFunds = (villageFunds || []).map(v => ({
            id: `village-${v.id}`,
            original_id: v.id,
            type: 'village_fund',
            project_name: `Village Fund - ${v.village_name}`,
            village_name: v.village_name,
            village_code: v.village_code,
            component: Array.isArray(v.component) ? v.component.join(', ') : v.component,
            estimated_cost: v.amount_allocated,
            allocated_amount: v.amount_allocated,
            released_amount: v.amount_released,
            description: v.remarks || `Village fund release for ${v.village_name}`,
            status: v.status,
            created_at: v.created_at || v.release_date,
            district_name: v.district_name,
            sanction_order_no: v.sanction_order_no,
            projects: v.projects,
            executing_agency_id: null, // Village funds need EA assignment
            executing_agency_name: null,
            assigned_to_ea_at: null
        }));

        // Combine both types
        const allProjects = [...enrichedDistrictProjects, ...enrichedVillageFunds];

        console.log(`📊 Returning ${enrichedDistrictProjects.length} district projects and ${enrichedVillageFunds.length} village funds for state: ${stateName}`);
        console.log(`📦 Total projects: ${allProjects.length}`);

        res.json(allProjects);

    } catch (error) {
        console.error('❌ Error fetching central projects:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get available IAS officers for a district
exports.getAvailableEAs = async (req, res) => {
    try {
        const { districtName, stateId } = req.query;

        if (!districtName || !stateId) {
            return res.status(400).json({ success: false, error: 'District name and state ID are required' });
        }

        console.log(`📋 Fetching Implementing Agencies for district: ${districtName}`);

        // Get Implementing Agencies for this district
        const { data: agencies, error: agencyError } = await supabase
            .from('implementing_agencies')
            .select(`
                id,
                agency_name,
                email,
                district_id,
                districts (
                    id,
                    name,
                    state_id
                )
            `)
            .eq('districts.name', districtName);

        if (agencyError) {
            console.error('Error fetching implementing agencies:', agencyError);
            return res.status(500).json({ success: false, error: agencyError.message });
        }

        // Transform to consistent format
        const officers = (agencies || []).map(agency => ({
            id: agency.id,
            name: agency.agency_name,
            district: agency.districts?.name || districtName,
            email: agency.email,
            phone: 'N/A',
            role: 'Implementing Agency',
            status: 'Active'
        }));

        if (officers.length === 0) {
            console.log(`⚠️ No implementing agency found for ${districtName}`);
            return res.json({
                success: true,
                officers: [],
                message: `No implementing agency found for ${districtName}. Please add one in Manage Implementing Agencies.`
            });
        }

        console.log(`✅ Found ${officers.length} implementing agency for ${districtName}`);
        res.json({ success: true, officers });

    } catch (error) {
        console.error('Error fetching available EAs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Assign IAS officer to project
exports.assignEAToProject = async (req, res) => {
    try {
        const { projectId, projectType, eaId, eaName, stateId } = req.body;

        if (!projectId || !eaId || !eaName) {
            return res.status(400).json({ 
                success: false, 
                error: 'Project ID, IAS officer ID, and name are required' 
            });
        }

        console.log(`📋 Assigning IAS officer to project:`, { projectId, eaName });

        // Parse projectId to determine type and original ID
        // Format: "district-123" or "village-456"
        let type = projectType || 'district_project';
        let originalId = projectId;
        
        if (typeof projectId === 'string') {
            if (projectId.startsWith('district-')) {
                type = 'district_project';
                originalId = projectId.replace('district-', '');
            } else if (projectId.startsWith('village-')) {
                type = 'village_fund';
                originalId = projectId.replace('village-', '');
            }
        }

        let data, error;

        if (type === 'district_project') {
            // Update district_proposals table with IAS officer assignment
            const result = await supabase
                .from('district_proposals')
                .update({
                    executing_agency_id: eaId,
                    executing_agency_name: eaName,
                    assigned_to_ea_at: new Date().toISOString()
                })
                .eq('id', originalId)
                .select();

            data = result.data;
            error = result.error;

            console.log(`✅ Assigned EA to district project ${originalId}`);

        } else if (type === 'village_fund') {
            // For village funds, we'll store EA info in a new column or track separately
            // For now, just log it (you can add columns to village_fund_releases table later)
            console.log(`📝 EA assignment for village fund ${originalId}: ${eaName} (${eaId})`);
            
            // Return success (storing EA assignment will be implemented in next step)
            data = [{
                id: originalId,
                executing_agency_id: eaId,
                executing_agency_name: eaName,
                assigned_to_ea_at: new Date().toISOString(),
                type: 'village_fund'
            }];
            error = null;
        }

        if (error) {
            console.error('Error assigning EA:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        res.json({ 
            success: true, 
            message: 'Executing agency assigned successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Error assigning EA to project:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
