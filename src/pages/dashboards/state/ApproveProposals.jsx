import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Modal from '../../../components/Modal';
import InteractiveButton from '../../../components/InteractiveButton';
import { Eye } from 'lucide-react';

const ApproveProposals = () => {
    const { user } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [stateName, setStateName] = useState('');
    const [loading, setLoading] = useState(false);

    const [selectedProposal, setSelectedProposal] = useState(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    // Fetch state name
    useEffect(() => {
        const fetchStateName = async () => {
            if (!user?.id) return;
            try {
                const response = await fetch(`http://localhost:5001/api/profile?userId=${user.id}`);
                const result = await response.json();
                if (result.success && result.data?.full_name) {
                    let name = result.data.full_name;
                    name = name.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
                    setStateName(name);
                }
            } catch (error) {
                console.error('Error fetching state name:', error);
            }
        };
        fetchStateName();
    }, [user]);

    // Fetch proposals
    useEffect(() => {
        if (stateName) {
            fetchProposals();
        }
    }, [stateName]);

    const fetchProposals = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5001/api/proposals/state?stateName=${encodeURIComponent(stateName)}`);
            const result = await response.json();
            if (result.success) {
                // Transform data for UI
                const formatted = result.data.map(p => ({
                    id: p.id,
                    district: p.district_name,
                    title: p.project_name,
                    date: new Date(p.created_at).toLocaleDateString(),
                    status: p.status === 'SUBMITTED' ? 'Pending' :
                        p.status === 'APPROVED_BY_STATE' ? 'Approved' :
                            p.status === 'REJECTED_BY_STATE' ? 'Rejected' : p.status,
                    budget: p.estimated_cost,
                    description: p.description,
                    rejectReason: p.reject_reason
                }));
                setProposals(formatted);
            }
        } catch (error) {
            console.error('Error fetching proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (proposal) => {
        if (!proposal.id) {
            alert("Error: This proposal is missing an ID. Please refresh the page.");
            return;
        }
        setSelectedProposal(proposal);
        setIsApproveModalOpen(true);
    };

    const handleRejectClick = (proposal) => {
        if (!proposal.id) {
            alert("Error: This proposal is missing an ID. Please refresh the page.");
            return;
        }
        setSelectedProposal(proposal);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const confirmApprove = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/proposals/${selectedProposal.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'APPROVED_BY_STATE',
                    userId: user?.id
                })
            });
            const result = await response.json();
            if (result.success) {
                let msg = `Proposal "${selectedProposal.title}" approved successfully`;
                if (result.notificationSent) {
                    msg += `. WhatsApp notification sent!`;
                } else {
                    // Only warn if approved, as rejection doesn't send WA yet (or does it? I didn't implement rejection msg)
                    // My backend code only implemented approval msg.
                    msg += `. (WhatsApp not sent)`;
                }
                showToast(msg);
                fetchProposals(); // Refresh
                setIsApproveModalOpen(false);
            } else {
                alert('Failed to approve: ' + result.error);
            }
        } catch (error) {
            console.error('Error approving proposal:', error);
        }
    };

    const confirmReject = async () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5001/api/proposals/${selectedProposal.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'REJECTED_BY_STATE',
                    rejectReason,
                    userId: user?.id
                })
            });
            const result = await response.json();
            if (result.success) {
                showToast(`Proposal "${selectedProposal.title}" rejected`);
                fetchProposals(); // Refresh
                setIsRejectModalOpen(false);
            } else {
                alert('Failed to reject: ' + result.error);
            }
        } catch (error) {
            console.error('Error rejecting proposal:', error);
        }
    };

    // View/Download PDF function
    const handleViewPDF = (proposal) => {
        try {
            console.log('Generating PDF for proposal:', proposal.title);

            // Create a new window for printing
            const printWindow = window.open('', '_blank');

            // Generate HTML content
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Proposal - ${proposal.title}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 40px;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .header {
                            text-align: center;
                            border-bottom: 3px solid #3498db;
                            padding-bottom: 20px;
                            margin-bottom: 30px;
                        }
                        h1 {
                            color: #2c3e50;
                            margin: 0;
                        }
                        .proposal-id {
                            color: #666;
                            font-size: 14px;
                            margin-top: 5px;
                        }
                        .section {
                            margin-bottom: 25px;
                        }
                        .section-title {
                            font-weight: bold;
                            color: #2c3e50;
                            font-size: 16px;
                            margin-bottom: 8px;
                            border-bottom: 2px solid #ecf0f1;
                            padding-bottom: 5px;
                        }
                        .info-row {
                            display: flex;
                            margin-bottom: 10px;
                        }
                        .info-label {
                            font-weight: bold;
                            width: 200px;
                            color: #555;
                        }
                        .info-value {
                            color: #333;
                        }
                        .status {
                            display: inline-block;
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-weight: bold;
                            font-size: 14px;
                        }
                        .status-pending {
                            background-color: #fff3cd;
                            color: #856404;
                        }
                        .status-approved {
                            background-color: #d4edda;
                            color: #155724;
                        }
                        .status-rejected {
                            background-color: #f8d7da;
                            color: #721c24;
                        }
                        .footer {
                            margin-top: 50px;
                            padding-top: 20px;
                            border-top: 2px solid #ecf0f1;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                        }
                        @media print {
                            body {
                                padding: 20px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>District Proposal Document</h1>
                        <div class="proposal-id">Proposal ID: PROP-${proposal.id}</div>
                    </div>

                    <div class="section">
                        <div class="section-title">Basic Information</div>
                        <div class="info-row">
                            <div class="info-label">District:</div>
                            <div class="info-value">${proposal.district}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Proposal Title:</div>
                            <div class="info-value">${proposal.title}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Submission Date:</div>
                            <div class="info-value">${proposal.date}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Budget Requested:</div>
                            <div class="info-value" style="color: #10B981 !important; font-weight: bold;">₹${proposal.budget}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Status:</div>
                            <div class="info-value">
                                <span class="status status-${proposal.status.toLowerCase()}">${proposal.status}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Proposal Description</div>
                        <p>${proposal.description || 'No description provided.'}</p>
                    </div>

                    ${proposal.rejectReason ? `
                    <div class="section">
                        <div class="section-title">Rejection Reason</div>
                        <p>${proposal.rejectReason}</p>
                    </div>
                    ` : ''}

                    <div class="footer">
                        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                        <p>PM-AJAY Portal - State Dashboard</p>
                    </div>
                </body>
                </html>
            `;

            // Write content to new window
            printWindow.document.write(htmlContent);
            printWindow.document.close();

            // Wait for content to load, then trigger print dialog
            printWindow.onload = function () {
                printWindow.print();
            };

            showToast('PDF preview opened! Use "Save as PDF" to download.');
            console.log('PDF window opened successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Error generating PDF. Please try again.');
        }
    };

    // Filter proposals based on status
    const filteredProposals = statusFilter
        ? proposals.filter(p => p.status === statusFilter)
        : proposals;

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Approve District Proposals</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        className="form-control"
                        style={{ width: '150px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>Proposal Title</th>
                            <th>Submission Date</th>
                            <th>Budget</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProposals.length > 0 ? (
                            filteredProposals.map(proposal => (
                                <tr key={proposal.id} style={{ backgroundColor: proposal.status.toLowerCase().includes('rejected') ? '#ffebee' : 'inherit' }}>
                                    <td>{proposal.district}</td>
                                    <td>{proposal.title}</td>
                                    <td>{proposal.date}</td>
                                    <td style={{ color: '#10B981', fontWeight: 'bold' }}>₹{proposal.budget}</td>
                                    <td>
                                        <span className={`badge badge-${proposal.status === 'Approved' ? 'warning' : proposal.status.toLowerCase().includes('approved') ? 'success' : proposal.status.toLowerCase().includes('rejected') ? 'error' : 'warning'} `}>
                                            {proposal.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                            <InteractiveButton
                                                variant="info"
                                                size="sm"
                                                onClick={() => handleViewPDF(proposal)}
                                            >
                                                <Eye size={16} style={{ marginRight: '5px' }} /> View
                                            </InteractiveButton>
                                            {proposal.status === 'Pending' && (
                                                <>
                                                    <InteractiveButton variant="success" size="sm" onClick={() => handleApproveClick(proposal)}>Approve</InteractiveButton>
                                                    <InteractiveButton variant="danger" size="sm" onClick={() => handleRejectClick(proposal)}>Reject</InteractiveButton>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No proposals found for the selected status.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                title="Confirm Approval"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <InteractiveButton variant="outline" onClick={() => setIsApproveModalOpen(false)}>
                            Cancel
                        </InteractiveButton>
                        <InteractiveButton variant="success" onClick={confirmApprove}>
                            Confirm Approve
                        </InteractiveButton>
                    </div>
                }
            >
                <p>Are you sure you want to approve the proposal <strong>"{selectedProposal?.title}"</strong>?</p>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>This action will mark the proposal as approved and notify the district admin.</p>
            </Modal>

            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="Reject Proposal"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <InteractiveButton variant="outline" onClick={() => setIsRejectModalOpen(false)}>
                            Cancel
                        </InteractiveButton>
                        <InteractiveButton variant="danger" onClick={confirmReject}>
                            Reject Proposal
                        </InteractiveButton>
                    </div>
                }
            >
                <div className="form-group">
                    <label className="form-label">Reason for Rejection</label>
                    <textarea
                        className="form-control"
                        rows="4"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Please provide a detailed reason for rejection..."
                    />
                    <div className="form-helper">This reason will be sent to the district admin</div>
                </div>
            </Modal>
        </div >
    );
};

export default ApproveProposals;
