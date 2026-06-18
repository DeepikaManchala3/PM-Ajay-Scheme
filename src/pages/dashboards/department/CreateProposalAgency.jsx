import React, { useState, useEffect } from 'react';
import InteractiveButton from '../../../components/InteractiveButton';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

const CreateProposalAgency = () => {
    const { user } = useAuth();
    const [agencyInfo, setAgencyInfo] = useState(null);
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
    const [myProposals, setMyProposals] = useState([]);

    // Fetch agency info for the logged-in user
    useEffect(() => {
        const fetchAgencyInfo = async () => {
            if (!user?.id) return;

            try {
                // District code mapping from email pattern
                const districtCodeMap = {
                    'eg': 'East Godavari',
                    'wg': 'West Godavari',
                    'kr': 'Kurnool',
                    'vz': 'Vizianagaram',
                    'vs': 'Visakhapatnam',
                    'sk': 'Srikakulam',
                    'gn': 'Guntur',
                    'kn': 'Krishna',
                    'nl': 'Nellore',
                    'cd': 'Chittoor',
                    'ap': 'Anantapur',
                    'kd': 'Kadapa'
                };

                // First, try to parse district from email pattern
                // Email format: ap-eg.district@pmajay.gov.in
                let districtFromEmail = null;
                let districtIdFromEmail = null;

                if (user.email && user.email.includes('.district@pmajay.gov.in')) {
                    const emailPrefix = user.email.split('.district@')[0]; // e.g., "ap-eg"
                    const parts = emailPrefix.split('-');
                    if (parts.length >= 2) {
                        const districtCode = parts[1]; // e.g., "eg"
                        districtFromEmail = districtCodeMap[districtCode];
                        console.log('📧 Parsed district from email:', districtCode, '->', districtFromEmail);

                        // Look up the district ID
                        if (districtFromEmail) {
                            const { data: districtData } = await supabase
                                .from('districts')
                                .select('id, name')
                                .ilike('name', `%${districtFromEmail}%`)
                                .limit(1);

                            if (districtData && districtData.length > 0) {
                                districtIdFromEmail = districtData[0].id;
                                districtFromEmail = districtData[0].name; // Use exact name from DB
                                console.log('✅ Found district:', districtFromEmail, 'ID:', districtIdFromEmail);
                            }
                        }
                    }
                }

                // If we found district from email, create agency info directly
                if (districtFromEmail && districtIdFromEmail) {
                    // Find or create agency for this district
                    const { data: agencyData } = await supabase
                        .from('implementing_agencies')
                        .select('id, agency_name, district_id')
                        .eq('district_id', districtIdFromEmail)
                        .limit(1);

                    if (agencyData && agencyData.length > 0) {
                        setAgencyInfo({
                            id: agencyData[0].id,
                            agency_name: agencyData[0].agency_name,
                            district_id: districtIdFromEmail,
                            districts: {
                                id: districtIdFromEmail,
                                name: districtFromEmail
                            }
                        });
                        console.log('✅ Agency info set from email parsing');
                        return;
                    } else {
                        // No agency exists, but we know the district - create temp info
                        setAgencyInfo({
                            id: null,
                            agency_name: 'Implementing Agency',
                            district_id: districtIdFromEmail,
                            districts: {
                                id: districtIdFromEmail,
                                name: districtFromEmail
                            }
                        });
                        console.log('✅ Created temp agency info from email parsing');
                        return;
                    }
                }

                // Fallback: try by user_id
                let { data: agencies, error: agencyError } = await supabase
                    .from('implementing_agencies')
                    .select(`
                        id,
                        agency_name,
                        email,
                        district_id,
                        districts (
                            id,
                            name,
                            state_id,
                            states (
                                id,
                                name
                            )
                        )
                    `)
                    .eq('user_id', user.id)
                    .limit(1);

                if (agencies && agencies.length > 0) {
                    setAgencyInfo(agencies[0]);
                    console.log('✅ Agency info loaded by user_id:', agencies[0]);
                } else {
                    console.warn('⚠️ No agency found for user');
                }
            } catch (err) {
                console.error('Error loading agency info:', err);
            }
        };

        fetchAgencyInfo();
    }, [user]);

    // Fetch proposals for this agency
    const fetchProposals = async () => {
        if (!agencyInfo?.id) return;

        try {
            const { data: proposals, error: proposalError } = await supabase
                .from('district_proposals')
                .select('*')
                .eq('implementing_agency_id', agencyInfo.id)
                .order('created_at', { ascending: false });

            if (proposalError) {
                console.error('Error fetching proposals:', proposalError);
                return;
            }

            setMyProposals(proposals || []);
        } catch (err) {
            console.error('Error fetching proposals:', err);
        }
    };

    useEffect(() => {
        if (agencyInfo) {
            fetchProposals();
        }
    }, [agencyInfo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, files: files }));
    };

    const getStatusBadge = (status) => {
        const badges = {
            'SUBMITTED': 'badge-info',
            'APPROVED_BY_STATE': 'badge-warning',
            'APPROVED_BY_MINISTRY': 'badge-success',
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

        if (!agencyInfo) {
            setError("Agency information not loaded. Please try reloading.");
            setLoading(false);
            return;
        }

        try {
            // Create proposal directly in Supabase
            const proposalData = {
                project_name: formData.projectName,
                component: formData.component,
                estimated_cost: parseFloat(formData.estimatedCost),
                description: formData.description,
                phone_number: formData.phoneNumber,
                district_id: agencyInfo.district_id,
                status: 'SUBMITTED',
                created_at: new Date().toISOString()
            };

            // Only add implementing_agency_id if it exists (not null)
            if (agencyInfo.id) {
                proposalData.implementing_agency_id = agencyInfo.id;
            }

            console.log('📤 Submitting proposal:', proposalData);
            console.log('🏢 Agency info:', agencyInfo);

            const { data: newProposal, error: insertError } = await supabase
                .from('district_proposals')
                .insert([proposalData])
                .select()
                .single();

            if (insertError) {
                throw new Error(insertError.message);
            }

            console.log('✅ Proposal created:', newProposal);
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

    if (!agencyInfo) {
        return (
            <div className="dashboard-panel" style={{ padding: 20, textAlign: 'center' }}>
                <p>Loading agency information...</p>
            </div>
        );
    }

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
                            {/* District Info */}
                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label className="form-label">District</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={agencyInfo.districts?.name || ''}
                                    disabled
                                    style={{ backgroundColor: '#F9FAFB', cursor: 'not-allowed' }}
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
                                    <tr key={p.id} style={{ backgroundColor: p.status?.toLowerCase().includes('rejected') ? '#ffebee' : 'inherit' }}>
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

export default CreateProposalAgency;
