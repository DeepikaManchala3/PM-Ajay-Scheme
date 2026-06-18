import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

const AssignProjects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedAgency, setSelectedAgency] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [assignedProjects, setAssignedProjects] = useState([]);

    useEffect(() => {
        fetchData();

        // Real-time subscription
        const subscription = supabase
            .channel('assign-projects-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, (payload) => {
                console.log('Real-time update received:', payload);
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user?.email]);

    const fetchData = async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            console.log('=== AssignProjects: Fetching data ===');
            console.log('User Email:', user.email);
            console.log('User Role:', user.role);

            // 1. Get implementing agency ID using email-based matching
            let implementingAgencyId = null;
            let userState = null;
            let stateId = null;
            let districtId = null;

            if (user?.role === 'implementing_agency' && user?.email) {
                console.log('✅ User is an implementing agency, finding their agency...');

                // 0. Try User ID Lookup (Best Practice - matches Dashboard logic)
                const { data: userAgencies, error: userAgencyError } = await supabase
                    .from('implementing_agencies')
                    .select('id, agency_name')
                    .eq('user_id', user.id)
                    .limit(1);

                if (!userAgencyError && userAgencies && userAgencies.length > 0) {
                    implementingAgencyId = userAgencies[0].id;
                    console.log('✅ Found Agency ID via user_id:', implementingAgencyId);
                }

                // 1a. Try Hardcoded Map First (Fallback if user_id not linked)
                if (!implementingAgencyId) {
                    const emailToAgencyMap = {
                        'ngo-karnataka14@nic.in': '16078b1c-bcd2-4eaa-81da-8dbd8590166b', // NGO - Karnataka (Correct ID)
                        'nod-karnataka14@nic.in': '16078b1c-bcd2-4eaa-81da-8dbd8590166b', // Typo variant
                        'nod-karnataka63@pmajay.in': '2bfc5307-6ce5-4922-82e9-8bdc2ee17b65', // Actual NGO email
                        'tec-karnataka@nic.in': '26d31b6c-771f-4a9b-970b-da3103b83615', // TEC - Karnataka
                        'tec-karnataka42@nic.in': '26d31b6c-771f-4a9b-970b-da3103b83615', // Map 42 to 54 (where project is)
                    };

                    if (emailToAgencyMap[user.email]) {
                        implementingAgencyId = emailToAgencyMap[user.email];
                        console.log('✅ Found Agency ID from direct map:', implementingAgencyId);
                    } else {
                        // 1b. Dynamic Matching (Fallback)
                        const emailBase = user.email
                            .split('@')[0]
                            .replace(/\d+/g, '')
                            .replace(/[-_.]/g, ' ')
                            .trim()
                            .toLowerCase();

                        console.log('📧 Email base:', emailBase);

                        // Fetch all implementing agencies
                        const { data: allAgencies, error: agenciesError } = await supabase
                            .from('implementing_agencies')
                            .select('id, agency_name, state_name, state_id, district_id');

                        if (agenciesError) {
                            console.error('❌ Error fetching agencies:', agenciesError);
                        } else if (allAgencies && allAgencies.length > 0) {
                            const matchedAgency = allAgencies.find(agency => {
                                const agencyNameNormalized = agency.agency_name
                                    .toLowerCase()
                                    .replace(/[-_.]/g, ' ')
                                    .trim();

                                const agencyTokens = agencyNameNormalized.split(/\s+/).filter(t => t.length > 2);
                                const emailTokens = emailBase.split(/\s+/).filter(t => t.length > 2);

                                const matchCount = agencyTokens.filter(aToken =>
                                    emailTokens.some(eToken => eToken.includes(aToken) || aToken.includes(eToken))
                                ).length;

                                const isMatch = matchCount >= Math.ceil(agencyTokens.length / 2);

                                if (isMatch) {
                                    console.log(`  ✓ Candidate Match: "${agency.agency_name}"`);
                                }
                                return isMatch;
                            });

                            if (matchedAgency) {
                                implementingAgencyId = matchedAgency.id;
                                console.log('✅ Matched Agency Dynamically:', matchedAgency);
                            } else {
                                console.warn('⚠️ No agency matched dynamically for:', user.email);
                            }
                        }
                    }

                }

                // Fetch full agency details if we found an ID
                if (implementingAgencyId) {
                    const { data: agencyDetails } = await supabase
                        .from('implementing_agencies')
                        .select('id, state_name, state_id, district_id')
                        .eq('id', implementingAgencyId)
                        .single();

                    if (agencyDetails) {
                        userState = agencyDetails.state_name;
                        stateId = agencyDetails.state_id;
                        districtId = agencyDetails.district_id;
                    }
                }
            }

            if (!implementingAgencyId) {
                console.error('❌ Could not identify implementing agency for this user');
                setLoading(false);
                return;
            }

            console.log('✅ Implementing Agency ID:', implementingAgencyId);
            console.log('State:', userState, 'State ID:', stateId, 'District ID:', districtId);

            // 2. Fetch ALL Ministry-approved proposals (removing district filter)
            // This ensures all approved projects are visible regardless of which district created them
            console.log('📋 Fetching ALL Ministry-approved proposals...');

            const { data: approvedProposals, error: proposalsError } = await supabase
                .from('district_proposals')
                .select('id, project_name, component, estimated_cost, allocated_amount, status, approved_at, implementing_agency_id, district_id')
                .eq('status', 'APPROVED_BY_MINISTRY')
                .order('approved_at', { ascending: false });

            if (proposalsError) {
                console.error('Error fetching approved proposals:', proposalsError);
            } else {
                console.log('✅ Fetched Ministry-approved proposals:', approvedProposals?.length || 0, 'proposals found');
                console.log('Proposals data:', approvedProposals);

                // Transform proposals to match project format
                const transformedProjects = (approvedProposals || []).map(p => ({
                    id: p.id,
                    title: p.project_name,
                    amount: p.allocated_amount || p.estimated_cost,
                    component: p.component,
                    status: p.status,
                    proposal_id: p.id
                }));
                setProjects(transformedProjects);
            }

            // 3. Fetch Executing Agencies from agency_assignments (agencies added by this implementing agency)
            const { data: assignedAgencies, error: agenciesError } = await supabase
                .from('agency_assignments')
                .select('id, name, agency_officer, phone, email, status')
                .eq('implementing_agency_id', user.id)
                .eq('status', 'Active');

            if (agenciesError) {
                console.error('Error fetching agencies from agency_assignments:', agenciesError);
            } else {
                console.log('✅ Fetched Executing Agencies from agency_assignments:', assignedAgencies);
                // Transform to expected format
                const transformedAgencies = (assignedAgencies || []).map(a => ({
                    id: a.id,
                    agency_name: a.name,
                    agency_officer: a.agency_officer
                }));
                setAgencies(transformedAgencies);
            }


            // 4. Fetch already assigned projects (status = ASSIGNED_TO_EA) for history table
            console.log('📋 Fetching assigned projects history...');
            const { data: assignedData, error: assignedError } = await supabase
                .from('district_proposals')
                .select('id, project_name, component, estimated_cost, allocated_amount, status, approved_at, updated_at')
                .eq('status', 'ASSIGNED_TO_EA')
                .order('updated_at', { ascending: false });

            if (assignedError) {
                console.error('Error fetching assigned projects:', assignedError);
            } else {
                console.log('✅ Assigned projects found:', assignedData?.length || 0);

                // Transform to match expected format
                const transformedAssigned = (assignedData || []).map(p => ({
                    id: p.id,
                    title: p.project_name,
                    component: p.component,
                    amount: p.allocated_amount || p.estimated_cost,
                    status: p.status,
                    created_at: p.updated_at || p.approved_at,
                    // We don't have executing agency stored in district_proposals yet
                    executing_agencies: { agency_name: 'Assigned' }
                }));

                setAssignedProjects(transformedAssigned);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedProject || !selectedAgency) {
            alert('Please select both a project and an executing agency.');
            return;
        }

        setAssigning(true);
        try {
            // Get the selected agency and project details
            const selectedAgencyData = agencies.find(a => String(a.id) === String(selectedAgency));
            const selectedProjectData = projects.find(p => String(p.id) === String(selectedProject));

            console.log('🔄 Assigning project:', selectedProject, 'to agency:', selectedAgency);
            console.log('Project data:', selectedProjectData);
            console.log('All projects:', projects);
            console.log('Agency data:', selectedAgencyData);

            // Update the proposal status to ASSIGNED_TO_EA
            const { data: updatedData, error: proposalError } = await supabase
                .from('district_proposals')
                .update({
                    status: 'ASSIGNED_TO_EA'
                })
                .eq('id', selectedProject)
                .select();

            console.log('Update result - data:', updatedData, 'error:', proposalError);

            if (proposalError) {
                console.error('Error updating proposal:', proposalError);
                throw proposalError;
            }

            if (!updatedData || updatedData.length === 0) {
                console.warn('⚠️ No rows were updated! The proposal ID might not exist or RLS is blocking.');
                alert('Warning: Assignment may not have been saved. Please check the database.');
            } else {
                console.log('✅ Database updated successfully:', updatedData);
            }

            console.log('✅ Project assigned to executing agency:', selectedAgencyData?.agency_name);
            const projectTitle = selectedProjectData?.title || selectedProjectData?.project_name || 'Project';
            alert(`${projectTitle} assigned to "${selectedAgencyData?.agency_name}" successfully!`);
            fetchData(); // Refresh lists
            setSelectedProject('');
            setSelectedAgency('');
        } catch (error) {
            console.error('Error assigning project:', error);
            alert('Failed to assign project: ' + error.message);
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div className="card" style={{ padding: 20, borderRadius: '12px' }}>
                <div style={{ marginBottom: 20 }}>
                    <h2 style={{ margin: 0 }}>Assign Projects to Executing Agencies</h2>
                    <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
                        Assign projects that have been allocated to your implementing agency to executing agencies for execution.
                    </p>
                </div>

                {/* Assignment Form */}
                <div style={{ padding: 20, marginBottom: 30, backgroundColor: '#Ffffff', borderRadius: '8px', border: '1px solid #E5E7EB', maxWidth: '50%' }}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <>
                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label className="form-label">Select Project</label>
                                <select
                                    className="form-control"
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                >
                                    <option value="">-- Select Approved Project --</option>
                                    {projects.length > 0 ? (
                                        projects.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.title} - {p.component} (₹{p.amount?.toLocaleString('en-IN') || '0'})
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No Ministry-approved projects available</option>
                                    )}
                                </select>
                                {projects.length === 0 && !loading && (
                                    <small style={{ color: '#666', marginTop: 5, display: 'block' }}>
                                        No Ministry-approved proposals found. Proposals need to be approved by Ministry first.
                                    </small>
                                )}
                            </div>

                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label className="form-label">Select Executing Agency</label>
                                <select
                                    className="form-control"
                                    value={selectedAgency}
                                    onChange={(e) => setSelectedAgency(e.target.value)}
                                >
                                    <option value="">-- Select Agency --</option>
                                    {agencies.length > 0 ? (
                                        agencies.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.agency_name} {a.agency_officer ? `(${a.agency_officer})` : ''}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No executing agencies added yet</option>
                                    )}
                                </select>
                                {agencies.length === 0 && !loading && (
                                    <small style={{ color: '#666', marginTop: 5, display: 'block' }}>
                                        Add executing agencies from "Manage Executing Agency" first.
                                    </small>
                                )}
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={handleAssign}
                                disabled={!selectedProject || !selectedAgency || assigning}
                            >
                                {assigning ? 'Assigning...' : 'Assign Project'}
                            </button>
                        </>
                    )}
                </div>

                {/* Assigned Projects History */}
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 15 }}>Assigned Projects History</h3>
                    <div className="card" style={{ borderRadius: '12px' }}>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Project Title</th>
                                        <th>Executing Agency</th>
                                        <th>Location</th>
                                        <th>Amount</th>
                                        <th>Deadline</th>
                                        <th>Status</th>
                                        <th>Assigned On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignedProjects.length > 0 ? (
                                        assignedProjects.map((project) => (
                                            <tr key={project.id}>
                                                <td>
                                                    <div style={{ fontWeight: 'bold' }}>
                                                        {project.title || 'N/A'}
                                                    </div>
                                                </td>
                                                <td>
                                                    {project.executing_agencies?.agency_name || 'Unknown'}
                                                </td>
                                                <td>{project.location || 'N/A'}</td>
                                                <td style={{ fontWeight: '600', color: '#10B981' }}>
                                                    ₹{project.amount?.toLocaleString('en-IN') || '0'}
                                                </td>
                                                <td>
                                                    {project.deadline
                                                        ? new Date(project.deadline).toLocaleDateString('en-IN')
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    <span className={`badge ${project.status === 'Completed' ? 'badge-success' :
                                                        project.status === 'In Progress' || project.status === 'Work in Progress' ? 'badge-warning' :
                                                            'badge-primary'
                                                        }`}>
                                                        {project.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {new Date(project.created_at).toLocaleDateString('en-IN')}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: 20, color: '#666' }}>
                                                No projects assigned to executing agencies yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignProjects;
