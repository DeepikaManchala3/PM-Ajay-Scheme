import React, { useState } from 'react';
import DistrictMap from '../../../components/maps/DistrictMap';
import { districtStats, mockProjects, districts } from '../../../data/mockData';
import InteractiveButton from '../../../components/InteractiveButton';
import { FileText, IndianRupee, CheckCircle2, Eye, XCircle, Plus, Download } from 'lucide-react';

const DistrictDashboardPanel = ({ formatCurrency, districtId, stateId }) => {
    const [stats, setStats] = useState({
        gramPanchayats: 0,
        totalProjects: 0,
        fundAllocated: 0,
        completedProjects: 0
    });
    const [fundAllocated, setFundAllocated] = useState(0);
    const [fundUtilized, setFundUtilized] = useState(0);
    const [districtProgress, setDistrictProgress] = useState(0);
    const [recentReleases, setRecentReleases] = useState([]);
    const [stateName, setStateName] = useState(null);
    const [districtName, setDistrictName] = useState(null);
    const [myProposals, setMyProposals] = useState([]);
    const [selectedComponent, setSelectedComponent] = useState('All Components');
    const [showComponentDropdown, setShowComponentDropdown] = useState(false);

    // Fetch district statistics
    React.useEffect(() => {
        if (!districtId) return;
        const fetchStats = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/funds/district-stats?districtId=${districtId}`);
                const result = await response.json();
                if (result.success) {
                    setStats(result.data);
                }
            } catch (error) {
                console.error('Error fetching district stats:', error);
            }
        };
        fetchStats();
    }, [districtId]);

    // Fetch my proposals
    React.useEffect(() => {
        if (!districtId) return;
        const fetchProposals = async () => {
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
        fetchProposals();
    }, [districtId]);

    // Fetch allocated funds and dist rict info
    React.useEffect(() => {
        const fetchData = async () => {
            if (!districtId) return;

            try {
                // Fetch district info to get state and district name
                const districtResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/districts?id=eq.${districtId}&select=name,state_id`, {
                    headers: {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                    }
                });

                if (districtResponse.ok) {
                    const districtData = await districtResponse.json();

                    if (districtData && districtData.length > 0) {
                        setDistrictName(districtData[0].name);

                        // Fetch state name
                        if (districtData[0].state_id) {
                            const stateResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/states?id=eq.${districtData[0].state_id}&select=name`, {
                                headers: {
                                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                                }
                            });
                            if (stateResponse.ok) {
                                const stateData = await stateResponse.json();

                                if (stateData && stateData.length > 0) {
                                    setStateName(stateData[0].name);
                                }
                            }
                        }
                    }
                }

                // Fetch fund releases
                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/fund_releases?district_id=eq.${districtId}&select=*&order=created_at.desc`, {
                    headers: {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const total = data.reduce((sum, item) => sum + (item.amount_cr || 0), 0);
                    setFundAllocated(total * 10000000);
                    setRecentReleases(data.slice(0, 5)); // Keep top 5
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [districtId]);

    // Fallback to mock data for implemented districts when real data is missing
    React.useEffect(() => {
        if (!districtName || !stateName) return;

        // Check if this district is implemented (exists in mock data)
        const stateDistricts = districts[stateName];
        const isImplemented = stateDistricts && stateDistricts.some(d => d.name === districtName);

        // If implemented but no real data, use mock data
        if (isImplemented && stats.totalProjects === 0 && fundAllocated === 0) {
            const mockDistrict = stateDistricts.find(d => d.name === districtName);
            if (mockDistrict) {
                const allocated = mockDistrict.fundAllocated;
                const utilized = allocated * (mockDistrict.progress / 100);

                setStats({
                    gramPanchayats: 0,
                    totalProjects: mockDistrict.projects,
                    fundAllocated: allocated / 10000000, // Convert to Cr
                    completedProjects: Math.floor(mockDistrict.projects * (mockDistrict.progress / 100))
                });
                setFundAllocated(allocated);
                setFundUtilized(utilized);
                setDistrictProgress(mockDistrict.progress);
            }
        }
    }, [districtName, stateName, stats.totalProjects, fundAllocated]);

    const getStatusBadge = (status) => {
        const badges = {
            'PROPOSED': 'badge-info',
            'APPROVED': 'badge-info',
            'ONGOING': 'badge-warning',
            'COMPLETED': 'badge-success',
            'DELAYED': 'badge-error',
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

    const getReadableStatus = (status) => {
        if (status === 'SUBMITTED') return 'Pending at State';
        if (status === 'APPROVED_BY_STATE') return 'Pending at Ministry';
        if (status === 'APPROVED_BY_MINISTRY') return 'Approved & Active';
        if (status === 'REJECTED_BY_STATE') return 'Rejected by State';
        if (status === 'REJECTED_BY_MINISTRY') return 'Rejected by Ministry';
        if (status === 'REJECTED') return 'Rejected';
        return status;
    };

    const handleAddLocation = () => {
        console.log('Adding new location:', newLocation);
        // Here you would typically send this to your backend
        setShowAddLocationModal(false);
        setNewLocation({
            name: '',
            gp: '',
            component: 'Adarsh Gram',
            estimatedCost: '',
            description: ''
        });
    };

    return (
        <>
            {/* District KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                {/* Card 1: Total Projects */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #F3F4F6'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#FEF3C7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        color: '#D97706'
                    }}>
                        <FileText size={24} />
                    </div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827',
                        lineHeight: '1.2',
                        marginBottom: '4px'
                    }}>
                        {stats.totalProjects}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Total Projects
                    </div>
                </div>

                {/* Card 2: Fund Allocated */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #F3F4F6'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        color: '#2563EB'
                    }}>
                        <IndianRupee size={24} />
                    </div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827',
                        lineHeight: '1.2',
                        marginBottom: '4px'
                    }}>
                        ₹{stats.fundAllocated} Cr
                    </div>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Fund Allocated
                    </div>
                </div>

                {/* Card 3: Completed Projects */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #F3F4F6'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#ECFDF5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        color: '#059669'
                    }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827',
                        lineHeight: '1.2',
                        marginBottom: '4px'
                    }}>
                        {stats.completedProjects}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Completed
                    </div>
                </div>
            </div>

            {/* Recent Funds Received */}
            <div className="dashboard-section" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="section-header">
                    <h2 className="section-title">Recent Funds Received from State</h2>
                </div>
                <div className="card" style={{
                    padding: 0,
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'white'
                }}>
                    <table className="table" style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Component</th>
                                <th>Amount</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentReleases.length > 0 ? (
                                recentReleases.map(release => (
                                    <tr key={release.id}>
                                        <td>{release.release_date}</td>
                                        <td>
                                            {release.component && release.component.map((c, i) => (
                                                <span key={i} className="badge badge-primary" style={{ marginRight: 4 }}>{c}</span>
                                            ))}
                                        </td>
                                        <td style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>
                                            ₹{release.amount_cr} Cr
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                            {release.remarks || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-tertiary)' }}>
                                        No funds received yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* District Overview - Map and Stats */}
            <div className="dashboard-section" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="section-header" style={{ marginBottom: 'var(--space-4)' }}>
                    <h2 className="section-title">District Overview</h2>

                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                    {/* Left: Map with Legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div style={{ height: '600px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)', position: 'relative' }}>
                            <DistrictMap state={stateName} district={districtName} />
                        </div>
                    </div>

                    {/* Right: Fund Utilization & Component Progress */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {/* Component Dropdown - Top Right */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px', position: 'relative' }}>
                            <button
                                className="btn"
                                onClick={() => setShowComponentDropdown(!showComponentDropdown)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    backgroundColor: 'white',
                                    border: '2px solid #7C3AED',
                                    borderRadius: '24px',
                                    color: '#7C3AED',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(124, 58, 237, 0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <span>{selectedComponent}</span>
                                <span style={{ fontSize: '12px' }}>▼</span>
                            </button>

                            {/* Dropdown Menu */}
                            {showComponentDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '8px',
                                    backgroundColor: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                    zIndex: 1000,
                                    minWidth: '200px',
                                    overflow: 'hidden'
                                }}>
                                    {['All Components', 'Adarsh Gram', 'GIA', 'Hostel'].map((component) => (
                                        <div
                                            key={component}
                                            onClick={() => {
                                                setSelectedComponent(component);
                                                setShowComponentDropdown(false);
                                            }}
                                            style={{
                                                padding: '12px 20px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s ease',
                                                backgroundColor: selectedComponent === component ? '#F3F4F6' : 'white',
                                                fontWeight: selectedComponent === component ? '600' : '500',
                                                color: selectedComponent === component ? '#7C3AED' : '#374151',
                                                fontSize: '14px'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (selectedComponent !== component) {
                                                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedComponent !== component) {
                                                    e.currentTarget.style.backgroundColor = 'white';
                                                }
                                            }}
                                        >
                                            {component}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fund Utilization Card */}
                        <div className="card" style={{ padding: 'var(--space-6)' }}>
                            <h3 style={{ margin: '0 0 var(--space-6) 0', color: 'var(--color-navy)', fontSize: 'var(--text-xl)', textAlign: 'center' }}>
                                Fund Utilization - {districtName || 'District'}
                            </h3>


                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
                                {/* Circular Progress */}
                                <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                                    <svg height="200" width="200" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle stroke="#E5E7EB" strokeWidth="30" fill="transparent" r="70" cx="100" cy="100" />
                                        <circle
                                            stroke="#7C3AED"
                                            strokeWidth="30"
                                            strokeDasharray={`${2 * Math.PI * 70}`}
                                            style={{ strokeDashoffset: `${2 * Math.PI * 70 * (1 - (districtProgress / 100))}`, transition: 'stroke-dashoffset 1.5s ease-out' }}
                                            strokeLinecap="round"
                                            fill="transparent"
                                            r="70"
                                            cx="100"
                                            cy="100"
                                        />
                                    </svg>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-navy)' }}>
                                            {districtProgress}%
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Utilized</div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#7C3AED' }}></div>
                                        <span style={{ color: 'var(--color-navy)' }}>Utilized: ₹{(fundUtilized / 10000000).toFixed(2)} Cr</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#E5E7EB' }}></div>
                                        <span style={{ color: 'var(--text-secondary)' }}>Remaining: ₹{((fundAllocated - fundUtilized) / 10000000).toFixed(2)} Cr</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* Component Progress Card */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 style={{ margin: '0 0 var(--space-6) 0', color: 'var(--color-navy)', fontSize: 'var(--text-xl)', textAlign: 'center' }}>
                            {selectedComponent === 'All Components' ? 'Component Progress' : `${selectedComponent} Progress`}
                        </h3>

                        {(() => {
                            const componentData = {
                                'Adarsh Gram': { progress: 27, color: '#7C3AED', label: 'Adarsh Gram' },
                                'GIA': { progress: 42, color: '#EC4899', label: 'GIA (Grant-in-Aid)' },
                                'Hostel': { progress: 89, color: '#F59E0B', label: 'Hostel' }
                            };

                            if (selectedComponent === 'All Components') {
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                                        {Object.entries(componentData).map(([key, data]) => (
                                            <div key={key}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                    <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-navy)' }}>{data.label}</span>
                                                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: data.color }}>{data.progress}%</span>
                                                </div>
                                                <div style={{ width: '100%', height: '12px', backgroundColor: '#E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${data.progress}%`, height: '100%', backgroundColor: data.color, borderRadius: '6px', transition: 'width 0.8s ease' }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            } else {
                                const data = componentData[selectedComponent];
                                if (!data) return null;
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px 0' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                            {/* Large percentage display */}
                                            <div style={{
                                                fontSize: '48px',
                                                fontWeight: 'bold',
                                                color: data.color,
                                                marginBottom: '16px'
                                            }}>
                                                {data.progress}%
                                            </div>

                                            {/* Large vertical bar */}
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                width: '60%',
                                                maxWidth: '200px'
                                            }}>
                                                <div style={{
                                                    width: '100%',
                                                    height: `${data.progress * 2.5}px`,
                                                    maxHeight: '250px',
                                                    backgroundColor: data.color,
                                                    borderRadius: '8px 8px 0 0',
                                                    transition: 'height 0.8s ease',
                                                    minHeight: '40px'
                                                }}></div>

                                                {/* Base line */}
                                                <div style={{
                                                    width: '100%',
                                                    height: '4px',
                                                    backgroundColor: '#E5E7EB'
                                                }}></div>
                                            </div>

                                            {/* Component name */}
                                            <div style={{
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                color: 'var(--color-navy)',
                                                marginTop: '16px'
                                            }}>
                                                {data.label}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })()}
                    </div>

                </div>
            </div>

            {/* GP Proposals Pending */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">GP Proposals Pending Approval</h2>
                    <span className="badge badge-warning" style={{ fontSize: 'var(--text-base)', padding: 'var(--space-2) var(--space-4)', boxShadow: 'var(--shadow-lg)' }}>
                        {stats.projectsProposed} Pending
                    </span>
                </div>

                <div className="card">
                    {['Shirur GP - Community Center', 'Khed GP - Water Tank'].map((proposal, index) => (
                        <div key={index} style={{
                            padding: 'var(--space-4)',
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-3)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: 'var(--shadow-sm)',
                            backgroundColor: 'white'
                        }}>
                            <div>
                                <h4 style={{ margin: 0, marginBottom: 'var(--space-2)' }}>{proposal}</h4>
                                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                    Submitted: Nov {22 + index}, 2025 • Component: Adarsh Gram •
                                    Estimated Cost: ₹{(Math.random() * 50 + 20).toFixed(2)} L
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <InteractiveButton variant="info" size="sm"><Eye size={16} /> View</InteractiveButton>
                                <InteractiveButton variant="success" size="sm"><CheckCircle2 size={16} /> Approve</InteractiveButton>
                                <InteractiveButton variant="danger" size="sm"><XCircle size={16} /> Reject</InteractiveButton>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* My Submitted Proposals (To State) */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">My Submitted Proposals (To State)</h2>
                </div>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Component</th>
                                <th>Est. Cost</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myProposals.length > 0 ? (
                                myProposals.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.project_name}</td>
                                        <td><span className="badge badge-primary">{p.component}</span></td>
                                        <td>₹{p.estimated_cost} L</td>
                                        <td><span className={`badge ${getStatusBadge(p.status)}`}>{getReadableStatus(p.status)}</span></td>
                                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                        No proposals submitted yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* All Projects Table */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">All District Projects</h2>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <InteractiveButton variant="saffron" size="sm"><Plus size={16} /> Assign Work</InteractiveButton>
                        <InteractiveButton variant="secondary" size="sm"><Download size={16} /> Export Data</InteractiveButton>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>GP</th>
                                <th>Component</th>
                                <th>Status</th>
                                <th>Progress</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myProposals.map(project => (
                                <tr key={project.id}>
                                    <td>
                                        <strong>{project.project_name}</strong>
                                        <br />
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                            ID: PRJ-{project.id.toString().padStart(4, '0')}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 'var(--text-sm)' }}>-</td>
                                    <td>
                                        <span className="badge badge-primary">{project.component}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(project.status)}`}>
                                            {getReadableStatus(project.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <div className="progress-bar" style={{ flex: 1, height: '6px', minWidth: '80px' }}>
                                                <div className="progress-fill" style={{ width: '0%' }}></div>
                                            </div>
                                            <span style={{ fontSize: 'var(--text-sm)' }}>0%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <InteractiveButton variant="info" size="sm"><Eye size={16} /> View</InteractiveButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default DistrictDashboardPanel;
