import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';

const AgencyProjects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAssignedProjects();

        // Real-time subscription
        const subscription = supabase
            .channel('agency-projects-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, (payload) => {
                console.log('Real-time update received:', payload);
                fetchAssignedProjects();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    const fetchAssignedProjects = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('=== AgencyProjects: Starting fetch ===');
            console.log('User Role:', user?.role);
            console.log('User Email:', user?.email);

            // Step 1: Get implementing_agency_id if user is an implementing agency
            let agencyId = null;
            if (user?.role === 'implementing_agency' && user?.email) {
                console.log('✅ User is an implementing agency, finding their agency...');

                // 0. Try User ID Lookup (Best Practice - matches Dashboard logic)
                const { data: userAgencies, error: userAgencyError } = await supabase
                    .from('implementing_agencies')
                    .select('id, agency_name')
                    .eq('user_id', user.id)
                    .limit(1);

                if (!userAgencyError && userAgencies && userAgencies.length > 0) {
                    agencyId = userAgencies[0].id;
                    console.log('✅ Found Agency ID via user_id:', agencyId);
                }

                // 1. Try Hardcoded Map First (Fallback if user_id not linked)
                if (!agencyId) {
                    const emailToAgencyMap = {
                        'ngo-karnataka14@nic.in': '16078b1c-bcd2-4eaa-81da-8dbd8590166b', // NGO - Karnataka (Correct ID)
                        'nod-karnataka14@nic.in': '16078b1c-bcd2-4eaa-81da-8dbd8590166b', // Typo variant
                        'nod-karnataka63@pmajay.in': '2bfc5307-6ce5-4922-82e9-8bdc2ee17b65', // Actual NGO email
                        'tec-karnataka@nic.in': '26d31b6c-771f-4a9b-970b-da3103b83615', // TEC - Karnataka
                        'tec-karnataka42@nic.in': '26d31b6c-771f-4a9b-970b-da3103b83615', // Map 42 to 54 (where project is)
                    };

                    if (emailToAgencyMap[user.email]) {
                        agencyId = emailToAgencyMap[user.email];
                        console.log('✅ Found Agency ID from direct map:', agencyId);
                    } else {
                        // 2. Dynamic Matching (Fallback)
                        // Extract base name from email (e.g., "nod-karnataka63@pmajay.in" -> "nod karnataka")
                        const emailBase = user.email
                            .split('@')[0]           // Get part before @
                            .replace(/\d+/g, '')     // Remove all numbers
                            .replace(/[-_.]/g, ' ')  // Replace hyphens/underscores/dots with spaces
                            .trim()
                            .toLowerCase();

                        console.log('📧 Email base:', emailBase);

                        // Fetch all implementing agencies
                        const { data: allAgencies, error: agenciesError } = await supabase
                            .from('implementing_agencies')
                            .select('id, agency_name');

                        if (agenciesError) {
                            console.error('❌ Error fetching agencies:', agenciesError);
                        } else if (allAgencies && allAgencies.length > 0) {
                            // Find matching agency
                            const matchedAgency = allAgencies.find(agency => {
                                const agencyNameNormalized = agency.agency_name
                                    .toLowerCase()
                                    .replace(/[-_.]/g, ' ')
                                    .trim();

                                // Simple token matching: Check if "karnataka" AND ("ngo" OR "nod" OR "tec") match
                                // We split both into tokens
                                const agencyTokens = agencyNameNormalized.split(/\s+/).filter(t => t.length > 2);
                                const emailTokens = emailBase.split(/\s+/).filter(t => t.length > 2);

                                // Count how many tokens match
                                const matchCount = agencyTokens.filter(aToken =>
                                    emailTokens.some(eToken => eToken.includes(aToken) || aToken.includes(eToken))
                                ).length;

                                // If we have at least 1 significant token match (like "karnataka"), it's a candidate
                                // But we want better precision. Let's say if > 50% of agency tokens are found in email
                                const isMatch = matchCount >= Math.ceil(agencyTokens.length / 2);

                                if (isMatch) {
                                    console.log(`  ✓ Candidate Match: "${agency.agency_name}" (Tokens: ${agencyTokens.join(',')}) matches Email (Tokens: ${emailTokens.join(',')})`);
                                }
                                return isMatch;
                            });

                            if (matchedAgency) {
                                agencyId = matchedAgency.id;
                                console.log('✅ Matched Agency Dynamically:', matchedAgency);
                            } else {
                                console.warn('⚠️ No agency matched dynamically for:', user.email);
                            }
                        }
                    }

                }

                if (agencyId) {
                    console.log('✅ Final Agency ID to filter by:', agencyId);
                } else {
                    console.warn('⚠️ Could not identify agency for this user. Showing ALL projects.');
                }
            } else {
                console.log('ℹ️ User is NOT an implementing agency (role:', user?.role, ')');
            }

            // Step 2: Fetch work_orders (with filter for implementing agency if applicable)
            let workOrdersQuery = supabase
                .from('work_orders')
                .select('id, title, amount, location, deadline, status, created_at, implementing_agency_id, proposal_id')
                .not('implementing_agency_id', 'is', null)
                .order('created_at', { ascending: false });

            // Filter by agency if user is an implementing agency
            if (agencyId) {
                console.log('🔍 Applying agency filter: implementing_agency_id =', agencyId);
                workOrdersQuery = workOrdersQuery.eq('implementing_agency_id', agencyId);
            } else {
                console.log('📋 No agency filter applied - showing all projects');
            }

            const { data: workOrders, error: workOrdersError } = await workOrdersQuery;

            if (workOrdersError) {
                throw workOrdersError;
            }

            if (!workOrders || workOrders.length === 0) {
                console.log('⚠️ No work orders found');
                setProjects([]);
                setLoading(false);
                return;
            }

            console.log('📊 Fetched Work Orders Count:', workOrders.length);
            console.log('📊 Work Orders:', workOrders);

            // Step 3: Get unique agency IDs and proposal IDs
            const agencyIds = [...new Set(workOrders.map(w => w.implementing_agency_id).filter(Boolean))];
            const proposalIds = [...new Set(workOrders.map(w => w.proposal_id).filter(Boolean))];

            // Step 4: Fetch implementing agencies
            let agenciesMap = {};
            if (agencyIds.length > 0) {
                const { data: agencies, error: agenciesError } = await supabase
                    .from('implementing_agencies')
                    .select('id, agency_name')
                    .in('id', agencyIds);

                if (agenciesError) {
                    console.error('Error fetching agencies:', agenciesError);
                } else if (agencies) {
                    agenciesMap = agencies.reduce((acc, agency) => {
                        acc[agency.id] = agency;
                        return acc;
                    }, {});
                }
            }

            // Step 5: Fetch district proposals
            let proposalsMap = {};
            if (proposalIds.length > 0) {
                const { data: proposals, error: proposalsError } = await supabase
                    .from('district_proposals')
                    .select('id, project_name, component')
                    .in('id', proposalIds);

                if (proposalsError) {
                    console.error('Error fetching proposals:', proposalsError);
                } else if (proposals) {
                    proposalsMap = proposals.reduce((acc, proposal) => {
                        acc[proposal.id] = proposal;
                        return acc;
                    }, {});
                }
            }

            // Step 6: Merge the data
            const mergedProjects = workOrders.map(order => ({
                ...order,
                implementing_agencies: agenciesMap[order.implementing_agency_id] || null,
                district_proposals: proposalsMap[order.proposal_id] || null
            }));

            console.log('✅ Merged Projects:', mergedProjects);
            console.log('✅ Total projects to display:', mergedProjects.length);
            setProjects(mergedProjects);
        } catch (err) {
            console.error('❌ Error fetching assigned projects:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-panel" style={{ padding: 20 }}>
                <h2 style={{ marginBottom: 20 }}>Projects Assigned to Implementing Agencies</h2>
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <p>Loading projects...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-panel" style={{ padding: 20 }}>
                <h2 style={{ marginBottom: 20 }}>Projects Assigned to Implementing Agencies</h2>
                <div style={{ textAlign: 'center', padding: 40, color: '#dc2626' }}>
                    <p>Error loading projects: {error}</p>
                    <button
                        className="btn btn-primary"
                        onClick={fetchAssignedProjects}
                        style={{ marginTop: 10 }}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 20 }}>Projects Assigned to Implementing Agencies</h2>
            <p style={{ marginBottom: 20, color: '#666' }}>
                {user?.role === 'implementing_agency'
                    ? 'Showing projects assigned to your agency'
                    : 'Showing all projects assigned from districts to implementing agencies'}
            </p>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Project Title</th>
                            <th>Implementing Agency</th>
                            <th>Component</th>
                            <th>Location</th>
                            <th>Project Fund</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Assigned On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <tr key={project.id}>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>
                                            {project.title || project.district_proposals?.project_name || 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            Order ID: {project.id}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>
                                            {project.implementing_agencies?.agency_name || 'Unknown Agency'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            ID: {project.implementing_agency_id}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-secondary">
                                            {project.district_proposals?.component || 'N/A'}
                                        </span>
                                    </td>
                                    <td>{project.location || 'N/A'}</td>
                                    <td style={{ fontWeight: '600', color: '#10B981' }}>₹{project.amount?.toLocaleString('en-IN') || '0'}</td>
                                    <td>{project.deadline ? new Date(project.deadline).toLocaleDateString('en-IN') : 'N/A'}</td>
                                    <td>
                                        <span className={`badge ${project.status === 'Completed' ? 'badge-success' :
                                            project.status === 'In Progress' || project.status === 'Work in Progress' ? 'badge-warning' :
                                                'badge-primary'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td>{new Date(project.created_at).toLocaleDateString('en-IN')}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: 40 }}>
                                    <div style={{ color: '#666' }}>
                                        <p style={{ marginBottom: 10 }}>
                                            {user?.role === 'implementing_agency'
                                                ? 'No projects assigned to your agency yet.'
                                                : 'No projects assigned to implementing agencies yet.'}
                                        </p>
                                        <p style={{ fontSize: '14px' }}>
                                            Projects will appear here once districts assign them to implementing agencies.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {projects.length > 0 && (
                <div style={{ marginTop: 20, padding: 15, background: '#f3f4f6', borderRadius: 8 }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        <strong>Total Projects:</strong> {projects.length}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AgencyProjects;
