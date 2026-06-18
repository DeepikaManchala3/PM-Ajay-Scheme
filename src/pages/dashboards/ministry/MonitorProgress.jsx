import React, { useState, useEffect } from 'react';
import IndiaMap from '../../../components/maps/IndiaMap';
import DistrictMap from '../../../components/maps/DistrictMap';
import MonitorProgressMinistry from './MonitorProgressMinistry';

const THEME = {
    primary: '#7C3AED',
    secondary: '#EC4899',
    accent: '#F59E0B',
    background: '#F5F3FF',
    text: '#4C1D95',
    textLight: '#6B7280',
    white: '#FFFFFF',
    grid: '#E5E7EB',
    completed: '#10B981',
    pending: '#F59E0B',
    notStarted: '#EF4444',
};

const generateStateData = (stateName) => {
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
        } else if (type === 'down') {
            current = Math.floor(Math.random() * 30) + 60;
            for (let i = 0; i < 6; i++) {
                data.push(current);
                current -= Math.floor(Math.random() * 15) + 5;
                if (current < 0) current = 0;
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
            total: 100,
        },
        projectTrends: {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                { label: 'Completed', values: generateTrend('up'), color: THEME.completed },
                { label: 'Pending', values: generateTrend('random'), color: THEME.pending },
                { label: 'Not Started', values: generateTrend('down'), color: THEME.notStarted },
            ],
        },
        components: {
            'Adarsh Gram': { progress: Math.floor(Math.random() * 30) + 70, color: '#7C3AED' },
            GIA: { progress: Math.floor(Math.random() * 40) + 40, color: '#EC4899' },
            Hostel: { progress: Math.floor(Math.random() * 30) + 20, color: '#F59E0B' },
        },
    };
};

const generateDistrictData = (stateName, districtName) => {
    console.log('📊 Generating district data for:', districtName, 'in', stateName);

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


const generateNationalOverview = (component) => {
    const baseValue =
        component === 'All Components'
            ? 78
            : component === 'Adarsh Gram'
                ? 85
                : component === 'GIA'
                    ? 72
                    : component === 'Hostel'
                        ? 65
                        : 78;

    return {
        utilization: baseValue,
        completed:
            component === 'All Components'
                ? 65
                : component === 'Adarsh Gram'
                    ? 75
                    : component === 'GIA'
                        ? 60
                        : component === 'Hostel'
                            ? 55
                            : 65,
        beneficiaries:
            component === 'All Components'
                ? '1.2M'
                : component === 'Adarsh Gram'
                    ? '450K'
                    : component === 'GIA'
                        ? '520K'
                        : component === 'Hostel'
                            ? '230K'
                            : '1.2M',
    };
};

const AnimatedLineChart = ({ data, height = 200 }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(false);
        const timer = setTimeout(() => setAnimate(true), 50);
        return () => clearTimeout(timer);
    }, [data]);

    const width = 500;
    const padding = 40;
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
            const [x0, y0] = points[Math.max(i - 1, 0)].split(',').map(Number);
            const [x1, y1] = points[i].split(',').map(Number);
            const [x2, y2] = points[i + 1].split(',').map(Number);
            const [x3, y3] = points[Math.min(i + 2, points.length - 1)].split(',').map(Number);

            const cp1x = x1 + (x2 - x0) / 6;
            const cp1y = y1 + (y2 - y0) / 6;
            const cp2x = x2 - (x3 - x1) / 6;
            const cp2y = y2 - (y3 - y1) / 6;

            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
        }
        return d;
    };

    return (
        <div style={{ width: '100%', position: 'relative', padding: '5px 0' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                {[0, 25, 50, 75, 100].map((tick, i) => {
                    const y = height - padding - (tick / maxY) * graphHeight;
                    return (
                        <g key={i}>
                            <line
                                x1={padding}
                                y1={y}
                                x2={width - padding}
                                y2={y}
                                stroke={THEME.grid}
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                            <text
                                x={padding - 10}
                                y={y + 4}
                                textAnchor="end"
                                fontSize="10"
                                fill={THEME.textLight}
                            >
                                {tick}%
                            </text>
                        </g>
                    );
                })}

                {data.datasets.map((dataset, idx) => {
                    const pathD = generatePath(dataset.values);
                    const pathLength = 1500;

                    return (
                        <g key={idx}>
                            <path
                                d={pathD}
                                fill="none"
                                stroke={dataset.color}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray={pathLength}
                                strokeDashoffset={animate ? 0 : pathLength}
                                style={{
                                    transition: 'stroke-dashoffset 1.5s ease-out',
                                    opacity: hoveredIndex === null || hoveredIndex === idx ? 1 : 0.3,
                                }}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        </g>
                    );
                })}

                {data.datasets.map((dataset, idx) => (
                    <g
                        key={`points-${idx}`}
                        style={{ opacity: hoveredIndex === null || hoveredIndex === idx ? 1 : 0.1 }}
                    >
                        {dataset.values.map((val, i) => {
                            const x = padding + (i / (dataset.values.length - 1)) * graphWidth;
                            const y = height - padding - (val / maxY) * graphHeight;
                            return (
                                <g key={i}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={animate ? 4 : 0}
                                        fill="white"
                                        stroke={dataset.color}
                                        strokeWidth="2"
                                        style={{
                                            transition:
                                                'r 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.2s',
                                        }}
                                    />
                                </g>
                            );
                        })}
                    </g>
                ))}

                {data.months.map((month, i) => {
                    const x = padding + (i / (data.months.length - 1)) * graphWidth;
                    return (
                        <text
                            key={i}
                            x={x}
                            y={height - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fill={THEME.textLight}
                            fontWeight="500"
                        >
                            {month}
                        </text>
                    );
                })}
            </svg>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    marginTop: '4px',
                    flexWrap: 'wrap',
                }}
            >
                {data.datasets.map((dataset, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            opacity: hoveredIndex === null || hoveredIndex === idx ? 1 : 0.4,
                            transition: 'opacity 0.3s',
                        }}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: dataset.color,
                            }}
                        ></div>
                        <span
                            style={{
                                fontSize: '10px',
                                fontWeight: '500',
                                color: THEME.text,
                            }}
                        >
                            {dataset.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PieChart = ({ data, size = 160 }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(false);
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, [data]);

    const percentage = (data.utilized / data.total) * 100;
    const radius = size / 2;
    const strokeWidth = 20;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg height={size} width={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        stroke="#E5E7EB"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke={THEME.primary}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{
                            strokeDashoffset: animate ? strokeDashoffset : circumference,
                            transition: 'stroke-dashoffset 1.5s ease-out',
                        }}
                        strokeLinecap="round"
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: THEME.text,
                        }}
                    >
                        {Math.round(percentage)}%
                    </div>
                    <div style={{ fontSize: '11px', color: THEME.textLight }}>Utilized</div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: THEME.primary,
                        }}
                    ></div>
                    <span style={{ color: THEME.text }}>Utilized: ₹{data.utilized} Cr</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: '#E5E7EB',
                        }}
                    ></div>
                    <span style={{ color: THEME.textLight }}>
                        Remaining: ₹{data.total - data.utilized} Cr
                    </span>
                </div>
            </div>
        </div>
    );
};

