import React from 'react';
import InteractiveButton from '../../../components/InteractiveButton';
import { Construction, Settings, Wallet, FileText, ArrowRight, Upload, Download } from 'lucide-react';

const DepartmentDashboardPanel = ({ formatCurrency, stats, recentOrders, projects, onNavigate }) => {

    const getStatusBadge = (status) => {
        const badges = {
            'PROPOSED': 'badge-info',
            'APPROVED': 'badge-info',
            'ONGOING': 'badge-warning',
            'In Progress': 'badge-warning',
            'COMPLETED': 'badge-success',
            'Completed': 'badge-success',
            'DELAYED': 'badge-error',
            'Not Started': 'badge-info'
        };
        return badges[status] || 'badge-info';
    };

    // ModernStatCard component matching the premium style
    const ModernStatCard = ({ icon, value, label, description, iconBg, iconColor }) => (
        <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'default',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
        >
            {/* Icon */}
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
            }}>
                <div style={{ color: iconColor, display: 'flex' }}>
                    {icon}
                </div>
            </div>

            {/* Value */}
            <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '0.25rem',
                lineHeight: '1.2'
            }}>
                {value}
            </div>

            {/* Label */}
            <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#4B5563',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                {label}
            </div>

            {/* Description */}
            <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                lineHeight: '1.6',
                margin: 0
            }}>
                {description}
            </p>
        </div>
    );

    return (
        <>
            {/* Department KPIs */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <ModernStatCard
                    icon={<Construction size={24} strokeWidth={1.5} />}
                    value={stats.totalWorks}
                    label="Total Works Assigned"
                    iconBg="#DBEAFE"
                    iconColor="#2563EB"
                />
                <ModernStatCard
                    icon={<Settings size={24} strokeWidth={1.5} />}
                    value={stats.ongoing}
                    label="Ongoing Works"
                    iconBg="#FEF3C7"
                    iconColor="#F59E0B"
                />
                <ModernStatCard
                    icon={<Wallet size={24} strokeWidth={1.5} />}
                    value={formatCurrency(stats.fundsUtilized)}
                    label="Funds Utilized"
                    iconBg="#D1FAE5"
                    iconColor="#10B981"
                />
                <ModernStatCard
                    icon={<FileText size={24} strokeWidth={1.5} />}
                    value={stats.pendingDPR}
                    label="Pending DPRs"
                    iconBg="#FEE2E2"
                    iconColor="#EF4444"
                />
            </div>

            {/* Project Progress Table */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Project Execution Status</h2>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <InteractiveButton
                            variant="secondary"
                            size="sm"
                            onClick={() => onNavigate('dpr-upload')}
                        >
                            <Upload size={16} style={{ marginRight: 'var(--space-1)' }} />
                            Upload DPR
                        </InteractiveButton>
                        <InteractiveButton
                            variant="secondary"
                            size="sm"
                            onClick={() => onNavigate('reports')}
                        >
                            <Upload size={16} style={{ marginRight: 'var(--space-1)' }} />
                            Export Status
                        </InteractiveButton>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Work Order</th>
                                <th>Location</th>
                                <th>Contractor</th>
                                <th>Status</th>
                                <th>Physical Progress</th>
                                <th>Financial Progress</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
                                <tr key={project.id}>
                                    <td>
                                        <strong>{project.title}</strong>
                                        <br />
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                            WO-{project.id + 100}
                                        </span>
                                    </td>
                                    <td>{project.location || 'N/A'}</td>
                                    <td>M/s Patil Constructions</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(project.status)}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <div style={{ flex: 1, height: '6px', minWidth: '80px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${project.progress}%`, height: '100%', backgroundColor: '#FF9933', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                                            </div>
                                            <span style={{ fontSize: 'var(--text-sm)' }}>{project.progress}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: '#10B981' }}>
                                            {formatCurrency((project.amount || 0) * (project.progress / 100))} / {formatCurrency(project.amount || 0)}
                                        </div>
                                    </td>
                                    <td>
                                        <InteractiveButton
                                            variant="primary"
                                            size="sm"
                                            onClick={() => onNavigate('work-orders')}
                                        >
                                            Update
                                        </InteractiveButton>
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

export default DepartmentDashboardPanel;
