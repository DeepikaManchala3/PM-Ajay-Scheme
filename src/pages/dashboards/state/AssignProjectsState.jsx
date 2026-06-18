import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Modal from '../../../components/Modal';
import InteractiveButton from '../../../components/InteractiveButton';
import { UserPlus, IndianRupee, ChevronsRight } from 'lucide-react';

const AssignProjectsState = ({ setActiveTab, setPreFillData }) => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [implementingAgencies, setImplementingAgencies] = useState([]);

    // Modal states
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedAgencyId, setSelectedAgencyId] = useState('');
    const [assigning, setAssigning] = useState(false);

    // Filter/Search states could be added here

    useEffect(() => {
        fetchProjects();
        fetchImplementingAgencies();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/proposals/approved'); // Re-using this endpoint which lists approved projects
            const result = await response.json();
            if (result.success) {
                setProjects(result.data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchImplementingAgencies = async () => {
        // Need state name to filter agencies
        // We can fetch profile or pass it in props. For now let's fetch profile or just fetch all and filter client side if needed.
        // Or better: Use the endpoint that fetches by stateName if we had it.
        // Assuming user is state admin, we should filter by their state.
        // Since this page is for State Admin, let's fetch user profile first or rely on standard fetch.

        try {
            // Get user profile to know State Name
            const profileRes = await fetch(`http://localhost:5001/api/profile?userId=${user?.id}`);
            const profileData = await profileRes.json();
            if (profileData.success) {
                let stateName = profileData.data.full_name.replace(' State Admin', '').replace(' State', '').trim();

                const response = await fetch(`http://localhost:5001/api/implementing-agencies?stateName=${encodeURIComponent(stateName)}`);
                const result = await response.json();
                if (result.success) {
                    setImplementingAgencies(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching agencies:', error);
        }
    };

    const handleAssignClick = (project) => {
        setSelectedProject(project);
        setSelectedAgencyId(project.implementingAgencyId || ''); // Pre-select if already assigned
        setIsAssignModalOpen(true);
    };

    const confirmAssign = async () => {
        if (!selectedAgencyId) {
            alert('Please select an agency');
            return;
        }

        setAssigning(true);
        try {
            const response = await fetch(`http://localhost:5001/api/proposals/${selectedProject.id}/assign-agency`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ implementingAgencyId: selectedAgencyId })
            });
            const result = await response.json();

            if (result.success) {
                // Update local state
                setProjects(prev => prev.map(p =>
                    p.id === selectedProject.id
                        ? { ...p, implementingAgencyId: selectedAgencyId, implementingAgencyName: implementingAgencies.find(a => a.id === selectedAgencyId)?.agency_name }
                        : p
                ));
                setIsAssignModalOpen(false);
            } else {
                alert('Failed to assign: ' + result.error);
            }
        } catch (error) {
            console.error('Error assigning:', error);
        } finally {
            setAssigning(false);
        }
    };

    const handleReleaseFunds = (project) => {
        // Switch to Fund Release tab and populate data
        if (setPreFillData) {
            setPreFillData({
                districtId: null, // We might not have district ID directly available without lookup, but let's see. 
                // Actually project object has districtName, we might need to map it or let FundRelease handle it.
                // Or better: Pass the implementingAgencyId directly!
                implementingAgencyId: project.implementingAgencyId,
                projectId: project.id,
                component: project.component,
                // Passing project name to remarks or similar could be useful
                projectName: project.projectName
            });
        }
        if (setActiveTab) {
            setActiveTab('funds');
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Assign Projects & Release Funds</h2>
                <p style={{ color: '#666' }}>Manage Central Approved Projects: Assign IEs and release funds.</p>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Project Details</th>
                            <th>Cost / Alloc.</th>
                            <th>Status</th>
                            <th>Assigned Agency</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.length > 0 ? projects.map(project => (
                            <tr key={project.id}>
                                <td>
                                    <div style={{ fontWeight: 'bold' }}>{project.projectName}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{project.districtName} | {project.component}</div>
                                </td>
                                <td>
                                    <div style={{ color: '#00b894', fontWeight: 'bold' }}>₹{project.estimatedCost} L</div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>Alloc: ₹{project.allocatedAmount} L</div>
                                </td>
                                <td>
                                    <span className="badge badge-success">Approved</span>
                                </td>
                                <td>
                                    {project.implementingAgencyName ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ecc71' }}></div>
                                            {project.implementingAgencyName}
                                        </div>
                                    ) : (
                                        <span style={{ color: '#95a5a6', fontStyle: 'italic' }}>Not Assigned</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <InteractiveButton
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAssignClick(project)}
                                        >
                                            <UserPlus size={14} style={{ marginRight: 4 }} />
                                            {project.implementingAgencyId ? 'Re-Assign' : 'Assign IE'}
                                        </InteractiveButton>

                                        <InteractiveButton
                                            variant="primary"
                                            size="sm"
                                            disabled={!project.implementingAgencyId}
                                            onClick={() => handleReleaseFunds(project)}
                                            style={{ opacity: !project.implementingAgencyId ? 0.5 : 1 }}
                                        >
                                            <IndianRupee size={14} style={{ marginRight: 4 }} /> Release
                                        </InteractiveButton>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 30 }}>No central approved projects found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Assign IE Modal */}
            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title="Assign Implementing Agency"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <InteractiveButton variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</InteractiveButton>
                        <InteractiveButton variant="success" onClick={confirmAssign} disabled={assigning}>
                            {assigning ? 'Assigning...' : 'Confirm Assignment'}
                        </InteractiveButton>
                    </div>
                }
            >
                <div className="form-group">
                    <label>Select Agency for <strong>{selectedProject?.projectName}</strong></label>
                    <select
                        className="form-control"
                        value={selectedAgencyId}
                        onChange={(e) => setSelectedAgencyId(e.target.value)}
                    >
                        <option value="">-- Select Agency --</option>
                        {implementingAgencies
                            // Optional: Filter agencies by district if strict matching is required
                            // .filter(a => a.district_name === selectedProject?.districtName) 
                            .map(agency => (
                                <option key={agency.id} value={agency.id}>
                                    {agency.agency_name} ({agency.district_name})
                                </option>
                            ))}
                    </select>
                    {selectedProject && selectedProject.districtName && (
                        <div className="form-helper">
                            Project District: <strong>{selectedProject.districtName}</strong>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default AssignProjectsState;