const ComponentProgressChart = ({ component, progress }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(false);
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, [component, progress]);

    const maxValue = 100;
    const chartHeight = 150;
    const barHeight = (progress / maxValue) * (chartHeight - 40);

    const color =
        component === 'Adarsh Gram'
            ? '#7C3AED'
            : component === 'GIA'
                ? '#EC4899'
                : '#F59E0B';

    return (
        <div style={{ padding: '16px' }}>
            <h4
                style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: THEME.text,
                    marginBottom: '12px',
                    textAlign: 'center',
                }}
            >
                {component} Progress
            </h4>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    height: chartHeight,
                }}
            >
                <div
                    style={{
                        width: '60%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: animate ? `${barHeight}px` : '0px',
                            backgroundColor: color,
                            borderRadius: '6px 6px 0 0',
                            transition: 'height 1s ease-out',
                            position: 'relative',
                            boxShadow: `0 4px 12px ${color}40`,
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: color,
                                opacity: animate ? 1 : 0,
                                transition: 'opacity 0.5s ease 1s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {progress}%
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: THEME.text,
                            }}
                        >
                            {component}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MonitorProgress = () => {
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedComponent, setSelectedComponent] = useState('All Components');
    const [stateData, setStateData] = useState(null);
    const [nationalOverview, setNationalOverview] = useState({
        utilization: 0,
        completed: 0,
        beneficiaries: '0'
    });
    const [loading, setLoading] = useState(false);

    // Fetch national overview from API
    useEffect(() => {
        const fetchNationalOverview = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `http://localhost:5001/api/monitor/national-overview?component=${selectedComponent}`
                );
                const result = await response.json();

                if (result.success) {
                    setNationalOverview(result.data);
                } else {
                    // Fallback to mock data if API fails
                    setNationalOverview(generateNationalOverview(selectedComponent));
                }
            } catch (error) {
                console.error('Error fetching national overview:', error);
                // Fallback to mock data
                setNationalOverview(generateNationalOverview(selectedComponent));
            } finally {
                setLoading(false);
            }
        };

        fetchNationalOverview();
    }, [selectedComponent]);

    // Fetch state data from API
    useEffect(() => {
        const fetchStateData = async () => {
            if (!selectedState) {
                setStateData(null);
                setSelectedDistrict(null);
                return;
            }

            if (selectedDistrict) {
                setStateData(generateDistrictData(selectedState, selectedDistrict));
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(
                    `http://localhost:5001/api/monitor/state/${selectedState}`
                );
                const result = await response.json();

                if (result.success) {
                    // Transform API data to match expected format
                    const transformedData = {
                        name: result.data.name,
                        fundUtilization: result.data.fundUtilization,
                        components: result.data.components,
                        projectTrends: {
                            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                            datasets: [
                                {
                                    label: 'Completed',
                                    values: [10, 20, 30, 40, 50, result.data.completedProposals || 0],
                                    color: THEME.completed
                                },
                                {
                                    label: 'Pending',
                                    values: [30, 35, 40, 35, 30, (result.data.totalProposals - result.data.completedProposals) || 0],
                                    color: THEME.pending
                                },
                                {
                                    label: 'Not Started',
                                    values: [60, 45, 30, 25, 20, 15],
                                    color: THEME.notStarted
                                },
                            ],
                        }
                    };
                    setStateData(transformedData);
                } else {
                    // Fallback to mock data
                    setStateData(generateStateData(selectedState));
                }
            } catch (error) {
                console.error('Error fetching state data:', error);
                // Fallback to mock data
                setStateData(generateStateData(selectedState));
            } finally {
                setLoading(false);
            }
        };

        fetchStateData();
        fetchStateData();
    }, [selectedState, selectedDistrict]);

    const handleComponentChange = (e) => {
        setSelectedComponent(e.target.value);
    };

    const InfoCard = ({ icon, value, label, colorBg, colorText }) => (
        <div
            className="card"
            style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
            }}
        >
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: colorBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colorText,
                    fontSize: '1.5rem',
                }}
            >
                {icon}
            </div>
            <div>
                <div
                    style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)',
                        lineHeight: 1,
                    }}
                >
                    {value}
                </div>
                <div
                    style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        fontWeight: '600',
                        marginTop: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}
                >
                    {label}
                </div>
            </div>
        </div>
    );

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

    return (
        <div className="dashboard-panel" style={{ backgroundColor: '#FFFFFF' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                }}
            >
                <h2 className="section-title" style={{ margin: 0 }}>
                    Monitor Progress
                </h2>

                <div style={{ position: 'relative' }}>
                    <select
                        className="form-select"
                        value={selectedComponent}
                        onChange={handleComponentChange}
                        style={{
                            appearance: 'none',
                            padding: '8px 36px 8px 16px',
                            borderRadius: '50px',
                            border: `1px solid ${THEME.primary}`,
                            backgroundColor: 'white',
                            color: THEME.text,
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px -1px rgba(124, 58, 237, 0.1)',
                            outline: 'none',
                            backgroundImage: 'none',
                            minWidth: '160px',
                            fontSize: '14px',
                        }}
                    >
                        <option>All Components</option>
                        <option>Adarsh Gram</option>
                        <option>GIA</option>
                        <option>Hostel</option>
                    </select>
                    <div
                        style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: THEME.primary,
                            fontSize: '10px',
                        }}
                    >
                        ▼
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem',
                    marginBottom: '1.5rem',
                }}
            >
                <InfoCard
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                    }
                    value={`${nationalOverview.utilization}%`}
                    label="Fund Utilization"
                    colorBg="#F5F3FF"
                    colorText="#7C3AED"
                />
                <InfoCard
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    }
                    value={`${nationalOverview.completed}%`}
                    label="Completed Projects"
                    colorBg="#D1FAE5"
                    colorText="#10B981"
                />
                <InfoCard
                    icon={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    }
                    value={nationalOverview.beneficiaries}
                    label="Beneficiaries"
                    colorBg="#FEF3C7"
                    colorText="#F59E0B"
                />
            </div>

            {/* Main Section: Map + Right Panel */}
            <div
                className="dashboard-section"
                style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}
            >
                {/* Map / Geography Card */}
                <div
                    className="card"
                    style={{
                        padding: '0',
                        minHeight: '700px',
                        overflow: 'hidden',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div
                        style={{
                            padding: '20px',
                            borderBottom: '1px solid #F3F4F6',
                            backgroundColor: 'white',
                        }}
                    >
                        <h3
                            className="section-title"
                            style={{ marginBottom: '4px', color: THEME.text, fontSize: '20px' }}
                        >
                            {selectedDistrict
                                ? `${selectedDistrict} District`
                                : selectedState
                                    ? `${selectedState} Overview`
                                    : 'National Overview'}
                        </h3>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <p
                                style={{
                                    fontSize: '14px',
                                    color: '#6B7280',
                                    margin: '0',
                                }}
                            >
                                {selectedDistrict
                                    ? `Viewing details for ${selectedDistrict}`
                                    : selectedState
                                        ? `Selected: ${selectedState}`
                                        : 'Click on a state to view detailed progress'}
                            </p>
                            {(selectedState || selectedDistrict) && (
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={handleBack}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                >
                                    ← Back to {selectedDistrict ? 'State' : 'National'}
                                </button>
                            )}
                        </div>
                    </div>
                    <div style={{ height: '800px', width: '100%' }}>
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

                {/* Right Side: Charts */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}
                >
                    {/* Fund Utilization */}
                    <div
                        className="card"
                        style={{
                            padding: '16px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {stateData ? (
                            <>
                                <h4
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: THEME.text,
                                        marginBottom: '12px',
                                        textAlign: 'center',
                                    }}
                                >
                                    Fund Utilization - {stateData.name}
                                </h4>
                                <PieChart data={stateData.fundUtilization} size={150} />
                            </>
                        ) : (
                            <div
                                style={{
                                    padding: '30px 16px',
                                    textAlign: 'center',
                                    color: '#9CA3AF',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '32px',
                                        marginBottom: '8px',
                                        opacity: 0.5,
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="32"
                                        height="32"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line x1="12" y1="1" x2="12" y2="23" />
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </div>
                                <h4
                                    style={{
                                        fontSize: '13px',
                                        color: THEME.text,
                                        marginBottom: '4px',
                                    }}
                                >
                                    No State Selected
                                </h4>
                                <p style={{ fontSize: '11px', color: '#6B7280' }}>
                                    Click on a state to view fund utilization
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Component Progress */}
                    <div
                        className="card"
                        style={{
                            padding: '0',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {stateData && selectedComponent !== 'All Components' ? (
                            <ComponentProgressChart
                                component={selectedComponent}
                                progress={stateData.components[selectedComponent].progress}
                            />
                        ) : stateData && selectedComponent === 'All Components' ? (
                            <div style={{ padding: '16px' }}>
                                <h4
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: THEME.text,
                                        marginBottom: '12px',
                                        textAlign: 'center',
                                    }}
                                >
                                    All Components Progress
                                </h4>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                    }}
                                >
                                    {Object.entries(stateData.components).map(
                                        ([name, data]) => (
                                            <div key={name}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        marginBottom: '4px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        color: THEME.text,
                                                    }}
                                                >
                                                    <span>{name}</span>
                                                    <span>{data.progress}%</span>
                                                </div>
                                                <div
                                                    style={{
                                                        height: '6px',
                                                        backgroundColor: '#E5E7EB',
                                                        borderRadius: '4px',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: `${data.progress}%`,
                                                            height: '100%',
                                                            backgroundColor: data.color,
                                                            borderRadius: '4px',
                                                            transition: 'width 0.8s ease',
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div
                                style={{
                                    padding: '30px 16px',
                                    textAlign: 'center',
                                    color: '#9CA3AF',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '32px',
                                        marginBottom: '8px',
                                        opacity: 0.5,
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="32"
                                        height="32"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line x1="18" y1="20" x2="18" y2="10" />
                                        <line x1="12" y1="20" x2="12" y2="4" />
                                        <line x1="6" y1="20" x2="6" y2="14" />
                                    </svg>
                                </div>
                                <h4
                                    style={{
                                        fontSize: '13px',
                                        color: THEME.text,
                                        marginBottom: '4px',
                                    }}
                                >
                                    No State Selected
                                </h4>
                                <p style={{ fontSize: '11px', color: '#6B7280' }}>
                                    Click on a state to view components
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Project Trends */}
                    <div
                        className="card"
                        style={{
                            padding: '16px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            flex: 1,
                        }}
                    >
                        {stateData ? (
                            <>
                                <h4
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: THEME.text,
                                        marginBottom: '8px',
                                        textAlign: 'center',
                                    }}
                                >
                                    Project Trends
                                </h4>
                                <AnimatedLineChart
                                    data={stateData.projectTrends}
                                    height={160}
                                />
                            </>
                        ) : (
                            <div
                                style={{
                                    padding: '30px 16px',
                                    textAlign: 'center',
                                    color: '#9CA3AF',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '32px',
                                        marginBottom: '8px',
                                        opacity: 0.5,
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="32"
                                        height="32"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                        <polyline points="17 6 23 6 23 12" />
                                    </svg>
                                </div>
                                <h4
                                    style={{
                                        fontSize: '13px',
                                        color: THEME.text,
                                        marginBottom: '4px',
                                    }}
                                >
                                    No State Selected
                                </h4>
                                <p style={{ fontSize: '11px', color: '#6B7280' }}>
                                    Click on a state to view trends
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* All Projects List */}
            <MonitorProgressMinistry
                selectedState={selectedState}
                selectedDistrict={selectedDistrict}
            />
        </div>
    );
};

export default MonitorProgress;
