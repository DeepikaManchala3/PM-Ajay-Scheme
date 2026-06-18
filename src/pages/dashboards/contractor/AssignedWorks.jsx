import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import InteractiveButton from '../../../components/InteractiveButton';
import { Eye } from 'lucide-react';

const AssignedWorks = () => {
    const { user } = useAuth();
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [toast, setToast] = useState(null);
    const [error, setError] = useState(null);
    const [executingAgencyIds, setExecutingAgencyIds] = useState([]);

    // 1. Identify Executing Agency IDs (all agencies with same name)
    useEffect(() => {
        const identifyAgency = async () => {
            if (!user?.email || user?.role !== 'executing_agency') return;

            try {
                // Fetch all executing agencies and match by email
                const { data: allAgencies, error: agenciesError } = await supabase
                    .from('executing_agencies')
                    .select('id, agency_name, email, name');

                if (agenciesError) throw agenciesError;

                let matchedAgency = null;

                // Try to match by email
                matchedAgency = allAgencies.find(agency =>
                    agency.email && agency.email.toLowerCase() === user.email.toLowerCase()
                );

                if (!matchedAgency) {
                    // Try matching by name from user metadata
                    const userName = user?.full_name || user?.user_metadata?.full_name || '';
                    if (userName) {
                        matchedAgency = allAgencies.find(agency => {
                            const agencyName = agency.agency_name || agency.name || '';
                            return agencyName.toLowerCase().includes(userName.toLowerCase()) ||
                                userName.toLowerCase().includes(agencyName.toLowerCase());
                        });
                    }
                }

                if (matchedAgency) {
                    // Find all agencies with the same name
                    const agencyName = matchedAgency.agency_name;
                    const matchingAgencies = allAgencies.filter(agency =>
                        agency.agency_name === agencyName
                    );
                    const matchingIds = matchingAgencies.map(a => a.id);

                    console.log(`Found ${matchingAgencies.length} agencies with name "${agencyName}":`, matchingIds);
                    setExecutingAgencyIds(matchingIds);
                } else {
                    setError('Could not identify your agency. Please contact support.');
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error identifying agency:', err);
                setError('Failed to identify agency');
                setLoading(false);
            }
        };

        identifyAgency();
    }, [user]);

    // 2. Fetch Data & Subscribe to Real-time Updates
    useEffect(() => {
        if (!executingAgencyIds || executingAgencyIds.length === 0) return;

        let subscription;

        const fetchAndSubscribe = async () => {
            setLoading(true);
            try {
                // Initial Fetch
                await fetchWorks(executingAgencyIds);

                // Real-time Subscription - listen to all work_orders changes
                // We'll filter client-side since Supabase doesn't support OR filters in subscriptions
                subscription = supabase
                    .channel('public:work_orders')
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'work_orders'
                        },
                        (payload) => {
                            console.log('Real-time update received:', payload);
                            // Check if the change affects our agencies
                            const newRecord = payload.new;
                            const oldRecord = payload.old;
                            const affectsUs = executingAgencyIds.includes(newRecord?.executing_agency_id) ||
                                executingAgencyIds.includes(oldRecord?.executing_agency_id);

                            if (affectsUs) {
                                handleRealtimeUpdate(payload);
                            }
                        }
                    )
                    .subscribe();

            } catch (err) {
                console.error('Error in fetchAndSubscribe:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAndSubscribe();

        return () => {
            if (subscription) supabase.removeChannel(subscription);
        };
    }, [executingAgencyIds]);

    const fetchWorks = async (agencyIds) => {
        try {
            const { data: workOrdersData, error: workOrdersError } = await supabase
                .from('work_orders')
                .select('id, title, amount, location, deadline, status, created_at, implementing_agency_id, proposal_id')
                .in('executing_agency_id', agencyIds)
                .order('created_at', { ascending: false });

            if (workOrdersError) throw workOrdersError;

            if (workOrdersData && workOrdersData.length > 0) {
                const iaIds = [...new Set(workOrdersData.map(w => w.implementing_agency_id).filter(Boolean))];

                // Fetch IA names
                const { data: iaData } = await supabase
                    .from('implementing_agencies')
                    .select('id, agency_name')
                    .in('id', iaIds);

                const iaMap = (iaData || []).reduce((acc, ia) => {
                    acc[ia.id] = ia;
                    return acc;
                }, {});

                const mergedWorks = workOrdersData.map(work => ({
                    ...work,
                    implementing_agencies: iaMap[work.implementing_agency_id] || null
                }));

                setWorks(mergedWorks);
            } else {
                setWorks([]);
            }
        } catch (err) {
            console.error('Error fetching works:', err);
            setError(err.message);
        }
    };

    const handleRealtimeUpdate = async (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        if (eventType === 'INSERT') {
            // Fetch the full details including IA name for the new record
            // For simplicity, we can just re-fetch all works or fetch this single one and append
            // Re-fetching is safer to ensure all joins (like IA name) are correct
            await fetchWorks(executingAgencyIds);
            showToast('New project assigned!');
        } else if (eventType === 'UPDATE') {
            setWorks(prevWorks => prevWorks.map(work =>
                work.id === newRecord.id ? { ...work, ...newRecord } : work
            ));
            // If status changed or critical info, maybe show toast
            if (oldRecord.status !== newRecord.status) {
                showToast(`Project status updated: ${newRecord.status}`);
            }
        } else if (eventType === 'DELETE') {
            setWorks(prevWorks => prevWorks.filter(work => work.id !== oldRecord.id));
            showToast('Project removed');
        }
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleViewWorkOrder = (work) => {
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Work Order - ${work.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
                        h1 { color: #2c3e50; margin: 0; }
                        .section { margin-bottom: 25px; }
                        .section-title { font-weight: bold; color: #2c3e50; font-size: 16px; margin-bottom: 8px; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; }
                        .info-row { display: flex; margin-bottom: 10px; }
                        .info-label { font-weight: bold; width: 200px; color: #555; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Work Order Details</h1>
                        <div style="color: #666; margin-top: 5px;">Order ID: WO-${work.id}</div>
                    </div>
                    <div class="section">
                        <div class="section-title">Project Information</div>
                        <div class="info-row"><div class="info-label">Project Title:</div><div>${work.title}</div></div>
                        <div class="info-row"><div class="info-label">Location:</div><div>${work.location || 'N/A'}</div></div>
                        <div class="info-row"><div class="info-label">Contract Amount:</div><div>₹${work.amount?.toLocaleString('en-IN') || '0'}</div></div>
                        <div class="info-row"><div class="info-label">Assigned By:</div><div>${work.implementing_agencies?.agency_name || 'N/A'}</div></div>
                    </div>
                    <div class="section">
                        <div class="section-title">Timeline & Status</div>
                        <div class="info-row"><div class="info-label">Assigned Date:</div><div>${new Date(work.created_at).toLocaleDateString('en-IN')}</div></div>
                        <div class="info-row"><div class="info-label">Deadline:</div><div>${work.deadline ? new Date(work.deadline).toLocaleDateString('en-IN') : 'N/A'}</div></div>
                        <div class="info-row"><div class="info-label">Current Status:</div><div>${work.status}</div></div>
                    </div>
                    <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">Generated on: ${new Date().toLocaleString()}</div>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.onload = function () { printWindow.print(); };
            showToast('Work Order PDF opened');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Error generating PDF');
        }
    };

    const filteredWorks = filterStatus
        ? works.filter(w => w.status === filterStatus)
        : works;

    if (loading && !works.length) {
        return (
            <div className="dashboard-panel" style={{ padding: 20 }}>
                <h2 style={{ marginBottom: 20 }}>Assigned Works</h2>
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <p>Loading assigned works...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-panel" style={{ padding: 20 }}>
                <h2 style={{ marginBottom: 20 }}>Assigned Works</h2>
                <div style={{ textAlign: 'center', padding: 40, color: '#dc2626' }}>
                    <p>Error: {error}</p>
                    <InteractiveButton
                        variant="primary"
                        onClick={() => window.location.reload()}
                        style={{ marginTop: 10 }}
                    >
                        Retry
                    </InteractiveButton>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: 0 }}>Assigned Works</h2>
                    <p style={{ marginTop: 5, color: '#666', fontSize: '14px' }}>
                        Projects assigned to your executing agency by implementing agencies
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        className="form-control"
                        style={{ width: '180px' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Assigned to EA">Assigned to EA</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Work in Progress">Work in Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Project Title</th>
                            <th>Assigned By</th>
                            <th>Location</th>
                            <th>Amount</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWorks.length > 0 ? (
                            filteredWorks.map(work => (
                                <tr key={work.id}>
                                    <td><strong>WO-{work.id}</strong></td>
                                    <td>{work.title}</td>
                                    <td>{work.implementing_agencies?.agency_name || 'N/A'}</td>
                                    <td>{work.location || 'N/A'}</td>
                                    <td style={{ fontWeight: '500' }}>₹{work.amount?.toLocaleString('en-IN') || '0'}</td>
                                    <td>{work.deadline ? new Date(work.deadline).toLocaleDateString('en-IN') : 'N/A'}</td>
                                    <td>
                                        <span className={`badge badge-${work.status === 'Completed' ? 'success' :
                                            work.status === 'In Progress' || work.status === 'Work in Progress' ? 'warning' :
                                                'info'
                                            }`}>
                                            {work.status}
                                        </span>
                                    </td>
                                    <td>
                                        <InteractiveButton variant="info" size="sm" onClick={() => handleViewWorkOrder(work)}>
                                            <Eye size={16} /> View Order
                                        </InteractiveButton>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    <div>
                                        <p style={{ marginBottom: 10 }}>No assigned works found.</p>
                                        <p style={{ fontSize: '14px' }}>
                                            Works will appear here once implementing agencies assign projects to your agency.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {works.length > 0 && (
                <div style={{ marginTop: 20, padding: 15, background: '#f3f4f6', borderRadius: 8 }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        <strong>Total Assigned Works:</strong> {works.length}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AssignedWorks;

