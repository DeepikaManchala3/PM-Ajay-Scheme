import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import InteractiveButton from '../../../components/InteractiveButton';
import { useAuth } from '../../../contexts/AuthContext';

const FundReleased = ({ formatCurrency, initialTab }) => {
    const { user } = useAuth();
    const [releasedFunds, setReleasedFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [bankAccount, setBankAccount] = useState('');
    const [toast, setToast] = useState(null);
    // Removed activeSubTab state - showing only village funds
    const [villageFunds, setVillageFunds] = useState([]);
    const [statesWithAdmins, setStatesWithAdmins] = useState([]);

    // Village fund release modal states
    const [isVillageReleaseModalOpen, setIsVillageReleaseModalOpen] = useState(false);
    const [selectedVillageFund, setSelectedVillageFund] = useState(null);
    const [villageReleaseAmount, setVillageReleaseAmount] = useState('');

    // Fetch Data on Mount
    useEffect(() => {
        fetchStatesWithAdmins();
        // Fetch village funds initially too, or only when tab changes
        fetchVillageFunds();

        // Removed initialTab handling - showing only village funds
    }, [initialTab]);

    // Refetch projects when states with admins are loaded
    useEffect(() => {
        if (statesWithAdmins.length > 0) {
            fetchApprovedProjects();
        }
    }, [statesWithAdmins]);

    // Fetch states that have registered state admins
    const fetchStatesWithAdmins = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/state-admins');
            const result = await response.json();
            if (result.success) {
                // Extract unique state names from state admins
                const uniqueStates = [...new Set(result.data.map(admin => admin.state_name))];
                setStatesWithAdmins(uniqueStates);
            }
        } catch (error) {
            console.error('Error fetching state admins:', error);
        }
    };

    const fetchApprovedProjects = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/proposals/approved');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Filter projects to only show states with registered admins
                    const filteredProjects = result.data.filter(project =>
                        statesWithAdmins.includes(project.stateName)
                    );
                    setReleasedFunds(filteredProjects);
                }
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVillageFunds = async () => {
        try {
            // For now, fetching for Andhra Pradesh as the primary use case, 
            // but ideally this should be all or filtered by selected state context if available.
            // Since there's no global "selectedState" passed here easily without prop drilling, 
            // we will fetch for Andhra Pradesh as verified in the task.
            const response = await fetch(`http://localhost:5001/api/villages/funds/state/Andhra%20Pradesh`);
            const result = await response.json();
            if (result.success) {
                setVillageFunds(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching village funds:', error);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleReleaseClick = (project) => {
        setSelectedProject(project);
        setBankAccount('');
        setIsReleaseModalOpen(true);
    };

    const handleConfirmRelease = async () => {
        if (!bankAccount.trim()) {
            showToast('Please enter a bank account number', 'error');
            return;
        }

        // Use the minimum allocation amount automatically
        const releaseAmount = selectedProject.minimumAllocation || selectedProject.allocatedAmount;

        if (!releaseAmount || parseFloat(releaseAmount) <= 0) {
            showToast('Invalid minimum allocation amount', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/funds/release', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stateName: selectedProject.stateName,
                    amount: (parseFloat(releaseAmount) / 100).toFixed(4), // Convert Lakhs to Cr if needed
                    amount_rupees: parseFloat(releaseAmount) * 100000,
                    component: [selectedProject.component],
                    date: new Date().toISOString().slice(0, 10),
                    officerId: `PROJ-${selectedProject.id}`,
                    remarks: `Fund release for project: ${selectedProject.projectName}`,
                    bankAccount: bankAccount
                })
            });

            const result = await response.json();

            if (result.success) {
                showToast('Funds released successfully!');
                setIsReleaseModalOpen(false);
                fetchApprovedProjects(); // Refresh list
            } else {
                showToast('Failed to release funds', 'error');
            }
        } catch (error) {
            console.error('Error releasing funds:', error);
            showToast('Error releasing funds', 'error');
        }
    };

    // Handle village fund release click
    const handleVillageReleaseClick = (villageFund) => {
        setSelectedVillageFund(villageFund);
        setVillageReleaseAmount('');
        setIsVillageReleaseModalOpen(true);
    };

    // Confirm village fund installment release
    const handleConfirmVillageRelease = async () => {
        if (!villageReleaseAmount || parseFloat(villageReleaseAmount) <= 0) {
            showToast('Please enter a valid release amount', 'error');
            return;
        }

        const remainingFunds = (selectedVillageFund.amount_released || 0) - (selectedVillageFund.amount_utilized || 0);
        if (parseFloat(villageReleaseAmount) > remainingFunds) {
            showToast('Release amount cannot exceed remaining funds', 'error');
            return;
        }

        try {
            // Update the village fund release with new utilized amount
            const response = await fetch(`http://localhost:5001/api/villages/release-installment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    village_fund_id: selectedVillageFund.id,
                    installment_amount: parseFloat(villageReleaseAmount),
                    release_date: new Date().toISOString().slice(0, 10)
                })
            });

            const result = await response.json();

            if (result.success) {
                showToast('Installment released successfully!');
                setIsVillageReleaseModalOpen(false);
                setVillageReleaseAmount('');
                fetchVillageFunds(); // Refresh list
            } else {
                showToast(result.message || 'Failed to release installment', 'error');
            }
        } catch (error) {
            console.error('Error releasing village installment:', error);
            showToast('Error releasing installment', 'error');
        }
    };

    return (
        <div className="fund-released-page" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Fund Released Log</h2>
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

            {/* Removed Tabs - Showing only Village Funds */}

            {/* Commented out Project Funds Table - Only showing Village Funds */}
            {/* 
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>STATE/UT</th>
                            <th>SCHEME COMPONENT</th>
                            <th style={{ textAlign: 'right' }}>PROJECT COST</th>
                            <th style={{ textAlign: 'right' }}>MINIMUM ALLOCATION</th>
                            <th style={{ textAlign: 'right' }}>AMOUNT RELEASED</th>
                            <th style={{ textAlign: 'right' }}>REMAINING FUND</th>
                            <th>PROJECT NAME</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: 30 }}>Loading data...</td>
                            </tr>
                        ) : releasedFunds.length > 0 ? (
                            releasedFunds.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 600 }}>{item.stateName}</td>
                                    <td>
                                        <span style={{
                                            background: '#e3f2fd',
                                            color: '#1976d2',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            display: 'inline-block'
                                        }}>
                                            {item.component}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', color: '#555', fontWeight: 600 }}>
                                        ₹{item.estimatedCost} Lakhs
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#2c3e50' }}>
                                        ₹{item.allocatedAmount} Lakhs
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#00B894' }}>
                                        ₹{item.releasedAmount} Lakhs
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#EF4444' }}>
                                        ₹{item.remainingAmount} Lakhs
                                    </td>
                                    <td style={{ color: '#555' }}>
                                        {item.projectName}
                                    </td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        <InteractiveButton
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleReleaseClick(item)}
                                            disabled={item.remainingAmount <= 0}
                                        >
                                            {item.remainingAmount <= 0 ? 'Fully Released' : 'Release Funds'}
                                        </InteractiveButton>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No approved projects found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            */}

            {/* Village Funds Table */}
            <div className="table-wrapper">
                <table className="table" style={{ marginTop: 20 }}>
                    <thead>
                        <tr>
                            <th>RELEASE DATE</th>
                            <th>DISTRICT</th>
                            <th>VILLAGE</th>
                            <th>COMPONENTS</th>
                            <th style={{ textAlign: 'right' }}>TOTAL ALLOCATION</th>
                            <th style={{ textAlign: 'right' }}>AMOUNT RELEASED</th>
                            <th style={{ textAlign: 'right' }}>REMAINING FUNDS</th>
                            <th>SANCTION ORDER</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {villageFunds.length > 0 ? (
                            villageFunds.map((item) => (
                                <tr key={item.id}>
                                    <td>{new Date(item.release_date).toLocaleDateString('en-GB')}</td>
                                    <td>{item.district_name}</td>
                                    <td style={{ fontWeight: 600 }}>{item.village_name}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {/* Components Group */}
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                {item.component && item.component.filter(c => ['Adarsh Gram', 'GIA', 'Hostel'].includes(c)).map((comp, idx) => (
                                                    <span key={`comp-${idx}`} style={{
                                                        background: '#e3f2fd',
                                                        color: '#1976d2',
                                                        padding: '6px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: 'bold',
                                                        textTransform: 'uppercase',
                                                        display: 'inline-block'
                                                    }}>
                                                        {comp}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Projects Group */}
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                {(item.projects && item.projects.length > 0 ? item.projects : (item.component && item.component.filter(c => !['Adarsh Gram', 'GIA', 'Hostel'].includes(c))))?.map((comp, idx) => (
                                                    <span key={`proj-${idx}`} style={{
                                                        background: '#f3e5f5',  // Different color for Projects (Purple-ish) to distinguish
                                                        color: '#7b1fa2',
                                                        padding: '6px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: 'bold',
                                                        textTransform: 'uppercase',
                                                        display: 'inline-block'
                                                    }}>
                                                        {comp}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#2c3e50' }}>
                                        ₹{item.amount_allocated ? item.amount_allocated.toLocaleString('en-IN') : 0}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#00B894' }}>
                                        ₹{item.amount_released ? item.amount_released.toLocaleString('en-IN') : 0}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#EF4444' }}>
                                        ₹{((item.amount_allocated || 0) - (item.amount_released || 0)).toLocaleString('en-IN')}
                                    </td>
                                    <td>{item.sanction_order_no || '-'}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <InteractiveButton
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleVillageReleaseClick(item)}
                                                disabled={((item.amount_allocated || 0) - (item.amount_released || 0)) <= 0}
                                                style={{ whiteSpace: 'nowrap' }}
                                            >
                                                Release Installment
                                            </InteractiveButton>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No village releases found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Release Modal */}
            <Modal
                isOpen={isReleaseModalOpen}
                onClose={() => setIsReleaseModalOpen(false)}
                title="Release Funds to Project"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <InteractiveButton onClick={() => setIsReleaseModalOpen(false)} variant="outline">
                            Cancel
                        </InteractiveButton>
                        <InteractiveButton onClick={handleConfirmRelease} variant="primary">
                            Confirm Release
                        </InteractiveButton>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                    <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#495057' }}>Project Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', fontSize: '13px' }}>
                            <div style={{ color: '#6c757d' }}>State:</div>
                            <div style={{ fontWeight: 600, textAlign: 'right' }}>{selectedProject?.stateName}</div>

                            <div style={{ color: '#6c757d' }}>Component:</div>
                            <div style={{ fontWeight: 600, textAlign: 'right' }}>{selectedProject?.component}</div>

                            <div style={{ color: '#6c757d' }}>Project:</div>
                            <div style={{ fontWeight: 600, textAlign: 'right' }}>{selectedProject?.projectName}</div>

                            <div style={{ color: '#6c757d', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #dee2e6' }}>Amount to be Released:</div>
                            <div style={{ fontWeight: 700, color: '#2ecc71', fontSize: '15px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #dee2e6', textAlign: 'right' }}>
                                ₹{selectedProject?.minimumAllocation || selectedProject?.allocatedAmount} Lakhs
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Bank Account Number <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter bank account number"
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            style={{ padding: '10px' }}
                        />
                        <div className="form-helper">Enter the bank account number for fund transfer</div>
                    </div>

                    <div style={{
                        background: '#fff3cd',
                        color: '#856404',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        border: '1px solid #ffeeba',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>⚠️</span>
                        <span>Note: Please verify the bank account number before confirming the fund release.</span>
                    </div>
                </div>
            </Modal>

            {/* Village Fund Installment Release Modal */}
            <Modal
                isOpen={isVillageReleaseModalOpen}
                onClose={() => setIsVillageReleaseModalOpen(false)}
                title="Release Village Fund Installment"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <InteractiveButton onClick={() => setIsVillageReleaseModalOpen(false)} variant="outline">
                            Cancel
                        </InteractiveButton>
                        <InteractiveButton onClick={handleConfirmVillageRelease} variant="primary">
                            Confirm Release
                        </InteractiveButton>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                    <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#495057' }}>Village Fund Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', fontSize: '13px' }}>
                            <div style={{ color: '#6c757d' }}>Village:</div>
                            <div style={{ fontWeight: 600, textAlign: 'right' }}>{selectedVillageFund?.village_name}</div>

                            <div style={{ color: '#6c757d' }}>District:</div>
                            <div style={{ fontWeight: 600, textAlign: 'right' }}>{selectedVillageFund?.district_name}</div>

                            <div style={{ color: '#6c757d' }}>Total Allocation:</div>
                            <div style={{ fontWeight: 600, textAlign: 'right' }}>
                                ₹{selectedVillageFund?.amount_allocated?.toLocaleString('en-IN') || 0}
                            </div>

                            <div style={{ color: '#6c757d' }}>Already Released:</div>
                            <div style={{ fontWeight: 600, textAlign: 'right' }}>
                                ₹{selectedVillageFund?.amount_released?.toLocaleString('en-IN') || 0}
                            </div>

                            <div style={{ color: '#6c757d', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #dee2e6' }}>Remaining Allocation:</div>
                            <div style={{ fontWeight: 700, color: '#2ecc71', fontSize: '15px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #dee2e6', textAlign: 'right' }}>
                                ₹{((selectedVillageFund?.amount_allocated || 0) - (selectedVillageFund?.amount_released || 0)).toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Installment Amount (₹) <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Enter installment amount"
                            value={villageReleaseAmount}
                            onChange={(e) => setVillageReleaseAmount(e.target.value)}
                            max={(selectedVillageFund?.amount_allocated || 0) - (selectedVillageFund?.amount_released || 0)}
                        />
                        <div className="form-helper">
                            Maximum: ₹{((selectedVillageFund?.amount_allocated || 0) - (selectedVillageFund?.amount_released || 0)).toLocaleString('en-IN')}
                        </div>
                    </div>

                    <div style={{
                        background: '#fff3cd',
                        color: '#856404',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        border: '1px solid #ffeeba',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>⚠️</span>
                        <span>Note: This installment will be released to the village for project execution.</span>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FundReleased;
