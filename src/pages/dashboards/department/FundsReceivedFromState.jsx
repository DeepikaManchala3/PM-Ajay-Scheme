import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { IndianRupee, Calendar, FileText, Filter } from 'lucide-react';

const FundsReceivedFromState = () => {
    const { user } = useAuth();
    const [releases, setReleases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalReceived: 0,
        totalUtilized: 0,
        balance: 0
    });
    const [agencyId, setAgencyId] = useState(null);

    // API Base URL
    const API_BASE_URL = 'http://localhost:5001/api';

    useEffect(() => {
        const fetchAgencyId = async () => {
            if (!user) return;
            try {
                // Fetch agency ID based on user ID
                const { supabase } = await import('../../../lib/supabaseClient');

                const { data, error } = await supabase
                    .from('implementing_agencies')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setAgencyId(data.id);
                } else {
                    console.error('Agency not found for user:', user.id);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching agency ID:', err);
                setLoading(false);
            }
        };

        fetchAgencyId();
    }, [user]);

    useEffect(() => {
        const fetchReleases = async () => {
            if (!agencyId) return;

            setLoading(true);
            try {
                // Use the existing endpoint to get releases for this agency
                const response = await fetch(`${API_BASE_URL}/funds/agency-releases?agencyId=${agencyId}`);
                const result = await response.json();

                if (result.success) {
                    setReleases(result.data);

                    // Calculate stats
                    const totalReceived = result.data.reduce((sum, item) => sum + (item.amount_cr || 0), 0);
                    // Mock utilization for now or fetch from another endpoint if available
                    const totalUtilized = result.data.reduce((sum, item) => sum + (item.amount_utilized || 0), 0);

                    setStats({
                        totalReceived,
                        totalUtilized,
                        balance: totalReceived - totalUtilized
                    });
                }
            } catch (error) {
                console.error('Error fetching funds:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReleases();
    }, [agencyId]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount * 10000000); // Convert Cr to Rupees for display or keep as Cr? 
        // Let's stick to Cr for stats and Rupees for table if consistent
    };

    const formatCr = (amount) => {
        return `₹${parseFloat(amount || 0).toFixed(2)} Cr`;
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#2c3e50' }}>Funds Received from State</h2>
                <p style={{ margin: 0, color: '#64748b' }}>Track all fund releases received from the State Department</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '20px', borderRadius: '12px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Total Received</p>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#1e293b' }}>{formatCr(stats.totalReceived)}</h3>
                        </div>
                        <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}>
                            <IndianRupee size={20} />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '20px', borderRadius: '12px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Available Balance</p>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#1e293b' }}>{formatCr(stats.balance)}</h3>
                        </div>
                        <div style={{ padding: '8px', background: '#ecfdf5', borderRadius: '8px', color: '#10b981' }}>
                            <IndianRupee size={20} />
                        </div>
                    </div>
                </div>

                {/* Utilization placeholder */}
                <div className="card" style={{ padding: '20px', borderRadius: '12px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Utilized Amount</p>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#1e293b' }}>{formatCr(stats.totalUtilized)}</h3>
                        </div>
                        <div style={{ padding: '8px', background: '#fffbeb', borderRadius: '8px', color: '#f59e0b' }}>
                            <Activity size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Releases Table */}
            <div className="card" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#334155' }}>Release History</h3>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#64748b' }}>
                        <Filter size={16} />
                        Filter
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Release Date</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Source</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Components</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Remarks / Project</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Amount (Cr)</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Amount (₹)</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Sanction Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading fund records...</td>
                                </tr>
                            ) : releases.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No fund releases found</td>
                                </tr>
                            ) : (
                                releases.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px', color: '#334155' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Calendar size={16} color="#94a3b8" />
                                                {new Date(item.release_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', color: '#334155' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                background: item.source === 'State' ? '#FFF7ED' : '#F0FDF4',
                                                color: item.source === 'State' ? '#C2410C' : '#15803D'
                                            }}>
                                                {item.sourceName || item.source || 'Unknown'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#334155' }}>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {Array.isArray(item.component) ? item.component.map((c, i) => (
                                                    <span key={i} style={{ padding: '4px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontSize: '12px', fontWeight: 500 }}>
                                                        {c}
                                                    </span>
                                                )) : (
                                                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontSize: '12px', fontWeight: 500 }}>
                                                        {item.component}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', color: '#334155', maxWidth: '300px' }}>
                                            {item.remarks || '-'}
                                        </td>
                                        <td style={{ padding: '16px', color: '#059669', fontWeight: 600, textAlign: 'right' }}>
                                            ₹{parseFloat(item.amount_cr || 0).toFixed(2)} Cr
                                        </td>
                                        <td style={{ padding: '16px', color: '#334155', fontWeight: 500, textAlign: 'right' }}>
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.amount_rupees || 0)}
                                        </td>
                                        <td style={{ padding: '16px', color: '#64748b' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FileText size={16} />
                                                {item.officer_id || 'N/A'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Start of Activity import was missing in stats usage, adding it
import { Activity } from 'lucide-react';

export default FundsReceivedFromState;
