import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import InteractiveButton from '../../../components/InteractiveButton';

// List of major districts in Maharashtra (you can expand this)
import { useAuth } from '../../../contexts/AuthContext';

const ManageDistrictAdmins = () => {
    const { user } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [stateName, setStateName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [formData, setFormData] = useState({
        district: '',
        name: '',
        email: '',
        phone: '',
        status: 'Active',
        bank_account_number: ''
    });
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [loading, setLoading] = useState(false);

    // API Base URL
    const API_BASE_URL = 'http://localhost:5001/api/district-admins';

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

    // Fetch admins and districts when stateName is available
    React.useEffect(() => {
        if (stateName) {
            fetchAdmins();
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

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const url = stateName
                ? `${API_BASE_URL}?stateName=${encodeURIComponent(stateName)}`
                : API_BASE_URL;

            const response = await fetch(url);
            const result = await response.json();
            if (result.success) {
                // Map backend fields to frontend state
                const mappedAdmins = result.data.map(admin => ({
                    id: admin.id,
                    name: admin.admin_name,
                    district: admin.district_name,
                    phone: admin.phone_no,
                    email: admin.email,
                    status: admin.status,
                    bank_account_number: admin.bank_account_number
                }));
                setAdmins(mappedAdmins);
            } else {
                showToast('Failed to fetch admins', 'error');
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
            showToast('Error connecting to server', 'error');
        } finally {
            setLoading(false);
        }
    };

    // small helper to show transient messages
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAdd = () => {
        setCurrentAdmin(null);
        setFormData({
            district: '',
            name: '',
            email: '',
            phone: '',
            status: 'Active',
            bank_account_number: ''
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (admin) => {
        setCurrentAdmin(admin);
        setFormData({
            district: admin.district,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            status: admin.status,
            bank_account_number: admin.bank_account_number || ''
        });
        setErrors({});
        setIsModalOpen(true);
    };

    // Basic validation
    const validate = () => {
        const errs = {};
        if (!formData.district) errs.district = 'Please select a district.';
        if (!formData.name.trim()) errs.name = 'Please enter admin name.';
        if (!formData.email.trim()) errs.email = 'Please enter email address.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Please enter a valid email address.';
        if (!formData.phone.trim()) errs.phone = 'Please enter phone number.';
        else if (!/^[0-9]{10}$/.test(formData.phone)) errs.phone = 'Please enter a valid 10-digit phone number.';
        if (!formData.bank_account_number.trim()) errs.bank_account_number = 'Please enter bank account number.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            const payload = {
                name: formData.name,
                district: formData.district,
                phone: formData.phone,
                email: formData.email,
                bank_account_number: formData.bank_account_number
            };

            let response;
            if (currentAdmin) {
                response = await fetch(`${API_BASE_URL}/${currentAdmin.id}`, {
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
                fetchAdmins(); // Refresh list
                setIsModalOpen(false);
            } else {
                showToast(result.error || 'Failed to save admin', 'error');
            }
        } catch (error) {
            console.error('Error saving admin:', error);
            showToast('Error saving admin', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle status button click to activate
    const handleStatusClick = async (admin) => {
        if (admin.status === 'Active') {
            try {
                setLoading(true);
                console.log('🔵 Activating district admin:', admin.id);

                const response = await fetch(`${API_BASE_URL}/${admin.id}/activate`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' }
                });
                const result = await response.json();

                if (result.success) {
                    showToast('Admin activated successfully and WhatsApp sent!', 'success');
                    fetchAdmins();
                } else {
                    showToast(result.error || 'Failed to activate admin', 'error');
                }
            } catch (error) {
                console.error('❌ Error activating admin:', error);
                showToast('Failed to activate admin', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    // Filter admins based on selected district
    const filteredAdmins = admins.filter(admin => {
        const matchesDistrict = selectedDistrict === 'all' || admin.district === selectedDistrict;
        return matchesDistrict;
    });

    // Get unique districts from admins for filter
    const uniqueDistricts = ['all', ...new Set(admins.map(admin => admin.district))];

    return (
        <div className="dashboard-panel" style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Manage District Admins</h2>
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
                    <InteractiveButton variant="primary" size="sm" onClick={handleAdd}>+ Add New Admin</InteractiveButton>
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
                            <th>Admin Name</th>
                            <th>District</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdmins.length > 0 ? (
                            filteredAdmins.map(admin => (
                                <tr key={admin.id}>
                                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                                        {admin.name}
                                    </td>
                                    <td>{admin.district}</td>
                                    <td>{admin.phone}</td>
                                    <td>{admin.email}</td>
                                    <td>
                                        <InteractiveButton
                                            variant={admin.status === 'Active' ? 'success' : 'secondary'}
                                            size="sm"
                                            onClick={() => handleStatusClick(admin)}
                                            disabled={admin.status !== 'Active' || loading}
                                            style={{
                                                cursor: admin.status === 'Active' ? 'pointer' : 'not-allowed',
                                                opacity: 1,
                                                minWidth: '90px',
                                                marginRight: '8px',
                                                backgroundColor: admin.status === 'Activated' ? '#F3F4F6' : undefined,
                                                color: admin.status === 'Activated' ? '#6B7280' : undefined,
                                                border: admin.status === 'Activated' ? '1px solid #E5E7EB' : undefined
                                            }}
                                            title={admin.status === 'Active' ? 'Click to activate and send WhatsApp' : ''}
                                        >
                                            {admin.status}
                                        </InteractiveButton>
                                        <InteractiveButton variant="success" size="sm" onClick={() => handleEdit(admin)}>Edit</InteractiveButton>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No district admins found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Admin Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentAdmin ? "Edit District Admin" : "Add New District Admin"}
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
                        <label className="form-label">Admin Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Rahul Deshmukh"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.name && <div className="form-error">{errors.name}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="e.g. admin@district.gov.in"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ padding: '10px' }}
                            />
                            {errors.email && <div className="form-error">{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-control"
                                placeholder="e.g. 9876543210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                style={{ padding: '10px' }}
                            />
                            {errors.phone && <div className="form-error">{errors.phone}</div>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bank Account Number</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. 123456789012"
                            value={formData.bank_account_number}
                            onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.bank_account_number && <div className="form-error">{errors.bank_account_number}</div>}
                        <div className="form-helper">This will be stored securely and not displayed in the public list.</div>
                    </div>

                    <div style={{ fontSize: 13, color: '#555' }}>
                        <strong>Note:</strong> The admin will receive login credentials via email after account creation.
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageDistrictAdmins;
