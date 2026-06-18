import React, { useState } from 'react';
import InteractiveButton from '../../../components/InteractiveButton';

const CreateProposal = ({ districtId }) => {
    const [formData, setFormData] = useState({
        projectName: '',
        component: 'Adarsh Gram',
        estimatedCost: '',
        description: '',
        phoneNumber: '',
        files: []
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, files: files }));
    };

    const [myProposals, setMyProposals] = useState([]);

    const fetchProposals = async () => {
        if (!districtId) return;
        try {
            const res = await fetch(`http://localhost:5001/api/proposals/district/${districtId}`);
            const data = await res.json();
            if (data.success) {
                setMyProposals(data.data);
            }
        } catch (err) {
            console.error('Error fetching proposals:', err);
        }
    };

    React.useEffect(() => {
        fetchProposals();
    }, [districtId]);

    const getStatusBadge = (status) => {
        const badges = {
            'SUBMITTED': 'badge-info',
            'APPROVED_BY_STATE': 'badge-warning',
            'APPROVED_BY_MINISTRY': 'badge-success',
            // All rejected statuses use error color (#EF4444)
            'REJECTED_BY_STATE': 'badge-error',
            'REJECTED_BY_MINISTRY': 'badge-error',
            'REJECTED': 'badge-error'
        };
        return badges[status] || 'badge-info';
    };

    const getTrackingStatus = (status) => {
        if (status === 'SUBMITTED') return 'Pending at State';
        if (status === 'APPROVED_BY_STATE') return 'Pending at Ministry';
        if (status === 'APPROVED_BY_MINISTRY') return 'Approved & Active';
        if (status === 'REJECTED_BY_STATE') return 'Rejected by State';
        if (status === 'REJECTED_BY_MINISTRY') return 'Rejected by Ministry';
        if (status === 'REJECTED') return 'Rejected';
        return 'Unknown';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!districtId) {
            setError("District ID is missing. Please try reloading.");
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('districtId', districtId);
            data.append('projectName', formData.projectName);
            data.append('component', formData.component);
            data.append('estimatedCost', formData.estimatedCost);
            data.append('phoneNumber', formData.phoneNumber);
            data.append('description', formData.description);

            formData.files.forEach((file) => {
                data.append('documents', file);
            });

            const response = await fetch('http://localhost:5001/api/proposals/create', {
                method: 'POST',
                body: data // Don't set Content-Type header when sending FormData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit proposal');
            }

            setSuccess('Proposal submitted successfully to State Government!');
            setFormData({
                projectName: '',
                component: 'Adarsh Gram',
                estimatedCost: '',
                description: '',
                phoneNumber: '',
                files: []
            });
            fetchProposals(); // Refresh the list
        } catch (err) {
            console.error('Error submitting proposal:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="dashboard-section">
                <div style={{
                    maxWidth: '1000px',
                    margin: '0 auto',
                    background: 'white',
                    padding: '32px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #F3F4F6'
                }}>
                    <div className="section-header" style={{ marginBottom: '24px', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px' }}>
                        <h2 className="section-title" style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937' }}>Create New Proposal</h2>
                        <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>
                            Submit a new project proposal for State Government approval.
                        </p>
                    </div>

                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        {success && (
                            <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label className="form-label">District ID</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={districtId || ''}
                                    disabled
                                    style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label className="form-label">Project Name</label>
                                <input
                                    type="text"
                                    name="projectName"
                                    className="form-control"
                                    value={formData.projectName}
                                    onChange={handleInputChange}
                                    placeholder="Enter project title"
                                    required
                                />
                            </div>

                            <div className="grid grid-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Component</label>
                                    <select
                                        name="component"
                                        className="form-control"
                                        value={formData.component}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Adarsh Gram">Adarsh Gram</option>
                                        <option value="GIA (Grant-in-Aid)">GIA (Grant-in-Aid)</option>
                                        <option value="Hostel">Hostel</option>
                                        <option value="Skill Development">Skill Development</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Estimated Cost (₹ Lakhs)</label>
                                    <input
                                        type="number"
                                        name="estimatedCost"
                                        className="form-control"
                                        value={formData.estimatedCost}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 25.50"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        className="form-control"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter contact number"
                                        pattern="[0-9]{10}"
                                        maxLength="10"
                                        title="Please enter a valid 10-digit phone number"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label className="form-label">Description & Justification</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe the project and why it is needed..."
                                    rows="5"
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                                <label className="form-label">Upload Documents</label>
                                <div style={{
                                    border: '2px dashed var(--border-light)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-6)',
                                    textAlign: 'center',
                                    backgroundColor: 'var(--bg-secondary)'
                                }}>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                                        📁 Choose Files
                                    </label>
                                    <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                        Upload DPR, Technical Sanction, or other supporting docs.
                                    </p>
                                    {formData.files.length > 0 && (
                                        <div style={{ marginTop: 'var(--space-3)', textAlign: 'left' }}>
                                            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>Selected Files:</p>
                                            <ul style={{ listStyle: 'none', padding: 0, fontSize: 'var(--text-sm)' }}>
                                                {formData.files.map((f, i) => (
                                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                        📄 {f.name} <span style={{ color: 'var(--text-tertiary)' }}>({(f.size / 1024).toFixed(1)} KB)</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                                <InteractiveButton variant="outline" onClick={() => setFormData({
                                    projectName: '',
                                    component: 'Adarsh Gram',
                                    estimatedCost: '',
                                    description: '',
                                    phoneNumber: '',
                                    files: []
                                })}>
                                    Reset
                                </InteractiveButton>
                                <InteractiveButton variant="primary" type="submit" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Proposal to State'}
                                </InteractiveButton>
                            </div>
                        </form>
                    </div>

                </div>
            </div>

            {/* Submitted Proposals Table */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Submitted Proposals Tracking</h2>
                </div>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="table" style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Component</th>
                                <th>Est. Cost</th>
                                <th>Submission Date</th>
                                <th>Current Status</th>
                                <th>Tracking</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myProposals.length > 0 ? (
                                myProposals.map(p => (
                                    <tr key={p.id} style={{ backgroundColor: p.status.toLowerCase().includes('rejected') ? '#ffebee' : 'inherit' }}>
                                        <td>
                                            <strong>{p.project_name}</strong>
                                            {p.documents && p.documents.length > 0 && (
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                                    📎 {p.documents.length} File(s) Attached
                                                </div>
                                            )}
                                        </td>
                                        <td><span className="badge badge-primary">{p.component}</span></td>
                                        <td>₹{p.estimated_cost} L</td>
                                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <div style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    backgroundColor:
                                                        p.status === 'APPROVED_BY_MINISTRY' ? 'var(--color-success)' :
                                                            (p.status === 'REJECTED_BY_STATE' || p.status === 'REJECTED_BY_MINISTRY' || p.status === 'REJECTED') ? 'var(--color-error)' :
                                                                'var(--color-warning)'
                                                }}></div>
                                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>
                                                    {getTrackingStatus(p.status)}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-tertiary)' }}>
                                        No proposals submitted yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CreateProposal;
