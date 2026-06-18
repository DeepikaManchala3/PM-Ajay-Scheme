import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import InteractiveButton from '../../../components/InteractiveButton';
import { Eye } from 'lucide-react';

const IssueNotifications = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Annual Plan Submission Deadline Extended',
            date: '2025-11-20',
            audience: 'All States',
            status: 'Sent',
            message: 'The deadline for Annual Plan submission has been extended to December 15, 2025. All states are requested to submit their plans before the new deadline.',
            priority: 'High'
        },
        {
            id: 2,
            title: 'New Guidelines for Fund Utilization',
            date: '2025-11-15',
            audience: 'All States',
            status: 'Sent',
            message: 'Updated guidelines for fund utilization under PM-AJAY scheme have been issued. Please refer to the attached document for detailed instructions.',
            priority: 'Medium'
        },
        {
            id: 3,
            title: 'Meeting with Maharashtra State Admin',
            date: '2025-11-28',
            audience: 'Maharashtra',
            status: 'Scheduled',
            message: 'A review meeting is scheduled with Maharashtra State Admin on November 28, 2025 at 11:00 AM to discuss project progress and fund utilization.',
            priority: 'High'
        },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', message: '', audience: 'All States', scheduleDate: '', priority: 'Medium' });
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const validate = () => {
        const errs = {};
        if (!formData.title.trim()) errs.title = 'Please enter notification title.';
        if (!formData.message.trim()) errs.message = 'Please enter notification message.';
        if (!formData.audience) errs.audience = 'Please select target audience.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleCreate = () => {
        if (!validate()) return;

        setNotifications([...notifications, {
            id: Date.now(),
            title: formData.title,
            message: formData.message,
            date: formData.scheduleDate || new Date().toISOString().split('T')[0],
            audience: formData.audience,
            priority: formData.priority,
            status: formData.scheduleDate ? 'Scheduled' : 'Sent'
        }]);
        showToast(`Notification "${formData.title}" ${formData.scheduleDate ? 'scheduled' : 'sent'} successfully`);
        setIsModalOpen(false);
        setFormData({ title: '', message: '', audience: 'All States', scheduleDate: '', priority: 'Medium' });
        setErrors({});
    };

    const handleViewPDF = (notification) => {
        try {
            console.log('Generating PDF for notification:', notification.title);

            const printWindow = window.open('', '_blank');

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Notification - ${notification.title}</title>
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
                        .logo {
                            font-size: 24px;
                            font-weight: bold;
                            color: #2c3e50;
                            margin-bottom: 10px;
                        }
                        .department {
                            color: #666;
                            font-size: 14px;
                        }
                        .notification-badge {
                            display: inline-block;
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: bold;
                            margin-top: 10px;
                        }
                        .priority-high {
                            background-color: #fee;
                            color: #c00;
                        }
                        .priority-medium {
                            background-color: #ffc;
                            color: #860;
                        }
                        .priority-low {
                            background-color: #efe;
                            color: #060;
                        }
                        .section {
                            margin-bottom: 25px;
                        }
                        .section-title {
                            font-weight: bold;
                            color: #2c3e50;
                            font-size: 16px;
                            margin-bottom: 10px;
                            border-bottom: 2px solid #ecf0f1;
                            padding-bottom: 5px;
                        }
                        .info-row {
                            display: flex;
                            margin-bottom: 10px;
                        }
                        .info-label {
                            font-weight: bold;
                            width: 150px;
                            color: #555;
                        }
                        .info-value {
                            color: #333;
                        }
                        .message-body {
                            background-color: #f9f9f9;
                            padding: 20px;
                            border-left: 4px solid #3498db;
                            line-height: 1.6;
                            margin-top: 20px;
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
                        <div class="logo">PM-AJAY Portal</div>
                        <div class="department">Ministry of Social Justice & Empowerment</div>
                        <div class="notification-badge priority-${notification.priority.toLowerCase()}">
                            ${notification.priority} Priority
                        </div>
                    </div>

                    <div class="section">
                        <h2 style="color: #2c3e50; margin-bottom: 20px;">${notification.title}</h2>
                        
                        <div class="info-row">
                            <div class="info-label">Notification ID:</div>
                            <div class="info-value">NOT-${notification.id}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Date Issued:</div>
                            <div class="info-value">${notification.date}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Target Audience:</div>
                            <div class="info-value"><strong>${notification.audience}</strong></div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Status:</div>
                            <div class="info-value">${notification.status}</div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Notification Message</div>
                        <div class="message-body">
                            ${notification.message}
                        </div>
                    </div>

                    <div class="footer">
                        <p>This is an official notification from PM-AJAY Portal</p>
                        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();

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

    const handleDeactivate = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, status: 'Deactivated' } : n));
        showToast('Notification deactivated successfully');
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Notifications & Circulars</h2>
                <InteractiveButton variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>+ Create New Notification</InteractiveButton>
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
                            <th>Title</th>
                            <th>Date</th>
                            <th>Target Audience</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.map(notif => (
                            <tr key={notif.id}>
                                <td style={{ fontWeight: 600 }}>{notif.title}</td>
                                <td>{notif.date}</td>
                                <td>{notif.audience}</td>
                                <td>
                                    <span className={`badge badge-${notif.priority === 'High' ? 'error' : notif.priority === 'Medium' ? 'warning' : 'info'}`}>
                                        {notif.priority}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge badge-${notif.status === 'Sent' ? 'success' : notif.status === 'Scheduled' ? 'warning' : 'error'}`}>
                                        {notif.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                        <InteractiveButton variant="info" size="sm" onClick={() => handleViewPDF(notif)}>
                                            <Eye size={16} style={{ marginRight: '5px' }} /> View
                                        </InteractiveButton>
                                        {notif.status !== 'Deactivated' && (
                                            <InteractiveButton variant="danger" size="sm" onClick={() => handleDeactivate(notif.id)}>Deactivate</InteractiveButton>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setErrors({}); }}
                title="Create New Notification"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <InteractiveButton variant="outline" onClick={() => { setIsModalOpen(false); setErrors({}); }}>
                            Cancel
                        </InteractiveButton>
                        <InteractiveButton variant="primary" onClick={handleCreate}>
                            Send / Schedule
                        </InteractiveButton>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">Notification Title</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Annual Plan Submission Deadline"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        {errors.title && <div className="form-error">{errors.title}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Message Body</label>
                        <textarea
                            className="form-control"
                            rows="5"
                            placeholder="Enter the notification message..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                        {errors.message && <div className="form-error">{errors.message}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Target Audience</label>
                            <select
                                className="form-control"
                                value={formData.audience}
                                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                            >
                                <option value="All States">All States</option>
                                <option value="Maharashtra">Maharashtra</option>
                                <option value="Karnataka">Karnataka</option>
                                <option value="Gujarat">Gujarat</option>
                            </select>
                            {errors.audience && <div className="form-error">{errors.audience}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Priority Level</label>
                            <select
                                className="form-control"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Schedule Date (Optional)</label>
                        <input
                            type="date"
                            className="form-control"
                            value={formData.scheduleDate}
                            onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                        />
                        <div className="form-helper">Leave empty to send immediately</div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default IssueNotifications;
