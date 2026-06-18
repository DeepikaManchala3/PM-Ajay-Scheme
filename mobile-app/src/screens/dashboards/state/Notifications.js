import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabaseClient';

const Notifications = ({ userRole, stateName, districtName }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read

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
        .order('created_at', { ascending: false });

      query = query.eq('user_role', effectiveRole);

      if (effectiveRole === 'state' && stateName) {
        query = query.eq('state_name', stateName);
      }

      if (effectiveRole === 'district' && districtName) {
        query = query.eq('district_name', districtName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        Alert.alert('Error', 'Failed to load notifications');
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveRole && stateName && stateName !== 'Loading...') {
      fetchNotifications();
    }
  }, [userRole, stateName, districtName]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
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

  const deleteNotification = async (id) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

              if (!error) {
                setNotifications(notifications.filter(n => n.id !== id));
              } else {
                Alert.alert('Error', 'Failed to delete notification');
              }
            } catch (err) {
              console.error('Error deleting notification:', err);
              Alert.alert('Error', 'Failed to delete notification');
            }
          }
        }
      ]
    );
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      if (unreadIds.length === 0) {
        Alert.alert('Info', 'All notifications are already read');
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (!error) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        Alert.alert('Success', 'All notifications marked as read');
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': 
      default: return 'ℹ️';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9933" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{notifications.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.unreadValue]}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <TouchableOpacity style={styles.statCard} onPress={markAllAsRead}>
            <Feather name="check-circle" size={24} color="#10B981" />
            <Text style={styles.statLabel}>Mark All Read</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'read' && styles.filterTabActive]}
          onPress={() => setFilter('read')}
        >
          <Text style={[styles.filterText, filter === 'read' && styles.filterTextActive]}>
            Read ({notifications.length - unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 
               'No notifications'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => (
            <View
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard
              ]}
            >
              <TouchableOpacity
                style={styles.notificationContent}
                onPress={() => !notification.read && markAsRead(notification.id)}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.typeIcon}>{getTypeIcon(notification.type)}</Text>
                  {!notification.read && <View style={styles.unreadDot} />}
                </View>
                <View style={styles.contentContainer}>
                  <Text style={styles.title}>{notification.title}</Text>
                  <Text style={styles.message}>{notification.message}</Text>
                  <Text style={styles.time}>{formatDate(notification.created_at)}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteNotification(notification.id)}
              >
                <Feather name="x" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  unreadValue: {
    color: '#EF4444',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: '#FFF5EB',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FF9933',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  notificationCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9933',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  typeIcon: {
    fontSize: 28,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 12,
  },
});

export default Notifications;
