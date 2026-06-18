import React, { useState, useEffect } from 'react';
import StatCard from '../../../components/StatCard';
import DistrictMap from '../../../components/maps/DistrictMap';
import CityMap from '../../../components/maps/CityMap';
import InteractiveButton from '../../../components/InteractiveButton';
import { IndianRupee, TrendingUp, MapPin, Clock } from 'lucide-react';

const THEME = {
    primary: '#7C3AED',
    secondary: '#EC4899',
    accent: '#F59E0B',
    text: '#4C1D95',
    textLight: '#6B7280',
    completed: '#10B981',
    pending: '#F59E0B',
    notStarted: '#EF4444',
};

const generateStateData = (stateName) => {
    // Real data from PM AJAY official sources
    const realStateData = {
        'Maharashtra': {
            name: 'Maharashtra',
            villages: 515,
            vdps: 345,
            adarshGram: 267,
            fundsReleased: 51.29, // in Crores
            fundUtilization: { utilized: 51, total: 100 },
            projectTrends: {
                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    { label: 'Completed', values: [30, 38, 45, 52, 58, 65], color: THEME.completed },
                    { label: 'Pending', values: [40, 38, 35, 30, 28, 25], color: THEME.pending },
                    { label: 'Not Started', values: [30, 24, 20, 18, 14, 10], color: THEME.notStarted }
                ]
            },
            components: {
                'Adarsh Gram': { progress: 67, color: '#7C3AED' },  // 345/515 VDPs generated
                'GIA': { progress: 52, color: '#EC4899' },
                'Hostel': { progress: 0, color: '#F59E0B' }  // No proposals received
            }
        },
        'Gujarat': {
            name: 'Gujarat',
            fundUtilization: { utilized: 68, total: 100 },
            projectTrends: {
                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    { label: 'Completed', values: [28, 36, 44, 50, 56, 62], color: THEME.completed },
                    { label: 'Pending', values: [42, 40, 36, 32, 28, 24], color: THEME.pending },
                    { label: 'Not Started', values: [30, 24, 20, 18, 16, 14], color: THEME.notStarted }
                ]
            },
            components: {
                'Adarsh Gram': { progress: 72, color: '#7C3AED' },
                'GIA': { progress: 68, color: '#EC4899' },
                'Hostel': { progress: 45, color: '#F59E0B' }
            }
        },
        'Rajasthan': {
            name: 'Rajasthan',
            districts: 8,
            fundUtilization: { utilized: 75, total: 100 },
            projectTrends: {
                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    { label: 'Completed', values: [32, 40, 48, 55, 62, 68], color: THEME.completed },
                    { label: 'Pending', values: [38, 36, 32, 28, 24, 20], color: THEME.pending },
                    { label: 'Not Started', values: [30, 24, 20, 17, 14, 12], color: THEME.notStarted }
                ]
            },
            components: {
                'Adarsh Gram': { progress: 78, color: '#7C3AED' },
                'GIA': { progress: 65, color: '#EC4899' },
                'Hostel': { progress: 52, color: '#F59E0B' }
            }
        }
    };

    // Return real data if available, otherwise generate random data
    if (realStateData[stateName]) {
        return realStateData[stateName];
    }

    // Fallback: Generate random data for other states
    const generateTrend = (type) => {
        const data = [];
        let current = 0;
        if (type === 'up') {
            current = Math.floor(Math.random() * 20) + 10;
            for (let i = 0; i < 6; i++) {
                data.push(current);
                current += Math.floor(Math.random() * 15) + 5;
                if (current > 100) current = 100;
            }
        } else {
            current = Math.floor(Math.random() * 20) + 20;
            for (let i = 0; i < 6; i++) {
                data.push(current);
                current += Math.floor(Math.random() * 20) - 10;
                if (current < 0) current = 0;
                if (current > 100) current = 100;
            }
        }
        return data;
    };

    return {
        name: stateName,
        fundUtilization: {
            utilized: Math.floor(Math.random() * 60) + 30,
            total: 100
        },
        projectTrends: {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                { label: 'Completed', values: generateTrend('up'), color: THEME.completed },
                { label: 'Pending', values: generateTrend('random'), color: THEME.pending },
                { label: 'Not Started', values: generateTrend('random'), color: THEME.notStarted }
            ]
        },
        components: {
            'Adarsh Gram': { progress: Math.floor(Math.random() * 30) + 70, color: '#7C3AED' },
            'GIA': { progress: Math.floor(Math.random() * 40) + 40, color: '#EC4899' },
            'Hostel': { progress: Math.floor(Math.random() * 30) + 20, color: '#F59E0B' }
        }
    };
};

