import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import InteractiveButton from '../../../components/InteractiveButton';
import { Eye } from 'lucide-react';

const WorkOrders = ({ orders, onUpdateOrder, onViewProgress }) => {
    // Use props 'orders' instead of local state
    const [filterStatus, setFilterStatus] = useState('');
    const [toast, setToast] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [selectedProgressOrder, setSelectedProgressOrder] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleViewPDF = (order) => {
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Work Order - ${order.title}</title>
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
                        <h1>Work Order Details</h1>
                        <div style="color: #666; margin-top: 5px;">Order ID: WO-${order.id}</div>
                    </div>
                    <div class="section">
                        <div class="section-title">Project Information</div>
                        <div class="info-row"><div class="info-label">Project Title:</div><div>${order.title}</div></div>
                        <div class="info-row"><div class="info-label">Location:</div><div>${order.location}</div></div>
                        <div class="info-row"><div class="info-label">Assigned Contractor:</div><div>${order.contractor}</div></div>
                        <div class="info-row"><div class="info-label">Contract Amount:</div><div>${order.amount}</div></div>
                    </div>
                    <div class="section">
                        <div class="section-title">Timeline & Status</div>
                        <div class="info-row"><div class="info-label">Issue Date:</div><div>${order.date}</div></div>
                        <div class="info-row"><div class="info-label">Deadline:</div><div>${order.deadline}</div></div>
                        <div class="info-row"><div class="info-label">Current Status:</div><div>${order.status}</div></div>
                    </div>
                    <div class="section">
                        <div class="section-title">Terms & Conditions</div>
                        <p>1. The work should be completed within the stipulated deadline.<br>
                           2. Quality of materials used must adhere to PWD standards.<br>
                           3. Weekly progress reports must be submitted by the contractor.</p>
                    </div>
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

    const openUpdateModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setIsModalOpen(true);
    };

    const handleUpdateStatus = () => {
        if (selectedOrder && newStatus) {
            onUpdateOrder({ ...selectedOrder, status: newStatus });
            showToast(`Order status updated to ${newStatus}`);
            setIsModalOpen(false);
        }
    };

    const openProgressModal = (order) => {
        setSelectedProgressOrder(order);
        setIsProgressModalOpen(true);
        setHistory([]); // Reset history

        // Fetch history
        import('../../../services/WorkService').then(({ WorkService }) => {
            WorkService.getProgressHistory(order.id).then(data => {
                setHistory(data);
            });

            // Mark as viewed if not already viewed
            if (!order.viewedByAgency) {
                WorkService.markAsViewed(order.id).then(updatedWorks => {
                    if (updatedWorks && onViewProgress) {
                        onViewProgress(updatedWorks);
                    }
                });
            }
        });
    };

    const [history, setHistory] = useState([]);

    const filteredOrders = filterStatus
        ? orders.filter(o => o.status === filterStatus)
        : orders;

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            {/* ... existing table code ... */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Work Progress Monitoring</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        className="form-control"
                        style={{ width: '180px' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Not Started">Not Started</option>
                        <option value="Completed">Completed</option>
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
                            <th>Order ID</th>
                            <th>Project Title</th>
                            <th>Location</th>
                            <th>Contractor</th>
                            <th>Amount</th>
                            <th>Deadline</th>
                            <th>Progress</th>
                            <th>Last Updated</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td><strong>WO-{order.id}</strong></td>
                                    <td>{order.title}</td>
                                    <td>{order.location}</td>
                                    <td>{order.contractor}</td>
                                    <td style={{ fontWeight: '600', color: '#10B981' }}>₹{order.amount}</td>
                                    <td>{order.deadline}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden', minWidth: '100px' }}>
                                                <div
                                                    style={{
                                                        width: `${order.progress || 0}%`,
                                                        height: '100%',
                                                        background: order.progress === 100 ? '#10B981' : '#FF9933',
                                                        borderRadius: '4px',
                                                        transition: 'width 0.3s ease'
                                                    }}
                                                ></div>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: '600', minWidth: '35px', color: '#374151' }}>{order.progress || 0}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        {order.lastUpdated ? (
                                            <span style={{ fontSize: '12px', color: '#666' }}>{order.lastUpdated}</span>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#999' }}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ whiteSpace: 'nowrap' }}>
                                            <span className={`badge badge-${order.status === 'Completed' ? 'success' : order.status === 'In Progress' ? 'warning' : 'info'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                            <InteractiveButton variant="info" size="sm" onClick={() => handleViewPDF(order)}>
                                                <Eye size={16} style={{ marginRight: '4px' }} />
                                                View
                                            </InteractiveButton>
                                            <InteractiveButton variant="success" size="sm" onClick={() => openProgressModal(order)}>Progress</InteractiveButton>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={10} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No work orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Update Work Order Status"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <InteractiveButton variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </InteractiveButton>
                        <InteractiveButton variant="primary" onClick={handleUpdateStatus}>
                            Save Changes
                        </InteractiveButton>
                    </div>
                }
            >
                <div className="form-group">
                    <label className="form-label">Select New Status</label>
                    <select
                        className="form-control"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                    >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Delayed">Delayed</option>
                    </select>
                </div>
            </Modal>

            <Modal
                isOpen={isProgressModalOpen}
                onClose={() => setIsProgressModalOpen(false)}
                title="Work Progress Details"
                footer={
                    <InteractiveButton variant="primary" onClick={() => setIsProgressModalOpen(false)}>Close</InteractiveButton>
                }
            >
                {selectedProgressOrder && (
                    <div style={{ padding: '10px' }}>
                        <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{selectedProgressOrder.title}</h3>
                            <p style={{ margin: 0, color: '#666' }}>{selectedProgressOrder.location}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '12px' }}>Funds Released</label>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#10B981' }}>₹{selectedProgressOrder.fundsReleased || 0}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '12px' }}>Funds Used</label>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#10B981' }}>₹{selectedProgressOrder.fundsUsed || 0}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '12px' }}>Funds Remaining</label>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#10B981' }}>₹{selectedProgressOrder.fundsRemaining || 0}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '12px' }}>Progress %</label>
                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedProgressOrder.progress || 0}%</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#888', fontSize: '12px', marginBottom: '5px' }}>Latest Remarks</label>
                            <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '4px', minHeight: '60px' }}>
                                {selectedProgressOrder.remarks || 'No remarks submitted.'}
                            </div>
                        </div>

                        {/* History Section */}
                        <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#555' }}>Submission History</h4>
                            {history.length > 0 ? (
                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {history.map((item, index) => (
                                        <div key={item.id} style={{
                                            padding: '10px',
                                            borderBottom: '1px solid #f0f0f0',
                                            fontSize: '13px',
                                            background: index === 0 ? '#f0f8ff' : 'transparent' // Highlight latest
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <strong>{new Date(item.created_at).toLocaleDateString()}</strong>
                                                <span className="badge badge-info">{item.progress_percentage}%</span>
                                            </div>
                                            <div style={{ color: '#666', marginBottom: '4px' }}>
                                                Released: ₹{item.funds_released} | Used: ₹{item.funds_used}
                                            </div>
                                            {item.remarks && <div style={{ fontStyle: 'italic', color: '#888' }}>"{item.remarks}"</div>}
                                            {item.photos && item.photos.length > 0 && (
                                                <div style={{ marginTop: '8px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                    {item.photos.map((photoUrl, pIndex) => (
                                                        <a key={pIndex} href={photoUrl} target="_blank" rel="noopener noreferrer">
                                                            <img
                                                                src={photoUrl}
                                                                alt={`Site ${pIndex + 1}`}
                                                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                                                            />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ color: '#999', fontSize: '13px', fontStyle: 'italic' }}>Loading history...</div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div >
    );
};

export default WorkOrders;
