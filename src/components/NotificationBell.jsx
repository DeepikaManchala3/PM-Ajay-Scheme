import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Bell, Inbox } from 'lucide-react';




const NotificationBell = ({ userRole, stateName, districtName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationRole = (role) => {
        switch (role) {
            case 'centre_admin': return 'ministry';
            case 'state_admin': return 'state';
            case 'district_admin': return 'district';
            case 'department_admin': return 'department';
            default: return role;
        }
    };

    const effectiveRole = getNotificationRole(userRole);

    const fetchNotifications = async () => {
        if (!effectiveRole) return;

        console.log('🔔 Fetching notifications for:', { effectiveRole, stateName, districtName });

        try {
            setLoading(true);
            let query = supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            // Filter by user role
            query = query.eq('user_role', effectiveRole);

            // If state admin, filter by state
            if (effectiveRole === 'state' && stateName) {
                query = query.eq('state_name', stateName);
            }

            // If district admin, filter by district
            if (effectiveRole === 'district' && districtName) {
                query = query.eq('district_name', districtName);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching notifications:', error);
            } else {
                console.log('✅ Notifications fetched:', data?.length || 0);
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

        // Auto-refresh every 5 seconds (faster updates)
        const interval = setInterval(fetchNotifications, 5000);

        // Also refresh when window gains focus
        const handleFocus = () => {
            console.log('🔄 Window focused - refreshing notifications');
            fetchNotifications();
        };
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [userRole, stateName, districtName]);

    const getNotificationClass = (type) => {
        const classes = {
            success: 'alert-success',
            warning: 'alert-warning',
            error: 'alert-error',
            info: 'alert-info'
        };
        return classes[type] || 'alert-info';
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
            }
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // difference in seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="notification-bell" style={{ position: 'relative' }}>
            <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
                <span className="notification-icon"><Bell size={34} /></span>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 'var(--space-2)',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    width: '380px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    zIndex: 'var(--z-dropdown)',
                    border: '1px solid var(--border-light)'
                }}>
                    <div style={{
                        padding: 'var(--space-4)',
                        borderBottom: '1px solid var(--border-light)',
                        fontWeight: 'var(--font-semibold)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: 'var(--text-xl)',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div style={{ marginBottom: 'var(--space-2)', display: 'flex', justifyContent: 'center' }}>
                                <Inbox size={40} strokeWidth={1} />
                            </div>
                            No notifications
                        </div>
                    ) : (
                        <div>
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => markAsRead(notification.id)}
                                    style={{
                                        padding: 'var(--space-4)',
                                        borderBottom: '1px solid var(--border-light)',
                                        cursor: 'pointer',
                                        backgroundColor: notification.read ? 'transparent' : 'var(--bg-secondary)',
                                        transition: 'background-color var(--transition-base)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.read ? 'transparent' : 'var(--bg-secondary)'}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'start',
                                        marginBottom: 'var(--space-2)'
                                    }}>
                                        <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                                            {notification.title}
                                        </strong>
                                        {!notification.read && (
                                            <span style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--color-primary)',
                                                display: 'inline-block'
                                            }} />
                                        )}
                                    </div>
                                    <p style={{
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--text-secondary)',
                                        margin: 0,
                                        marginBottom: 'var(--space-2)'
                                    }}>
                                        {notification.message}
                                    </p>
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                        {formatDate(notification.created_at)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
