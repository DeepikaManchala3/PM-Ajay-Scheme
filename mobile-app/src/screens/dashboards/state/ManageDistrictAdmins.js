import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';

// Get API_BASE_URL from environment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.60.81:5001/api';

const ManageDistrictAdmins = ({ stateId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateName, setStateName] = useState('');

  useEffect(() => {
    fetchStateName();
  }, [user]);

  useEffect(() => {
    if (stateName) {
      fetchAdmins();
    }
  }, [stateName]);

  const fetchStateName = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/profile?userId=${user.id}`);
      const result = await response.json();
      if (result.success && result.data?.full_name) {
        let name = result.data.full_name;
        name = name.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
        setStateName(name);
      }
    } catch (error) {
      console.error('Error fetching state name:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);

      const url = stateName
        ? `${API_BASE_URL}/district-admins?stateName=${encodeURIComponent(stateName)}`
        : `${API_BASE_URL}/district-admins`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        // Map backend fields to frontend state
        const mappedAdmins = result.data.map(admin => ({
          id: admin.id,
          full_name: admin.admin_name,
          districtName: admin.district_name,
          phone: admin.phone_no,
          email: admin.email,
          status: admin.status,
          bank_account_number: admin.bank_account_number,
          created_at: admin.created_at
        }));
        setAdmins(mappedAdmins);
      } else {
        Alert.alert('Error', 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      Alert.alert('Error', 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAdmins();
    setRefreshing(false);
  };

  const filteredAdmins = admins.filter(admin =>
    admin.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.districtName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading district admins...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, district, or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{admins.length}</Text>
          <Text style={styles.statsLabel}>Total District Admins</Text>
        </View>

        {/* Admins List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>District Administrators</Text>

          {filteredAdmins.length > 0 ? (
            filteredAdmins.map((admin, index) => (
              <View key={index} style={styles.adminCard}>
                <View style={styles.adminHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {admin.full_name?.charAt(0) || 'A'}
                    </Text>
                  </View>
                  <View style={styles.adminInfo}>
                    <Text style={styles.adminName}>{admin.full_name || 'N/A'}</Text>
                    <Text style={styles.adminDistrict}>{admin.districtName}</Text>
                  </View>
                </View>

                <View style={styles.adminDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📧 Email:</Text>
                    <Text style={styles.detailValue}>{admin.email}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📱 Phone:</Text>
                    <Text style={styles.detailValue}>{admin.phone || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📅 Joined:</Text>
                    <Text style={styles.detailValue}>
                      {admin.created_at ? new Date(admin.created_at).toLocaleDateString('en-IN') : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👤</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No admins found matching your search' : 'No district admins found'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  statsCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  adminCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  adminDistrict: {
    fontSize: 14,
    color: '#6B7280',
  },
  adminDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
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
});

export default ManageDistrictAdmins;
