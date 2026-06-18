import React, { useMemo, useState } from 'react';
import {
    BarChart as RBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
    RadarChart as RRadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
    , AreaChart, Area
} from 'recharts';
import { reportsMockData } from '../../../data/reportsMockData';

const Sparkline = ({ values, color }) => {
    const points = useMemo(() => {
        if (!values?.length) return '';
        const max = Math.max(...values);
        const min = Math.min(...values);
        const range = max - min || 1;
        return values
            .map((v, i) => {
                const x = (i / (values.length - 1 || 1)) * 120;
                const y = 40 - ((v - min) / range) * 40;
                return `${x},${y}`;
            })
            .join(' ');
    }, [values]);

    return (
        <svg width="120" height="40" aria-hidden>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                points={points}
            />
        </svg>
    );
};

const SummaryCard = ({ label, primaryValue, secondaryValue, color, accent, trend }) => (
    <div style={{
        background: color,
        borderRadius: '14px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A' }}>{primaryValue}</div>
                <div style={{ color: '#475569', fontSize: '14px', marginTop: 4 }}>{secondaryValue}</div>
            </div>
            <div style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: accent,
                marginTop: 4
            }} />
        </div>
        <div style={{ color: '#0F172A', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        <Sparkline values={trend} color={accent} />
    </div>
);

const AnalyticsBarChart = ({ title, subtitle, data, showPercent, valueSuffix }) => {
    const customTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const val = payload[0].value;
            return (
                <div style={{
                    background: 'rgba(15,23,42,0.92)',
                    color: '#fff',
                    padding: '8px 10px',
                    borderRadius: 8,
                    boxShadow: '0 10px 24px rgba(0,0,0,0.16)'
                }}>
                    <div style={{ fontWeight: 700 }}>{label}</div>
                    <div>{val}{showPercent ? '%' : ''}{valueSuffix || ''}</div>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={chartCardStyle}>
            <ChartHeader title={title} subtitle={subtitle} />
            <div style={{ width: '100%', height: 280, marginTop: 8 }}>
                <ResponsiveContainer>
                    <RBarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#CBD5E1' }} />
                        <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#CBD5E1' }} />
                        <Tooltip content={customTooltip} />
                        <Bar dataKey="value" fill="#3B82F6" barSize={46} radius={[4, 4, 0, 0]} />
                    </RBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const AnalyticsPieChart = ({ title, subtitle, slices, valueSuffix }) => {
    const customTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { name, value } = payload[0];
            return (
                <div style={{
                    background: 'rgba(15,23,42,0.92)',
                    color: '#fff',
                    padding: '8px 10px',
                    borderRadius: 8,
                    boxShadow: '0 10px 24px rgba(0,0,0,0.16)'
                }}>
                    <div style={{ fontWeight: 700 }}>{name}</div>
                    <div>{value}{valueSuffix || ''}</div>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={chartCardStyle}>
            <ChartHeader title={title} subtitle={subtitle} />
            <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Tooltip content={customTooltip} />
                        <Legend verticalAlign="bottom" height={32} />
                        <Pie
                            data={slices}
                            dataKey="value"
                            nameKey="label"
                            cx="50%"
                            cy="45%"
                            outerRadius={90}
                            innerRadius={50}
                            paddingAngle={2}
                        >
                            {slices.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const AnalyticsGroupedBarChart = ({ title, subtitle, data }) => {
    const customTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(15,23,42,0.92)',
                    color: '#fff',
                    padding: '8px 10px',
                    borderRadius: 8,
                    boxShadow: '0 10px 24px rgba(0,0,0,0.16)'
                }}>
                    <div style={{ fontWeight: 700 }}>{label}</div>
                    {payload.map(p => (
                        <div key={p.dataKey} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ width: 10, height: 10, borderRadius: 999, background: p.color }} />
                            <span>{p.name}: ₹{(p.value).toFixed(2)} Cr</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={chartCardStyle}>
            <ChartHeader title={title} subtitle={subtitle} />
            <div style={{ width: '100%', height: 320, marginTop: 8 }}>
                <ResponsiveContainer>
                    <RBarChart data={data} margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#CBD5E1' }} />
                        <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#CBD5E1' }} />
                        <Tooltip content={customTooltip} />
                        <Legend />
                        <Bar dataKey="allocatedCr" name="Allocated" fill="#2563EB" barSize={36} />
                        <Bar dataKey="releasedCr" name="Released" fill="#22C55E" barSize={36} />
                        <Bar dataKey="utilizedCr" name="Utilized" fill="#F97316" barSize={36} />
                    </RBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const AnalyticsAreaChart = ({ title, subtitle, months, series }) => {
    const combined = months.map((m, i) => {
        const entry = { month: m };
        series.forEach((s) => {
            entry[s.dataKey] = s.data[i];
        });
        return entry;
    });

    return (
        <div style={chartCardStyle}>
            <ChartHeader title={title} subtitle={subtitle} />
            <div style={{ width: '100%', height: 320, marginTop: 8 }}>
                <ResponsiveContainer>
                    <AreaChart data={combined} margin={{ top: 12, right: 12, left: 0, bottom: 12 }}>
                        <defs>
                            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#CBD5E1' }} />
                        <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#CBD5E1' }} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey={series[0].dataKey} stroke="#22C55E" fillOpacity={1} fill="url(#colorArea)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const AnalyticsRadarChart = ({ title, subtitle, metrics }) => {
    const data = metrics.map(m => ({ subject: m.label, value: m.value }));
    return (
        <div style={chartCardStyle}>
            <ChartHeader title={title} subtitle={subtitle} />
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <RRadarChart data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Radar dataKey="value" stroke="#2563EB" fill="rgba(37,99,235,0.25)" fillOpacity={0.7} />
                    </RRadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const AnalyticsLineChart = ({ title, subtitle, months, series }) => {
    const combined = months.map((m, i) => {
        const entry = { month: m };
        series.forEach((s) => {
            entry[s.dataKey] = s.data[i];
        });
        return entry;
    });

    return (
        <div style={chartCardStyle}>
            <ChartHeader title={title} subtitle={subtitle} />
            <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                    <LineChart data={combined} margin={{ top: 12, right: 12, left: 0, bottom: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#CBD5E1' }} />
                        <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#CBD5E1' }} />
                        <Tooltip />
                        <Legend />
                        {series.map((s, idx) => (
                            <Line
                                key={s.dataKey}
                                type="monotone"
                                dataKey={s.dataKey}
                                stroke={s.color || '#2563EB'}
                                strokeWidth={3}
                                dot={false}
                                strokeDasharray={idx === 0 ? undefined : '6 4'}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const AnalyticsHorizontalBarChart = ({ title, subtitle, data, valueSuffix }) => {
    const customTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const val = payload[0].value;
            return (
                <div style={{
                    background: 'rgba(15,23,42,0.92)',
                    color: '#fff',
                    padding: '8px 10px',
                    borderRadius: 8,
                    boxShadow: '0 10px 24px rgba(0,0,0,0.16)'
                }}>
                    <div style={{ fontWeight: 700 }}>{label}</div>
                    <div>{val}{valueSuffix || ''}</div>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={chartCardStyle}>
            <ChartHeader title={title} subtitle={subtitle} />
            <div style={{ width: '100%', height: 300, marginTop: 8 }}>
                <ResponsiveContainer>
                    <RBarChart data={data} layout="vertical" margin={{ top: 12, right: 12, left: 24, bottom: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis type="number" tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#CBD5E1' }} />
                        <YAxis dataKey="label" type="category" tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#CBD5E1' }} width={110} />
                        <Tooltip content={customTooltip} />
                        <Bar dataKey="value" fill={data[0]?.color || '#F97316'} barSize={24} />
                    </RBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


const ChartHeader = ({ title, subtitle }) => (
    <div>
        <div style={{ fontWeight: 700, color: '#0F172A' }}>{title}</div>
        {subtitle && <div style={{ color: '#64748B', fontSize: 13 }}>{subtitle}</div>}
    </div>
);

const chartCardStyle = {
    background: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
    border: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
};

const ReportsAnalytics = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const downloadExcel = async () => {
        try {
            const url = '/projects.xlsx';
            const res = await fetch(url);
            if (!res.ok) throw new Error('Network response was not ok');
            const blob = await res.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = 'projects.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(objectUrl);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Download failed', err);
            alert('Failed to download file. Make sure projects.xlsx exists in the public folder.');
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div style={tabGridStyle}>
                        <AnalyticsBarChart
                            title="Projects by Status"
                            subtitle="Portfolio snapshot"
                            data={reportsMockData.overview.projectsByStatus}
                        />
                        <AnalyticsPieChart
                            title="Budget by Component"
                            subtitle="Distribution across key components"
                            slices={reportsMockData.overview.budgetByComponent}
                            valueSuffix="%"
                        />
                        <AnalyticsHorizontalBarChart
                            title="State-wise Project Distribution"
                            subtitle="Projects spread across key states"
                            data={reportsMockData.overview.stateWiseProjectDistribution}
                            valueSuffix=" projects"
                        />
                        <AnalyticsLineChart
                            title="Component Performance"
                            subtitle="Performance across components"
                            months={reportsMockData.overview.componentPerformance.map(i => i.label)}
                            series={[
                                {
                                    label: 'Value',
                                    dataKey: 'value',
                                    data: reportsMockData.overview.componentPerformance.map(i => i.value),
                                    color: '#10B981'
                                }
                            ]}
                        />
                    </div>
                );
            case 'financial':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <AnalyticsGroupedBarChart
                                title="Fund Utilization by State"
                                subtitle="Allocated vs Released vs Utilized (₹ Cr)"
                                data={reportsMockData.financial.utilizationByState}
                            />
                        </div>
                        <AnalyticsPieChart
                            title="Budget Allocation vs Utilization"
                            subtitle="Allocation compared to current utilization"
                            slices={reportsMockData.financial.allocationVsUtilization}
                            valueSuffix=" Cr"
                        />
                        <AnalyticsAreaChart
                            title="Fund Release Timeline"
                            subtitle="Cumulative releases across months (₹ Cr)"
                            months={reportsMockData.financial.fundReleaseTimeline.months}
                            series={[
                                {
                                    label: 'Released (₹ Cr)',
                                    dataKey: 'currencyCr',
                                    data: reportsMockData.financial.fundReleaseTimeline.currencyCr,
                                    color: '#22C55E'
                                }
                            ]}
                        />
                    </div>
                );
            case 'performance':
                return (
                    <div style={tabGridStyle}>
                        <AnalyticsBarChart
                            title="Progress Distribution"
                            subtitle="Projects by completion range"
                            data={reportsMockData.performance.progressDistribution}
                        />
                        <AnalyticsRadarChart
                            title="Performance Metrics"
                            subtitle="Overall programme performance"
                            metrics={reportsMockData.performance.radarMetrics}
                        />
                    </div>
                );
            case 'trends':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                        <AnalyticsLineChart
                            title="Monthly Project Initiation & Budget Trend"
                            subtitle="Projects started vs monthly allocated budget"
                            months={reportsMockData.trends.months}
                            series={[
                                { label: 'Projects Started', dataKey: 'projects', data: reportsMockData.trends.projectsStarted, color: '#2563EB' },
                                { label: 'Budget (Cr)', dataKey: 'budget', data: reportsMockData.trends.monthlyBudgetCr, color: '#F97316' }
                            ]}
                        />
                        <AnalyticsAreaChart
                            title="Cumulative Fund Release"
                            subtitle="Cumulative releases over months (₹ Cr)"
                            months={reportsMockData.financial.fundReleaseTimeline.months}
                            series={[
                                {
                                    label: 'Released (₹ Cr)',
                                    dataKey: 'currencyCr',
                                    data: reportsMockData.financial.fundReleaseTimeline.currencyCr,
                                    color: '#22C55E'
                                }
                            ]}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-panel" style={{ background: '#F8FAFC', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h2 style={{ margin: 0, color: '#0F172A' }}>Reports & Analytics</h2>
                    <p style={{ margin: 0, color: '#475569' }}>Portfolio insights powered by  realistic data</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={downloadExcel} className="btn btn-primary" style={{ background: '#2563EB', border: 'none' }}>Download Excel</button>
                    <button className="btn btn-secondary" style={{ background: '#E2E8F0', border: 'none', color: '#0F172A' }}>Share</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 20, overflow: 'hidden' }}>
                {reportsMockData.kpis.map(kpi => (
                    <SummaryCard key={kpi.label} {...kpi} />
                ))}
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: 14, padding: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #E2E8F0', padding: '6px' }}>
                    {['overview', 'financial', 'performance', 'trends'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                border: 'none',
                                background: activeTab === tab ? '#2563EB' : 'transparent',
                                color: activeTab === tab ? '#FFFFFF' : '#0F172A',
                                borderRadius: 10,
                                padding: '10px 14px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
                <div style={{ padding: 12 }}>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

const tabGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16
};

export default ReportsAnalytics;
