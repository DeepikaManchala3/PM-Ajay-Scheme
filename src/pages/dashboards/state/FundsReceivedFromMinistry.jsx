import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

const FundsReceivedFromMinistry = ({ formatCurrency }) => {
    const { user } = useAuth();
    const [receivedFunds, setReceivedFunds] = useState([]);
    const [villageFunds, setVillageFunds] = useState([]); // New state for village funds
    const [loading, setLoading] = useState(true);
    const [stateName, setStateName] = useState('');
    const [activeTab, setActiveTab] = useState('project'); // Tab state

    // Backend API Base URL
    const API_BASE_URL = 'http://localhost:5001/api';

    useEffect(() => {
        fetchStateName();
    }, [user?.id]);

    useEffect(() => {
        if (stateName) {
            fetchReceivedFunds();
            fetchVillageFunds(); // Fetch village funds
        }
    }, [stateName]);

    const fetchStateName = async () => {
        if (!user?.id) return;

        try {
            const response = await fetch(`${API_BASE_URL}/profile?userId=${user.id}`);
            const result = await response.json();

            if (result.success && result.data?.full_name) {
                // Remove 'State Admin', 'Admin', and 'State' from the name
                let name = result.data.full_name;
                name = name.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
                console.log('📍 Cleaned name:', name);
                setStateName(name);
            }
        } catch (error) {
            console.error('Error fetching state name:', error);
        }
    };

    const fetchReceivedFunds = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/funds/releases`);
            const result = await response.json();

            if (result.success) {
                const data = result.data;
                // Filter for current state
                const stateFunds = data.filter(item => item.states?.name === stateName);

                const formattedData = stateFunds.map(item => ({
                    id: item.id,
                    component: item.component,
                    amountInRupees: item.amount_rupees,
                    amountCr: item.amount_cr,
                    date: item.release_date,
                    sanctionNo: item.sanction_order_no,
                    remarks: item.remarks
                }));
                setReceivedFunds(formattedData);
            }
        } catch (error) {
            console.error('Error fetching funds:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVillageFunds = async () => {
        try {
            // Fetch village funds for the state
            const response = await fetch(`${API_BASE_URL}/villages/funds/state/${encodeURIComponent(stateName)}`);
            const result = await response.json();
            if (result.success) {
                setVillageFunds(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching village funds:', error);
        }
    };

    // Calculate total based on active tab
    const totalReceived = activeTab === 'project'
        ? receivedFunds.reduce((sum, item) => sum + (item.amountInRupees || 0), 0)
        : villageFunds.reduce((sum, item) => sum + (item.amount_released || 0), 0);

    return (
        <div className="fund-received-page" style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Funds Received from Ministry</h2>
                <p style={{ color: '#666', marginTop: 8 }}>View all fund releases from the Ministry to {stateName}</p>
            </div>

            {/* Summary Card */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: 24,
                borderRadius: 12,
                marginBottom: 24,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <div style={{ fontSize: 13, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {activeTab === 'project' ? 'Total Project Funds Received' : 'Total Village Funds Received'}
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>
                    {formatCurrency ? formatCurrency(totalReceived) : `₹${totalReceived.toLocaleString('en-IN')}`}
                </div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                    {activeTab === 'project' ? receivedFunds.length : villageFunds.length} release{
                        (activeTab === 'project' ? receivedFunds.length : villageFunds.length) !== 1 ? 's' : ''
                    } received
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button
                    onClick={() => setActiveTab('project')}
                    style={{
                        padding: '8px 16px',
                        background: activeTab === 'project' ? '#0984e3' : '#e0e0e0',
                        color: activeTab === 'project' ? 'white' : '#636e72',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: '0.2s'
                    }}
                >
                    Project Funds
                </button>
                <button
                    onClick={() => setActiveTab('village')}
                    style={{
                        padding: '8px 16px',
                        background: activeTab === 'village' ? '#0984e3' : '#e0e0e0',
                        color: activeTab === 'village' ? 'white' : '#636e72',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: '0.2s'
                    }}
                >
                    Village Funds
                </button>
            </div>

            {/* Table */}
            <div className="table-wrapper" style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {activeTab === 'project' ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Scheme Component</th>
                                <th style={{ textAlign: 'right' }}>Amount Received</th>
                                <th>Release Date</th>
                                <th>Sanction Order</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 30 }}>Loading data...</td>
                                </tr>
                            ) : receivedFunds.length > 0 ? (
                                receivedFunds.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <span style={{
                                                background: '#e3f2fd',
                                                color: '#1976d2',
                                                padding: '4px 12px',
                                                borderRadius: '16px',
                                                fontSize: '12px',
                                                fontWeight: 600
                                            }}>
                                                {item.component}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#2ecc71' }}>
                                            {formatCurrency ? formatCurrency(item.amountInRupees) : `₹${item.amountInRupees}`}
                                        </td>
                                        <td>
                                            {new Date(item.date).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td>{item.sanctionNo}</td>
                                        <td style={{ color: '#666', maxWidth: 300 }}>
                                            {item.remarks || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                        No project funds received yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Release Date</th>
                                <th>District</th>
                                <th>Village</th>
                                <th>Components</th>
                                <th style={{ textAlign: 'right' }}>Total Allocation</th>
                                <th style={{ textAlign: 'right' }}>Amount Released</th>
                                <th>Sanction Order</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {villageFunds.length > 0 ? (
                                villageFunds.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            {new Date(item.release_date).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td>{item.district_name}</td>
                                        <td style={{ fontWeight: "bold", color: "#2d3436" }}>{item.village_name}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                                {item.component.map((comp, idx) => (
                                                    <span
                                                        key={idx}
                                                        style={{
                                                            fontSize: "11px",
                                                            padding: "2px 6px",
                                                            background: "#eef2f7",
                                                            color: "#4a5568",
                                                            borderRadius: "4px",
                                                            border: "1px solid #e2e8f0",
                                                        }}
                                                    >
                                                        {comp}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "right", fontWeight: "bold", color: "#2ecc71" }}>
                                            ₹{item.amount_allocated ? item.amount_allocated.toLocaleString("en-IN") : "0"}
                                        </td>
                                        <td style={{ textAlign: "right", fontWeight: "bold", color: "#00b894" }}>
                                            ₹{item.amount_released ? item.amount_released.toLocaleString("en-IN") : "0"}
                                        </td>
                                        <td style={{ fontSize: "12px", color: "#636e72" }}>
                                            {item.sanction_order_no || "-"}
                                        </td>
                                        <td>
                                            <span
                                                style={{
                                                    padding: "4px 8px",
                                                    borderRadius: "12px",
                                                    fontSize: "11px",
                                                    fontWeight: "bold",
                                                    backgroundColor:
                                                        item.status === "Released"
                                                            ? "rgba(0, 184, 148, 0.1)"
                                                            : item.status === "Utilized"
                                                                ? "rgba(9, 132, 227, 0.1)"
                                                                : "rgba(99, 110, 114, 0.1)",
                                                    color:
                                                        item.status === "Released"
                                                            ? "#00b894"
                                                            : item.status === "Utilized"
                                                                ? "#0984e3"
                                                                : "#636e72",
                                                }}
                                            >
                                                {item.status || "Released"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                        No village funds received yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default FundsReceivedFromMinistry;
