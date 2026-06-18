import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import InteractiveButton from '../../../components/InteractiveButton';
import { useAuth } from '../../../contexts/AuthContext';

const ManageImplementingAgencies = () => {
    const { user } = useAuth();
    const [agencies, setAgencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [stateName, setStateName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAgency, setCurrentAgency] = useState(null);
    const [formData, setFormData] = useState({
        district: '',
        agencyName: '',
        email: '',
        phone: '',
        status: 'Active'
    });
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [loading, setLoading] = useState(false);

    // API Base URL
    const API_BASE_URL = 'http://localhost:5001/api/implementing-agencies';

    // Fetch state name from user profile
    useEffect(() => {
        const fetchStateName = async () => {
            if (!user?.id) return;
            try {
                const response = await fetch(`http://localhost:5001/api/profile?userId=${user.id}`);
                const result = await response.json();
                if (result.success && result.data?.full_name) {
                    let name = result.data.full_name;
                    name = name.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
                    setStateName(name);
                }
            } catch (error) {
                console.error('Error fetching state name:', error);
            }
        };
        fetchStateName();
    }, [user]);

    // Fetch agencies and districts when stateName is available
    React.useEffect(() => {
        if (stateName) {
            fetchAgencies();
            fetchDistricts();
        }
    }, [stateName]);

    const fetchDistricts = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/state-admins/districts?stateName=${encodeURIComponent(stateName)}`);
            const result = await response.json();
            if (result.success) {
                setDistricts(result.data);
            }
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    const fetchAgencies = async () => {
        try {
            setLoading(true);
            const url = stateName
                ? `${API_BASE_URL}?stateName=${encodeURIComponent(stateName)}`
                : API_BASE_URL;

            const response = await fetch(url);
            const result = await response.json();
            if (result.success) {
                setAgencies(result.data);
            } else {
                showToast('Failed to fetch agencies', 'error');
            }
        } catch (error) {
            console.error('Error fetching agencies:', error);
            showToast('Error connecting to server', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAdd = () => {
        setCurrentAgency(null);
        setFormData({
            district: '',
            agencyName: '',
            email: '',
            phone: '',
            status: 'Active'
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (agency) => {
        setCurrentAgency(agency);
        setFormData({
            district: agency.district_name,
            agencyName: agency.agency_name,
            email: agency.email,
            phone: agency.phone || '',
            status: agency.status || 'Active'
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const validate = () => {
        const errs = {};
        if (!formData.district) errs.district = 'Please select a district.';
        if (!formData.agencyName.trim()) errs.agencyName = 'Please enter agency name.';
        if (!formData.email.trim()) errs.email = 'Please enter email address.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Please enter a valid email address.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            const payload = {
                agencyName: formData.agencyName,
                district: formData.district,
                email: formData.email,
                phone: formData.phone,
                stateName: stateName
            };

            let response;
            if (currentAgency) {
                response = await fetch(`${API_BASE_URL}/${currentAgency.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            const result = await response.json();

            if (result.success) {
                showToast(result.message, 'success');
                fetchAgencies();
                setIsModalOpen(false);
            } else {
                showToast(result.error || 'Failed to save agency', 'error');
            }
        } catch (error) {
            console.error('Error saving agency:', error);
            showToast('Error saving agency', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusClick = async (agency) => {
        console.log('🔘 Status button clicked for agency:', agency);
        console.log('🔍 Agency status:', agency.status);

        if (agency.status === 'Active') {
            try {
                setLoading(true);
                console.log('🔵 Activating implementing agency:', agency.id);
                console.log('📡 Calling:', `${API_BASE_URL}/${agency.id}/activate`);

                const response = await fetch(`${API_BASE_URL}/${agency.id}/activate`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' }
                });

                console.log('📥 Response status:', response.status);
                const result = await response.json();
                console.log('📥 Response data:', result);

                if (result.success) {
                    showToast(`Agency activated! Credentials: ${result.credentials?.email} / ${result.credentials?.password}`, 'success');
                    fetchAgencies();
                } else {
                    showToast(result.error || 'Failed to activate agency', 'error');
                }
            } catch (error) {
                console.error('❌ Error activating agency:', error);
                showToast('Failed to activate agency: ' + error.message, 'error');
            } finally {
                setLoading(false);
            }
        } else {
            console.log('⚠️ Agency already activated, status:', agency.status);
        }
    };

    const filteredAgencies = agencies.filter(agency => {
        const matchesDistrict = selectedDistrict === 'all' || agency.district_name === selectedDistrict;
        return matchesDistrict;
    });

    const uniqueDistricts = ['all', ...new Set(agencies.map(agency => agency.district_name))];

    return (
        <div className="dashboard-panel" style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Manage Implementing Agencies</h2>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            height: '38px'
                        }}
                    >
                        <option value="all">All Districts</option>
                        {uniqueDistricts.filter(d => d !== 'all').map(district => (
                            <option key={district} value={district}>{district}</option>
                        ))}
                    </select>
                    <InteractiveButton variant="primary" size="sm" onClick={handleAdd}>+ Add New Agency</InteractiveButton>
                </div>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{
                        display: 'inline-block',
                        background: toast.type === 'error' ? '#E74C3C' : '#00B894',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: 6
                    }}>
                        {toast.message}
                    </div>
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
                    Loading...
                </div>
            )}

            <div className="table-wrapper" style={{ marginBottom: 16 }}>
                <table className="table" style={{ minWidth: 800 }}>
                    <thead>
                        <tr>
                            <th>Agency Name</th>
                            <th>District</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAgencies.length > 0 ? (
                            filteredAgencies.map(agency => (
                                <tr key={agency.id}>
                                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                                        {agency.agency_name}
                                    </td>
                                    <td>{agency.district_name}</td>
                                    <td>{agency.email}</td>
                                    <td>{agency.phone || 'N/A'}</td>
                                    <td>
                                        <InteractiveButton variant="success" size="sm" onClick={() => handleEdit(agency)}>Edit</InteractiveButton>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No implementing agencies found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Agency Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentAgency ? "Edit Implementing Agency" : "Add New Implementing Agency"}
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <InteractiveButton variant="outline" onClick={() => setIsModalOpen(false)} disabled={loading}>
                            Cancel
                        </InteractiveButton>
                        <InteractiveButton variant="primary" onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </InteractiveButton>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">District Name</label>
                        <select
                            className="form-control"
                            value={formData.district}
                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        >
                            <option value="">-- select district --</option>
                            {districts.map((d) => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                        {errors.district && <div className="form-error">{errors.district}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Agency Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Public Works Department"
                            value={formData.agencyName}
                            onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.agencyName && <div className="form-error">{errors.agencyName}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="e.g. agency@district.gov.in"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ padding: '10px' }}
                            />
                            {errors.email && <div className="form-error">{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number (Optional)</label>
                            <input
                                type="tel"
                                className="form-control"
                                placeholder="e.g. 9876543210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                style={{ padding: '10px' }}
                            />
                        </div>
                    </div>

                    <div style={{ fontSize: 13, color: '#555' }}>
                        <strong>Note:</strong> The agency will receive login credentials via email after account creation.
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageImplementingAgencies;
