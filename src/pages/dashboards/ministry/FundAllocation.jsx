import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import InteractiveButton from '../../../components/InteractiveButton';
import VillageFundReleaseForm from './VillageFundReleaseForm';

/**
 * FundAllocation - Ministry Allocates Funds ONLY for Ministry-Approved Proposals
 * - Fetches ministry-approved proposals first
 * - Shows states with approved projects and their total cost
 * - Allows fund allocation only for states with approved proposals
 * - Persists allocation to backend API
 * - Sends WhatsApp notification via backend
 */

const FundAllocation = ({ formatCurrency, onNavigate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showVillageForm, setShowVillageForm] = useState(false);
    const [allocationData, setAllocationData] = useState({
        stateName: '',
        component: [],
        amount: '',
        date: '',
        officerId: '',
        allocatorName: '',
        allocatorRole: ''
    });
    const [fundStates, setFundStates] = useState([]);
    const [approvedProposals, setApprovedProposals] = useState([]);
    const [statesWithApprovals, setStatesWithApprovals] = useState([]);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [isNotifying, setIsNotifying] = useState(false);
    const [loading, setLoading] = useState(true);

    // Backend API Base URL
    const API_BASE_URL = 'http://localhost:5001/api';

    // Fetch Minister-Approved Proposals and Fund Allocations
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch approved proposals
                const proposalsResponse = await fetch(`${API_BASE_URL}/proposals/ministry`);
                const proposalsData = await proposalsResponse.json();

                if (proposalsData.success && proposalsData.data) {
                    const approvedOnly = proposalsData.data.filter(p => p.status === 'APPROVED_BY_MINISTRY');
                    setApprovedProposals(approvedOnly);

                    // Group proposals by state
                    const stateMap = {};
                    approvedOnly.forEach(proposal => {
                        const stateName = proposal.state_name;
                        if (!stateMap[stateName]) {
                            stateMap[stateName] = {
                                name: stateName,
                                totalProjects: 0,
                                totalCost: 0,
                                projects: []
                            };
                        }
                        stateMap[stateName].totalProjects += 1;
                        stateMap[stateName].totalCost += parseFloat(proposal.estimated_cost) || 0;
                        stateMap[stateName].projects.push({
                            id: proposal.id,
                            name: proposal.project_name,
                            district: proposal.district_name,
                            component: proposal.component,
                            cost: proposal.estimated_cost
                        });
                    });

                    setStatesWithApprovals(Object.values(stateMap));
                }

                // Fetch existing fund allocations
                const fundsResponse = await fetch(`${API_BASE_URL}/funds`);
                const fundsData = await fundsResponse.json();
                setFundStates(fundsData || []);

            } catch (error) {
                console.error('Error fetching data:', error);
                showToast('⚠️ Error loading data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper to show toast messages
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 4000);
    };

    // Open Add Allocation modal
    const openAddAllocation = (stateName = '') => {
        setAllocationData({
            stateName: stateName,
            component: [],
            amount: '',
            date: new Date().toISOString().slice(0, 10),
            officerId: '',
            allocatorName: '',
            allocatorRole: ''
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const handleComponentChange = (e) => {
        const { value, checked } = e.target;
        setAllocationData((prev) => {
            const next = checked ? [...prev.component, value] : prev.component.filter((c) => c !== value);
            return { ...prev, component: next };
        });
    };

    // Validation
    const validate = () => {
        const errs = {};
        if (!allocationData.stateName) errs.stateName = 'Please select a state.';
        const amountCr = parseFloat(allocationData.amount);
        if (isNaN(amountCr) || amountCr <= 0) errs.amount = 'Enter a valid amount (> 0).';
        if (!allocationData.officerId.trim()) errs.officerId = 'Enter Allocation Officer ID.';
        if (!allocationData.allocatorName.trim()) errs.allocatorName = 'Enter allocator name.';
        if (!allocationData.allocatorRole.trim()) errs.allocatorRole = 'Enter allocator role.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Perform allocation
    const handleAllocate = async () => {
        if (!validate()) return;

        setIsNotifying(true);

        const amountCr = parseFloat(allocationData.amount);
        const amountInRupees = Math.round(amountCr * 10000000);

        try {
            const allocationPayload = {
                stateName: allocationData.stateName,
                component: allocationData.component,
                amount: amountCr,
                date: allocationData.date,
                officerId: allocationData.officerId,
                allocatorName: allocationData.allocatorName,
                allocatorRole: allocationData.allocatorRole
            };

            const saveResponse = await fetch(`${API_BASE_URL}/funds/allocate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(allocationPayload),
            });

            const saveResult = await saveResponse.json();

            if (!saveResult.success) {
                throw new Error(saveResult.error || 'Failed to save allocation');
            }

            setIsNotifying(false);

            // Refresh fund allocations
            const response = await fetch(`${API_BASE_URL}/funds`);
            const data = await response.json();
            setFundStates(data || []);

            const successMessage =
                `✅ FUND ALLOCATION SAVED!\n\n` +
                `📊 Allocation Details:\n` +
                `• State: ${allocationData.stateName}\n` +
                `• Amount: ₹${amountInRupees.toLocaleString()} (${amountCr} Cr)\n` +
                `• Component: ${allocationData.component.join(', ') || 'N/A'}\n\n` +
                `💾 Database: SAVED TO SUPABASE ✅`;

            alert(successMessage);
            showToast(`✅ Fund allocated to ${allocationData.stateName}!`);
            closeModal();

        } catch (error) {
            console.error("Allocation Error:", error);
            setIsNotifying(false);
            alert(`❌ Error: ${error.message}\n\nPlease check the backend server and try again.`);
        }
    };

    // Get allocation info for a state
    const getStateAllocation = (stateName) => {
        return fundStates.find((s) => s.name === stateName);
    };

    // Helper: find selected state's approval info
    const selectedStateApprovals = allocationData.stateName
        ? statesWithApprovals.find((s) => s.name === allocationData.stateName)
        : null;

    const selectedStateAllocation = allocationData.stateName
        ? fundStates.find((s) => s.name === allocationData.stateName)
        : null;

    if (loading) {
        return <div style={{ padding: 20, textAlign: 'center' }}>Loading approved proposals...</div>;
    }

    if (showVillageForm) {
        return <VillageFundReleaseForm onBack={() => setShowVillageForm(false)} onNavigate={onNavigate} />;
    }

    return (
        <div className="fund-allocation-page" style={{ padding: 20 }}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Fund Allocation for Approved Projects</h2>
                    <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
                        ℹ️ Allocate funds only for states with Ministry-approved proposals
                    </p>
                </div>
                <InteractiveButton
                    variant="primary"
                    size="md"
                    onClick={() => setShowVillageForm(true)}
                    style={{ whiteSpace: 'nowrap' }}
                >
                    🏘️ Allocate Village Funds
                </InteractiveButton>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            {/* States with Approved Proposals */}
            <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, marginBottom: 16 }}>States With Ministry-Approved Projects</h3>

                {statesWithApprovals.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: 8 }}>
                        <p style={{ fontSize: 16, color: '#666' }}>❌ No Ministry-approved proposals found.</p>
                        <p style={{ fontSize: 14, color: '#999' }}>Please approve proposals in the "Project Approval" section first.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>State</th>
                                    <th style={{ textAlign: 'center' }}>Approved Projects</th>
                                    <th style={{ textAlign: 'right' }}>Total Project Cost (Lakhs)</th>
                                    <th style={{ textAlign: 'right' }}>Fund Allocated</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statesWithApprovals.map((state) => {
                                    const allocation = getStateAllocation(state.name);
                                    return (
                                        <tr key={state.name}>
                                            <td>
                                                <div style={{ fontWeight: 700 }}>{state.name}</div>
                                                <div style={{ fontSize: 12, color: '#666' }}>
                                                    {state.projects.map(p => p.district).join(', ')}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="badge badge-info">{state.totalProjects}</span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                                ₹{state.totalCost.toFixed(2)}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                {allocation ? (
                                                    <span style={{ color: '#00B894', fontWeight: 600 }}>
                                                        {formatCurrency ? formatCurrency(allocation.fundAllocated) : `₹${allocation.fundAllocated}`}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#999' }}>Not Allocated</span>
                                                )}
                                            </td>
                                            <td>
                                                <InteractiveButton
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => openAddAllocation(state.name)}
                                                >
                                                    {allocation ? '+ Top-up' : 'Allocate Funds'}
                                                </InteractiveButton>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* All Fund Allocations */}
            <div>
                <h3 style={{ fontSize: 18, marginBottom: 16 }}>All Fund Allocations</h3>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>State/UT</th>
                                <th>Scheme Component</th>
                                <th style={{ textAlign: 'right' }}>Total Allocated</th>
                                <th>Allocator Name</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fundStates.map((s) => (
                                <tr key={s.name}>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>{s.name}</div>
                                        <div style={{ fontSize: 12, color: '#666' }}>{s.code}</div>
                                    </td>
                                    <td>{Array.isArray(s.component) ? s.component.join(', ') : s.component || '-'}</td>
                                    <td style={{ textAlign: 'right', color: '#00B894', fontWeight: 600 }}>{formatCurrency ? formatCurrency(s.fundAllocated || 0) : s.fundAllocated || 0}</td>
                                    <td>{s.lastAllocation?.allocatorName || '-'}</td>
                                    <td>{s.lastAllocation?.allocatorRole || '-'}</td>
                                </tr>
                            ))}
                            {fundStates.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: 20, textAlign: 'center' }}>No fund allocations yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Allocation Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={`Allocate Funds - ${allocationData.stateName}`}
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <InteractiveButton onClick={closeModal} variant="outline">
                            Cancel
                        </InteractiveButton>
                        <InteractiveButton
                            onClick={handleAllocate}
                            variant="primary"
                            disabled={isNotifying}
                        >
                            {isNotifying ? 'Allocating...' : 'Allocate Fund'}
                        </InteractiveButton>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    {/* Show approved projects for this state */}
                    {selectedStateApprovals && (
                        <div style={{ padding: 12, backgroundColor: '#f0f8ff', borderRadius: 8, marginBottom: 16 }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#333' }}>
                                ✅ Approved Projects for {selectedStateApprovals.name}
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
                                {selectedStateApprovals.projects.map(project => (
                                    <li key={project.id} style={{ marginBottom: 6 }}>
                                        <strong>{project.name}</strong> - {project.district}
                                        <span style={{ color: '#666' }}> (₹{project.cost} Lakhs - {project.component})</span>
                                    </li>
                                ))}
                            </ul>
                            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>
                                Total Project Cost: ₹{selectedStateApprovals.totalCost.toFixed(2)} Lakhs
                            </div>
                        </div>
                    )}

                    {selectedStateAllocation && selectedStateAllocation.fundAllocated > 0 && (
                        <div style={{ padding: 12, backgroundColor: '#fffbf0', borderRadius: 8, marginBottom: 16, border: '1px solid #ffc107' }}>
                            ⚠️ This state already has {formatCurrency ? formatCurrency(selectedStateAllocation.fundAllocated) : selectedStateAllocation.fundAllocated} allocated.
                            <br />Submitting will add to the existing allocation.
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">State Name</label>
                        <select
                            className="form-control"
                            value={allocationData.stateName}
                            onChange={(e) => setAllocationData({ ...allocationData, stateName: e.target.value })}
                        >
                            <option value="">-- Select state with approved projects --</option>
                            {statesWithApprovals.map((state) => (
                                <option key={state.name} value={state.name}>
                                    {state.name} ({state.totalProjects} projects)
                                </option>
                            ))}
                        </select>
                        {errors.stateName && <div className="form-error">{errors.stateName}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Scheme Component</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <label><input type="checkbox" value="Adarsh Gram" onChange={handleComponentChange} /> Adarsh Gram</label>
                            <label><input type="checkbox" value="GIA" onChange={handleComponentChange} /> GIA</label>
                            <label><input type="checkbox" value="Hostel" onChange={handleComponentChange} /> Hostel</label>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Amount to Allocate (in Cr)</label>
                            <input
                                type="number"
                                inputMode="decimal"
                                className="form-control no-spin"
                                placeholder="e.g. 1.5"
                                value={allocationData.amount}
                                onChange={(e) => setAllocationData({ ...allocationData, amount: e.target.value })}
                                style={{ padding: '10px' }}
                            />
                            {errors.amount && <div className="form-error">{errors.amount}</div>}
                            <div className="form-helper">Enter numeric value (decimals allowed)</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Allocation Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={allocationData.date}
                                onChange={(e) => setAllocationData({ ...allocationData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Allocation Officer ID</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. OFF1234"
                            value={allocationData.officerId}
                            onChange={(e) => setAllocationData({ ...allocationData, officerId: e.target.value })}
                        />
                        {errors.officerId && <div className="form-error">{errors.officerId}</div>}
                    </div>

                    <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                    <h4 style={{ margin: '8px 0', fontSize: 16 }}>State Allocator Information</h4>

                    <div className="form-group">
                        <label className="form-label">Allocator Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Rajesh Kumar"
                            value={allocationData.allocatorName}
                            onChange={(e) => setAllocationData({ ...allocationData, allocatorName: e.target.value })}
                        />
                        {errors.allocatorName && <div className="form-error">{errors.allocatorName}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Allocator Role in State Government</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. State Finance Secretary"
                            value={allocationData.allocatorRole}
                            onChange={(e) => setAllocationData({ ...allocationData, allocatorRole: e.target.value })}
                        />
                        {errors.allocatorRole && <div className="form-error">{errors.allocatorRole}</div>}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FundAllocation;
