const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpeg|jpg|png|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, images, and documents are allowed!'));
        }
    }
});

// Get all circulars (for public dashboard)
exports.getAllCirculars = async (req, res) => {
    try {
        const { type, category, limit = 50 } = req.query;

        let query = supabase
            .from('circulars')
            .select('*')
            .eq('is_active', true)
            .order('issued_date', { ascending: false })
            .limit(limit);

        if (type) {
            query = query.eq('type', type);
        }

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data: data,
            count: data.length
        });

    } catch (error) {
        console.error('Error fetching circulars:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get single circular by ID
exports.getCircularById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('circulars')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ success: false, error: 'Circular not found' });
        }

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('Error fetching circular:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create new circular (Ministry only)
exports.createCircular = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            category,
            file_url,
            file_type,
            file_name,
            file_size,
            priority,
            issued_date
        } = req.body;

        if (!title || !type || !file_url || !file_name) {
            return res.status(400).json({
                success: false,
                error: 'Title, type, file URL, and file name are required'
            });
        }

        const { data, error } = await supabase
            .from('circulars')
            .insert([{
                title,
                description,
                type,
                category,
                file_url,
                file_type,
                file_name,
                file_size,
                priority: priority || 'medium',
                issued_date: issued_date || new Date().toISOString().split('T')[0],
                is_active: true
            }])
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Circular created successfully',
            data: data
        });

    } catch (error) {
        console.error('Error creating circular:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update circular
exports.updateCircular = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updated_at: new Date().toISOString() };

        const { data, error } = await supabase
            .from('circulars')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Circular updated successfully',
            data: data
        });

    } catch (error) {
        console.error('Error updating circular:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete (deactivate) circular
exports.deleteCircular = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('circulars')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Circular deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting circular:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Upload file to Supabase storage
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const file = req.file;
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = `circulars/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('documents')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        res.json({
            success: true,
            data: {
                file_url: publicUrl,
                file_name: file.originalname,
                file_size: file.size,
                file_type: file.mimetype.includes('pdf') ? 'pdf' :
                    file.mimetype.includes('image') ? 'image' : 'document'
            }
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


// Export upload middleware for use in routes
module.exports.upload = upload;

