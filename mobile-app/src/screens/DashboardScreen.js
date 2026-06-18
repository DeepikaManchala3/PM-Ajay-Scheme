import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: 12,
    fundsAllocated: '₹4.5Cr',
    pendingProposals: 8,
    utilization: '95%'
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' }
      ]
    );
  };

  // Role-based menu items
  const getMenuItems = () => {
    const role = user?.role;
    
    const commonItems = [
      { id: 'dashboard', title: 'Dashboard', icon: '📊' },
      { id: 'notifications', title: 'Notifications', icon: '🔔' },
      { id: 'profile', title: 'Profile', icon: '👤' },
    ];

    const roleSpecificItems = {
      'centre_admin': [
        { id: 'fund-allocation', title: 'Fund Allocation', icon: '💰' },
        { id: 'manage-states', title: 'Manage States', icon: '🏛️' },
        { id: 'reports', title: 'Reports & Analytics', icon: '📈' },
        { id: 'annual-plans', title: 'Annual Plans', icon: '📋' },
      ],
      'state_admin': [
        { id: 'fund-release', title: 'Fund Release', icon: '💸' },
        { id: 'approve-proposals', title: 'Approve Proposals', icon: '✅' },
        { id: 'manage-districts', title: 'Manage Districts', icon: '🏙️' },
        { id: 'reports', title: 'Reports', icon: '📊' },
      ],
      'district_admin': [
        { id: 'gp-proposals', title: 'GP Proposals', icon: '📝' },
        { id: 'fund-release-gp', title: 'Fund Release to GP', icon: '💵' },
        { id: 'manage-gps', title: 'Manage GPs', icon: '🏘️' },
        { id: 'reports', title: 'Reports', icon: '📊' },
      ],
      'gp_admin': [
        { id: 'new-proposal', title: 'New Proposal', icon: '➕' },
        { id: 'my-projects', title: 'My Projects', icon: '📁' },
        { id: 'monitor-progress', title: 'Monitor Progress', icon: '📈' },
      ],
      'department_admin': [
        { id: 'work-orders', title: 'Work Orders', icon: '📋' },
        { id: 'dpr-upload', title: 'DPR Upload', icon: '📤' },
        { id: 'executing-agencies', title: 'Executing Agencies', icon: '🏗️' },
      ],
      'executing_agency': [
        { id: 'assigned-works', title: 'Assigned Works', icon: '🔨' },
        { id: 'progress-update', title: 'Progress Update', icon: '📊' },
        { id: 'payment-status', title: 'Payment Status', icon: '💳' },
      ],
      'public': [
        { id: 'track-project', title: 'Track Projects', icon: '🔍' },
        { id: 'beneficiary-info', title: 'Beneficiary Info', icon: 'ℹ️' },
      ],
    };

    return [...(roleSpecificItems[role] || []), ...commonItems];
  };

  const menuItems = getMenuItems();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        {/* Header */}
        <View className="bg-blue-600 p-6 pb-8">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-white text-2xl font-bold">PM-AJAY</Text>
              <Text className="text-blue-100 text-sm">Dashboard</Text>
            </View>
            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Logout</Text>
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View className="bg-blue-700 p-4 rounded-lg">
            <Text className="text-blue-100 text-xs uppercase tracking-wider mb-1">
              Logged in as
            </Text>
            <Text className="text-white text-lg font-semibold">{user?.email}</Text>
            <Text className="text-blue-200 text-sm mt-1 capitalize">
              {user?.role?.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="px-6 -mt-4 mb-6">
          <View className="flex-row flex-wrap justify-between">
            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4">
              <Text className="text-3xl font-bold text-blue-600 mb-1">
                {stats.activeProjects}
              </Text>
              <Text className="text-gray-500 text-xs">Active Projects</Text>
            </View>
            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4">
              <Text className="text-3xl font-bold text-green-600 mb-1">
                {stats.fundsAllocated}
              </Text>
              <Text className="text-gray-500 text-xs">Funds Allocated</Text>
            </View>
            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4">
              <Text className="text-3xl font-bold text-orange-600 mb-1">
                {stats.pendingProposals}
              </Text>
              <Text className="text-gray-500 text-xs">Pending Proposals</Text>
            </View>
            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4">
              <Text className="text-3xl font-bold text-purple-600 mb-1">
                {stats.utilization}
              </Text>
              <Text className="text-gray-500 text-xs">Utilization</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Quick Actions</Text>
          <View className="bg-white rounded-xl shadow-sm overflow-hidden">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center p-4 ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                onPress={() => Alert.alert(item.title, 'Feature coming soon!')}
              >
                <Text className="text-2xl mr-3">{item.icon}</Text>
                <Text className="text-gray-800 font-medium flex-1">{item.title}</Text>
                <Text className="text-gray-400">›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer Info */}
        <View className="px-6 pb-8">
          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="text-gray-600 text-xs text-center">
              © 2025 Ministry of Social Justice & Empowerment
            </Text>
            <Text className="text-gray-500 text-xs text-center mt-1">
              Government of India
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
