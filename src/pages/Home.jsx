import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import ImageSlider from "../components/ImageSlider";
import ComponentsSection from "../components/ComponentsSection";
import StatisticsSection from "../components/StatisticsSection";
import IndiaMap from "../components/maps/IndiaMap";
import DistrictMap from "../components/maps/DistrictMap";
import StatCard from "../components/StatCard";
import PortalFeatures from "../components/PortalFeatures";
import { nationalStats } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";
import "./Home.css";

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

const generateNationalData = () => {
    return {
        name: 'National',
        fundUtilization: {
            utilized: 78,
            total: 100
        },
        projectTrends: {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                { label: 'Completed', values: [25, 35, 42, 48, 55, 65], color: THEME.completed },
                { label: 'Pending', values: [45, 42, 38, 35, 30, 25], color: THEME.pending },
                { label: 'Not Started', values: [30, 23, 20, 17, 15, 10], color: THEME.notStarted }
            ]
        },
        components: {
            'Adarsh Gram': { progress: 82, color: '#7C3AED' },
            'GIA': { progress: 57, color: '#EC4899' },
            'Hostel': { progress: 34, color: '#F59E0B' }
        }
    };
};



const fetchDistrictData = async (stateName, districtName) => {
    // Generate mock data similar to State Dashboard
    console.log('📊 Generating mock data for:', districtName, 'in', stateName);

    // Sample district data for common districts
    const mockDistrictData = {
        'Maharashtra': {
            'Pune': { villages: 25, vdps: 18, adarshGram: 12, fundUtilization: { utilized: 62, total: 100 } },
            'Mumbai': { villages: 0, vdps: 0, adarshGram: 0, fundUtilization: { utilized: 0, total: 100 } },
            'Nagpur': { villages: 32, vdps: 24, adarshGram: 15, fundUtilization: { utilized: 68, total: 100 } },
            'Nashik': { villages: 28, vdps: 20, adarshGram: 14, fundUtilization: { utilized: 58, total: 100 } },
            'Thane': { villages: 18, vdps: 12, adarshGram: 8, fundUtilization: { utilized: 55, total: 100 } }
        },
        'Bihar': {
            'Muzaffarpur': { villages: 35, vdps: 28, adarshGram: 20, fundUtilization: { utilized: 72, total: 100 } },
            'Patna': { villages: 30, vdps: 25, adarshGram: 18, fundUtilization: { utilized: 65, total: 100 } },
            'Gaya': { villages: 28, vdps: 22, adarshGram: 16, fundUtilization: { utilized: 60, total: 100 } }
        },
        'Gujarat': {
            'Ahmedabad': { villages: 30, vdps: 24, adarshGram: 18, fundUtilization: { utilized: 70, total: 100 } },
            'Surat': { villages: 25, vdps: 20, adarshGram: 15, fundUtilization: { utilized: 65, total: 100 } },
            'Vadodara': { villages: 22, vdps: 18, adarshGram: 13, fundUtilization: { utilized: 62, total: 100 } }
        }
    };

    // Get district-specific data or generate random
    const stateDistricts = mockDistrictData[stateName];
    const districtInfo = stateDistricts?.[districtName]
        ? stateDistricts[districtName]
        : {
            villages: Math.floor(Math.random() * 30) + 10,
            vdps: Math.floor(Math.random() * 20) + 5,
            fundUtilization: {
                utilized: Math.floor(Math.random() * 40) + 40,
                total: 100
            }
        };

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
            'Adarsh Gram': {
                progress: districtInfo.vdps && districtInfo.villages
                    ? Math.floor((districtInfo.vdps / districtInfo.villages) * 100)
                    : Math.floor(Math.random() * 30) + 60,
                color: '#7C3AED'
            },
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

    const percentage = data.total > 0 ? (data.utilized / data.total) * 100 : 0;
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

const Home = () => {
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [stateData, setStateData] = useState(generateNationalData());
    const [selectedComponent, setSelectedComponent] = useState('All Components');
    const [showComponentDropdown, setShowComponentDropdown] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Fetch district admin's district and state info on mount
    useEffect(() => {
        const fetchDistrictAdminInfo = async () => {
            if (user?.id) {
                try {
                    // Get user profile including role, district_id, and state_id
                    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

                    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=role,district_id,state_id`, {
                        headers: {
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`
                        }
                    });
                    const profileData = await profileResponse.json();

                    console.log('Profile data:', profileData);

                    // If user is a district admin, fetch their district info
                    if (profileData[0]?.role === 'district_admin' && profileData[0]?.district_id) {
                        const districtId = profileData[0].district_id;
                        const stateId = profileData[0].state_id;

                        // Fetch district name
                        const districtResponse = await fetch(`${supabaseUrl}/rest/v1/districts?id=eq.${districtId}&select=name`, {
                            headers: {
                                'apikey': supabaseKey,
                                'Authorization': `Bearer ${supabaseKey}`
                            }
                        });
                        const districtData = await districtResponse.json();

                        console.log('District data:', districtData);

                        if (districtData && districtData.length > 0) {
                            const districtName = districtData[0].name;

                            // Fetch state name if state_id is available
                            if (stateId) {
                                const stateResponse = await fetch(`${supabaseUrl}/rest/v1/states?id=eq.${stateId}&select=name`, {
                                    headers: {
                                        'apikey': supabaseKey,
                                        'Authorization': `Bearer ${supabaseKey}`
                                    }
                                });
                                const stateData = await stateResponse.json();

                                console.log('State data:', stateData);

                                if (stateData && stateData.length > 0) {
                                    const stateName = stateData[0].name;
                                    console.log('Setting state and district:', stateName, districtName);
                                    setSelectedState(stateName);
                                    setSelectedDistrict(districtName);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching district admin info:', error);
                }
            }
        };

        fetchDistrictAdminInfo();
    }, [user?.id]);

    useEffect(() => {
        const loadData = async () => {
            if (selectedDistrict && selectedState) {
                const data = await fetchDistrictData(selectedState, selectedDistrict);
                setStateData(data);
            } else if (selectedState) {
                setStateData(generateStateData(selectedState));
            } else {
                setStateData(generateNationalData());
                setSelectedDistrict(null);
            }
        };

        loadData();
    }, [selectedState, selectedDistrict]);

    const handleStateSelect = (stateName) => {
        setSelectedState(stateName);
    };

    const handleDistrictSelect = (districtName) => {
        setSelectedDistrict(districtName);
    };

    const handleBack = () => {
        if (selectedDistrict) {
            setSelectedDistrict(null);
        } else {
            setSelectedState(null);
        }
    };

    const formatCurrency = (amount) => {
        return `₹${(amount / 10000000000).toFixed(2)} Cr`;
    };

    const openGuidelinesPDF = () => {
        window.open("https://pmajay.dosje.gov.in/Writereaddata/Guidelines.pdf", "_blank");
    };

    return (
        <div className="page-wrapper">
            <ImageSlider />

            <div className="page-content">
                <ComponentsSection
                    onAdarshGramClick={() => navigate("/adarsh-gram")}
                    onGIAclick={openGuidelinesPDF}
                    onHostelClick={openGuidelinesPDF}
                />

                <StatisticsSection />

                <div style={{ paddingTop: "60px", backgroundColor: "white" }}>
                    <div className="container">
                        <div className="dashboard-section home-national-overview">
                            <div className="section-header">
                                <h2 className="section-title">National Overview</h2>
                            </div>

                            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                <StatCard icon="🏛️" value={nationalStats.totalStates} label="States/UTs" />
                                <StatCard icon="🏘️" value={nationalStats.totalDistricts} label="Districts" />
                                <StatCard icon="📊" value={nationalStats.totalProjects} label="Total Projects" trend="positive" trendValue="+12% this year" />
                                <StatCard icon="💰" value={formatCurrency(nationalStats.totalFundAllocated)} label="Fund Allocated" />
                                <StatCard icon="✅" value={nationalStats.projectsCompleted} label="Completed Projects" trend="positive" trendValue="+8% this month" />
                                <StatCard icon="🚧" value={nationalStats.projectsOngoing} label="Ongoing Projects" />
                            </div>
                        </div>

                        <div className="dashboard-section">
                            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 className="section-title">
                                        {selectedDistrict ? `${selectedDistrict} District` : selectedState ? `${selectedState} Overview` : 'Interactive State Map'}
                                    </h2>
                                    <p className="section-subtitle">
                                        {selectedDistrict ? `Viewing ${selectedDistrict}` : selectedState ? `Select district or view trends` : 'Click on any state to view details'}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div className="card" style={{ padding: '0', minHeight: '700px', overflow: 'hidden', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
                                        {/* Back button positioned top right of map */}
                                        {(selectedState || selectedDistrict) && (
                                            <button
                                                className="btn"
                                                onClick={handleBack}
                                                style={{
                                                    position: 'absolute',
                                                    top: '20px',
                                                    right: '20px',
                                                    zIndex: 1000,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    backgroundColor: 'white',
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    border: '1px solid #E5E7EB',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                    color: '#374151'
                                                }}
                                            >
                                                <span>←</span> Back to {selectedDistrict ? 'State' : 'National'}
                                            </button>
                                        )}

                                        {selectedState ? (
                                            selectedDistrict ? (
                                                <DistrictMap key={selectedDistrict} state={selectedState} district={selectedDistrict} />
                                            ) : (
                                                <DistrictMap key={selectedState} state={selectedState} district={null} onDistrictSelect={handleDistrictSelect} />
                                            )
                                        ) : (
                                            <IndiaMap onStateSelect={handleStateSelect} />
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* All Components Dropdown - Top Right */}
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
                                                <h4 style={{ fontSize: '14px', color: THEME.text, marginBottom: '4px' }}>No State Selected</h4>
                                                <p style={{ fontSize: '12px', color: '#6B7280' }}>Click a state to view fund utilization</p>
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
                                                <h4 style={{ fontSize: '14px', color: THEME.text, marginBottom: '4px' }}>No State Selected</h4>
                                                <p style={{ fontSize: '12px', color: '#6B7280' }}>Click a state to view progress</p>
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
                                                <h4 style={{ fontSize: '14px', color: THEME.text, marginBottom: '4px' }}>No State Selected</h4>
                                                <p style={{ fontSize: '12px', color: '#6B7280' }}>Click a state to view trends</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container" style={{ marginTop: "4rem", marginBottom: "4rem" }}>
                    <PortalFeatures />
                </div>
            </div >

            <Footer />
        </div >
    );
};

export default Home;
