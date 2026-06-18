const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, role, email')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Supabase error fetching profile:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({ success: true, data });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
