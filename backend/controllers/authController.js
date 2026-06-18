// Auth Controller
// Note: Most authentication happens directly on the frontend with Supabase
// This is for server-side admin operations if needed

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // In a real backend login, we would verify with Supabase Admin API
        // For now, we just acknowledge the request
        console.log('Login attempt received for:', email);

        res.status(200).json({
            message: 'Login request received. Please complete authentication on frontend via Supabase.',
            email: email
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUser = (req, res) => {
    res.json({ message: 'User profile endpoint' });
};
