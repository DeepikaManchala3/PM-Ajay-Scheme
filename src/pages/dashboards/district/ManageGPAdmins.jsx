import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import InteractiveButton from '../../../components/InteractiveButton';

const ManageGPAdmins = () => {
    const { user } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [districtName, setDistrictName] = useState('');
    const [loading, setLoading] = useState(false);

    const [implementingAgencies, setImplementingAgencies] = useState(() => {
        const states = [
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
            "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
            "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
            "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
            "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
            "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
        ];
        const prefixes = ["GOV", "NGO", "PSU", "TEC", "STA", "NOD", "COO"];

        const stateAgencies = states.flatMap(state =>
            prefixes.map(prefix => `${prefix} - ${state}`)
        );

        const genericAgencies = [
            'Ministry of Tribal Affairs',
            'Ministry of Social Justice and Empowerment',
            'State Scheduled Caste Corporation',
            'National Backward Classes Finance Corporation',
            'Tribal Cooperative Marketing Development Federation',
            'State Social Welfare Department',
            'District Collector Office',
            'National Minorities Development Corporation'
        ];

        return [...stateAgencies, ...genericAgencies];
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', agency: '', email: '', phone: '', accountNo: '' });
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});
    const [currentAdmin, setCurrentAdmin] = useState(null);

    const [stateName, setStateName] = useState('');

    // API Base URL
    const API_BASE_URL = 'http://localhost:5001/api/implementing-agencies';

    // Fetch district name from user profile
    useEffect(() => {
        const fetchDistrictName = async () => {
            if (!user?.id) return;
            try {
                const response = await fetch(`http://localhost:5001/api/profile?userId=${user.id}`);
                const result = await response.json();
                if (result.success && result.data?.full_name) {
                    let name = result.data.full_name;
                    name = name.replace(' District Admin', '').replace(' Admin', '').replace(' District', '').trim();
                    setDistrictName(name);
                }
            } catch (error) {
                console.error('Error fetching district name:', error);
            }
        };
        fetchDistrictName();
    }, [user]);

    // Fetch State Name based on District Name
    useEffect(() => {
        const fetchStateName = async () => {
            if (!districtName) return;
            try {
                // 1. Get State ID from District Name
                const districtRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/districts?name=eq.${encodeURIComponent(districtName)}&select=state_id`, {
                    headers: {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                    }
                });
                const districtData = await districtRes.json();

                if (districtData?.[0]?.state_id) {
                    // 2. Get State Name from State ID
                    const stateRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/states?id=eq.${districtData[0].state_id}&select=name`, {
                        headers: {
                            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                        }
                    });
                    const stateData = await stateRes.json();
                    if (stateData?.[0]?.name) {
                        setStateName(stateData[0].name);
                    }
                }
            } catch (err) {
                console.error("Error fetching state:", err);
            }
        };
        fetchStateName();
    }, [districtName]);

    // Filter agencies based on state
    const filteredAgencies = implementingAgencies.filter(agency => {
        if (!stateName) return true; // If state not found, show all (or could show none)

        // Check if agency is state-specific (contains " - ")
        if (agency.includes(' - ')) {
            // Only show if it matches the current state
            return agency.includes(` - ${stateName}`);
        }

        // Always show generic agencies (no " - " in name)
        return true;
    });

    // Fetch implementing agencies when districtName is available
    useEffect(() => {
        if (districtName) {
            fetchImplementingAgencies();
        }
    }, [districtName]);

    const fetchImplementingAgencies = async () => {
        try {
            setLoading(true);
            const url = districtName
                ? `${API_BASE_URL}?districtName=${encodeURIComponent(districtName)}`
                : API_BASE_URL;

            const response = await fetch(url);
            const result = await response.json();
            if (result.success) {
                // Map backend fields to frontend state
                const mappedAgencies = result.data.map(agency => ({
                    id: agency.id,
                    name: agency.admin_name,
                    agency: agency.agency_name,
                    phone: agency.phone_no,
                    email: agency.email,
                    accountNo: agency.bank_account_number,
                    status: agency.status
                }));
                setAdmins(mappedAgencies);
            } else {
                showToast('Failed to fetch implementing agencies', 'error');
            }
        } catch (error) {
            console.error('Error fetching implementing agencies:', error);
            showToast('Error connecting to server', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleActivate = async (agency) => {
        if (agency.status === 'Activated') return;

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/${agency.id}/activate`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();

            if (result.success) {
                showToast('Agency activated successfully and WhatsApp sent!', 'success');
                fetchImplementingAgencies();
            } else {
                showToast(result.error || 'Failed to activate agency', 'error');
            }
        } catch (error) {
            console.error('Error activating agency:', error);
            showToast('Error activating agency', 'error');
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        if (!formData.agency) errs.agency = 'Please select an implementing agency';
        if (!formData.email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email format';
        if (!formData.phone.trim()) errs.phone = 'Phone is required';
        else if (!/^[0-9]{10}$/.test(formData.phone)) errs.phone = 'Invalid phone number';
        if (!formData.accountNo.trim()) errs.accountNo = 'Account number is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleAdd = () => {
        setCurrentAdmin(null);
        setFormData({ name: '', agency: '', email: '', phone: '', accountNo: '' });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (admin) => {
        setCurrentAdmin(admin);
        setFormData({
            name: admin.name,
            agency: admin.agency,
            email: admin.email,
            phone: admin.phone,
            accountNo: admin.accountNo || ''
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            const payload = {
                name: formData.name,
                agency: formData.agency,
                phone: formData.phone,
                email: formData.email,
                accountNo: formData.accountNo,
                districtName: districtName
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
                fetchImplementingAgencies(); // Refresh list
                setIsModalOpen(false);
                setFormData({ name: '', agency: '', email: '', phone: '', accountNo: '' });
                setErrors({});
            } else {
                showToast(result.error || 'Failed to save implementing agency', 'error');
            }
        } catch (error) {
            console.error('Error saving implementing agency:', error);
            showToast('Error saving implementing agency', 'error');
        } finally {
            setLoading(false);
        }
    };




    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Manage Implementing Agencies</h2>
                <InteractiveButton variant="primary" size="sm" onClick={handleAdd}>+ Add New Agency</InteractiveButton>
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
                        {toast.message || toast}
                    </div>
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
                    Loading...
                </div>
            )}

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Implementing Agency Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.length > 0 ? (
                            admins.map(admin => (
                                <tr key={admin.id}>
                                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{admin.name}</td>
                                    <td>{admin.agency}</td>
                                    <td>{admin.phone}</td>
                                    <td>{admin.email}</td>
                                    <td>
                                        <InteractiveButton
                                            variant={admin.status === 'Activated' ? 'secondary' : 'primary'}
                                            size="sm"
                                            onClick={() => handleActivate(admin)}
                                            disabled={admin.status === 'Activated' || loading}
                                            style={{
                                                marginRight: '8px',
                                                opacity: 1,
                                                cursor: admin.status === 'Activated' ? 'default' : 'pointer',
                                                backgroundColor: admin.status === 'Activated' ? '#F3F4F6' : undefined,
                                                color: admin.status === 'Activated' ? '#6B7280' : undefined,
                                                border: admin.status === 'Activated' ? '1px solid #E5E7EB' : undefined
                                            }}
                                        >
                                            {admin.status === 'Activated' ? 'Activated' : 'Activate'}
                                        </InteractiveButton>
                                        <InteractiveButton
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleEdit(admin)}
                                        >
                                            Edit
                                        </InteractiveButton>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No admins found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setErrors({}); }}
                title={currentAdmin ? "Edit Implementing Agency" : "Add New Implementing Agency"}
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <InteractiveButton variant="outline" onClick={() => { setIsModalOpen(false); setErrors({}); }}>
                            Cancel
                        </InteractiveButton>
                        <InteractiveButton variant="primary" onClick={handleSave}>
                            Save
                        </InteractiveButton>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Ramesh Patil"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.name && <div className="form-error">{errors.name}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Implementing Agency Name</label>
                        <select
                            className="form-control"
                            value={formData.agency}
                            onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                            style={{ padding: '10px' }}
                        >
                            <option value="">-- Select Implementing Agency --</option>
                            {filteredAgencies.map((agencyName) => (
                                <option key={agencyName} value={agencyName}>{agencyName}</option>
                            ))}
                        </select>
                        {errors.agency && <div className="form-error">{errors.agency}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="e.g. admin@agency.gov.in"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ padding: '10px' }}
                            />
                            {errors.email && <div className="form-error">{errors.email}</div>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Account Number</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. 123456789012"
                            value={formData.accountNo}
                            onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.accountNo && <div className="form-error">{errors.accountNo}</div>}
                        <div className="form-helper">This will be stored securely and not displayed in the public list.</div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageGPAdmins;
