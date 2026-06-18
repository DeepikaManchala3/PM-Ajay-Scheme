import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { indiaHierarchy } from '../data/indiaHierarchy';
import './RegisterAgency.css';

const RegisterAgency = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        agencyName: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        gstNumber: '',
        state: '',
        districts: []
    });
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'state') {
            const selectedStateData = indiaHierarchy.find(s => s.name === value);
            setAvailableDistricts(selectedStateData ? selectedStateData.districts : []);
            setFormData(prev => ({ ...prev, districts: [] }));
        }
    };

    const handleDistrictChange = (districtName) => {
        setFormData(prev => {
            const currentDistricts = prev.districts;
            if (currentDistricts.includes(districtName)) {
                return { ...prev, districts: currentDistricts.filter(d => d !== districtName) };
            } else {
                return { ...prev, districts: [...currentDistricts, districtName] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (formData.districts.length === 0) {
                throw new Error('Please select at least one district');
            }

            // Prepare payload (exclude confirmPassword)
            const payload = {
                agencyName: formData.agencyName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                password: formData.password,
                gstNumber: formData.gstNumber,
                state: formData.state,
                districts: formData.districts
            };

            const response = await fetch('http://localhost:5001/api/implementing-agencies/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
            }

            alert(result.message || 'Registration Successful!');
            navigate('/login');

        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="register-agency-container">
                <div className="success-message-card">
                    <div className="success-icon" style={{ fontSize: '4rem', color: 'green', display: 'flex', justifyContent: 'center' }}>✓</div>
                    <h2 style={{ textAlign: 'center' }}>Registration Successful!</h2>
                    <p style={{ textAlign: 'center' }}>Your agency registration has been submitted for approval.</p>
                    <p style={{ textAlign: 'center' }}>You will receive an email once your application is reviewed by the Ministry/State Admin.</p>
                    <p style={{ marginTop: '20px', color: '#64748b', textAlign: 'center' }}>Redirecting to login page...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="login-page">
                <div className="login-card" style={{ maxWidth: '600px' }}>
                    <div className="login-header">
                        <img src="/logos/emblem.png" alt="PM-AJAY" className="login-logo" />
                        <h1 className="login-title">Agency Registration</h1>
                        <p className="login-subtitle">PM-AJAY Portal</p>
                    </div>

                    {error && <div className="alert alert-error" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '0.5rem' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Agency Name</label>
                            <input type="text" className="form-control" placeholder="Enter agency name" name="agencyName" value={formData.agencyName} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input type="tel" className="form-control" placeholder="Enter phone number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required pattern="[0-9]{10}" title="Please enter a valid 10-digit phone number" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" className="form-control" placeholder="Enter email address" name="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input type="password" className="form-control" placeholder="Create a password" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">GST Number</label>
                            <input type="text" className="form-control" placeholder="Enter GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} required style={{ textTransform: 'uppercase' }} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">State</label>
                            <select className="form-control" name="state" value={formData.state} onChange={handleChange} required style={{ backgroundImage: 'none' }}>
                                <option value="">Select State</option>
                                {indiaHierarchy.map(state => (
                                    <option key={state.id} value={state.name}>{state.name}</option>
                                ))}
                            </select>
                        </div>

                        {formData.state && (
                            <div className="form-group">
                                <label className="form-label">Select Districts (Available for Work)</label>
                                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                                    {availableDistricts.length > 0 ? (
                                        availableDistricts.map(district => (
                                            <div key={district.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                <input type="checkbox" id={`district-${district.id}`} checked={formData.districts.includes(district.name)} onChange={() => handleDistrictChange(district.name)} style={{ marginRight: '8px' }} />
                                                <label htmlFor={`district-${district.id}`} style={{ cursor: 'pointer', fontSize: '14px' }}>{district.name}</label>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>No districts available</p>
                                    )}
                                </div>
                                <small style={{ color: '#666', fontSize: '12px' }}>Selected: {formData.districts.length} districts</small>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary login-button" style={{ width: '100%', marginTop: 'var(--space-4)', borderRadius: '50px', transition: 'all 0.3s ease' }} disabled={loading}>
                            {loading ? 'Registering...' : 'Register Agency'}
                        </button>
                    </form>

                    <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)' }}>Login here</Link>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default RegisterAgency;