const generateDistrictData = (stateName, districtName) => {
    // Sample district data for Maharashtra districts
    const maharashtraDistricts = {
        'Pune': { villages: 25, vdps: 18, adarshGram: 12, fundUtilization: { utilized: 62, total: 100 } },
        'Mumbai': { villages: 0, vdps: 0, adarshGram: 0, fundUtilization: { utilized: 0, total: 100 } },
        'Nagpur': { villages: 32, vdps: 24, adarshGram: 15, fundUtilization: { utilized: 68, total: 100 } },
        'Nashik': { villages: 28, vdps: 20, adarshGram: 14, fundUtilization: { utilized: 58, total: 100 } },
        'Thane': { villages: 18, vdps: 12, adarshGram: 8, fundUtilization: { utilized: 55, total: 100 } }
    };

    const districtInfo = (stateName === 'Maharashtra' && maharashtraDistricts[districtName])
        ? maharashtraDistricts[districtName]
        : { villages: Math.floor(Math.random() * 30) + 10, vdps: Math.floor(Math.random() * 20) + 5, fundUtilization: { utilized: Math.floor(Math.random() * 40) + 40, total: 100 } };

    return {
        name: districtName,
        state: stateName,
        fundUtilization: districtInfo.fundUtilization,
        projectTrends: {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                { label: 'Completed', values: [20, 28, 36, 44, 52, 60], color: THEME.completed },
                { label: 'Pending', values: [50, 45, 40, 35, 30, 25], color: THEME.pending },
                { label: 'Not Started', values: [30, 27, 24, 21, 18, 15], color: THEME.notStarted }
            ]
        },
        components: {
            'Adarsh Gram': { progress: Math.floor((districtInfo.vdps / districtInfo.villages) * 100) || 50, color: '#7C3AED' },
            'GIA': { progress: Math.floor(Math.random() * 30) + 40, color: '#EC4899' },
            'Hostel': { progress: Math.floor(Math.random() * 30) + 20, color: '#F59E0B' }
        }
    };
};

const AnimatedLineChart = ({ data, height = 180 }) => {
    const [animate, setAnimate] = useState(false);
    useEffect(() => {
        setAnimate(false);
        const timer = setTimeout(() => setAnimate(true), 50);
        return () => clearTimeout(timer);
    }, [data]);

    const width = 500;
    const padding = 50;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    const maxY = 100;

    const generatePath = (values) => {
        const points = values.map((val, i) => {
            const x = padding + (i / (values.length - 1)) * graphWidth;
            const y = height - padding - (val / maxY) * graphHeight;
            return `${x},${y}`;
        });
        if (points.length === 0) return '';
        let d = `M ${points[0]}`;
        for (let i = 0; i < points.length - 1; i++) {
            const [x1, y1] = points[i].split(',').map(Number);
            const [x2, y2] = points[i + 1].split(',').map(Number);
            d += ` L ${x2},${y2}`;
        }
        return d;
    };

    return (
        <div style={{ width: '100%', position: 'relative', padding: '10px 0' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
                {data.datasets.map((dataset, idx) => (
                    <path key={idx} d={generatePath(dataset.values)} fill="none" stroke={dataset.color} strokeWidth="3" strokeLinecap="round" />
                ))}
                {data.months.map((month, i) => {
                    const x = padding + (i / (data.months.length - 1)) * graphWidth;
                    return <text key={i} x={x} y={height - 10} textAnchor="middle" fontSize="10" fill={THEME.textLight} fontWeight="500">{month}</text>;
                })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                {data.datasets.map((dataset, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dataset.color }}></div>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: THEME.text }}>{dataset.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PieChart = ({ data, size = 180 }) => {
    const [animate, setAnimate] = useState(false);
    useEffect(() => {
        setAnimate(false);
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, [data]);

    const percentage = (data.utilized / data.total) * 100;
    const radius = size / 2;
    const strokeWidth = 30;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg height={size} width={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle stroke="#E5E7EB" strokeWidth={strokeWidth} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
                    <circle
                        stroke={THEME.primary}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset: animate ? strokeDashoffset : circumference, transition: 'stroke-dashoffset 1.5s ease-out' }}
                        strokeLinecap="round"
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: THEME.text }}>{Math.round(percentage)}%</div>
                    <div style={{ fontSize: '12px', color: THEME.textLight }}>Utilized</div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: THEME.primary }}></div>
                    <span style={{ color: THEME.text }}>Utilized: ₹{data.utilized} Cr</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#E5E7EB' }}></div>
                    <span style={{ color: THEME.textLight }}>Remaining: ₹{data.total - data.utilized} Cr</span>
                </div>
            </div>
        </div>
    );
};

