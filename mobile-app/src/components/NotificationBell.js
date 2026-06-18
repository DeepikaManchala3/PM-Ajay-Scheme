import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabaseClient';

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

    try {
      setLoading(true);
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

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
        // console.log('✅ Fetched notifications:', data?.length || 0);
        // if (data && data.length > 0) {
        //   console.log('📝 Sample notification:', {
        //     title: data[0].title,
        //     message: data[0].message?.substring(0, 50) + '...',
        //     read: data[0].read
        //   });
        // }
        setNotifications(data || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have a valid state name (not "Loading...")
    if (effectiveRole && stateName && stateName !== 'Loading...') {
      fetchNotifications();
    }
  }, [userRole, stateName, districtName]);

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (!error) {
        // Update the notification as read
        setNotifications(notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ));

        // If no more unread notifications, close the modal
        const updatedNotifications = notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        );
        const hasUnread = updatedNotifications.some(n => !n.read);
        if (!hasUnread) {
          setTimeout(() => setIsOpen(false), 300);
        }
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
    return date.toLocaleDateString('en-IN');
  };

  const handleBellPress = () => {
    console.log('🔔 Bell clicked! Notifications:', notifications.length);
    console.log('🔔 Modal will open with:', {
      total: notifications.length,
      unread: unreadCount,
      loading
    });
    if (notifications.length > 0) {
      console.log('📨 First 3 notifications:');
      notifications.slice(0, 3).forEach((notif, idx) => {
        console.log(`  ${idx + 1}. ${notif.title}`);
        console.log(`     Message: ${notif.message}`);
        console.log(`     Read: ${notif.read}`);
      });
    }
    setIsOpen(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleBellPress}
        style={styles.bellButton}
      >
        <Feather name="bell" size={24} color="#333" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackground}
            onPress={() => setIsOpen(false)}
          />
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                Notifications {notifications.length > 0 && `(${unreadCount} unread)`}
              </Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            {loading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.emptyText}>Loading...</Text>
              </View>
            ) : notifications.filter(n => !n.read).length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No unread notifications</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.notificationList}
                contentContainerStyle={styles.notificationListContent}
                showsVerticalScrollIndicator={true}
              >
                {notifications.filter(n => !n.read).map((notification, index) => (
                  <TouchableOpacity
                    key={notification.id || index}
                    onPress={() => markAsRead(notification.id)}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadNotification
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle} numberOfLines={2}>
                        {notification.title || 'No Title'}
                      </Text>
                      {!notification.read && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={4}>
                      {notification.message || 'No message'}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {notification.created_at ? formatDate(notification.created_at) : 'Unknown time'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bellButton: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationList: {
    flex: 1,
  },
  notificationListContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 100,
  },
  unreadNotification: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 3,
    borderLeftColor: '#FF9933',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF9933',
    marginTop: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 22,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default NotificationBell;
