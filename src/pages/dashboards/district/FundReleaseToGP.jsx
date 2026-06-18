import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';

const FundReleaseToGP = ({ formatCurrency = (amount) => `₹${amount} Cr`, districtId }) => {
    const [funds, setFunds] = useState([]);
    const [totalAvailableFunds, setTotalAvailableFunds] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        gp: '',
        component: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        officerId: '',
        remarks: ''
    });
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    // Sample GPs for Pune district
    const gps = [
        "Shirur", "Khed", "Baramati", "Haveli", "Mulshi", "Maval", "Junnar", "Ambegaon", "Daund", "Indapur", "Purandar", "Velhe", "Bhor"
    ];

    useEffect(() => {
        const savedFunds = localStorage.getItem('district_funds_released');
        if (savedFunds) {
            setFunds(JSON.parse(savedFunds));
        } else {
            // Initial sample data
            const initialData = [
                { id: 1, gp: 'Shirur', component: 'Adarsh Gram', amount: '0.50', date: '2025-11-15', officerId: 'OFF-101', remarks: 'First installment' },
                { id: 2, gp: 'Khed', component: 'Infrastructure', amount: '0.75', date: '2025-11-18', officerId: 'OFF-102', remarks: 'Road construction' },
            ];
            setFunds(initialData);
            localStorage.setItem('district_funds_released', JSON.stringify(initialData));
        }
    }, []);

    // Fetch total available funds from State
    useEffect(() => {
        const fetchTotalFunds = async () => {
            if (!districtId) return;
            try {
                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/fund_releases?district_id=eq.${districtId}&select=amount_cr`, {
                    headers: {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const total = data.reduce((sum, item) => sum + (item.amount_cr || 0), 0);
                    setTotalAvailableFunds(total);
                }
            } catch (error) {
                console.error('Error fetching total funds:', error);
            }
        };
        fetchTotalFunds();
    }, [districtId]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const validate = () => {
        const errs = {};
        if (!formData.gp) errs.gp = 'Please select a Gram Panchayat';
        if (!formData.component) errs.component = 'Please select a component';
        if (!formData.amount || parseFloat(formData.amount) <= 0) errs.amount = 'Please enter a valid amount';
        if (!formData.date) errs.date = 'Please select a date';
        if (!formData.officerId.trim()) errs.officerId = 'Officer ID is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleRelease = () => {
        if (!validate()) return;

        const newFund = {
            id: Date.now(),
            ...formData
        };

        const updatedFunds = [newFund, ...funds];
        setFunds(updatedFunds);
        localStorage.setItem('district_funds_released', JSON.stringify(updatedFunds));

        showToast(`₹${formData.amount} Cr released to ${formData.gp} GP successfully`);
        setIsModalOpen(false);
        setFormData({
            gp: '',
            component: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            officerId: '',
            remarks: ''
        });
        setErrors({});
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Fund Release to Gram Panchayats</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>+ Release New Funds</button>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="dashboard-section">
                <div className="card" style={{ padding: 20, marginBottom: 20, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#666' }}>Total Funds Available</h3>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>₹{totalAvailableFunds.toFixed(2)} Cr</div>
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#666' }}>Total Released</h3>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                                ₹{funds.reduce((sum, f) => sum + parseFloat(f.amount), 0).toFixed(2)} Cr
                            </div>
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#666' }}>Pending Requests</h3>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e67e22' }}>3</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Gram Panchayat</th>
                            <th>Component</th>
                            <th>Amount (Cr)</th>
                            <th>Date</th>
                            <th>Officer ID</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {funds.length > 0 ? (
                            funds.map(fund => (
                                <tr key={fund.id}>
                                    <td><strong>{fund.gp}</strong></td>
                                    <td><span className="badge badge-primary">{fund.component}</span></td>
                                    <td style={{ color: '#27ae60', fontWeight: 'bold' }}>₹{parseFloat(fund.amount).toFixed(2)} Cr</td>
                                    <td>{fund.date}</td>
                                    <td>{fund.officerId}</td>
                                    <td>{fund.remarks || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No fund release records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setErrors({}); }}
                title="Release Funds to Gram Panchayat"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => { setIsModalOpen(false); setErrors({}); }} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={handleRelease} className="btn btn-primary" style={{ padding: '8px 14px' }}>
                            Confirm Release
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">Select Gram Panchayat</label>
                        <select
                            className="form-control"
                            value={formData.gp}
                            onChange={(e) => setFormData({ ...formData, gp: e.target.value })}
                        >
                            <option value="">-- Select GP --</option>
                            {gps.map(gp => (
                                <option key={gp} value={gp}>{gp}</option>
                            ))}
                        </select>
                        {errors.gp && <div className="form-error">{errors.gp}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Scheme Component</label>
                        <select
                            className="form-control"
                            value={formData.component}
                            onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                        >
                            <option value="">-- Select Component --</option>
                            <option value="Adarsh Gram">Adarsh Gram</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Skill Development">Skill Development</option>
                            <option value="Livelihood">Livelihood Projects</option>
                        </select>
                        {errors.component && <div className="form-error">{errors.component}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount (in Crores)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control no-spin"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                        <div className="form-helper">Enter numeric value (decimals allowed)</div>
                        {errors.amount && <div className="form-error">{errors.amount}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Release Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                        {errors.date && <div className="form-error">{errors.date}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Officer ID</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. OFF-123"
                            value={formData.officerId}
                            onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
                        />
                        {errors.officerId && <div className="form-error">{errors.officerId}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Remarks (Optional)</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Add notes..."
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ marginTop: 15, padding: 10, backgroundColor: '#e8f5e9', borderRadius: 6, fontSize: '14px', color: '#2e7d32' }}>
                    <strong>Note:</strong> Available balance for release is ₹{totalAvailableFunds.toFixed(2)} Cr. Please ensure sufficient funds before releasing.
                </div>
            </Modal>
        </div>
    );
};

export default FundReleaseToGP;
