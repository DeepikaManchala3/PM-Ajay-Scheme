import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import InteractiveButton from '../../../components/InteractiveButton';
import { useAuth } from '../../../contexts/AuthContext';
import { Eye, Check, X } from 'lucide-react';

const AnnualPlansApproval = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [minAllocationAmount, setMinAllocationAmount] = useState('');
    const [toast, setToast] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [componentFilter, setComponentFilter] = useState('');
    const [stateFilter, setStateFilter] = useState('');
    const { user } = useAuth();

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/proposals/ministry');
            const result = await response.json();
            if (result.success) {
                setPlans(result.data);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
            showToast('Failed to load proposals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleApproveClick = (plan) => {
        setSelectedPlan(plan);
        setMinAllocationAmount(plan.estimated_cost || '');
        setIsApproveModalOpen(true);
    };

    const handleRejectClick = (plan) => {
        setSelectedPlan(plan);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const updateStatus = async (status, reason = '', allocationAmount = null) => {
        try {
            const requestBody = {
                status: status,
                rejectReason: reason,
                userId: user?.id
            };

            // Add allocation amount if approving
            if (status === 'APPROVED_BY_MINISTRY' && allocationAmount) {
                requestBody.allocatedAmount = parseFloat(allocationAmount);
            }

            const response = await fetch(`http://localhost:5001/api/proposals/${selectedPlan.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            if (result.success) {
                showToast(`Proposal ${status === 'APPROVED_BY_MINISTRY' ? 'approved' : 'rejected'} successfully`);
                fetchPlans(); // Refresh list
            } else {
                showToast('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Error updating status');
        }
    };

    const confirmApprove = async () => {
        if (!minAllocationAmount || parseFloat(minAllocationAmount) <= 0) {
            showToast('Please enter a valid minimum allocation amount');
            return;
        }

        if (parseFloat(minAllocationAmount) > parseFloat(selectedPlan.estimated_cost)) {
            showToast('Allocation amount cannot exceed the project cost');
            return;
        }

        await updateStatus('APPROVED_BY_MINISTRY', '', minAllocationAmount);
        setIsApproveModalOpen(false);
    };

    const confirmReject = async () => {
        if (!rejectReason.trim()) {
            showToast('Please provide a reason for rejection');
            return;
        }
        await updateStatus('REJECTED_BY_MINISTRY', rejectReason);
        setIsRejectModalOpen(false);
    };



    const handleViewPDF = (plan) => {
        // If there's a document URL, open it
        if (plan.documents && plan.documents.length > 0) {
            window.open(plan.documents[0].url, '_blank');
            return;
        }

        // Fallback to generated view if no document
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Project Proposal - ${plan.project_name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
                        h1 { color: #2c3e50; margin: 0; }
                        .section { margin-bottom: 25px; }
                        .section-title { font-weight: bold; color: #2c3e50; font-size: 16px; margin-bottom: 8px; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; }
                        .info-row { display: flex; margin-bottom: 10px; }
                        .info-label { font-weight: bold; width: 200px; color: #555; }
                        .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Project Proposal</h1>
                        <div style="color: #666; margin-top: 5px;">${plan.state_name} - ${plan.district_name}</div>
                    </div>
                    <div class="section">
                        <div class="section-title">Overview</div>
                        <div class="info-row"><div class="info-label">Project Name:</div><div>${plan.project_name}</div></div>
                        <div class="info-row"><div class="info-label">Component:</div><div>${plan.component}</div></div>
                        <div class="info-row"><div class="info-label">Estimated Cost:</div><div>₹${plan.estimated_cost} Lakhs</div></div>
                        <div class="info-row"><div class="info-label">Submission Date:</div><div>${new Date(plan.created_at).toLocaleDateString()}</div></div>
                        <div class="info-row"><div class="info-label">Status:</div><div>${plan.status}</div></div>
                    </div>
                    <div class="section">
                        <div class="section-title">Description</div>
                        <p>${plan.description || 'No description provided.'}</p>
                    </div>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
        } catch (error) {
            console.error('Error generating view:', error);
            showToast('Error opening view');
        }
    };

    const filteredPlans = plans.filter(plan => {
        // Status filter
        if (statusFilter) {
            if (statusFilter === 'Pending' && plan.status !== 'APPROVED_BY_STATE') return false;
            if (statusFilter === 'Approved' && plan.status !== 'APPROVED_BY_MINISTRY') return false;
            if (statusFilter === 'Rejected' && plan.status !== 'REJECTED_BY_MINISTRY') return false;
        }

        // Component filter
        if (componentFilter && plan.component !== componentFilter) return false;

        // State filter
        if (stateFilter && plan.state_name !== stateFilter) return false;

        return true;
    });

    // Get unique components and states for filter dropdowns
    const uniqueComponents = [...new Set(plans.map(p => p.component))].filter(Boolean);
    const uniqueStates = [...new Set(plans.map(p => p.state_name))].filter(Boolean);

    return (
        <div className="dashboard-panel">
            <div className="section-header">
                <h2 className="section-title">Project Approval</h2>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {/* Component Filter */}
                    <select
                        className="form-select"
                        value={componentFilter}
                        onChange={(e) => setComponentFilter(e.target.value)}
                        style={{
                            width: '180px',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#fff',
                            fontSize: '14px',
                            color: '#4a5568',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">All Components</option>
                        {uniqueComponents.map(comp => (
                            <option key={comp} value={comp}>{comp}</option>
                        ))}
                    </select>

                    {/* State Filter */}
                    <select
                        className="form-select"
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        style={{
                            width: '180px',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#fff',
                            fontSize: '14px',
                            color: '#4a5568',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">All States</option>
                        {uniqueStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        className="form-select"
                        style={{
                            width: '200px',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#fff',
                            fontSize: '14px',
                            color: '#4a5568',
                            cursor: 'pointer',
                            outline: 'none',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            appearance: 'none', // Remove default arrow to style it better if we had a wrapper, but for now this cleans it up
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a0aec0'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3e%3c/path%3e%3c/svg%3e")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                            backgroundSize: '16px'
                        }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Proposals</option>
                        <option value="Pending">Pending Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {toast && (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: '6px' }}>{toast}</div>
                </div>
            )}

            <div className="table-wrapper">
                <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                    <thead>
                        <tr style={{ background: '#000080', color: 'white', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '0.5px' }}>
                            <th style={{ padding: '15px', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>State / District</th>
                            <th style={{ padding: '15px' }}>Project Name</th>
                            <th style={{ padding: '15px' }}>Component</th>
                            <th style={{ padding: '15px' }}>Cost (Lakhs)</th>
                            <th style={{ padding: '15px' }}>Date</th>
                            <th style={{ padding: '15px' }}>Status</th>
                            <th style={{ padding: '15px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Loading proposals...</td></tr>
                        ) : filteredPlans.length > 0 ? (
                            filteredPlans.map(plan => (
                                <tr key={plan.id} style={{ background: plan.status.toLowerCase().includes('rejected') ? '#ffebee' : 'white', borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: 'bold', color: '#000', fontSize: '14px' }}>{plan.state_name}</div>
                                        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{plan.district_name}</div>
                                    </td>
                                    <td style={{ padding: '15px', fontSize: '14px', color: '#333' }}>{plan.project_name}</td>
                                    <td style={{ padding: '15px' }}>
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
                                            {plan.component.replace(/ /g, '\u00A0')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#333' }}>₹{plan.estimated_cost}</td>
                                    <td style={{ padding: '15px', color: '#555' }}>{new Date(plan.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            background: plan.status === 'APPROVED_BY_MINISTRY' ? '#e8f5e9' :
                                                plan.status === 'REJECTED_BY_MINISTRY' ? '#ffebee' : '#fff3e0',
                                            color: plan.status === 'APPROVED_BY_MINISTRY' ? '#2e7d32' :
                                                plan.status === 'REJECTED_BY_MINISTRY' ? '#c62828' : '#ef6c00',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            display: 'inline-block'
                                        }}>
                                            {plan.status === 'APPROVED_BY_STATE' ? 'PENDING REVIEW' : plan.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <InteractiveButton variant="info" size="sm" onClick={() => handleViewPDF(plan)}>
                                                <Eye size={16} style={{ marginRight: '5px' }} /> View
                                            </InteractiveButton>
                                            {plan.status === 'APPROVED_BY_STATE' && (
                                                <>
                                                    <InteractiveButton variant="success" size="sm" onClick={() => handleApproveClick(plan)}>
                                                        <Check size={16} style={{ marginRight: '5px' }} /> Approve
                                                    </InteractiveButton>
                                                    <InteractiveButton variant="danger" size="sm" onClick={() => handleRejectClick(plan)}>
                                                        <X size={16} style={{ marginRight: '5px' }} /> Reject
                                                    </InteractiveButton>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    No proposals found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                title="Approve Project & Set Minimum Allocation"
                footer={
                    <>
                        <InteractiveButton variant="secondary" onClick={() => setIsApproveModalOpen(false)}>Cancel</InteractiveButton>
                        <InteractiveButton variant="success" onClick={confirmApprove}>Confirm Approve</InteractiveButton>
                    </>
                }
            >
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>
                        You are approving the project <strong>{selectedPlan?.project_name}</strong> from <strong>{selectedPlan?.district_name}</strong>.
                    </p>

                    <div style={{
                        background: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>Actual Project Cost:</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                            ₹{selectedPlan?.estimated_cost} Lakhs
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: '600', color: '#2c3e50' }}>
                            Total Allocation Amount (in Lakhs) <span style={{ color: '#e74c3c' }}>*</span>
                        </label>
                        <input
                            type="number"
                            className="form-input"
                            value={minAllocationAmount}
                            onChange={(e) => setMinAllocationAmount(e.target.value)}
                            placeholder="Enter the minimum amount you want to allocate for this project"
                            min="0"
                            step="0.01"
                            style={{
                                padding: '12px',
                                fontSize: '14px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e0',
                                width: '100%'
                            }}
                        />
                        <small style={{ display: 'block', marginTop: '8px', color: '#718096', fontSize: '12px' }}>
                            Enter the minimum amount you want to allocate for this project.
                        </small>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="Reject Proposal"
                footer={
                    <>
                        <InteractiveButton variant="secondary" onClick={() => setIsRejectModalOpen(false)}>Cancel</InteractiveButton>
                        <InteractiveButton variant="danger" onClick={confirmReject}>Reject Proposal</InteractiveButton>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Reason for Rejection</label>
                    <textarea
                        className="form-input"
                        rows="4"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Please provide a reason for rejection..."
                    ></textarea>
                </div>
            </Modal>
        </div >
    );
};

export default AnnualPlansApproval;
