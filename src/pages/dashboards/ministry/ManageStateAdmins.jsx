import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import Modal from '../../../components/Modal';
import InteractiveButton from '../../../components/InteractiveButton';

const ManageStateAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [selectedState, setSelectedState] = useState('all');
    const [states, setStates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [formData, setFormData] = useState({
        admin_name: '',
        state_name: '',
        phone_no: '',
        email: '',
        bank_account_number: ''
    });
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    // API Base URL
    const API_BASE_URL = 'http://localhost:5001/api/state-admins';

    // Fetch all state admins and states from backend
    useEffect(() => {
        fetchStateAdmins();
        fetchStates();
    }, []);

    const fetchStateAdmins = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_BASE_URL);
            const result = await response.json();

            if (result.success) {
                setAdmins(result.data);
                setFilteredAdmins(result.data);
            } else {
                showToast('Error fetching state admins', 'error');
            }
        } catch (error) {
            console.error('Error fetching state admins:', error);
            showToast('Failed to load state admins', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all states from Backend (replacing direct Supabase call)
    const fetchStates = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/states`);
            const result = await response.json();
            if (result.success) {
                setStates(result.data.map(s => s.name));
            } else {
                console.error('Error fetching states:', result.error);
            }
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Handle state filter change
    const handleStateFilter = (e) => {
        const state = e.target.value;
        setSelectedState(state);
        if (state === 'all') {
            setFilteredAdmins(admins);
        } else {
            setFilteredAdmins(admins.filter(admin => admin.state_name === state));
        }
    };

    // Get unique states from admins
    const uniqueStates = ['all', ...new Set(admins.map(admin => admin.state_name))];

    // Handle status button click to activate
    const handleStatusClick = async (admin) => {
        if (admin.status === 'Active') {
            try {
                console.log('🔵 Activating admin:', admin.id);
                const response = await fetch(`${API_BASE_URL}/${admin.id}/activate`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' }
                });
                const result = await response.json();
                console.log('🔵 Activation response:', result);

                if (result.success) {
                    showToast('Admin activated successfully and WhatsApp sent!', 'success');
                    fetchStateAdmins();
                } else {
                    showToast(result.error || 'Failed to activate admin', 'error');
                }
            } catch (error) {
                console.error('❌ Error activating admin:', error);
                showToast('Failed to activate admin', 'error');
            }
        }
    };

    // Open modal to add new admin
    const handleAdd = () => {
        setCurrentAdmin(null);
        setFormData({ admin_name: '', state_name: '', phone_no: '', email: '', bank_account_number: '' });
        setErrors({});
        setIsModalOpen(true);
    };

    // Open modal to edit existing admin
    const handleEdit = (admin) => {
        setCurrentAdmin(admin);
        setFormData({
            admin_name: admin.admin_name,
            state_name: admin.state_name,
            phone_no: admin.phone_no,
            email: admin.email,
            bank_account_number: admin.bank_account_number
        });
        setErrors({});
        setIsModalOpen(true);
    };

    // Validation
    const validate = () => {
        const errs = {};
        if (!formData.admin_name.trim()) errs.admin_name = 'Please enter admin name.';
        if (!formData.state_name.trim()) errs.state_name = 'Please enter state name.';
        if (!formData.email.trim()) errs.email = 'Please enter email address.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            errs.email = 'Please enter a valid email address.';
        if (!formData.phone_no.trim()) errs.phone_no = 'Please enter phone number.';
        else if (!/^[0-9]{10}$/.test(formData.phone_no))
            errs.phone_no = 'Please enter a valid 10-digit phone number.';
        if (!formData.bank_account_number.trim())
            errs.bank_account_number = 'Please enter bank account number.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Save (Add or Update) state admin
    const handleSave = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            let response;

            if (currentAdmin) {
                // Update existing admin
                response = await fetch(`${API_BASE_URL}/${currentAdmin.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                // Add new admin
                response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            const result = await response.json();

            if (result.success) {
                showToast(result.message, 'success');
                fetchStateAdmins(); // Refresh the list
                setIsModalOpen(false);
            } else {
                showToast(result.error || 'Failed to save admin', 'error');
            }
        } catch (error) {
            console.error('Error saving admin:', error);
            showToast('Failed to save admin', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Manage State Admins</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select
                        value={selectedState}
                        onChange={handleStateFilter}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        <option value="all">All States</option>
                        {uniqueStates.filter(s => s !== 'all').map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                    <InteractiveButton variant="primary" size="sm" onClick={handleAdd}>
                        + Add State Admin
                    </InteractiveButton>
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
                            <th>State Name</th>
                            <th>Name</th>
                            <th>Phone No</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdmins.length > 0 ? (
                            filteredAdmins.map(admin => (
                                <tr key={admin.id}>
                                    <td>{admin.state_name}</td>
                                    <td style={{ fontWeight: 600 }}>{admin.admin_name}</td>
                                    <td>{admin.phone_no}</td>
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
                                        
                                        <InteractiveButton
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => window.open(`https://wa.me/91${admin.phone_no}?text=Hello ${admin.admin_name},`, '_blank')}
                                            style={{ marginRight: '8px', borderColor: '#25D366', color: '#25D366' }}
                                            title="Message on WhatsApp"
                                        >
                                            <MessageCircle size={14} style={{ marginRight: 4 }} />
                                            Message
                                        </InteractiveButton>

                                        <InteractiveButton
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleEdit(admin)}
                                            disabled={loading}
                                        >
                                            Edit
                                        </InteractiveButton>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    {selectedState === 'all' ? 'No state admins found. Click "+ Add State Admin" to create one.' : `No admins found for ${selectedState}.`}
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
                title={currentAdmin ? "Edit State Admin" : "Add New State Admin"}
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <InteractiveButton
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </InteractiveButton>
                        <InteractiveButton
                            variant="primary"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
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
                            placeholder="e.g. Rajesh Kumar"
                            value={formData.admin_name}
                            onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.admin_name && <div className="form-error">{errors.admin_name}</div>}
                        <div className="form-helper">Enter the full name of the admin</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">State Name</label>
                        <select
                            className="form-control"
                            value={formData.state_name}
                            onChange={(e) => setFormData({ ...formData, state_name: e.target.value })}
                            style={{ padding: '10px' }}
                        >
                            <option value="">Select a state</option>
                            {states.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        {errors.state_name && <div className="form-error">{errors.state_name}</div>}
                        <div className="form-helper">Select the state from the dropdown</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="e.g. admin@state.gov.in"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.email && <div className="form-error">{errors.email}</div>}
                        <div className="form-helper">Official government email</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone No</label>
                        <input
                            type="tel"
                            className="form-control"
                            placeholder="e.g. 9876543210"
                            value={formData.phone_no}
                            onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.phone_no && <div className="form-error">{errors.phone_no}</div>}
                        <div className="form-helper">10-digit mobile number</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bank Account Number</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. 1234567890123456"
                            value={formData.bank_account_number}
                            onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.bank_account_number && <div className="form-error">{errors.bank_account_number}</div>}
                        <div className="form-helper">Bank account number for fund transfers (stored in database, not displayed in table)</div>
                    </div>

                    <div style={{ fontSize: 13, color: '#555', marginTop: 10 }}>
                        <strong>Note:</strong> The state admin will be added with "Active" status by default. Bank account number will be stored securely in the database.
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageStateAdmins;