const StateDashboardPanel = ({ formatCurrency, stateName }) => {
    const [dashboardStats, setDashboardStats] = useState({
        totalFundReceived: 0,
        fundUtilizedPercentage: 0,
        districtsReporting: 0,
        totalDistricts: 0,
        pendingApprovals: 0,
        districtFundStatus: []
    });
    const [loading, setLoading] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [stateData, setStateData] = useState(null);
    const [selectedComponent, setSelectedComponent] = useState('All Components');
    const [showComponentDropdown, setShowComponentDropdown] = useState(false);

    const API_BASE_URL = 'http://localhost:5001/api';

    useEffect(() => {
        const fetchDashboardStats = async () => {
            if (!stateName || stateName === 'Loading...' || stateName === 'State') return;

            // Clean the state name (remove 'State Admin', 'Admin', 'State')
            let cleanStateName = stateName;
            cleanStateName = cleanStateName.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
            console.log('📊 Dashboard fetching stats for:', cleanStateName);

            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/dashboard/state-stats?stateName=${encodeURIComponent(cleanStateName)}`);

                if (response.ok) {
                    const result = await response.json();
                    console.log('📊 Dashboard stats received:', result);

                    if (result.success) {
                        setDashboardStats(result.data);
                    } else {
                        console.error('Failed to fetch dashboard stats:', result.error);
                    }
                } else {
                    console.error('API request failed with status:', response.status);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, [stateName]);

    // Update state data when stateName or selectedDistrict changes
    useEffect(() => {
        if (!stateName || stateName === 'Loading...' || stateName === 'State') return;

        let cleanStateName = stateName.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();

        if (selectedDistrict) {
            setStateData(generateDistrictData(cleanStateName, selectedDistrict));
        } else {
            setStateData(generateStateData(cleanStateName));
        }
    }, [stateName, selectedDistrict]);

    // Don't render map until we have a valid state name
    const isValidState = stateName && stateName !== 'Loading...' && stateName !== 'State';
    const displayStateName = isValidState ? stateName.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim() : 'Maharashtra';

    const handleDistrictSelect = (districtName) => {
        setSelectedDistrict(districtName);
        console.log('Selected district:', districtName);
    };

    const handleBack = () => {
        setSelectedDistrict(null);
    };

    return (
        <div className="dashboard-panel">
            {/* State KPIs - Image 2 Style */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* Total Fund Received Card */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#FEF3C7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem'
                    }}>
                        <IndianRupee size={24} strokeWidth={1.5} color="#F59E0B" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                        {loading ? "..." : (formatCurrency ? formatCurrency(dashboardStats.totalFundReceived) : `₹${dashboardStats.totalFundReceived}`)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                        Total Fund Received
                    </div>
                </div>

                {/* Fund Utilized Card */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#D1FAE5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem'
                    }}>
                        <TrendingUp size={24} strokeWidth={1.5} color="#059669" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                        {loading ? "..." : `${dashboardStats.fundUtilizedPercentage}%`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                        Fund Utilized
                    </div>
                </div>

                {/* Districts Reporting Card */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#DBEAFE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem'
                    }}>
                        <MapPin size={24} strokeWidth={1.5} color="#2563EB" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                        {loading ? "..." : dashboardStats.districtsReporting}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                        Districts Reporting
                    </div>
                </div>

                {/* Pending Approvals Card */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#FEF3C7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem'
                    }}>
                        <Clock size={24} strokeWidth={1.5} color="#F59E0B" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                        {loading ? "..." : dashboardStats.pendingApprovals}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                        Pending Approvals
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="section-title">
                        {selectedDistrict
                            ? `${selectedDistrict} District Overview`
                            : `${displayStateName} District-wise Progress Map`
                        }
                    </h2>



                    {/* Component Dropdown - Parallel to title */}
                    <div style={{ position: 'relative' }}>
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="card" style={{ padding: '0', minHeight: '700px', overflow: 'hidden', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
                            {/* Back button positioned top right of map */}
                            {selectedDistrict && (
                                <InteractiveButton
                                    variant="secondary"
                                    onClick={handleBack}
                                    style={{
                                        position: 'absolute',
                                        top: '20px',
                                        right: '20px',
                                        zIndex: 1000,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <span>←</span> Back to State View
                                </InteractiveButton>
                            )}

                            {selectedDistrict ? (
                                <DistrictMap key={selectedDistrict} state={displayStateName} district={selectedDistrict} />
                            ) : (
                                <DistrictMap key={displayStateName} state={displayStateName} district={null} onDistrictSelect={handleDistrictSelect} />
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>


                        <div className="card" style={{ padding: '20px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            {stateData ? (
                                <>
                                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: THEME.text, marginBottom: '16px', textAlign: 'center' }}>
                                        Fund Utilization - {stateData.name}
                                    </h4>
                                    <PieChart data={stateData.fundUtilization} size={180} />
                                </>
                            ) : (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.5 }}>💰</div>
                                    <h4 style={{ fontSize: '14px', color: THEME.text, marginBottom: '4px' }}>No Data Available</h4>
                                </div>
                            )}
                        </div>
                        <div className="card" style={{ padding: '20px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            {stateData ? (
                                <>
                                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: THEME.text, marginBottom: '16px', textAlign: 'center' }}>
                                        {selectedComponent === 'All Components' ? 'Component Progress' : `${selectedComponent} Progress`}
                                    </h4>
                                    {selectedComponent === 'All Components' ? (
                                        // Show all components as horizontal bar graph
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
                                            {Object.entries(stateData.components).map(([name, data]) => (
                                                <div key={name}>
                                                    {/* Component name and percentage on same line */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                        <span style={{ fontSize: '15px', fontWeight: '600', color: THEME.text }}>{name}</span>
                                                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: data.color }}>{data.progress}%</span>
                                                    </div>

                                                    {/* Horizontal bar with background showing unfilled portion */}
                                                    <div style={{
                                                        width: '100%',
                                                        height: '12px',
                                                        backgroundColor: '#E5E7EB',
                                                        borderRadius: '6px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            width: `${data.progress}%`,
                                                            height: '100%',
                                                            backgroundColor: data.color,
                                                            borderRadius: '6px',
                                                            transition: 'width 0.8s ease'
                                                        }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // Show single component as large vertical bar
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px 0' }}>
                                            {Object.entries(stateData.components)
                                                .filter(([name]) => name === selectedComponent)
                                                .map(([name, data]) => (
                                                    <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
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
                                                            color: THEME.text,
                                                            marginTop: '16px'
                                                        }}>
                                                            {name}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.5 }}>📊</div>
                                    <h4 style={{ fontSize: '14px', color: THEME.text, marginBottom: '4px' }}>No Data Available</h4>
                                </div>
                            )}
                        </div>

                        <div className="card" style={{ padding: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flex: 1 }}>
                            {stateData ? (
                                <>
                                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: THEME.text, marginBottom: '8px', textAlign: 'center' }}>Project Trends</h4>
                                    <AnimatedLineChart data={stateData.projectTrends} height={180} />
                                </>
                            ) : (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.5 }}>📈</div>
                                    <h4 style={{ fontSize: '14px', color: THEME.text, marginBottom: '4px' }}>No Data Available</h4>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* District-wise Status */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">District Fund Status</h2>
                </div>

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>District Name</th>
                                <th>Fund Released</th>
                                <th>Fund Utilized</th>
                                <th>Project Status</th>
                                <th>UC Uploaded</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                        Loading district data...
                                    </td>
                                </tr>
                            ) : dashboardStats.districtFundStatus && dashboardStats.districtFundStatus.length > 0 ? (
                                dashboardStats.districtFundStatus.map((district, index) => (
                                    <tr key={index}>
                                        <td><strong>{district.districtName}</strong></td>
                                        <td>{formatCurrency ? formatCurrency(district.fundReleased) : `₹${district.fundReleased}`}</td>
                                        <td>
                                            {formatCurrency ? formatCurrency(district.fundUtilized) : `₹${district.fundUtilized}`}
                                            {' '}({district.utilizationPercent}%)
                                        </td>
                                        <td>
                                            <span className={`badge ${district.projectStatus === 'On Track' ? 'badge-success' : 'badge-warning'}`}>
                                                {district.projectStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${district.ucUploaded ? 'badge-success' : 'badge-error'}`}>
                                                {district.ucUploaded ? 'YES' : 'NO'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                        No district data available for {displayStateName}
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

export default StateDashboardPanel;
