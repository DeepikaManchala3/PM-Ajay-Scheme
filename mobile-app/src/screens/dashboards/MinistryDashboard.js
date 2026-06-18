import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import DashboardSidebar from '../../components/DashboardSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import DashboardPanel from './ministry/DashboardPanel';
import ManageStateAdmins from './ministry/ManageStateAdmins';
import FundAllocation from './ministry/FundAllocation';
import FundReleased from './ministry/FundReleased';
import AnnualPlansApproval from './ministry/AnnualPlansApproval';
import MonitorProgress from './ministry/MonitorProgress';
import IssueNotifications from './ministry/IssueNotifications';
import ReportsAnalytics from './ministry/ReportsAnalytics';
import HelpSupport from './ministry/HelpSupport';

const { width } = Dimensions.get('window');

const MinistryDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const sidebarMenu = [
    {
      icon: <Text style={{ fontSize: 20 }}>📊</Text>,
      label: 'Dashboard',
      action: () => setActiveTab('dashboard'),
      active: activeTab === 'dashboard'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>👥</Text>,
      label: 'Manage State Admins',
      action: () => setActiveTab('admins'),
      active: activeTab === 'admins'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>💰</Text>,
      label: 'Fund Allocation',
      action: () => setActiveTab('allocation'),
      active: activeTab === 'allocation'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>💸</Text>,
      label: 'Fund Released',
      action: () => setActiveTab('release'),
      active: activeTab === 'release'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>📄</Text>,
      label: 'Project Approval',
      action: () => setActiveTab('plans'),
      active: activeTab === 'plans'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>📝</Text>,
      label: 'Annual Plan Approvals',
      action: () => setActiveTab('aap'),
      active: activeTab === 'aap'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>📈</Text>,
      label: 'Monitor Progress',
      action: () => setActiveTab('monitor'),
      active: activeTab === 'monitor'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>🔔</Text>,
      label: 'Notifications',
      action: () => setActiveTab('notifications'),
      active: activeTab === 'notifications'
    },
    {
      icon: <Text style={{ fontSize: 20 }}>📋</Text>,
      label: 'Reports & Analytics',
      action: () => setActiveTab('reports'),
      active: activeTab === 'reports'
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
      'admins': 'Manage State Admins',
      'allocation': 'Fund Allocation',
      'release': 'Fund Released',
      'plans': 'Project Approval',
      'aap': 'Annual Plan Approvals',
      'monitor': 'Monitor Progress',
      'notifications': 'Notifications',
      'reports': 'Reports & Analytics',
      'help': 'Help/Support'
    };
    return `Home > ${labels[activeTab] || 'Dashboard'}`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Add refresh logic here if needed, e.g. refetching data in child components
    // For now simulate delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <Header />

      <DashboardHeader
        toggleSidebar={toggleSidebar}
        breadcrumb={getBreadcrumb()}
        stateName={'Ministry'}
        userRole={'Ministry Admin'}
        showNotificationBell={true}
      />

      <DashboardSidebar
        menuItems={sidebarMenu}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <View style={styles.content}>
        {activeTab === 'dashboard' && (
          <DashboardPanel refreshing={refreshing} onRefresh={onRefresh} />
        )}
        {activeTab === 'admins' && <ManageStateAdmins />}
        {activeTab === 'allocation' && <FundAllocation />}
        {activeTab === 'release' && <FundReleased />}
        {activeTab === 'plans' && <AnnualPlansApproval type="project" />}
        {activeTab === 'aap' && <AnnualPlansApproval type="annual" />}
        {activeTab === 'monitor' && <MonitorProgress />}
        {activeTab === 'notifications' && <IssueNotifications />}
        {activeTab === 'reports' && <ReportsAnalytics />}
        {activeTab === 'help' && <HelpSupport />}
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
  }
});

export default MinistryDashboard;
