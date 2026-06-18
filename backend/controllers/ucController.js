const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all UCs for a state (State Admin view)
exports.getUCsByState = async (req, res) => {
    try {
        const { stateName } = req.query;

        if (!stateName) {
            return res.status(400).json({ success: false, error: 'State name is required' });
        }

        console.log('📋 Fetching UCs for state:', stateName);

        // Get state ID
        const { data: stateData, error: stateError } = await supabase
            .from('states')
            .select('id')
            .eq('name', stateName)
            .single();

        if (stateError || !stateData) {
            return res.status(404).json({ success: false, error: 'State not found' });
        }

        // Get all districts for this state
        const { data: districts, error: districtsError } = await supabase
            .from('districts')
            .select('id, name')
            .eq('state_id', stateData.id);

        if (districtsError) {
            return res.status(500).json({ success: false, error: districtsError.message });
        }

        const districtIds = districts.map(d => d.id);

        // Get all UCs for these districts
        const { data: ucs, error: ucsError } = await supabase
            .from('uc_submissions')
            .select('*, districts(name)')
            .in('district_id', districtIds)
            .order('submitted_date', { ascending: false });

        if (ucsError) {
            return res.status(500).json({ success: false, error: ucsError.message });
        }

        console.log(`✅ Found ${ucs.length} UCs for ${stateName}`);

        res.json({ success: true, data: ucs });

    } catch (error) {
        console.error('Error fetching UCs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Submit UC (District Admin) - WITH NOTIFICATION
exports.submitUC = async (req, res) => {
    try {
        const {
            districtId,
            financialYear,
            fundReleased,
            fundUtilized,
            documentUrl
        } = req.body;

        if (!districtId || !financialYear || !fundReleased || !fundUtilized) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        console.log('📤 District submitting UC:', { districtId, financialYear });

        // Get district info
        const { data: districtData, error: districtError } = await supabase
            .from('districts')
            .select('name, state_id')
            .eq('id', districtId)
            .single();

        if (districtError || !districtData) {
            return res.status(404).json({ success: false, error: 'District not found' });
        }

        // Get state name
        const { data: stateData, error: stateError } = await supabase
            .from('states')
            .select('name')
            .eq('id', districtData.state_id)
            .single();

        if (stateError || !stateData) {
            return res.status(404).json({ success: false, error: 'State not found' });
        }

        // Insert UC submission
        const { data, error } = await supabase
            .from('uc_submissions')
            .insert([{
                district_id: districtId,
                financial_year: financialYear,
                fund_released: parseInt(fundReleased),
                fund_utilized: parseInt(fundUtilized),
                document_url: documentUrl || null,
                status: 'Pending Verification'
            }])
            .select('*, districts(name)');

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        console.log('✅ UC submitted successfully');

        // 🔔 CREATE NOTIFICATION FOR STATE ADMIN
        try {
            const utilizationPercent = Math.round((parseInt(fundUtilized) / parseInt(fundReleased)) * 100);
            const fundReleasedCr = (parseInt(fundReleased) / 10000000).toFixed(2);
            const fundUtilizedCr = (parseInt(fundUtilized) / 10000000).toFixed(2);

            const notification = {
                user_role: 'state',
                state_name: stateData.name,
                title: 'New UC Submitted for Verification',
                message: `${districtData.name} district has submitted a Utilization Certificate for ${financialYear}. Fund Released: ₹${fundReleasedCr} Cr, Fund Utilized: ₹${fundUtilizedCr} Cr (${utilizationPercent}% utilization). Please review and verify.`,
                type: 'info',
                read: false,
                metadata: {
                    uc_id: data[0].id,
                    district_name: districtData.name,
                    financial_year: financialYear,
                    fund_released: fundReleasedCr,
                    fund_utilized: fundUtilizedCr,
                    utilization_percent: utilizationPercent,
                    action_required: 'verify_uc'
                }
            };

            const { error: notifError } = await supabase
                .from('notifications')
                .insert([notification]);

            if (notifError) {
                console.error('Failed to create notification:', notifError);
            } else {
                console.log(`🔔 Notification created for State: ${stateData.name} - UC from ${districtData.name}`);
            }
        } catch (notifErr) {
            console.error('Error creating notification:', notifErr);
            // Don't fail the request, just log it
        }

        res.json({
            success: true,
            message: 'UC submitted successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Error submitting UC:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Verify UC (State Admin)
exports.verifyUC = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks, verifiedBy } = req.body;

        if (!status || !['Verified', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be Verified or Rejected'
            });
        }

        console.log(`✓ Verifying UC ${id} with status: ${status}`);

        // Update UC status
        const { data, error } = await supabase
            .from('uc_submissions')
            .update({
                status: status,
                remarks: remarks || null,
                verified_by: verifiedBy || null,
                verification_date: new Date().toISOString().split('T')[0]
            })
            .eq('id', id)
            .select('*, districts(name)');

        if (error) {
            console.error('Supabase update error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, error: 'UC not found' });
        }

        console.log(`✅ UC ${status.toLowerCase()} successfully`);

        res.json({
            success: true,
            message: `UC ${status.toLowerCase()} successfully`,
            data: data[0]
        });

    } catch (error) {
        console.error('Error verifying UC:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get UCs for a specific district (District Admin view)
exports.getUCsByDistrict = async (req, res) => {
    try {
        const { districtId } = req.params;

        console.log('📋 Fetching UCs for district ID:', districtId);

        const { data: ucs, error } = await supabase
            .from('uc_submissions')
            .select('*')
            .eq('district_id', districtId)
            .order('submitted_date', { ascending: false });

        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }

        console.log(`✅ Found ${ucs.length} UCs for district`);

        res.json({ success: true, data: ucs });

    } catch (error) {
        console.error('Error fetching district UCs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
