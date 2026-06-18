import React, { useState } from 'react';

const ProposeWorks = () => {
    const [formData, setFormData] = useState({
        title: '',
        component: '',
        description: '',
        cost: '',
        file: null
    });

    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Project Title is required';
        if (!formData.component || formData.component === 'Select Component') newErrors.component = 'Please select a component';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.cost) newErrors.cost = 'Estimated Cost is required';
        else if (isNaN(formData.cost) || Number(formData.cost) <= 0) newErrors.cost = 'Please enter a valid positive number';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            // Simulate API call
            console.log('Submitting proposal:', formData);
            showToast('Proposal submitted successfully!', 'success');
            // Reset form
            setFormData({
                title: '',
                component: '',
                description: '',
                cost: '',
                file: null
            });
            setErrors({});
        } else {
            showToast('Please fix the errors before submitting', 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData(prev => ({ ...prev, file: e.target.files[0] }));
        }
    };

    return (
        <div className="dashboard-panel">
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: toast.type === 'error' ? '#e74c3c' : '#00b894',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {toast.message}
                </div>
            )}

            <div className="form-section">
                <div className="form-section-header">
                    <h3 className="form-section-title">Propose New Work</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Project Title</label>
                        <input
                            type="text"
                            name="title"
                            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                            placeholder="e.g., Community Hall Construction"
                            value={formData.title}
                            onChange={handleChange}
                        />
                        {errors.title && <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px' }}>{errors.title}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Component</label>
                        <select
                            name="component"
                            className={`form-control form-select ${errors.component ? 'is-invalid' : ''}`}
                            value={formData.component}
                            onChange={handleChange}
                        >
                            <option value="">Select Component</option>
                            <option value="Adarsh Gram">Adarsh Gram</option>
                            <option value="GIA (Grant-in-Aid)">GIA (Grant-in-Aid)</option>
                            <option value="Hostel">Hostel</option>
                        </select>
                        {errors.component && <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px' }}>{errors.component}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Description</label>
                        <textarea
                            name="description"
                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                            rows="4"
                            placeholder="Describe the proposed work in detail"
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                        {errors.description && <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px' }}>{errors.description}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Estimated Cost (₹)</label>
                        <input
                            type="number"
                            name="cost"
                            className={`form-control ${errors.cost ? 'is-invalid' : ''}`}
                            placeholder="Enter estimated cost"
                            value={formData.cost}
                            onChange={handleChange}
                        />
                        {errors.cost && <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px' }}>{errors.cost}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload Documents/Photos</label>
                        <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
                            <div className="upload-area-icon">📁</div>
                            <div className="upload-area-text">
                                {formData.file ? formData.file.name : "Click to upload or drag and drop"}
                            </div>
                            <div className="upload-area-hint">PDF, JPG, PNG (Max 10MB)</div>
                            <input
                                id="fileInput"
                                type="file"
                                multiple
                                accept="image/*,.pdf"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <button type="submit" className="btn btn-primary">Submit Proposal</button>
                        <button type="button" className="btn btn-outline" onClick={() => showToast('Draft saved', 'success')}>Save as Draft</button>
                    </div>
                </form>
            </div>

            <div className="dashboard-section" style={{ marginTop: 'var(--space-6)' }}>
                <div className="section-header">
                    <h3 className="section-title">Recent Proposals</h3>
                </div>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project Title</th>
                                <th>Component</th>
                                <th>Date Submitted</th>
                                <th>Estimated Cost</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Village Library Construction</td>
                                <td>Adarsh Gram</td>
                                <td>2025-11-20</td>
                                <td>₹12 Lakhs</td>
                                <td><span className="badge badge-warning">Pending</span></td>
                            </tr>
                            <tr>
                                <td>Solar Street Lights Phase 2</td>
                                <td>Infrastructure</td>
                                <td>2025-11-15</td>
                                <td>₹8.5 Lakhs</td>
                                <td><span className="badge badge-success">Approved</span></td>
                            </tr>
                            <tr>
                                <td>Skill Development Workshop</td>
                                <td>Skill Development</td>
                                <td>2025-11-10</td>
                                <td>₹2.5 Lakhs</td>
                                <td><span className="badge badge-error">Rejected</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProposeWorks;
