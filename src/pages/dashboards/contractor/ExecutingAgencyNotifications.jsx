import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import InteractiveButton from '../../../components/InteractiveButton';
import { Eye, CheckCheck, Filter, Inbox } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const ExecutingAgencyNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRow, setActiveRow] = useState(null);
    const [toast, setToast] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_role', 'executing_agency')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching notifications:', error);
            } else {
                setNotifications(data || []);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleViewPDF = (notification) => {
        try {
            console.log('Generating PDF for notification:', notification.title);

            // Mark as read
            markAsRead(notification.id);

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
                        .agency-name {
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
                        <div class="agency-name">Executing Agency Dashboard - ${user?.full_name || 'Executing Agency'}</div>
                        <div class="notification-badge priority-${(notification.priority || 'medium').toLowerCase()}">
                            ${notification.priority || 'Medium'} Priority
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
                            <div class="info-value">${new Date(notification.created_at).toLocaleDateString()}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Priority:</div>
                            <div class="info-value">${notification.priority || 'Medium'}</div>
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

    const markAsRead = async (id) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);

            if (!error) {
                setNotifications(notifications.map(n =>
                    n.id === id ? { ...n, read: true } : n
                ));
                showToast('Notification marked as read');
            }
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    // Filter notifications
    const filteredNotifications = filterStatus
        ? notifications.filter(n => filterStatus === 'Unread' ? !n.read : n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div className="dashboard-section" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading notifications...</p>
            </div>
        );
    }

    return (
        <>
            {/* Page Header */}
            <div className="dashboard-section">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Notifications</h2>
                        {unreadCount > 0 && (
                            <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                You have <strong style={{ color: 'var(--color-error)' }}>{unreadCount}</strong> unread notification{unreadCount > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                        <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
                        <select
                            className="form-control"
                            style={{ width: '180px' }}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Notifications</option>
                            <option value="Unread">Unread Only</option>
                            <option value="Read">Read Only</option>
                        </select>
                    </div>
                </div>

                {/* Toast Notification */}
                {toast && (
                    <div style={{
                        marginBottom: 'var(--space-4)',
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'var(--color-success)',
                        color: 'var(--text-inverse)',
                        borderRadius: 'var(--radius-md)',
                        display: 'inline-block',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        {toast}
                    </div>
                )}

                {/* Notifications Table */}
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNotifications.length > 0 ? (
                                filteredNotifications.map(notif => (
                                    <tr
                                        key={notif.id}
                                        onClick={() => {
                                            setActiveRow(notif.id);
                                            // Reset active state after animation
                                            setTimeout(() => setActiveRow(null), 300);
                                        }}
                                        style={{
                                            backgroundColor: !notif.read ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                            borderLeft: !notif.read ? '4px solid var(--color-info)' : 'none',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-base)',
                                            position: 'relative',
                                            boxShadow: activeRow === notif.id
                                                ? '0 0 0 4px rgba(255, 153, 51, 0.3), 0 0 0 8px rgba(255, 153, 51, 0.15)'
                                                : 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeRow !== notif.id) {
                                                e.currentTarget.style.backgroundColor = !notif.read
                                                    ? 'rgba(59, 130, 246, 0.1)'
                                                    : 'var(--bg-secondary)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeRow !== notif.id) {
                                                e.currentTarget.style.backgroundColor = !notif.read
                                                    ? 'rgba(59, 130, 246, 0.05)'
                                                    : 'transparent';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }}
                                    >
                                        <td style={{ fontWeight: !notif.read ? 'var(--font-semibold)' : 'var(--font-normal)' }}>
                                            {notif.title}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                            {new Date(notif.created_at).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${(notif.priority || 'Medium') === 'High' ? 'error' :
                                                (notif.priority || 'Medium') === 'Medium' ? 'warning' :
                                                    'info'
                                                }`}>
                                                {notif.priority || 'Medium'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${!notif.read ? 'warning' : 'success'}`}>
                                                {!notif.read ? 'Unread' : 'Read'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                                <InteractiveButton
                                                    variant="info"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewPDF(notif);
                                                    }}
                                                >
                                                    <Eye size={16} style={{ marginRight: 'var(--space-1)' }} />
                                                    View
                                                </InteractiveButton>
                                                {!notif.read && (
                                                    <InteractiveButton
                                                        variant="success"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notif.id);
                                                        }}
                                                    >
                                                        <CheckCheck size={16} style={{ marginRight: 'var(--space-1)' }} />
                                                        Mark Read
                                                    </InteractiveButton>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{
                                        textAlign: 'center',
                                        padding: 'var(--space-12)',
                                        color: 'var(--text-tertiary)',
                                        fontSize: 'var(--text-base)'
                                    }}>
                                        <div style={{ marginBottom: 'var(--space-2)', color: 'var(--text-tertiary)' }}>
                                            <Inbox size={48} strokeWidth={1} />
                                        </div>
                                        No notifications found for the selected filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ExecutingAgencyNotifications;
