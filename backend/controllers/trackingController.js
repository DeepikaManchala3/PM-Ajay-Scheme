const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

// Get distinct states
exports.getStates = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('villages')
            .select('state_name')
            .neq('state_name', null);

        if (error) throw error;

        // Unique states
        const uniqueStates = [...new Set(data.map(item => item.state_name))].sort();

        res.json({ success: true, data: uniqueStates });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get districts by state
exports.getDistricts = async (req, res) => {
    try {
        const { state } = req.query;
        if (!state) return res.status(400).json({ error: "State is required" });

        const { data, error } = await supabase
            .from('villages')
            .select('district_name')
            .eq('state_name', state);

        if (error) throw error;

        const uniqueDistricts = [...new Set(data.map(item => item.district_name))].sort();
        res.json({ success: true, data: uniqueDistricts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get villages by district
exports.getVillages = async (req, res) => {
    try {
        const { district } = req.query;
        if (!district) return res.status(400).json({ error: "District is required" });

        const { data, error } = await supabase
            .from('villages')
            .select('village_name, village_code')
            .eq('district_name', district)
            .order('village_name');

        if (error) throw error;

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get projects (cascading filter)
exports.getProjects = async (req, res) => {
    try {
        const { state, district } = req.query;
        let query = supabase.from('approved_projects').select('id, project_name, district_name, state_name');

        if (state) query = query.eq('state_name', state);
        if (district) query = query.eq('district_name', district);
        // Note: Filtering by village is not directly supported by approved_projects schema yet

        const { data, error } = await query;
        if (error) throw error;

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/tracking/projects
// Query Params: state (optional), year (optional, default '2024-25'), district (optional)
exports.getProjectLocations = async (req, res) => {
    try {
        const { state, year, district } = req.query;
        // Default to current FY if not provided
        const selectedYear = year || '2024-2025';

        console.log(`📍 Fetching Tracking Data: Year=${selectedYear}, State=${state || 'All'}, District=${district || 'All'}`);

        let query = supabase
            .from('approved_projects')
            .select(`
                id,
                project_name,
                component,
                status,
                latitude,
                longitude,
                allocated_amount,
                released_amount,
                financial_year,
                implementing_agency_id,
                state_name,
                district_name
            `)
            .eq('financial_year', selectedYear);

        if (state && state !== 'All States') {
            query = query.eq('state_name', state);
        }

        if (district && district !== 'All Districts') {
            query = query.eq('district_name', district);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Database Error:', error);
            return res.status(500).json({ error: error.message });
        }

        // Calculate Stats for the filtered view
        const totalProjects = data.length;
        const totalAllocated = data.reduce((sum, p) => sum + (parseFloat(p.allocated_amount) || 0), 0);
        const totalReleased = data.reduce((sum, p) => sum + (parseFloat(p.released_amount) || 0), 0);

        // Calculate Utilization (Mock logic if not explicit in DB, but we have released_amount)
        // In real scenario, utilization comes from UC submissions or Work Orders. 
        // For visual, let's assume 'released' is what's with the agency.

        const stats = {
            totalProjects,
            totalAllocated, // In Rupees
            totalReleased,  // In Rupees
            utilizationPercentage: totalAllocated > 0 ? Math.round((totalReleased / totalAllocated) * 100) : 0
        };

        res.json({
            success: true,
            year: selectedYear,
            stats,
            projects: data
        });

    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
