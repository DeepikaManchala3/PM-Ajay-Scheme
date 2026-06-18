import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import InteractiveButton from '../../../components/InteractiveButton';

const FundReleaseToAgencies = ({ formatCurrency }) => {
    const { user } = useAuth();
    const [releasedFunds, setReleasedFunds] = useState([]);
    const [receivedFunds, setReceivedFunds] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [totalReceived, setTotalReceived] = useState(0);
    const [totalReleased, setTotalReleased] = useState(0);
    const [componentStats, setComponentStats] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    const [districtName, setDistrictName] = useState('');
    const [districtId, setDistrictId] = useState(null);

    const [formData, setFormData] = useState({
        agencyId: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        bankAccount: '',
        remarks: ''
    });

    const [errors, setErrors] = useState({});

    // API Base URL
    const API_BASE_URL = 'http://localhost:5001/api';

    // Fetch district info from user profile
    useEffect(() => {
        const fetchDistrictInfo = async () => {
            if (!user?.id) return;
            try {
                const response = await fetch(`${API_BASE_URL}/profile?userId=${user.id}`);
                const result = await response.json();
                if (result.success && result.data?.full_name) {
                    let name = result.data.full_name;
                    name = name.replace(' District Admin', '').replace(' Admin', '').replace(' District', '').trim();
                    setDistrictName(name);

                    // Fetch District ID
                    const distRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/districts?name=eq.${encodeURIComponent(name)}&select=id`, {
                        headers: {
                            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                        }
                    });
                    const distData = await distRes.json();
                    if (distData && distData.length > 0) {
                        setDistrictId(distData[0].id);
                    }
                }
            } catch (error) {
                console.error('Error fetching district info:', error);
            }
        };
        fetchDistrictInfo();
    }, [user]);

    // Fetch Data when districtId is available
    useEffect(() => {
        if (districtId) {
            fetchAgencies();
            fetchReleasedFunds();
            fetchReceivedFunds();
        }
    }, [districtId]);

    const fetchAgencies = async () => {
        try {
            console.log('Fetching agencies for district:', districtName);
            const response = await fetch(`${API_BASE_URL}/implementing-agencies?districtName=${encodeURIComponent(districtName)}&activeOnly=true`);
            const result = await response.json();
            console.log('Agencies response:', result);
            if (result.success) {
                setAgencies(result.data);
                console.log('Agencies set:', result.data);
            }
        } catch (error) {
            console.error('Error fetching agencies:', error);
        }
    };

    const fetchReleasedFunds = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/funds/agency-releases?districtId=${districtId}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    const formattedData = result.data.map(item => {
                        // Get the state release date for this component
                        const component = Array.isArray(item.component) ? item.component[0] : item.component;
                        const stateReleaseDate = window.stateReleaseDates?.[component] || null;

                        return {
                            id: item.id,
                            agencyName: item.implementing_agencies_assignment?.agency_name || 'Unknown Agency',
                            adminName: item.implementing_agencies_assignment?.admin_name,
                            component: item.component,
                            amountInRupees: item.amount_rupees,
                            amountCr: item.amount_cr,
                            date: item.release_date,
                            stateReleaseDate: stateReleaseDate,
                            remarks: item.remarks
                        };
                    });
                    setReleasedFunds(formattedData);
                    const total = formattedData.reduce((sum, item) => sum + (item.amountCr || 0), 0);
                    setTotalReleased(total);
                }
            }
        } catch (error) {
            console.error('Error fetching released funds:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReceivedFunds = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/funds/releases-to-district?districtId=${districtId}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setReceivedFunds(result.data);
                    const total = result.data.reduce((sum, item) => sum + (item.amount_cr || 0), 0);
                    setTotalReceived(total);

                    // Store state release dates by component for later matching
                    const datesByComponent = {};
                    result.data.forEach(item => {
                        const comps = Array.isArray(item.component) ? item.component : [item.component];
                        comps.forEach(c => {
                            if (!datesByComponent[c] || new Date(item.release_date) > new Date(datesByComponent[c])) {
                                datesByComponent[c] = item.release_date;
                            }
                        });
                    });
                    window.stateReleaseDates = datesByComponent; // Store globally for access in fetchReleasedFunds
                }
            }
        } catch (error) {
            console.error('Error fetching received funds:', error);
        }
    };

    // Calculate Component-wise Stats
    useEffect(() => {
        const stats = {
            'Adarsh Gram': { received: 0, released: 0 },
            'GIA': { received: 0, released: 0 },
            'Hostel': { received: 0, released: 0 }
        };

        receivedFunds.forEach(item => {
            const amount = item.amount_cr || 0;
            const comps = Array.isArray(item.component) ? item.component : [item.component];
            comps.forEach(c => {
                if (stats[c]) stats[c].received += amount;
            });
        });

        releasedFunds.forEach(item => {
            const amount = item.amountCr || 0;
            const comps = Array.isArray(item.component) ? item.component : [item.component];
            comps.forEach(c => {
                if (stats[c]) stats[c].released += amount;
            });
        });

        setComponentStats(stats);
    }, [receivedFunds, releasedFunds]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const openModal = () => {
        const availableComps = Object.keys(componentStats).filter(c =>
            (componentStats[c]?.received - componentStats[c]?.released) > 0
        );

        setFormData({
            agencyId: '',
            component: availableComps.length === 1 ? availableComps[0] : '',
            amount: '',
            date: new Date().toISOString().slice(0, 10),
            bankAccount: '',
            remarks: '',
            availableComponents: availableComps
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const validate = () => {
        const errs = {};
        if (!formData.agencyId) errs.agencyId = 'Select an agency.';
        if (!formData.component) errs.component = 'Select a component.';

        const amountCr = parseFloat(formData.amount);
        if (isNaN(amountCr) || amountCr <= 0) errs.amount = 'Enter a valid amount (> 0).';

        if (!formData.date) errs.date = 'Select a release date.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleReleaseSubmit = async () => {
        if (!validate()) return;

        const amountCr = parseFloat(formData.amount);
        const activeComponent = formData.component;
        const compAvailable = componentStats[activeComponent]?.received - componentStats[activeComponent]?.released || 0;

        if (amountCr > compAvailable) {
            showToast(`Insufficient balance for ${activeComponent}! Available: ₹${compAvailable.toFixed(2)} Cr`, 'error');
            return;
        }

        try {
            const payload = {
                districtId: districtId,
                agencyId: formData.agencyId,
                component: activeComponent,
                amount: amountCr,
                date: formData.date,
                remarks: formData.remarks,
                bankAccount: formData.bankAccount,
                createdBy: user?.id,
                districtName: districtName
            };

            const response = await fetch(`${API_BASE_URL}/funds/agency-release`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showToast(`Successfully released ₹${amountCr} Cr`);
                fetchReleasedFunds();
                closeModal();
            } else {
                showToast(`Error: ${result.error || 'Failed to release funds'}`, 'error');
            }
        } catch (error) {
            console.error('Error saving fund release:', error);
            showToast('Network error occurred', 'error');
        }
    };

    return (
        <div className="fund-released-page" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Fund Release to Implementing Agencies</h2>
                <InteractiveButton variant="primary" onClick={openModal}>
                    + Release New Funds
                </InteractiveButton>
            </div>

            {/* Fund Summary Card */}
            <div className="card" style={{ padding: 20, marginBottom: 20, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#666' }}>Total Funds Received (State)</h3>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>₹{totalReceived.toFixed(2)} Cr</div>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#666' }}>Total Released (Agencies)</h3>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e67e22' }}>₹{totalReleased.toFixed(2)} Cr</div>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#666' }}>Available Balance</h3>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                            ₹{(totalReceived - totalReleased).toFixed(2)} Cr
                        </div>
                    </div>
                </div>
            </div>

            {/* Component-wise Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 20 }}>
                {Object.entries(componentStats).map(([component, stats]) => (
                    <div key={component} className="card" style={{ padding: 15, border: '1px solid #e0e0e0', borderRadius: 8, backgroundColor: '#fff' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50', borderBottom: '1px solid #eee', paddingBottom: 8, fontSize: '16px' }}>{component}</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: '#7f8c8d', fontSize: 13 }}>Received:</span>
                            <span style={{ fontWeight: 600, color: '#2c3e50' }}>₹{stats.received.toFixed(2)} Cr</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: '#7f8c8d', fontSize: 13 }}>Released:</span>
                            <span style={{ fontWeight: 600, color: '#e67e22' }}>₹{stats.released.toFixed(2)} Cr</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px dashed #eee' }}>
                            <span style={{ color: '#7f8c8d', fontSize: 13 }}>Available:</span>
                            <span style={{ fontWeight: 'bold', color: (stats.received - stats.released) > 0 ? '#27ae60' : '#95a5a6' }}>
                                ₹{(stats.received - stats.released).toFixed(2)} Cr
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {toast && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{
                        display: 'inline-block',
                        background: toast.type === 'error' ? '#FF7675' : '#00B894',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: 6,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Agency Name</th>
                            <th>Admin Name</th>
                            <th>Scheme Component</th>
                            <th style={{ textAlign: 'right' }}>Amount Released</th>
                            <th>State Release Date</th>
                            <th>Agency Release Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 30 }}>Loading data...</td>
                            </tr>
                        ) : releasedFunds.length > 0 ? (
                            releasedFunds.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 600 }}>{item.agencyName}</td>
                                    <td>{item.adminName}</td>
                                    <td>{item.component.join(', ')}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#2ecc71' }}>
                                        {formatCurrency ? formatCurrency(item.amountInRupees) : item.amountInRupees}
                                    </td>
                                    <td>{item.stateReleaseDate || '-'}</td>
                                    <td>{item.date}</td>
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

            {/* Release Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Release Funds to Agency"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <InteractiveButton variant="outline" onClick={closeModal}>
                            Cancel
                        </InteractiveButton>
                        <InteractiveButton variant="primary" onClick={handleReleaseSubmit}>
                            Confirm Release
                        </InteractiveButton>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">Scheme Component</label>
                        {formData.availableComponents && formData.availableComponents.length > 1 ? (
                            <select
                                className="form-control"
                                value={formData.component}
                                onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                            >
                                <option value="">-- Select Component --</option>
                                {formData.availableComponents.map(c => (
                                    <option key={c} value={c}>
                                        {c} (Avail: ₹{(componentStats[c]?.received - componentStats[c]?.released).toFixed(2)} Cr)
                                    </option>
                                ))}
                            </select>
                        ) : formData.availableComponents && formData.availableComponents.length === 1 ? (
                            <div style={{ padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd', color: '#0369a1' }}>
                                <strong>{formData.availableComponents[0]}</strong>
                                <span style={{ float: 'right', fontWeight: 'bold' }}>
                                    Avail: ₹{(componentStats[formData.availableComponents[0]]?.received - componentStats[formData.availableComponents[0]]?.released).toFixed(2)} Cr
                                </span>
                            </div>
                        ) : (
                            <div style={{ padding: '10px', backgroundColor: '#fee2e2', borderRadius: '6px', border: '1px solid #fca5a5', color: '#b91c1c' }}>
                                No funds available to release.
                            </div>
                        )}
                        {errors.component && <div className="form-error">{errors.component}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Implementing Agency</label>
                        <select
                            className="form-control"
                            value={formData.agencyId}
                            onChange={(e) => setFormData({ ...formData, agencyId: e.target.value })}
                        >
                            <option value="">-- Select Agency --</option>
                            {agencies.map((a) => (
                                <option key={a.id} value={a.id}>{a.agency_name} ({a.admin_name})</option>
                            ))}
                        </select>
                        {errors.agencyId && <div className="form-error">{errors.agencyId}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount to Release (in Cr)</label>
                        <input
                            type="number"
                            inputMode="decimal"
                            pattern="[0-9]*[.,]?[0-9]*"
                            min="0"
                            className="form-control no-spin"
                            placeholder="e.g. 0.5"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.amount && <div className="form-error">{errors.amount}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bank Account Number (Optional)</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Bank Account Number"
                            value={formData.bankAccount}
                            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                        />
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
                </div>
            </Modal>
        </div>
    );
};

export default FundReleaseToAgencies;
