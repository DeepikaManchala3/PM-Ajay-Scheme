import React, { useState, useEffect } from 'react';
import { Check, X, FileText } from 'lucide-react';

const ApproveAgencyRegistrations = () => {
    const [pendingAgencies, setPendingAgencies] = useState([]);
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPendingRegistrations();
    }, []);

    const fetchPendingRegistrations = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5001/api/implementing-agencies/registrations/pending');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch registrations');
            }

            setPendingAgencies(result.data || []);
            setError('');
        } catch (err) {
            console.error('Error fetching pending registrations:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (window.confirm('Are you sure you want to approve this agency?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/implementing-agencies/registrations/${id}/approve`, {
                    method: 'PATCH'
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to approve registration');
                }

                alert('Agency Approved Successfully!');
                setSelectedAgency(null);
                fetchPendingRegistrations(); // Refresh the list
            } catch (err) {
                console.error('Error approving registration:', err);
                alert('Error: ' + err.message);
            }
        }
    };

    const handleReject = async (id) => {
        if (window.confirm('Are you sure you want to reject this agency?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/implementing-agencies/registrations/${id}/reject`, {
                    method: 'PATCH'
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to reject registration');
                }

                alert('Agency Rejected');
                setSelectedAgency(null);
                fetchPendingRegistrations(); // Refresh the list
            } catch (err) {
                console.error('Error rejecting registration:', err);
                alert('Error: ' + err.message);
            }
        }
    };

    return (
        <div className="dashboard-panel">
            <h2 className="section-title">Agency Registration Approvals</h2>

            {loading ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    <p>Loading...</p>
                </div>
            ) : error ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#e74c3c' }}>
                    <p>Error: {error}</p>
                    <button className="btn btn-primary" onClick={fetchPendingRegistrations} style={{ marginTop: '10px' }}>Retry</button>
                </div>
            ) : pendingAgencies.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    <p>No pending agency registrations found.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* List of Pending Agencies */}
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Agency Name</th>
                                        <th>State</th>
                                        <th>Status</th>
                                        <th>Submitted At</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingAgencies.map((agency) => (
                                        <tr
                                            key={agency.id}
                                            onClick={() => setSelectedAgency(agency)}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: selectedAgency?.id === agency.id ? '#f0f9ff' : 'transparent'
                                            }}
                                        >
                                            <td style={{ fontWeight: '500' }}>{agency.agency_name}</td>
                                            <td>{agency.state}</td>
                                            <td>
                                                <span className={`badge ${agency.status === 'Approved' ? 'badge-success' :
                                                        agency.status === 'Rejected' ? 'badge-danger' :
                                                            'badge-warning'
                                                    }`}>
                                                    {agency.status}
                                                </span>
                                            </td>
                                            <td>{new Date(agency.submitted_at).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedAgency(agency);
                                                    }}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Detail View */}
                    <div>
                        {selectedAgency ? (
                            <div className="card" style={{ padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    Application Details
                                </h3>

                                <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>AGENCY NAME</label>
                                        <div style={{ fontSize: '16px' }}>{selectedAgency.agency_name}</div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>PHONE</label>
                                            <div>{selectedAgency.phone_number}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>EMAIL</label>
                                            <div>{selectedAgency.email}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>GST NUMBER</label>
                                        <div style={{ fontFamily: 'monospace' }}>{selectedAgency.gst_number}</div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>STATUS</label>
                                        <div>
                                            <span className={`badge ${selectedAgency.status === 'Approved' ? 'badge-success' :
                                                    selectedAgency.status === 'Rejected' ? 'badge-danger' :
                                                        'badge-warning'
                                                }`} style={{ fontSize: '14px', padding: '6px 12px' }}>
                                                {selectedAgency.status}
                                            </span>
                                        </div>
                                    </div>



                                    <div>
                                        <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>REQUESTED DISTRICTS</label>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                            {selectedAgency.districts && selectedAgency.districts.length > 0 ? (
                                                selectedAgency.districts.map((d, i) => (
                                                    <span key={i} className="badge badge-info">{d}</span>
                                                ))
                                            ) : (
                                                <span className="text-muted">None selected</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                    <button
                                        className="btn btn-success"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        onClick={() => handleApprove(selectedAgency.id)}
                                        disabled={selectedAgency.status !== 'Pending'}
                                    >
                                        <Check size={18} /> Approve
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        onClick={() => handleReject(selectedAgency.id)}
                                        disabled={selectedAgency.status !== 'Pending'}
                                    >
                                        <X size={18} /> Reject
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="card" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <FileText size={48} color="#e5e7eb" style={{ marginBottom: '16px' }} />
                                <p style={{ color: '#6b7280' }}>Select an application to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApproveAgencyRegistrations;
