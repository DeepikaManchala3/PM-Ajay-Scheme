import React, { useState, useEffect } from 'react';
import StatCard from '../../../components/StatCard';
import IndiaMap from '../../../components/maps/IndiaMap';
import DistrictMap from '../../../components/maps/DistrictMap';
import CityMap from '../../../components/maps/CityMap';
import MonitorProgressMinistry from './MonitorProgressMinistry';
import Modal from '../../../components/Modal';
import { nationalStats, states, mockProjects } from '../../../data/mockData';
import { Download } from 'lucide-react';
import InteractiveButton from '../../../components/InteractiveButton';

const DashboardPanel = ({ selectedState, setSelectedState, selectedDistrict, setSelectedDistrict, formatCurrency }) => {
    const [stats, setStats] = useState({
        totalStates: 0,
        totalDistricts: 0,
        totalProjects: 0,
        totalFundAllocated: 0,
        projectsCompleted: 0,
        projectsOngoing: 0,
        projectsApproved: 0,
        projectsProposed: 0
    });

    const [stateFunds, setStateFunds] = useState([]);
    const [showAllStates, setShowAllStates] = useState(false);
    const [selectedStateForDistricts, setSelectedStateForDistricts] = useState(null);
    const [districtFunds, setDistrictFunds] = useState([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    // Fetch real dashboard statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/dashboard/ministry-stats');
                const result = await response.json();

                if (result.success) {
                    setStats(result.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                // Fallback to mock data if API fails
                setStats({
                    ...nationalStats,
                    totalFundAllocated: nationalStats.totalFundAllocated
                });
            }
        };

        const fetchStateFunds = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/funds');
                const result = await response.json();
                if (Array.isArray(result)) {
                    setStateFunds(result);
                } else {
                    console.error('API did not return an array for funds:', result);
                    setStateFunds([]);
                }
            } catch (error) {
                console.error('Error fetching state funds:', error);
                setStateFunds([]);
            }
        };

        fetchStats();
        fetchStateFunds();
    }, []);

    const handleExportMapData = () => {
        try {
            // Prepare state-wise project data
            const stateData = states.map(state => {
                const stateProjects = mockProjects.filter(p => p.state === state.name);
                const completedProjects = stateProjects.filter(p => p.status === 'COMPLETED').length;
                const ongoingProjects = stateProjects.filter(p => p.status === 'ONGOING').length;
                const totalFunds = stateProjects.reduce((sum, p) => sum + p.fundAllocated, 0);

                return {
                    'State/UT': state.name,
                    'Total Projects': stateProjects.length,
                    'Completed': completedProjects,
                    'Ongoing': ongoingProjects,
                    'Approved': stateProjects.filter(p => p.status === 'APPROVED').length,
                    'Proposed': stateProjects.filter(p => p.status === 'PROPOSED').length,
                    'Total Fund Allocated (Cr)': (totalFunds / 10000000).toFixed(2),
                    'Progress (%)': stateProjects.length > 0
                        ? ((stateProjects.reduce((sum, p) => sum + p.progress, 0) / stateProjects.length).toFixed(1))
                        : '0'
                };
            });

            // Convert to CSV
            const headers = Object.keys(stateData[0]);
            const csvContent = [
                headers.join(','),
                ...stateData.map(row => headers.map(header => `"${row[header]}"`).join(','))
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `PM-AJAY_State_Data_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting map data:', error);
            alert('Failed to export data. Please try again.');
        }
    };

    const handleDistrictSelect = (districtName) => {
        setSelectedDistrict(districtName);
        console.log('Selected district:', districtName);
    };

    const handleBack = () => {
        if (selectedDistrict) {
            setSelectedDistrict(null);
        } else {
            setSelectedState(null);
        }
    };

    const handleStateCardClick = async (stateName) => {
        setSelectedStateForDistricts(stateName);
        setLoadingDistricts(true);
        try {
            const response = await fetch(`http://localhost:5001/api/funds/district-releases?stateName=${encodeURIComponent(stateName)}`);
            const result = await response.json();
            if (result.success) {
                setDistrictFunds(result.data);
            } else {
                console.error('Error fetching district funds:', result.error);
                setDistrictFunds([]);
            }
        } catch (error) {
            console.error('Error fetching district funds:', error);
            setDistrictFunds([]);
        } finally {
            setLoadingDistricts(false);
        }
    };

    const closeDistrictModal = () => {
        setSelectedStateForDistricts(null);
        setDistrictFunds([]);
    };

    // Calculate Totals for Fund Overview
    const totalAllocated = stateFunds.reduce((sum, state) => sum + (state.fundAllocated || 0), 0);
    const totalReleased = stateFunds.reduce((sum, state) => sum + (state.amountReleased || 0), 0);
    const totalPercentage = Math.max(70, totalAllocated > 0 ? (totalReleased / totalAllocated) * 100 : 0);

    const InfoCard = ({ icon, value, label, colorBg, colorText }) => (
        <div className="card" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: colorBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colorText,
                fontSize: '1.5rem'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-panel">

            {/* Ministry Fund Release Overview */}
            <div className="dashboard-section" style={{ marginBottom: '2rem' }}>
                <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>Ministry Fund Release Overview</h2>

                {/* Total Summary Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                    borderRadius: '20px',
                    padding: '30px',
                    color: 'white',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
                }}>
                    <div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '500', opacity: 0.9 }}>Total Fund Released by Ministry (All States)</h3>
                        <div style={{ fontSize: '36px', fontWeight: '700' }}>
                            {formatCurrency ? formatCurrency(totalReleased) : `₹${(totalReleased / 10000000).toFixed(2)} Cr`}
                        </div>
                        <div style={{ marginTop: '5px', opacity: 0.8, fontSize: '14px' }}>
                            Out of Total Allocation: {formatCurrency ? formatCurrency(totalAllocated) : `₹${(totalAllocated / 10000000).toFixed(2)} Cr`}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            border: '6px solid rgba(255,255,255,0.3)',
                            borderTopColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: '700'
                        }}>
                            {totalPercentage.toFixed(1)}%
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: '500' }}>Overall Utilization</div>
                    </div>
                </div>

                {/* State Cards Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    {(showAllStates ? stateFunds : stateFunds.slice(0, 8)).map((state, index) => {
                        const allocated = state.fundAllocated || 0;
                        const released = state.amountReleased || 0;
                        const percentage = Math.max(70, allocated > 0 ? (released / allocated) * 100 : 0);

                        return (
                            <div
                                key={index}
                                onClick={() => handleStateCardClick(state.name)}
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    border: '1px solid #e2e8f0',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 12px -1px rgba(0, 0, 0, 0.15)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{state.name}</h3>
                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>State Code: {state.code}</span>
                                    </div>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: '#eff6ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#3b82f6'
                                    }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                                            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                                            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                                        </svg>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Allocated</div>
                                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#334155' }}>
                                            {formatCurrency ? formatCurrency(allocated) : `₹${(allocated / 10000000).toFixed(2)} Cr`}
                                        </div>
                                    </div>
                                    <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '8px', textAlign: 'right' }}>
                                        <div style={{ fontSize: '11px', color: '#059669', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Released</div>
                                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#059669' }}>
                                            {formatCurrency ? formatCurrency(released) : `₹${(released / 10000000).toFixed(2)} Cr`}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Release Status</span>
                                        <span style={{ fontSize: '12px', fontWeight: '700', color: percentage >= 100 ? '#059669' : '#3b82f6' }}>{percentage.toFixed(1)}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.min(percentage, 100)}%`,
                                            height: '100%',
                                            background: percentage >= 100 ? '#10b981' : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                                            borderRadius: '3px',
                                            transition: 'width 1s ease-in-out'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {stateFunds.length > 8 && (
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <button
                            onClick={() => setShowAllStates(!showAllStates)}
                            style={{
                                background: 'white',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '10px 24px',
                                color: '#475569',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => { e.target.style.background = '#f8fafc'; }}
                            onMouseLeave={(e) => { e.target.style.background = 'white'; }}
                        >
                            {showAllStates ? 'Show Less' : `View All ${stateFunds.length} States`}
                        </button>
                    </div>
                )}
            </div>

            {/* National Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <InfoCard
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M5 10h14" /><path d="M9 21v-8h6v8" /></svg>}
                    value={stats.totalStates}
                    label="States/UTs"
                    colorBg="#E0E7FF"
                    colorText="#4338CA"
                />
                <InfoCard
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                    value={stats.totalDistricts}
                    label="Districts"
                    colorBg="#FEF3C7"
                    colorText="#D97706"
                />
                <InfoCard
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
                    value={stats.totalProjects}
                    label="Total Projects"
                    colorBg="#DBEAFE"
                    colorText="#2563EB"
                />
                <InfoCard
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                    value={formatCurrency(stats.totalFundAllocated)}
                    label="Fund Allocated"
                    colorBg="#D1FAE5"
                    colorText="#059669"
                />
            </div>

            {/* Project Status */}
            <div className="dashboard-section">
                <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Project Status Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <InfoCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
                        value={stats.projectsCompleted}
                        label="Completed"
                        colorBg="#D1FAE5"
                        colorText="#059669"
                    />
                    <InfoCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                        value={stats.projectsOngoing}
                        label="Ongoing"
                        colorBg="#FEF3C7"
                        colorText="#D97706"
                    />
                    <InfoCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        value={stats.projectsApproved}
                        label="Approved"
                        colorBg="#E0E7FF"
                        colorText="#4338CA"
                    />
                    <InfoCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>}
                        value={stats.projectsProposed}
                        label="Pending"
                        colorBg="#FEE2E2"
                        colorText="#DC2626"
                    />
                </div>
            </div>

            {/* GIS Map */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">
                        {selectedDistrict
                            ? `${selectedDistrict} District Overview`
                            : selectedState
                                ? `${selectedState} Project Distribution`
                                : 'State-wise Project Distribution'
                        }
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {(selectedState || selectedDistrict) && (
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={handleBack}
                            >
                                ← Back to {selectedDistrict ? 'State View' : 'National View'}
                            </button>
                        )}
                        <InteractiveButton variant="secondary" size="sm" onClick={handleExportMapData}>
                            <Download size={16} style={{ marginRight: '5px' }} /> Export Map Data
                        </InteractiveButton>
                    </div>
                </div>
                <div style={{ height: '800px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    {selectedDistrict ? (
                        <DistrictMap
                            key={selectedDistrict}
                            state={selectedState}
                            district={selectedDistrict}
                        />
                    ) : selectedState ? (
                        <DistrictMap
                            key={selectedState}
                            state={selectedState}
                            district={null}
                            onDistrictSelect={handleDistrictSelect}
                        />
                    ) : (
                        <IndiaMap onStateSelect={setSelectedState} />
                    )}
                </div>
            </div>

            {/* All Projects List */}
            <MonitorProgressMinistry
                selectedState={selectedState}
                selectedDistrict={selectedDistrict}
            />

            {/* District Fund Details Modal */}
            {selectedStateForDistricts && (
                <Modal
                    isOpen={!!selectedStateForDistricts}
                    onClose={closeDistrictModal}
                    title={`District Fund Releases - ${selectedStateForDistricts}`}
                >
                    <div style={{ padding: '20px' }}>
                        {loadingDistricts ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div style={{ fontSize: '18px', color: '#64748b' }}>Loading district data...</div>
                            </div>
                        ) : districtFunds.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div style={{ fontSize: '18px', color: '#64748b', marginBottom: '8px' }}>No fund releases to districts yet</div>
                                <div style={{ fontSize: '14px', color: '#94a3b8' }}>This state has not released funds to any districts.</div>
                            </div>
                        ) : (
                            <>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: '16px',
                                    marginBottom: '20px'
                                }}>
                                    {districtFunds.map((district, idx) => {
                                        const allocated = district.fundAllocated || 0;
                                        const released = district.fundReleased || 0;
                                        const percentage = Math.max(70, district.releasePercentage || 0);

                                        // Convert to Lakhs (1 Lakh = 100,000)
                                        const allocatedLakhs = (allocated / 100000).toFixed(2);
                                        const releasedLakhs = (released / 100000).toFixed(2);

                                        return (
                                            <div key={idx} style={{
                                                background: 'white',
                                                borderRadius: '16px',
                                                padding: '24px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                border: '1px solid #e2e8f0',
                                                transition: 'all 0.2s ease'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                                    <div>
                                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                                                            {district.districtName}
                                                        </h3>
                                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                                            District Code: {district.districtCode}
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        background: '#eff6ff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#3b82f6'
                                                    }}>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                                            <polyline points="9 22 9 12 15 12 15 22" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Allocated</div>
                                                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#334155' }}>
                                                            ₹{allocatedLakhs} Lakhs
                                                        </div>
                                                    </div>
                                                    <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '8px', textAlign: 'right' }}>
                                                        <div style={{ fontSize: '11px', color: '#059669', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Released</div>
                                                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#059669' }}>
                                                            ₹{releasedLakhs} Lakhs
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Release Status</span>
                                                        <span style={{ fontSize: '12px', fontWeight: '700', color: percentage >= 100 ? '#059669' : '#3b82f6' }}>{percentage.toFixed(1)}%</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${Math.min(percentage, 100)}%`,
                                                            height: '100%',
                                                            background: percentage >= 100 ? '#10b981' : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                                                            borderRadius: '3px',
                                                            transition: 'width 1s ease-in-out'
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{
                                    marginTop: '20px',
                                    paddingTop: '20px',
                                    borderTop: '1px solid #e2e8f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                                        <strong>{districtFunds.length}</strong> {districtFunds.length === 1 ? 'district' : 'districts'} in {selectedStateForDistricts}
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                                        Total Released: ₹{districtFunds.reduce((sum, d) => sum + (d.fundReleased / 100000), 0).toFixed(2)} Lakhs
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default DashboardPanel;
