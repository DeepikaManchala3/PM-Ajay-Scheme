import React, { useState, useEffect } from 'react';

const FundsReceivedFromState = ({ formatCurrency, districtId }) => {
    const [fundReleases, setFundReleases] = useState([]);
    const [totalReceived, setTotalReceived] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFundReleases = async () => {
            if (!districtId) return;

            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/fund_releases?district_id=eq.${districtId}&select=*&order=created_at.desc`, {
                    headers: {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFundReleases(data);
                    const total = data.reduce((sum, item) => sum + (item.amount_cr || 0), 0);
                    setTotalReceived(total);
                }
            } catch (error) {
                console.error('Error fetching fund releases:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFundReleases();
    }, [districtId]);

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Funds Received from State</h2>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
                    View all fund allocations released by the State Admin
                </p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 30 }}>
                <div style={{
                    padding: 20,
                    backgroundColor: '#EEF2FF',
                    borderRadius: 12,
                    textAlign: 'center',
                    border: '1px solid #EEF2FF',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{ fontSize: '13px', color: '#6366F1', marginBottom: 8, textTransform: 'capitalize', fontWeight: '600', letterSpacing: '0.05em' }}>
                        Total Funds Received
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#4F46E5' }}>₹{totalReceived.toFixed(2)} Cr</div>
                </div>
                <div style={{
                    padding: 20,
                    backgroundColor: '#ECFDF5',
                    borderRadius: 12,
                    textAlign: 'center',
                    border: '1px solid #ECFDF5',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{ fontSize: '13px', color: '#10B981', marginBottom: 8, textTransform: 'capitalize', fontWeight: '600', letterSpacing: '0.05em' }}>
                        Total Releases
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#059669' }}>{fundReleases.length}</div>
                </div>
            </div>

            {/* Funds Table */}
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Release Date</th>
                            <th>Component</th>
                            <th>Amount</th>
                            <th>Officer ID</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 30 }}>Loading...</td>
                            </tr>
                        ) : fundReleases.length > 0 ? (
                            fundReleases.map((release) => (
                                <tr key={release.id}>
                                    <td>{release.release_date}</td>
                                    <td>
                                        {release.component && release.component.map((c, i) => (
                                            <span key={i} className="badge badge-primary" style={{ marginRight: 4 }}>{c}</span>
                                        ))}
                                    </td>
                                    <td style={{ fontWeight: 'bold', color: '#27ae60' }}>
                                        ₹{release.amount_cr} Cr
                                    </td>
                                    <td>{release.officer_id || '-'}</td>
                                    <td style={{ color: '#666', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={release.remarks}>
                                        {release.remarks || '-'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No fund releases received yet from the State.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FundsReceivedFromState;
