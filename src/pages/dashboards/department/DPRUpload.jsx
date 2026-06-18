import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

const DPRUpload = () => {
    const { user } = useAuth();
    const [dprs, setDprs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', location: '', estimatedCost: '', file: null });
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    // Supabase Configuration
    // Supabase Configuration
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    useEffect(() => {
        fetchDPRs();
    }, [user?.id]);

    const fetchDPRs = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('dprs')
                .select('*')
                .eq('uploaded_by', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDprs(data || []);
        } catch (error) {
            console.error('Error fetching DPRs:', error);
            showToast('Error loading DPRs');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const validate = () => {
        const errs = {};
        if (!formData.title.trim()) errs.title = 'Project title is required';
        if (!formData.location.trim()) errs.location = 'Location is required';
        if (!formData.estimatedCost) errs.estimatedCost = 'Estimated cost is required';
        if (!formData.file) errs.file = 'DPR file is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleUpload = async () => {
        if (!validate()) return;

        // Check if user is authenticated
        if (!user || !user.id) {
            showToast('User not authenticated. Please log in again.');
            return;
        }

        console.log('Starting DPR upload...');
        console.log('User ID:', user.id);
        console.log('Form data:', formData);

        try {
            const payload = {
                project_title: formData.title,
                location: formData.location,
                estimated_cost: parseFloat(formData.estimatedCost),
                submission_date: new Date().toISOString().split('T')[0],
                status: 'Submitted',
                file_name: formData.file.name,
                uploaded_by: user.id
            };

            console.log('Payload to insert:', payload);

            const { data, error } = await supabase
                .from('dprs')
                .insert([payload])
                .select();

            if (error) {
                console.error('Supabase error details:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                console.error('Error details:', error.details);
                showToast(`Failed to upload DPR: ${error.message}`);
                return;
            }

            console.log('Upload successful:', data);
            fetchDPRs();
            showToast('DPR uploaded successfully');
            setIsModalOpen(false);
            setFormData({ title: '', location: '', estimatedCost: '', file: null });
            setErrors({});
        } catch (error) {
            console.error('Catch block error:', error);
            showToast(`Error uploading DPR: ${error.message || 'Unknown error'}`);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleViewPDF = (dpr) => {
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>DPR - ${dpr.project_title}</title>
                    <style>
                        body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 900px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 3px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; }
                        h1 { font-size: 26px; text-transform: uppercase; margin: 0; color: #2c3e50; }
                        .subtitle { color: #666; font-size: 14px; margin-top: 8px; }
                        .section { margin-bottom: 30px; }
                        .section-title { font-weight: bold; color: #2c3e50; font-size: 18px; margin-bottom: 12px; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px; }
                        .info-row { display: flex; margin-bottom: 12px; line-height: 1.6; }
                        .info-label { font-weight: bold; width: 200px; color: #555; }
                        .info-value { color: #333; }
                        .description { background-color: #f9f9f9; padding: 20px; border-left: 4px solid #3498db; margin-top: 15px; line-height: 1.8; }
                        .footer { margin-top: 60px; padding-top: 20px; border-top: 2px solid #ecf0f1; text-align: center; color: #666; font-size: 12px; }
                        @media print { body { border: none; padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Detailed Project Report (DPR)</h1>
                        <div class="subtitle">PM-AJAY Scheme Implementation</div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Project Information</div>
                        <div class="info-row"><div class="info-label">Project Title:</div><div class="info-value">${dpr.project_title}</div></div>
                        <div class="info-row"><div class="info-label">Location:</div><div class="info-value">${dpr.location}</div></div>
                        <div class="info-row"><div class="info-label">Estimated Cost:</div><div class="info-value">₹${dpr.estimated_cost} Cr</div></div>
                        <div class="info-row"><div class="info-label">Submission Date:</div><div class="info-value">${dpr.submission_date}</div></div>
                        <div class="info-row"><div class="info-label">Status:</div><div class="info-value">${dpr.status}</div></div>
                        <div class="info-row"><div class="info-label">DPR Document:</div><div class="info-value">${dpr.file_name}</div></div>
                    </div>

                    <div class="section">
                        <div class="section-title">Project Description</div>
                        <div class="description">
                            This Detailed Project Report outlines the comprehensive planning, implementation strategy, 
                            and financial requirements for the ${dpr.project_title} project located at ${dpr.location}. 
                            The project has been carefully designed to align with PM-AJAY scheme objectives and 
                            community development goals.
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Technical Specifications</div>
                        <div class="info-row"><div class="info-label">Implementing Department:</div><div class="info-value">Public Works Department (PWD)</div></div>
                        <div class="info-row"><div class="info-label">Expected Duration:</div><div class="info-value">12 months</div></div>
                        <div class="info-row"><div class="info-label">Beneficiaries:</div><div class="info-value">Community residents</div></div>
                    </div>

                    <div class="footer">
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                        <p>Document ID: DPR-${dpr.id} | PM-AJAY Portal - Department Dashboard</p>
                    </div>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            showToast(`Opening DPR for ${dpr.project_title}`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Error generating PDF');
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>DPR Upload & Management</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>+ Upload New DPR</button>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Project Title</th>
                            <th>Location</th>
                            <th>Estimated Cost</th>
                            <th>Submission Date</th>
                            <th>Status</th>
                            <th>File</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : dprs.length > 0 ? (
                            dprs.map(dpr => (
                                <tr key={dpr.id}>
                                    <td><strong>{dpr.project_title}</strong></td>
                                    <td>{dpr.location}</td>
                                    <td>₹{dpr.estimated_cost} Cr</td>
                                    <td>{dpr.submission_date}</td>
                                    <td>
                                        <span className={`badge badge-${dpr.status === 'Submitted' ? 'success' : 'warning'}`}>
                                            {dpr.status}
                                        </span>
                                    </td>
                                    <td>{dpr.file_name}</td>
                                    <td>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleViewPDF(dpr)}>View</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: 20 }}>No DPRs uploaded yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setErrors({}); }}
                title="Upload Detailed Project Report (DPR)"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => { setIsModalOpen(false); setErrors({}); }} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={handleUpload} className="btn btn-primary" style={{ padding: '8px 14px' }}>
                            Upload DPR
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">Project Title</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Construction of Community Hall"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        {errors.title && <div className="form-error">{errors.title}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Location (GP/District)</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Shirur GP, Pune"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                        {errors.location && <div className="form-error">{errors.location}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Estimated Cost (in Crores)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control no-spin"
                            placeholder="0.00"
                            value={formData.estimatedCost}
                            onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                        />
                        {errors.estimatedCost && <div className="form-error">{errors.estimatedCost}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload DPR Document (PDF)</label>
                        <input
                            type="file"
                            accept=".pdf"
                            className="form-control"
                            onChange={handleFileChange}
                            style={{ padding: '8px' }}
                        />
                        <div className="form-helper">Max file size: 10MB. PDF only.</div>
                        {errors.file && <div className="form-error">{errors.file}</div>}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DPRUpload;
