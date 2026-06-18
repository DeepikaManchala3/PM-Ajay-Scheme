import React from 'react';
import InteractiveButton from '../../../components/InteractiveButton';
import { Construction, Settings, Wallet, CheckCircle, Camera, Receipt, AlertCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { t } from '../../../utils/translations';

const ContractorDashboardPanel = ({ formatCurrency, stats, recentWorks, onNavigate }) => {
    const { language } = useLanguage();

    const getStatusBadge = (status) => {
        const badges = {
            'In Progress': 'badge-warning',
            'Completed': 'badge-success',
            'Not Started': 'badge-info',
            'Delayed': 'badge-error'
        };
        return badges[status] || 'badge-info';
    };

    return (
        <>
            {/* Contractor KPIs */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px',
                marginBottom: '32px'
            }}>
                {/* Card 1: Assigned Works */}
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
                        color: '#FF9933'
                    }}>
                        <Construction size={24} />
                    </div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827',
                        lineHeight: '1.2',
                        marginBottom: '4px'
                    }}>
                        {stats.totalWorks}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Assigned Works
                    </div>
                </div>

                {/* Card 2: Works In Progress */}
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
                        color: '#F59E0B'
                    }}>
                        <Settings size={24} />
                    </div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827',
                        lineHeight: '1.2',
                        marginBottom: '4px'
                    }}>
                        {stats.ongoing}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Works In Progress
                    </div>
                </div>

                {/* Card 3: Pending Payments */}
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
                        backgroundColor: '#FEE2E2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        color: '#EF4444'
                    }}>
                        <Wallet size={24} />
                    </div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827',
                        lineHeight: '1.2',
                        marginBottom: '4px'
                    }}>
                        {formatCurrency(stats.pendingPayments)}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Pending Payments
                    </div>
                </div>

                {/* Card 4: Completed Works */}
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
                        backgroundColor: '#D1FAE5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        color: '#10B981'
                    }}>
                        <CheckCircle size={24} />
                    </div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827',
                        lineHeight: '1.2',
                        marginBottom: '4px'
                    }}>
                        {stats.completed}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Completed Works
                    </div>
                </div>
            </div>

            {/* Recent Assigned Works */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Recent Assigned Works</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => onNavigate('assigned-works')}>View All Works</button>
                </div>

                <div className="card" style={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    {recentWorks && recentWorks.length > 0 ? (
                        recentWorks.map((work, index) => (
                            <div key={index} style={{
                                padding: 'var(--space-4)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '12px',
                                marginBottom: 'var(--space-3)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#fff'
                            }}>
                                <div>
                                    <h4 style={{ margin: 0, marginBottom: 'var(--space-2)', fontSize: '1rem', fontWeight: 600 }}>{work.title}</h4>
                                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                        {t('location', language)}: {work.location} • ID: WO-{work.id}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <span className={`badge ${getStatusBadge(work.status)}`}>{work.status}</span>
                                    <button className="btn btn-outline btn-sm" onClick={() => onNavigate('work-progress')}>Update Progress</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No assigned works found.</div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
                <h2 className="section-title">Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div className="card action-card" onClick={() => onNavigate('work-progress')} style={{ cursor: 'pointer', textAlign: 'center', padding: '30px' }}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>📸</div>
                        <h3>Upload Site Photos</h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>Update physical progress with images</p>
                    </div>
                    <div className="card action-card" onClick={() => onNavigate('payment-status')} style={{ cursor: 'pointer', textAlign: 'center', padding: '30px' }}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>🧾</div>
                        <h3>Check Payments</h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>View bill status and history</p>
                    </div>
                    <div className="card action-card" onClick={() => onNavigate('help')} style={{ cursor: 'pointer', textAlign: 'center', padding: '30px' }}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>🆘</div>
                        <h3>Raise Issue</h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>Contact department for support</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContractorDashboardPanel;
