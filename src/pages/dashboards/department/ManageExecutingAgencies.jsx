import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import InteractiveButton from '../../../components/InteractiveButton';

const ManageExecutingAgencies = () => {
    const { user } = useAuth();
    const [agencies, setAgencies] = useState([]);
    const [executingAgenciesList, setExecutingAgenciesList] = useState([]); // New state for dropdown options
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        agency_officer: '',
        phone: '',
        email: '',
        work_assigned: '',
        status: 'Active'
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchAgencies();
        fetchExecutingAgenciesList(); // Fetch the list for dropdown
    }, [user?.id]);

    const fetchExecutingAgenciesList = async () => {
        try {
            console.log('📋 Fetching ALL executing agencies for dropdown...');

            // Fetch ALL executing agencies without state filter
            const { data, error } = await supabase
                .from('executing_agencies')
                .select('agency_name')
                .order('agency_name', { ascending: true });

            if (error) {
                console.error('Error fetching executing agencies:', error);
                return;
            }

            console.log('✅ Found', data?.length || 0, 'executing agencies');
            if (data && data.length > 0) {
                setExecutingAgenciesList(data);
            } else {
                console.warn('⚠️ No executing agencies found in database');
            }
        } catch (error) {
            console.error('Error fetching executing agencies list:', error);
        }
    };

    const fetchAgencies = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // Fetch from the new 'agency_assignments' table
            const { data, error } = await supabase
                .from('agency_assignments')
                .select('*')
                .eq('implementing_agency_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // No need to map 'agency_name' anymore as new table uses 'name'
                setAgencies(data);
            }
        } catch (error) {
            console.error('Error fetching agencies:', error);
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        if (!formData.agency_officer.trim()) errs.agency_officer = 'Agency Officer is required';
        if (!formData.phone.trim()) errs.phone = 'Phone number is required';
        if (!formData.email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email format';
        if (!formData.work_assigned.trim()) errs.work_assigned = 'Work Assigned is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        if (editingId) {
            // Editing an existing item
            const isLocal = agencies.find(a => a.id === editingId)?.status === 'Inactive';

            if (isLocal) {
                // Update local state
                setAgencies(prev => prev.map(a => a.id === editingId ? { ...a, ...formData } : a));
                handleCloseModal();
            } else {
                // Update in DB (agency_assignments table)
                try {
                    const payload = {
                        name: formData.name,
                        agency_officer: formData.agency_officer,
                        phone: formData.phone,
                        email: formData.email,
                        work_assigned: formData.work_assigned,
                    };

                    const { error } = await supabase
                        .from('agency_assignments')
                        .update(payload)
                        .eq('id', editingId);

                    if (error) throw error;

                    setAgencies(prev => prev.map(a => a.id === editingId ? { ...a, ...formData } : a));
                    handleCloseModal();
                } catch (error) {
                    console.error('Error updating agency:', error);
                    alert('Failed to update agency: ' + error.message);
                }
            }
        } else {
            // Adding new item -> Save directly to DB
            try {
                const payload = {
                    name: formData.name,
                    agency_officer: formData.agency_officer,
                    phone: formData.phone,
                    email: formData.email,
                    work_assigned: formData.work_assigned,
                    status: 'Active',
                    implementing_agency_id: user.id
                };

                console.log('📤 Saving new executing agency:', payload);

                const { data, error } = await supabase
                    .from('agency_assignments')
                    .insert([payload])
                    .select();

                if (error) {
                    console.error('Error saving agency:', error);
                    alert('Failed to save agency: ' + error.message);
                    return;
                }

                console.log('✅ Agency saved:', data);

                if (data && data.length > 0) {
                    setAgencies([data[0], ...agencies]);
                }

                handleCloseModal();
                alert('Executing Agency added successfully!');
            } catch (error) {
                console.error('Error adding agency:', error);
                alert('Failed to add agency: ' + error.message);
            }
        }
    };

    const handleEdit = (agency) => {
        setEditingId(agency.id);
        setFormData({
            name: agency.name,
            agency_officer: agency.agency_officer || '',
            phone: agency.phone,
            email: agency.email || '',
            work_assigned: agency.work_assigned || '',
            status: agency.status || 'Active'
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: '', agency_officer: '', phone: '', email: '', work_assigned: '', status: 'Active' });
        setErrors({});
    };

    const [successModal, setSuccessModal] = useState({ show: false, message: '' });

    const handleStatusChange = async (agency, newStatus) => {
        setProcessingId(agency.id);
        if (newStatus === 'Active') {
            // Activate: Add to DB (agency_assignments)
            try {
                const payload = {
                    name: agency.name,
                    agency_officer: agency.agency_officer,
                    phone: agency.phone,
                    email: agency.email,
                    work_assigned: agency.work_assigned,
                    status: 'Active',
                    implementing_agency_id: user.id
                };

                const { data, error } = await supabase
                    .from('agency_assignments')
                    .insert([payload])
                    .select();

                if (error) throw error;

                if (data) {
                    const savedData = data[0];
                    setAgencies(prev => prev.map(a => a.id === agency.id ? savedData : a));

                    // Send Activation WhatsApp Notification
                    try {
                        const response = await fetch('http://localhost:5001/api/notifications/send-activation-email', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                name: agency.name,
                                phone: agency.phone,
                                work_assigned: agency.work_assigned,
                                agency_officer: agency.agency_officer
                            }),
                        });

                        if (response.ok) {
                            setSuccessModal({
                                show: true,
                                message: `Agency Activated Successfully! WhatsApp notification sent to ${agency.phone}`
                            });
                        } else {
                            console.error('Failed to send WhatsApp notification');
                        }
                    } catch (emailError) {
                        console.error('Failed to send activation notification:', emailError);
                    }
                }
            } catch (error) {
                console.error('Error activating agency:', error);
                alert('Failed to activate agency: ' + error.message);
            } finally {
                setProcessingId(null);
            }
        } else {
            // Deactivate: Remove from DB (agency_assignments)
            try {
                if (!String(agency.id).startsWith('local-')) {
                    const { error } = await supabase
                        .from('agency_assignments')
                        .delete()
                        .eq('id', agency.id);

                    if (error) throw error;
                }
                setAgencies(prev => prev.map(a => a.id === agency.id ? { ...a, status: 'Inactive' } : a));
            } catch (error) {
                console.error('Error deactivating agency:', error);
                alert('Failed to deactivate agency: ' + error.message);
            } finally {
                setProcessingId(null);
            }
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Manage Executing Agencies</h2>
                <InteractiveButton variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Executing Agency</InteractiveButton>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Agency Officer</th>
                            <th>Email</th>
                            <th>Phone No</th>
                            <th>Work Assigned</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : agencies.length > 0 ? (
                            agencies.map((agency) => (
                                <tr key={agency.id}>
                                    <td>{agency.name}</td>
                                    <td>{agency.agency_officer || '-'}</td>
                                    <td>{agency.email || '-'}</td>
                                    <td>{agency.phone}</td>
                                    <td>{agency.work_assigned || '-'}</td>
                                    <td>
                                        <span className={`badge ${agency.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                                            {agency.status || 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <InteractiveButton
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleEdit(agency)}
                                                style={{ marginRight: '5px' }}
                                                disabled={processingId === agency.id}
                                            >
                                                Edit
                                            </InteractiveButton>
                                            {agency.status === 'Active' ? (
                                                <InteractiveButton
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStatusChange(agency, 'Inactive')}
                                                    disabled={processingId === agency.id}
                                                >
                                                    {processingId === agency.id ? 'Wait...' : 'Deactivate'}
                                                </InteractiveButton>
                                            ) : (
                                                <InteractiveButton
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleStatusChange(agency, 'Active')}
                                                    disabled={processingId === agency.id}
                                                >
                                                    {processingId === agency.id ? 'Wait...' : 'Activate'}
                                                </InteractiveButton>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: 20 }}>No executing agencies found. Add one to get started.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? "Edit Executing Agency" : "Add Executing Agency"}
                footer={
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <InteractiveButton variant="outline" onClick={handleCloseModal}>Cancel</InteractiveButton>
                        <InteractiveButton variant="primary" onClick={handleSubmit}>{editingId ? "Update" : "Submit"}</InteractiveButton>
                    </div>
                }
            >
                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Agency Name</label>
                    <select
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    >
                        <option value="">-- Select Agency --</option>
                        {executingAgenciesList.length > 0 ? (
                            executingAgenciesList.map((agency, index) => (
                                <option key={index} value={agency.agency_name}>
                                    {agency.agency_name}
                                </option>
                            ))
                        ) : (
                            <option disabled>No agencies available</option>
                        )}
                    </select>
                    {errors.name && <div className="form-error">{errors.name}</div>}
                    {executingAgenciesList.length === 0 && (
                        <small style={{ color: '#666', marginTop: 5, display: 'block' }}>
                            Loading agencies or no agencies found in database.
                        </small>
                    )}
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Agency Officer</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.agency_officer}
                        onChange={(e) => setFormData({ ...formData, agency_officer: e.target.value })}
                        placeholder="Enter officer name"
                    />
                    {errors.agency_officer && <div className="form-error">{errors.agency_officer}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                    />
                    {errors.email && <div className="form-error">{errors.email}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Phone No</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                    />
                    {errors.phone && <div className="form-error">{errors.phone}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Work Assigned</label>
                    <textarea
                        className="form-control"
                        value={formData.work_assigned}
                        onChange={(e) => setFormData({ ...formData, work_assigned: e.target.value })}
                        placeholder="Enter work assigned"
                        rows="3"
                    />
                    {errors.work_assigned && <div className="form-error">{errors.work_assigned}</div>}
                </div>
            </Modal>

            {/* Success Modal */}
            {successModal.show && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Success!</h3>
                        <p style={{ color: '#7f8c8d', marginBottom: '25px', lineHeight: '1.5' }}>
                            {successModal.message}
                        </p>
                        <InteractiveButton
                            variant="primary"
                            onClick={() => setSuccessModal({ show: false, message: '' })}
                            style={{ width: '100%' }}
                        >
                            Close
                        </InteractiveButton>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageExecutingAgencies;
