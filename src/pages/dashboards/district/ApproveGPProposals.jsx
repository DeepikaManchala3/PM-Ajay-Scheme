import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import InteractiveButton from '../../../components/InteractiveButton';

const ApproveGPProposals = () => {
    const [proposals, setProposals] = useState([
        { id: 1, gp: 'Shirur', title: 'Community Hall Construction', date: '2025-11-22', status: 'Pending', budget: '0.45 Cr', description: 'Construction of a multi-purpose community hall for village meetings and events.' },
        { id: 2, gp: 'Khed', title: 'Solar Street Lights', date: '2025-11-20', status: 'Pending', budget: '0.25 Cr', description: 'Installation of 50 solar street lights in main village areas.' },
        { id: 3, gp: 'Baramati', title: 'Skill Training Center', date: '2025-11-15', status: 'Approved', budget: '0.60 Cr', description: 'Setting up a vocational training center for youth skill development.' },
        { id: 4, gp: 'Haveli', title: 'Drainage System Upgrade', date: '2025-11-10', status: 'Rejected', budget: '0.80 Cr', description: 'Upgrading the existing drainage system to prevent waterlogging.', rejectReason: 'Budget exceeds allocation limit.' },
    ]);

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

    const handleApproveClick = (proposal) => {
        setSelectedProposal(proposal);
        setIsApproveModalOpen(true);
    };

    const handleRejectClick = (proposal) => {
        setSelectedProposal(proposal);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const confirmApprove = () => {
        setProposals(proposals.map(p => p.id === selectedProposal.id ? { ...p, status: 'Approved' } : p));
        showToast(`Proposal "${selectedProposal.title}" approved successfully`);
        setIsApproveModalOpen(false);
    };

    const confirmReject = () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        setProposals(proposals.map(p => p.id === selectedProposal.id ? { ...p, status: 'Rejected', rejectReason } : p));
        showToast(`Proposal "${selectedProposal.title}" rejected`);
        setIsRejectModalOpen(false);
    };

    const handleViewPDF = (proposal) => {
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>GP Proposal - ${proposal.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
                        h1 { color: #2c3e50; margin: 0; }
                        .section { margin-bottom: 25px; }
                        .section-title { font-weight: bold; color: #2c3e50; font-size: 16px; margin-bottom: 8px; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; }
                        .info-row { display: flex; margin-bottom: 10px; }
                        .info-label { font-weight: bold; width: 200px; color: #555; }
                        .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; }
                        .status-pending { background-color: #fff3cd; color: #856404; }
                        .status-approved { background-color: #d4edda; color: #155724; }
                        .status-rejected { background-color: #f8d7da; color: #721c24; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Gram Panchayat Proposal</h1>
                        <div style="color: #666; margin-top: 5px;">Proposal ID: GP-PROP-${proposal.id}</div>
                    </div>
                    <div class="section">
                        <div class="section-title">Basic Information</div>
                        <div class="info-row"><div class="info-label">Gram Panchayat:</div><div>${proposal.gp}</div></div>
                        <div class="info-row"><div class="info-label">Proposal Title:</div><div>${proposal.title}</div></div>
                        <div class="info-row"><div class="info-label">Submission Date:</div><div>${proposal.date}</div></div>
                        <div class="info-row"><div class="info-label">Budget Requested:</div><div>₹${proposal.budget}</div></div>
                        <div class="info-row"><div class="info-label">Status:</div><div><span class="status status-${proposal.status.toLowerCase()}">${proposal.status}</span></div></div>
                    </div>
                    <div class="section">
                        <div class="section-title">Description</div>
                        <p>${proposal.description}</p>
                    </div>
                    ${proposal.rejectReason ? `<div class="section"><div class="section-title">Rejection Reason</div><p>${proposal.rejectReason}</p></div>` : ''}
                    <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">Generated on: ${new Date().toLocaleString()}</div>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.onload = function () { printWindow.print(); };
            showToast('PDF preview opened');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Error generating PDF');
        }
    };

    const filteredProposals = statusFilter
        ? proposals.filter(p => p.status === statusFilter)
        : proposals;

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Approve GP Proposals</h2>
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
                            <th>Gram Panchayat</th>
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
                                    <td>{proposal.gp}</td>
                                    <td>{proposal.title}</td>
                                    <td>{proposal.date}</td>
                                    <td>₹{proposal.budget}</td>
                                    <td>
                                        <span className={`badge badge-${proposal.status.toLowerCase().includes('approved') ? 'success' : proposal.status.toLowerCase().includes('rejected') ? 'error' : 'warning'}`}>
                                            {proposal.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                            <InteractiveButton variant="info" size="sm" onClick={() => handleViewPDF(proposal)}>View</InteractiveButton>
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
                        <button onClick={() => setIsApproveModalOpen(false)} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>Cancel</button>
                        <InteractiveButton variant="primary" onClick={confirmApprove} style={{ padding: '8px 14px' }}>Confirm Approve</InteractiveButton>
                    </div>
                }
            >
                <p>Are you sure you want to approve the proposal <strong>"{selectedProposal?.title}"</strong> from <strong>{selectedProposal?.gp} GP</strong>?</p>
            </Modal>

            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="Reject Proposal"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setIsRejectModalOpen(false)} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>Cancel</button>
                        <InteractiveButton variant="danger" onClick={confirmReject} style={{ padding: '8px 14px' }}>Reject Proposal</InteractiveButton>
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
                </div>
            </Modal>
        </div>
    );
};

export default ApproveGPProposals;
