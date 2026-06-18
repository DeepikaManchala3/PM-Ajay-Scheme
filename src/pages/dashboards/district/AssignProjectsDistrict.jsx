import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import InteractiveButton from '../../../components/InteractiveButton';

const AssignProjectsDistrict = ({ districtId, stateId, stateName }) => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [assignedProjects, setAssignedProjects] = useState([]);

    // Form State
    const [selectedProject, setSelectedProject] = useState('');
    const [projectFund, setProjectFund] = useState('');
    const [selectedAgency, setSelectedAgency] = useState('');
    const [location, setLocation] = useState('');
    const [deadline, setDeadline] = useState('');

    useEffect(() => {
        console.log('AssignProjectsDistrict mounted/updated. DistrictID:', districtId, 'StateID:', stateId);
        if (districtId) {
            fetchData();
        } else {
            console.log('Waiting for districtId...');
        }
    }, [user?.id, districtId, stateId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Approved Proposals (State Approved)
            // We fetch from district_proposals where status is APPROVED_BY_STATE
            let query = supabase
                .from('district_proposals')
                .select('id, project_name, estimated_cost, status, component')
                .eq('status', 'APPROVED_BY_MINISTRY');

            // If districtId is provided, filter by it. 
            if (districtId) {
                query = query.eq('district_id', districtId);
            }

            const { data: proposalsData, error: proposalsError } = await query;

            if (proposalsError) throw proposalsError;
            if (proposalsData) setProjects(proposalsData);

            // 2. Fetch Implementing Agencies for this district's state ONLY
            // Use state_name for filtering since state_id is not reliably populated
            if (stateName) {
                console.log('🔍 Fetching agencies for state:', stateName);

                // Primary: Filter by state_name (case-insensitive)
                let { data: agencyData, error: agencyError } = await supabase
                    .from('implementing_agencies')
                    .select('id, agency_name, district_id, state_id, agency_type, district_name, state_name')
                    .ilike('state_name', stateName)
                    .order('agency_name');

                if (agencyError) {
                    console.error('Error fetching agencies:', agencyError);
                    setAgencies([]);
                } else {
                    console.log(`✅ Fetched ${agencyData?.length || 0} agencies for state "${stateName}":`, agencyData);
                    setAgencies(agencyData || []);
                }
            } else if (districtId) {
                // Fallback: if stateName not available, try district_id
                const { data: agencyData, error: agencyError } = await supabase
                    .from('implementing_agencies')
                    .select('id, agency_name, district_id, state_id, agency_type, district_name, state_name')
                    .eq('district_id', districtId)
                    .order('agency_name');

                if (agencyError) {
                    console.error('Error fetching agencies:', agencyError);
                }
                console.log(`Fetched ${agencyData?.length || 0} agencies for districtId ${districtId}:`, agencyData);
                setAgencies(agencyData || []);
            } else {
                console.log('District ID not yet available, skipping agency fetch.');
                setAgencies([]);
            }

            // 3. Fetch Assigned Projects (Work Orders)
            // Robust approach: 
            // a. Fetch ALL proposal IDs for this district (to filter work_orders)
            // b. Fetch work_orders where proposal_id is in that list

            if (districtId) {
                // a. Get all proposal IDs for this district (assigned or not)
                // We need to fetch ALL proposals for this district to map them correctly
                const { data: districtProposals, error: dpError } = await supabase
                    .from('district_proposals')
                    .select('id, project_name, component')
                    .eq('district_id', districtId);

                if (dpError) {
                    console.error('Error fetching district proposals for filtering:', dpError);
                } else {
                    const proposalIds = districtProposals.map(p => p.id);
                    const proposalMap = districtProposals.reduce((acc, p) => {
                        acc[p.id] = p;
                        return acc;
                    }, {});

                    if (proposalIds.length > 0) {
                        // b. Fetch work orders for these proposals
                        // TEMPORARY: Removed join with implementing_agencies to debug relationship issue
                        const { data: ordersData, error: ordersError } = await supabase
                            .from('work_orders')
                            .select('*')
                            .in('proposal_id', proposalIds)
                            .order('created_at', { ascending: false });

                        if (ordersError) {
                            console.error('Error fetching assigned projects:', ordersError);
                        } else {
                            // Merge proposal details manually
                            // Also fetch and merge implementing agency details
                            const agencyIds = [...new Set(ordersData.map(o => o.implementing_agency_id).filter(Boolean))];
                            let agencyMap = {};

                            if (agencyIds.length > 0) {
                                const { data: agencies, error: agError } = await supabase
                                    .from('implementing_agencies')
                                    .select('id, agency_name')
                                    .in('id', agencyIds);

                                if (!agError && agencies) {
                                    agencyMap = agencies.reduce((acc, ag) => {
                                        acc[ag.id] = ag;
                                        return acc;
                                    }, {});
                                }
                            }

                            const mergedOrders = ordersData.map(order => ({
                                ...order,
                                district_proposals: proposalMap[order.proposal_id] || {},
                                implementing_agencies: agencyMap[order.implementing_agency_id] || { agency_name: 'Unknown' }
                            }));

                            console.log('Merged Assigned Projects:', mergedOrders);
                            setAssignedProjects(mergedOrders);
                        }
                    } else {
                        setAssignedProjects([]);
                    }
                }
            } else {
                setAssignedProjects([]);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedProject || !selectedAgency || !projectFund || !deadline || !location) {
            alert('Please fill all fields.');
            return;
        }

        setAssigning(true);
        try {
            // Find the selected project details
            // Use loose equality (==) because selectedProject is a string from the select input, and p.id is a number
            const projectDetails = projects.find(p => p.id == selectedProject);
            if (!projectDetails) throw new Error("Project details not found");

            // 1. Create Work Order
            const { error: workOrderError } = await supabase
                .from('work_orders')
                .insert([
                    {
                        proposal_id: selectedProject,
                        title: projectDetails.project_name,
                        amount: projectFund, // Assigned fund amount (standard column)
                        project_fund: projectFund, // Specific column for project fund
                        // component: projectDetails.component, // Removed as column doesn't exist
                        implementing_agency_id: selectedAgency,
                        location: location,
                        deadline: deadline,
                        status: 'Assigned to IA'
                    }
                ]);

            if (workOrderError) throw workOrderError;

            // 2. Update Proposal Status to 'ASSIGNED' (to prevent re-assignment)
            const { error: updateError } = await supabase
                .from('district_proposals')
                .update({ status: 'ASSIGNED' })
                .eq('id', selectedProject);

            if (updateError) {
                console.error("Warning: Failed to update proposal status", updateError);
            }

            alert('Project assigned successfully!');

            // Reset form
            setSelectedProject('');
            setProjectFund('');
            setSelectedAgency('');
            setLocation('');
            setDeadline('');

            // Refresh list
            fetchData();

        } catch (error) {
            console.error('Error assigning project:', error);
            alert('Failed to assign project: ' + error.message);
        } finally {
            setAssigning(false);
        }
    };

    // Auto-fill fund if project selected
    useEffect(() => {
        if (selectedProject) {
            // Use loose equality (==) to handle string/number mismatch
            const proj = projects.find(p => p.id == selectedProject);
            if (proj && proj.estimated_cost) {
                setProjectFund(proj.estimated_cost); // Pre-fill with estimated cost
            }
        }
    }, [selectedProject, projects]);

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                background: 'white',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                border: '1px solid #F3F4F6'
            }}>
                <h2 style={{ marginBottom: '24px', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px', fontSize: '24px', fontWeight: '700', color: '#1F2937' }}>
                    Assign Projects to Implementing Agency
                </h2>

                <div>
                    {loading ? <p>Loading...</p> : (
                        <div>
                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label className="form-label">Select Project (Approved Proposals)</label>
                                <select
                                    className="form-control"
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                >
                                    <option value="">-- Select Project --</option>
                                    {projects.length > 0 ? (
                                        projects.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.project_name} (Est: ₹{p.estimated_cost})
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No approved projects found</option>
                                    )}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label className="form-label">Project Fund (₹)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={projectFund}
                                    onChange={(e) => setProjectFund(e.target.value)}
                                    placeholder="Enter Amount"
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label className="form-label">Select Implementing Agency</label>
                                <select
                                    className="form-control"
                                    value={selectedAgency}
                                    onChange={(e) => setSelectedAgency(e.target.value)}
                                >
                                    <option value="">-- Select Agency --</option>
                                    {agencies.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.agency_name}
                                            {a.district_name && ` - ${a.district_name}`}
                                            {a.state_name && !a.district_name && ` - ${a.state_name}`}
                                            {a.agency_type && ` (${a.agency_type})`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label className="form-label">Location / GP</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Enter Location or GP Name"
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label className="form-label">Deadline</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                />
                            </div>

                            <InteractiveButton
                                variant="primary"
                                onClick={handleAssign}
                                disabled={assigning}
                            >
                                {assigning ? 'Assigning...' : 'Assign Project'}
                            </InteractiveButton>
                        </div>
                    )}
                </div>
            </div>

            {/* Assigned Projects Table */}
            <div className="dashboard-section" style={{ maxWidth: '1200px', margin: '40px auto 0' }}>
                <h3 style={{ marginBottom: 20 }}>Assigned Projects History</h3>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Implementing Agency</th>
                                <th>Component</th>
                                <th>Location</th>
                                <th>Amount</th>
                                <th>Deadline</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedProjects.length > 0 ? (
                                assignedProjects.map((project) => (
                                    <tr key={project.id}>
                                        <td>{project.title || project.district_proposals?.project_name}</td>
                                        <td>{project.implementing_agencies?.agency_name || 'Unknown'}</td>
                                        <td>
                                            <span className="badge badge-secondary">
                                                {project.district_proposals?.component || 'N/A'}
                                            </span>
                                        </td>
                                        <td>{project.location || 'N/A'}</td>
                                        <td>₹{project.amount}</td>
                                        <td>{project.deadline || 'N/A'}</td>
                                        <td>
                                            <span className="badge badge-primary">
                                                {project.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: 20 }}>
                                        No projects assigned yet.
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

export default AssignProjectsDistrict;
