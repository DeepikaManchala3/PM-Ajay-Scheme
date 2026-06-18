import React, { useState, useEffect } from 'react';
import InteractiveButton from '../../../components/InteractiveButton';
import { FileText, Eye } from 'lucide-react';

const AnnualActionPlan = () => {
    const [filters, setFilters] = useState({
        componentType: 'Adarsh Gram',
        financialYear: '2024-2025',
        state: 'KARNATAKA'
    });

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Hardcoded for debugging to ensure we hit the local backend
                const url = 'http://localhost:5001/api/funds/annual-plan-approvals';
                console.log('Fetching from:', url);

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Fetch result:', result);

                let finalData = [];
                if (Array.isArray(result)) {
                    finalData = result;
                } else if (result && Array.isArray(result.data)) {
                    finalData = result.data;
                }

                setData(finalData);
                if (finalData.length === 0) {
                    console.warn('Received empty data array');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Get unique states from data for the dropdown
    const availableStates = [...new Set(data.map(item => item.state))].sort();

    // Filter data based on selected state
    const filteredData = data.filter(item => {
        if (!filters.state || filters.state === 'All States') return true;
        return item.state.toLowerCase() === filters.state.toLowerCase();
    });

    return (
        <div className="dashboard-panel" style={{ padding: '20px', fontFamily: "'Inter', sans-serif", maxWidth: '1200px', margin: '0 auto' }}>
            <div className="section-header" style={{ marginBottom: '25px' }}>
                <h2 className="section-title" style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Annual Plan Approvals</h2>
            </div>

            {/* Filter Section */}
            <div className="filter-section" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                alignItems: 'center',
                padding: '25px',
                background: '#ffffff',
                borderRadius: '12px',
                marginBottom: '30px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0'
            }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Component Type</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            className="form-select"
                            style={{
                                width: '200px',
                                padding: '10px 15px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                outline: 'none',
                                appearance: 'none',
                                backgroundColor: '#f8fafc',
                                color: '#334155',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            value={filters.componentType}
                            onChange={(e) => setFilters({ ...filters, componentType: e.target.value })}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                        >
                            <option>Adarsh Gram</option>
                            <option>GIA</option>
                            <option>Hostel</option>
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Financial Year</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            className="form-select"
                            style={{
                                width: '160px',
                                padding: '10px 15px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                outline: 'none',
                                appearance: 'none',
                                backgroundColor: '#f8fafc',
                                color: '#334155',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            value={filters.financialYear}
                            onChange={(e) => setFilters({ ...filters, financialYear: e.target.value })}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                        >
                            <option>2024-2025</option>
                            <option>2023-2024</option>
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>State</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            className="form-select"
                            style={{
                                width: '200px',
                                padding: '10px 15px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                outline: 'none',
                                appearance: 'none',
                                backgroundColor: '#f8fafc',
                                color: '#334155',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            value={filters.state}
                            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                        >
                            <option>All States</option>
                            {availableStates.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>


            </div>

            {/* Table Section */}
            <div className="table-wrapper" style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0'
            }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#000080', color: 'white' }}>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Sr. No.</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>State</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Total Projects</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Total Funds Released (Rs. In Lakh)</th>
                            <th style={{ padding: 0, border: 'none' }}>
                                <div style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sanction Orders</div>
                                <div style={{ display: 'flex', width: '100%' }}>
                                    <div style={{ flex: 1, padding: '12px', borderRight: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Date of Sanction</div>
                                    <div style={{ flex: 1, padding: '12px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Sanction Amount (Rs. in Lakh)</div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {error ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                                    Error loading data: {error}
                                </td>
                            </tr>
                        ) : loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No approved projects found for the selected criteria.</td>
                            </tr>
                        ) : filteredData.map((item, index) => (
                            <tr key={item.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '20px', textAlign: 'center', verticalAlign: 'top', color: '#64748b', fontWeight: '500' }}>{index + 1}</td>
                                <td style={{ padding: '20px', verticalAlign: 'top', fontWeight: '700', color: '#1e293b' }}>{item.state}</td>
                                <td style={{ padding: '20px', textAlign: 'center', verticalAlign: 'top', fontWeight: '700', color: '#1e293b' }}>{item.totalProjects}</td>
                                <td style={{ padding: '20px', textAlign: 'right', verticalAlign: 'top', fontWeight: '700', color: '#1e293b' }}>{item.totalFunds}</td>
                                <td style={{ padding: 0 }}>
                                    {item.orders && item.orders.length > 0 ? item.orders.map((order, idx) => (
                                        <div key={order.id || idx} style={{
                                            display: 'flex',
                                            borderBottom: idx === item.orders.length - 1 ? 'none' : '1px solid #f1f5f9',
                                            background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                                            transition: 'background-color 0.2s'
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc'}
                                        >
                                            <div style={{ flex: 1, padding: '12px', borderRight: '1px solid #f1f5f9', fontSize: '14px', color: '#475569', textAlign: 'center' }}>{order.date}</div>
                                            <div style={{ flex: 1, padding: '12px', textAlign: 'right', fontSize: '14px', color: '#475569', paddingRight: '20px' }}>{order.amount}</div>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No orders found</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {/* Total Row */}
                        {!loading && filteredData.length > 0 && (
                            <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                                <td colSpan="3" style={{ textAlign: 'right', padding: '20px', color: '#1e293b', fontSize: '16px' }}>Total</td>
                                <td style={{ textAlign: 'right', padding: '20px', color: '#1e293b', fontSize: '16px' }}>
                                    {filteredData.reduce((sum, item) => sum + parseFloat((item.totalFunds || '0').toString().replace(/,/g, '')), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AnnualActionPlan;
