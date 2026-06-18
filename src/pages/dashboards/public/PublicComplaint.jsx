import React, { useState } from 'react';

const PublicComplaint = () => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        state: '',
        district: '',
        details: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.contact || !formData.details) {
            alert('Please fill in all required fields.');
            return;
        }

        // Simulate API call
        console.log('Complaint Submitted:', formData);
        alert(`Complaint Submitted Successfully!\nReference ID: COMP-${Math.floor(Math.random() * 10000)}`);

        // Reset form
        setFormData({
            name: '',
            contact: '',
            state: '',
            district: '',
            details: ''
        });
    };

    return (
        <div className="dashboard-section">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>

                {/* Complaint Form */}
                <div>
                    <div className="section-header">
                        <h2 className="section-title">Lodge a Complaint</h2>
                    </div>
                    <div className="card">
                        <div className="form-group">
                            <label className="form-label required">Your Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Contact Number</label>
                            <input
                                type="tel"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter mobile number"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Location</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="form-control form-select"
                                >
                                    <option value="">Select State</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Karnataka">Karnataka</option>
                                </select>
                                <select
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    className="form-control form-select"
                                >
                                    <option value="">Select District</option>
                                    <option value="Pune">Pune</option>
                                    <option value="Mumbai">Mumbai</option>
                                    <option value="Nagpur">Nagpur</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Complaint Details</label>
                            <textarea
                                name="details"
                                value={formData.details}
                                onChange={handleChange}
                                className="form-control"
                                rows="5"
                                placeholder="Describe your complaint in detail..."
                            ></textarea>
                        </div>

                        <button onClick={handleSubmit} className="btn btn-primary" style={{ width: '100%' }}>Submit Complaint</button>
                    </div>
                </div>

                {/* Track Status */}
                <div>
                    <div className="section-header">
                        <h2 className="section-title">Track Complaint Status</h2>
                    </div>
                    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                        <div className="form-group">
                            <label className="form-label">Enter Complaint Reference Number</label>
                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                <input type="text" className="form-control" placeholder="e.g., COMP-2024-001" />
                                <button className="btn btn-secondary">Track</button>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-3)' }}>Helpline Numbers</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Toll Free:</span>
                                <strong>1800-11-0001</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Email:</span>
                                <strong>support@pmajay.gov.in</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicComplaint;
