import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import InteractiveButton from '../../../components/InteractiveButton';
import { Eye } from 'lucide-react';

const ExecutingAgencyList = () => {
    const { user } = useAuth();
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [stateName, setStateName] = useState('Your State');
    const [filterType, setFilterType] = useState('All');

    useEffect(() => {
        // Load dummy data immediately
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        setLoading(true);
        try {
            console.log('🔍 Fetching executing agencies for state:', stateName);

            // Generate completely generic dummy executing agencies data with consistent project counts
            const dummyAgencies = [
                { id: 'ea-001', agency_name: 'Patel Construction Company', agency_type: 'Construction', email: 'contact@abc-construction.com', phone_number: '+91 9876543210', state_name: stateName, created_at: '2024-01-15T10:30:00Z', projectCount: 7, rating: 4.2 },
                { id: 'ea-002', agency_name: 'Aneel Infrastructure Ltd', agency_type: 'Infrastructure', email: 'info@xyz-infra.com', phone_number: '+91 9876543211', state_name: stateName, created_at: '2024-02-20T14:15:00Z', projectCount: 12, rating: 4.5 },
                { id: 'ea-003', agency_name: 'BuildPro Contractors', agency_type: 'Construction', email: 'contact@buildpro.com', phone_number: '+91 9876543212', state_name: stateName, created_at: '2024-03-10T09:45:00Z', projectCount: 5, rating: 3.8 },
                { id: 'ea-004', agency_name: 'Metro Engineering Services', agency_type: 'Engineering', email: 'info@metro-eng.com', phone_number: '+91 9876543213', state_name: stateName, created_at: '2024-04-05T11:20:00Z', projectCount: 15, rating: 4.7 },
                { id: 'ea-005', agency_name: 'Prime Builders Association', agency_type: 'Construction', email: 'contact@primebuilders.com', phone_number: '+91 9876543214', state_name: stateName, created_at: '2024-05-12T16:00:00Z', projectCount: 9, rating: 4.1 },
                { id: 'ea-006', agency_name: 'Global Infrastructure Group', agency_type: 'Infrastructure', email: 'info@globalinfra.com', phone_number: '+91 9876543215', state_name: stateName, created_at: '2024-01-20T08:30:00Z', projectCount: 18, rating: 4.6 },
                { id: 'ea-007', agency_name: 'Elite Engineering Solutions', agency_type: 'Engineering', email: 'contact@eliteeng.com', phone_number: '+91 9876543216', state_name: stateName, created_at: '2024-02-15T12:00:00Z', projectCount: 11, rating: 4.3 },
                { id: 'ea-008', agency_name: 'Skyline Builders', agency_type: 'Construction', email: 'info@skylinebuilders.com', phone_number: '+91 9876543217', state_name: stateName, created_at: '2024-03-22T10:15:00Z', projectCount: 8, rating: 4.0 },
                { id: 'ea-009', agency_name: 'Urban Development Corp', agency_type: 'Infrastructure', email: 'contact@urbandev.com', phone_number: '+91 9876543218', state_name: stateName, created_at: '2024-04-18T14:45:00Z', projectCount: 14, rating: 4.4 },
                { id: 'ea-010', agency_name: 'Precision Engineering Ltd', agency_type: 'Engineering', email: 'info@precisioneng.com', phone_number: '+91 9876543219', state_name: stateName, created_at: '2024-05-25T09:00:00Z', projectCount: 10, rating: 4.2 },
                { id: 'ea-011', agency_name: 'Apex Construction Services', agency_type: 'Construction', email: 'contact@apexconst.com', phone_number: '+91 9876543220', state_name: stateName, created_at: '2024-01-08T11:30:00Z', projectCount: 6, rating: 3.9 },
                { id: 'ea-012', agency_name: 'National Infrastructure Partners', agency_type: 'Infrastructure', email: 'info@natinfra.com', phone_number: '+91 9876543221', state_name: stateName, created_at: '2024-02-28T15:20:00Z', projectCount: 16, rating: 4.8 },
                { id: 'ea-013', agency_name: 'TechBuild Engineering', agency_type: 'Engineering', email: 'contact@techbuild.com', phone_number: '+91 9876543222', state_name: stateName, created_at: '2024-03-14T13:10:00Z', projectCount: 13, rating: 4.5 },
                { id: 'ea-014', agency_name: 'Royal Contractors', agency_type: 'Construction', email: 'info@royalcontractors.com', phone_number: '+91 9876543223', state_name: stateName, created_at: '2024-04-22T08:45:00Z', projectCount: 7, rating: 4.1 },
                { id: 'ea-015', agency_name: 'Smart Infrastructure Solutions', agency_type: 'Infrastructure', email: 'contact@smartinfra.com', phone_number: '+91 9876543224', state_name: stateName, created_at: '2024-05-30T16:30:00Z', projectCount: 9, rating: 4.3 },
                { id: 'ea-016', agency_name: 'Advanced Engineering Works', agency_type: 'Engineering', email: 'info@adveng.com', phone_number: '+91 9876543225', state_name: stateName, created_at: '2024-01-12T10:00:00Z', projectCount: 12, rating: 4.6 },
                { id: 'ea-017', agency_name: 'Diamond Builders Group', agency_type: 'Construction', email: 'contact@diamondbuilders.com', phone_number: '+91 9876543226', state_name: stateName, created_at: '2024-02-05T14:20:00Z', projectCount: 8, rating: 4.0 },
                { id: 'ea-018', agency_name: 'Mega Infrastructure Ltd', agency_type: 'Infrastructure', email: 'info@megainfra.com', phone_number: '+91 9876543227', state_name: stateName, created_at: '2024-03-18T11:50:00Z', projectCount: 17, rating: 4.7 },
                { id: 'ea-019', agency_name: 'Innovative Engineering Co', agency_type: 'Engineering', email: 'contact@innoveng.com', phone_number: '+91 9876543228', state_name: stateName, created_at: '2024-04-10T09:30:00Z', projectCount: 11, rating: 4.4 },
                { id: 'ea-020', agency_name: 'Supreme Construction Works', agency_type: 'Construction', email: 'info@supremeconst.com', phone_number: '+91 9876543229', state_name: stateName, created_at: '2024-05-15T15:00:00Z', projectCount: 10, rating: 4.2 },
            ];

            console.log(`✅ Fetched ${dummyAgencies.length} executing agencies:`, dummyAgencies);
            setAgencies(dummyAgencies);
        } catch (error) {
            console.error('Error loading agencies:', error);
            setAgencies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = (agency) => {
        setSelectedAgency(agency);
        setShowModal(true);
    };

    const generateDummyProjects = (count) => {
        const projectTypes = ['Road Construction', 'School Building', 'Water Supply', 'Community Center', 'Health Clinic', 'Drainage System'];
        const statuses = ['Completed', 'In Progress', 'Completed', 'Completed'];

        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            name: `${projectTypes[i % projectTypes.length]} - Phase ${Math.floor(i / projectTypes.length) + 1}`,
            status: statuses[i % statuses.length],
            budget: `₹${(Math.random() * 50 + 10).toFixed(2)} L`,
            completion: statuses[i % statuses.length] === 'Completed' ? 100 : Math.floor(Math.random() * 40 + 40)
        }));
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Executing Agencies - {stateName || 'Loading...'}</h2>
                </div>

                {/* Filter Section */}
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontWeight: '600', color: '#374151' }}>Filter by Type:</label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #D1D5DB',
                            fontSize: '14px',
                            cursor: 'pointer',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="All">All Types</option>
                        <option value="Construction">Construction</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Engineering">Engineering</option>
                    </select>
                </div>

                <div className="table-wrapper">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <p>Loading agencies...</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Agency Name</th>
                                    <th>Agency Type</th>
                                    <th>Phone Number</th>
                                    <th>Projects</th>
                                    <th>Rating</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agencies.length > 0 ? (
                                    agencies
                                        .filter(agency => filterType === 'All' || agency.agency_type === filterType)
                                        .map((agency, index) => (
                                            <tr key={agency.id}>
                                                <td>
                                                    <strong>{agency.agency_name}</strong>
                                                </td>
                                                <td>
                                                    <span className="badge badge-primary">
                                                        {agency.agency_type || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>{agency.phone_number || `+91 ${9100000000 + index}${Math.floor(Math.random() * 100)}`}</td>
                                                <td>
                                                    <span style={{ color: 'var(--color-navy)', fontWeight: '600' }}>
                                                        {agency.projectCount}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ color: '#F59E0B', fontSize: '16px' }}>★</span>
                                                        <span style={{ fontWeight: '600' }}>
                                                            {agency.rating}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <InteractiveButton
                                                        variant="info"
                                                        size="sm"
                                                        onClick={() => handleViewProfile(agency)}
                                                    >
                                                        <Eye size={16} /> View
                                                    </InteractiveButton>
                                                </td>
                                            </tr>
                                        ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                                            No executing agencies found for {stateName}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Agency Profile Modal */}
            {showModal && selectedAgency && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    zIndex: 1000,
                    paddingTop: '200px',
                    overflowY: 'auto'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        maxWidth: '700px',
                        width: '85%',
                        maxHeight: 'calc(100vh - 170px)',
                        overflow: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        marginBottom: '20px'
                    }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                                {/* Profile Image */}
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    backgroundColor: '#3B82F6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: 'white',
                                    flexShrink: 0
                                }}>
                                    {selectedAgency.agency_name.charAt(0)}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827', wordBreak: 'break-word' }}>
                                        {selectedAgency.agency_name}
                                    </h2>
                                    <span className="badge badge-primary" style={{ marginTop: '4px', display: 'inline-block', fontSize: '11px' }}>
                                        {selectedAgency.agency_type || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6B7280',
                                    padding: '4px 8px',
                                    flexShrink: 0
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Agency Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Overall Rating</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ color: '#F59E0B', fontSize: '16px' }}>★</span>
                                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                                        {selectedAgency.rating}
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Total Projects</div>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                                    {selectedAgency.projectCount}
                                </div>
                            </div>
                            <div style={{ padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Completed</div>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>
                                    {Math.floor(selectedAgency.projectCount * 0.7)}
                                </div>
                            </div>
                        </div>

                        {/* Projects List */}
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                                Recent Projects
                            </h3>
                            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                                <table className="table" style={{ fontSize: '14px' }}>
                                    <thead>
                                        <tr>
                                            <th>Project Name</th>
                                            <th>Budget</th>
                                            <th>Status</th>
                                            <th>Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generateDummyProjects(selectedAgency.projectCount).map((project) => (
                                            <tr key={project.id}>
                                                <td>{project.name}</td>
                                                <td>{project.budget}</td>
                                                <td>
                                                    <span className={`badge ${project.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                                                        {project.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ flex: 1, height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{
                                                                width: `${project.completion}%`,
                                                                height: '100%',
                                                                backgroundColor: project.completion === 100 ? '#10B981' : '#F59E0B',
                                                                transition: 'width 0.3s ease'
                                                            }}></div>
                                                        </div>
                                                        <span style={{ fontSize: '12px', color: '#6B7280', minWidth: '40px' }}>
                                                            {project.completion}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Close Button */}
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <InteractiveButton variant="secondary" onClick={() => setShowModal(false)}>
                                Close
                            </InteractiveButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExecutingAgencyList;
