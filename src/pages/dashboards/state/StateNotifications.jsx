import React, { useState } from 'react';
import InteractiveButton from '../../../components/InteractiveButton';
import { Eye, CheckCheck } from 'lucide-react';

const StateNotifications = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Annual Plan Submission Deadline Extended',
            date: '2025-11-20',
            from: 'Ministry of Social Justice',
            status: 'Unread',
            message: 'The deadline for Annual Plan submission has been extended to December 15, 2025. Please ensure timely submission.',
            priority: 'High'
        },
        {
            id: 2,
            title: 'New Guidelines for Fund Utilization',
            date: '2025-11-15',
            from: 'Ministry of Social Justice',
            status: 'Read',
            message: 'Updated guidelines for fund utilization under PM-AJAY scheme have been issued. Please refer to the attached document.',
            priority: 'Medium'
        },
        {
            id: 3,
            title: 'District Proposal Approval Required',
            date: '2025-11-25',
            from: 'Pune District Admin',
            status: 'Unread',
            message: 'New project proposal from Pune District requires your approval. Please review at the earliest.',
            priority: 'High'
        },
        {
            id: 4,
            title: 'UC Submission Reminder',
            date: '2025-11-22',
            from: 'Ministry of Social Justice',
            status: 'Read',
            message: 'Reminder: Utilization Certificates for Q3 are due by November 30, 2025.',
            priority: 'Medium'
        },
    ]);

    const [toast, setToast] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleViewPDF = (notification) => {
        try {
            console.log('Generating PDF for notification:', notification.title);

            // Mark as read
            setNotifications(notifications.map(n => n.id === notification.id ? { ...n, status: 'Read' } : n));

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
                        .state-name {
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
                        <div class="state-name">State Dashboard - Maharashtra</div>
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
                            <div class="info-label">Date Received:</div>
                            <div class="info-value">${notification.date}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">From:</div>
                            <div class="info-value"><strong>${notification.from}</strong></div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Priority:</div>
                            <div class="info-value">${notification.priority}</div>
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

    const handleMarkAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, status: 'Read' } : n));
        showToast('Notification marked as read');
    };

    // Filter notifications
    const filteredNotifications = filterStatus
        ? notifications.filter(n => n.status === filterStatus)
        : notifications;

    const unreadCount = notifications.filter(n => n.status === 'Unread').length;

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: 0 }}>Notifications</h2>
                    {unreadCount > 0 && (
                        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                            You have <strong style={{ color: '#e74c3c' }}>{unreadCount}</strong> unread notification{unreadCount > 1 ? 's' : ''}
                        </p>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        className="form-control"
                        style={{ width: '150px' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Notifications</option>
                        <option value="Unread">Unread</option>
                        <option value="Read">Read</option>
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
                            <th>Title</th>
                            <th>From</th>
                            <th>Date</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map(notif => (
                                <tr key={notif.id} style={{ backgroundColor: notif.status === 'Unread' ? '#f0f8ff' : 'transparent' }}>
                                    <td style={{ fontWeight: notif.status === 'Unread' ? 700 : 400 }}>{notif.title}</td>
                                    <td>{notif.from}</td>
                                    <td>{notif.date}</td>
                                    <td>
                                        <span className={`badge badge-${notif.priority === 'High' ? 'error' : notif.priority === 'Medium' ? 'warning' : 'info'}`}>
                                            {notif.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${notif.status === 'Unread' ? 'warning' : 'success'}`}>
                                            {notif.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                            <InteractiveButton variant="info" size="sm" onClick={() => handleViewPDF(notif)}>
                                                <Eye size={16} style={{ marginRight: '5px' }} /> View
                                            </InteractiveButton>
                                            {notif.status === 'Unread' && (
                                                <InteractiveButton variant="success" size="sm" onClick={() => handleMarkAsRead(notif.id)}>
                                                    <CheckCheck size={16} /> Unread
                                                </InteractiveButton>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No notifications found for the selected filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StateNotifications;
