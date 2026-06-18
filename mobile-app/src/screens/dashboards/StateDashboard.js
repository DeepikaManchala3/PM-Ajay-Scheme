import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import DashboardSidebar from '../../components/DashboardSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import { supabase } from '../../lib/supabaseClient';
import MonitorProgressState from './state/MonitorProgressState';
import FundsReceivedFromMinistry from './state/FundsReceivedFromMinistry';
import ManageDistrictAdmins from './state/ManageDistrictAdmins';
import FundRelease from './state/FundRelease';
import ApproveProposals from './state/ApproveProposals';
import VerifyUCs from './state/VerifyUCs';
import Notifications from './state/Notifications';
import {
  requestNotificationPermissions,
  notifyPendingApprovals,
  setupNotificationListeners,
  registerForPushNotificationsAsync,
  setupRealtimeNotificationListener,
  notifyFundRelease
} from '../../services/notificationService';

const { width } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.60.81:5001/api';

const StateDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stateName, setStateName] = useState('Loading...');
  const [stateId, setStateId] = useState(null);
  const [stateCode, setStateCode] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalFundReceived: 0,
    fundUtilizedPercentage: 0,
    districtsReporting: 0,
    totalDistricts: 0,
    pendingApprovals: 0,
    districtFundStatus: []
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationChecked, setNotificationChecked] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            logout();
            if (navigation) {
              navigation.replace('Login');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Request notification permissions on mount and setup realtime listener
  useEffect(() => {
    // Setup notification listeners for local notifications
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('Notification received in foreground:', notification);
      },
      (response) => {
        console.log('Notification tapped:', response);
        const notifData = response.notification.request.content.data;

        // Navigate to appropriate tab based on notification type
        if (notifData.type === 'pending_approvals') {
          setActiveTab('proposals');
        } else if (notifData.type === 'fund_release') {
          setActiveTab('received');
        }
      }
    );

    // Setup realtime listener for database notifications
    let realtimeCleanup = () => {};
    if (user) {
      realtimeCleanup = setupRealtimeNotificationListener(user);
    }

    return () => {
      cleanup();
      realtimeCleanup();
    };
  }, [user]);

  // Fetch state name and Register Push Token
  useEffect(() => {
    const fetchStateName = async () => {
      if (user?.id) {
        try {
          // Register for Push Notifications
          const token = await registerForPushNotificationsAsync();
          if (token) {
            console.log('📲 [StateDashboard] Updating push token for user:', user.id);
            console.log('📲 [StateDashboard] Token:', token.substring(0, 30) + '...');
            const { error: tokenError, data: updateResult } = await supabase
              .from('profiles')
              .update({ push_token: token })
              .eq('id', user.id)
              .select();

            if (tokenError) {
              console.error('❌ [StateDashboard] Error updating push token:', tokenError);
            } else {
              console.log('✅ [StateDashboard] Push token saved to profile');
              console.log('✅ [StateDashboard] Updated rows:', updateResult?.length || 0);
              if (updateResult && updateResult.length > 0) {
                console.log('✅ [StateDashboard] Profile data:', {
                  id: updateResult[0].id,
                  email: updateResult[0].email,
                  tokenSaved: !!updateResult[0].push_token
                });
              }
            }
          }

          // Fetch profile from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          if (profileData?.full_name) {
            let name = profileData.full_name
              .replace(' State Admin', '')
              .replace(' Admin', '')
              .replace(' State', '')
              .trim();
            console.log('🏛️ State name extracted:', name);
            setStateName(name);

            // Fetch State ID and Code
            const { data: stateData, error: stateError } = await supabase
              .from('states')
              .select('id, code')
              .eq('name', name)
              .single();

            if (!stateError && stateData) {
              setStateId(stateData.id);
              setStateCode(stateData.code);
              console.log('✅ State data:', { id: stateData.id, code: stateData.code, name });
            }
          }
        } catch (error) {
          console.error('Error fetching state name:', error);
          setStateName('State');
        }
      }
    };
    fetchStateName();
  }, [user?.id]);

  // Fetch dashboard stats
  useEffect(() => {
    if (stateName && stateName !== 'Loading...' && stateName !== 'State') {
      fetchDashboardStats();
    }
  }, [stateName]);

  const fetchDashboardStats = async () => {
    if (!stateName || stateName === 'Loading...' || stateName === 'State') return;

    // Clean the state name (remove 'State Admin', 'Admin', 'State')
    let cleanStateName = stateName;
    cleanStateName = cleanStateName.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
    console.log('📊 Dashboard fetching stats for:', cleanStateName);

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/state-stats?stateName=${encodeURIComponent(cleanStateName)}`);

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Dashboard stats received:', result);

        if (result.success) {
          setDashboardStats(result.data);
          console.log('📊 Pending Approvals Count:', result.data.pendingApprovals);

          // Send notification for pending approvals on first load
          if (!notificationChecked && result.data.pendingApprovals > 0) {
            console.log('🔔 Sending notification for pending approvals:', result.data.pendingApprovals);
            await notifyPendingApprovals(result.data.pendingApprovals);
            setNotificationChecked(true);
          } else if (!notificationChecked) {
            console.log('ℹ️ No pending approvals to notify about');
            setNotificationChecked(true);
          }
        } else {
          console.error('Failed to fetch dashboard stats:', result.error);
        }
      } else {
        console.error('API request failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  };

  const sidebarMenu = [
    {
      icon: <Text style={{ fontSize: 20 }}>📊</Text>,
      label: 'Dashboard',
      action: () => setActiveTab('dashboard'),
      active: activeTab === 'dashboard'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>📈</Text>,
      label: 'Monitor Progress',
      action: () => setActiveTab('monitor'),
      active: activeTab === 'monitor'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>💰</Text>,
      label: 'Funds Received from Ministry',
      action: () => setActiveTab('received'),
      active: activeTab === 'received'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>👥</Text>,
      label: 'Manage District Admins',
      action: () => setActiveTab('admins'),
      active: activeTab === 'admins'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>💸</Text>,
      label: 'Fund Release to Districts',
      action: () => setActiveTab('funds'),
      active: activeTab === 'funds'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>📄</Text>,
      label: 'Approve District Proposals',
      action: () => setActiveTab('proposals'),
      active: activeTab === 'proposals'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>✅</Text>,
      label: 'Verify Utilisation Certificates',
      action: () => setActiveTab('ucs'),
      active: activeTab === 'ucs'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>📋</Text>,
      label: 'Reports',
      action: () => setActiveTab('reports'),
      active: activeTab === 'reports'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>🔔</Text>,
      label: 'Notifications',
      action: () => setActiveTab('notifications'),
      active: activeTab === 'notifications'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>❓</Text>,
      label: 'Help/Support',
      action: () => setActiveTab('help'),
      active: activeTab === 'help'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>🚪</Text>,
      label: 'Logout',
      action: handleLogout,
      isLogout: true
    }
  ];

  const getBreadcrumb = () => {
    const labels = {
      'dashboard': 'Dashboard',
      'monitor': 'Monitor Progress',
      'received': 'Funds Received from Ministry',
      'admins': 'Manage District Admins',
      'funds': 'Fund Release',
      'proposals': 'Approve Proposals',
      'ucs': 'Verify UCs',
      'reports': 'Reports',
      'notifications': 'Notifications',
      'help': 'Help'
    };
    return `Home > ${labels[activeTab] || 'Dashboard'}`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'monitor', label: 'Monitor Progress', icon: '📈' },
    { id: 'received', label: 'Funds Received', icon: '💰' },
    { id: 'admins', label: 'District Admins', icon: '👥' },
    { id: 'funds', label: 'Fund Release', icon: '💸' },
    { id: 'proposals', label: 'Proposals', icon: '📄' },
    { id: 'ucs', label: 'Verify UCs', icon: '✅' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'help', label: 'Help', icon: '❓' },
  ];

  return (
    <View style={styles.container}>
      <Header />

      <DashboardHeader
        toggleSidebar={toggleSidebar}
        breadcrumb={getBreadcrumb()}
        stateName={stateName}
        userRole={user?.role}
        showNotificationBell={true}
      />

      <DashboardSidebar
        menuItems={sidebarMenu}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <View style={styles.content}>
        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.dashboardPanel}>
              {/* Stats Cards Grid */}
              <View style={styles.statsGrid}>
                {/* Total Fund Received */}
                <View style={styles.statCard}>
                  <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={styles.statIconText}>💰</Text>
                  </View>
                  <Text style={styles.statValue}>
                    {formatCurrency(dashboardStats.totalFundReceived || 0)}
                  </Text>
                  <Text style={styles.statLabel}>TOTAL FUND RECEIVED</Text>
                </View>

                {/* Fund Utilized */}
                <View style={styles.statCard}>
                  <View style={[styles.statIconBox, { backgroundColor: '#D1FAE5' }]}>
                    <Text style={styles.statIconText}>📈</Text>
                  </View>
                  <Text style={styles.statValue}>
                    {dashboardStats.fundUtilizedPercentage || 0}%
                  </Text>
                  <Text style={styles.statLabel}>FUND UTILIZED</Text>
                </View>

                {/* Districts Reporting */}
                <View style={styles.statCard}>
                  <View style={[styles.statIconBox, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={styles.statIconText}>📍</Text>
                  </View>
                  <Text style={styles.statValue}>
                    {dashboardStats.districtsReporting || 0}
                  </Text>
                  <Text style={styles.statLabel}>DISTRICTS REPORTING</Text>
                </View>

                {/* Pending Approvals */}
                <View style={styles.statCard}>
                  <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={styles.statIconText}>⏰</Text>
                  </View>
                  <Text style={styles.statValue}>
                    {dashboardStats.pendingApprovals || 0}
                  </Text>
                  <Text style={styles.statLabel}>PENDING APPROVALS</Text>
                </View>
              </View>
              {/* District Fund Status Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>District Fund Status</Text>
                </View>

                {dashboardStats.districtFundStatus && dashboardStats.districtFundStatus.length > 0 ? (
                  <View style={styles.tableContainer}>
                    {dashboardStats.districtFundStatus.map((district, index) => (
                      <View key={index} style={styles.districtCard}>
                        <Text style={styles.districtName}>{district.districtName}</Text>

                        <View style={styles.districtRow}>
                          <Text style={styles.districtLabel}>Fund Released:</Text>
                          <Text style={styles.districtValue}>
                            {formatCurrency(district.fundReleased)}
                          </Text>
                        </View>

                        <View style={styles.districtRow}>
                          <Text style={styles.districtLabel}>Fund Utilized:</Text>
                          <Text style={styles.districtValue}>
                            {formatCurrency(district.fundUtilized)} ({district.utilizationPercent}%)
                          </Text>
                        </View>

                        <View style={styles.districtRow}>
                          <Text style={styles.districtLabel}>Project Status:</Text>
                          <View style={[
                            styles.badge,
                            district.projectStatus === 'On Track' ? styles.badgeSuccess : styles.badgeWarning
                          ]}>
                            <Text style={styles.badgeText}>{district.projectStatus}</Text>
                          </View>
                        </View>

                        <View style={styles.districtRow}>
                          <Text style={styles.districtLabel}>UC Uploaded:</Text>
                          <View style={[
                            styles.badge,
                            district.ucUploaded ? styles.badgeSuccess : styles.badgeError
                          ]}>
                            <Text style={styles.badgeText}>{district.ucUploaded ? 'YES' : 'NO'}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyText}>No district fund data available</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        )}

        {/* Monitor Progress Tab */}
        {activeTab === 'monitor' && (
          <MonitorProgressState stateName={stateName} stateId={stateId} />
        )}

        {/* Funds Received from Ministry Tab */}
        {activeTab === 'received' && (
          <FundsReceivedFromMinistry formatCurrency={formatCurrency} />
        )}

        {/* Manage District Admins Tab */}
        {activeTab === 'admins' && (
          <ManageDistrictAdmins stateId={stateId} />
        )}

        {/* Fund Release Tab */}
        {activeTab === 'funds' && (
          <FundRelease formatCurrency={formatCurrency} stateId={stateId} stateCode={stateCode} stateName={stateName} />
        )}

        {/* Approve Proposals Tab */}
        {activeTab === 'proposals' && (
          <ApproveProposals stateName={stateName} />
        )}

        {/* Verify UCs Tab */}
        {activeTab === 'ucs' && (
          <VerifyUCs stateName={stateName} />
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Notifications
            userRole={user?.role}
            stateName={stateName}
          />
        )}

        {/* Other Tabs Placeholder */}
        {!['dashboard', 'monitor', 'received', 'admins', 'funds', 'proposals', 'ucs', 'notifications'].includes(activeTab) && (
          <ScrollView>
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>
                {sidebarMenu.find(item => item.active)?.icon}
              </Text>
              <Text style={styles.placeholderTitle}>
                {getBreadcrumb().split(' > ')[1]}
              </Text>
              <Text style={styles.placeholderText}>
                This feature is coming soon!
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  dashboardPanel: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statIconText: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001f3f',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  tableContainer: {
    gap: 12,
  },
  districtCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  districtName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  districtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  districtLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  districtValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeSuccess: {
    backgroundColor: '#D1FAE5',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  badgeError: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  placeholderIcon: {
    fontSize: 80,
    marginBottom: 20,
    opacity: 0.3,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default StateDashboard;
