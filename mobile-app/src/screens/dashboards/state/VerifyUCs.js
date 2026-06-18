import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.60.81:5001/api';

const VerifyUCs = ({ stateName }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ucs, setUcs] = useState([]);
  const [filter, setFilter] = useState('pending');

  const fetchUCs = async () => {
    try {
      setLoading(true);

      const cleanStateName = stateName?.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
      const response = await fetch(`${API_BASE_URL}/ucs/state?stateName=${encodeURIComponent(cleanStateName)}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUcs(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching UCs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stateName) {
      fetchUCs();
    }
  }, [stateName]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUCs();
    setRefreshing(false);
  };

  const handleVerify = async (ucId) => {
    Alert.alert(
      'Verify UC',
      'Are you sure you want to verify this Utilisation Certificate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/ucs/${ucId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'VERIFIED' })
              });

              if (response.ok) {
                Alert.alert('Success', 'UC verified successfully');
                await fetchUCs();
              } else {
                Alert.alert('Error', 'Failed to verify UC');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to verify UC');
            }
          }
        }
      ]
    );
  };

  const handleReject = async (ucId) => {
    Alert.alert(
      'Reject UC',
      'Are you sure you want to reject this UC?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/ucs/${ucId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'REJECTED' })
              });

              if (response.ok) {
                Alert.alert('Success', 'UC rejected');
                await fetchUCs();
              } else {
                Alert.alert('Error', 'Failed to reject UC');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to reject UC');
            }
          }
        }
      ]
    );
  };

  const filteredUCs = ucs.filter(uc => {
    if (filter === 'pending') return uc.status === 'PENDING';
    if (filter === 'verified') return uc.status === 'VERIFIED';
    if (filter === 'rejected') return uc.status === 'REJECTED';
    return true;
  });

  const pendingCount = ucs.filter(uc => uc.status === 'PENDING').length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading UCs...</Text>
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
        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{pendingCount}</Text>
          <Text style={styles.statsLabel}>PENDING VERIFICATION</Text>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
              Pending ({pendingCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'verified' && styles.filterButtonActive]}
            onPress={() => setFilter('verified')}
          >
            <Text style={[styles.filterText, filter === 'verified' && styles.filterTextActive]}>
              Verified
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'rejected' && styles.filterButtonActive]}
            onPress={() => setFilter('rejected')}
          >
            <Text style={[styles.filterText, filter === 'rejected' && styles.filterTextActive]}>
              Rejected
            </Text>
          </TouchableOpacity>
        </View>

        {/* UCs List */}
        <View style={styles.section}>
          {filteredUCs.length > 0 ? (
            filteredUCs.map((uc, index) => (
              <View key={index} style={styles.ucCard}>
                <View style={styles.ucHeader}>
                  <Text style={styles.ucTitle}>UC #{uc.id}</Text>
                  <View style={[
                    styles.statusBadge,
                    uc.status === 'VERIFIED' ? styles.statusVerified :
                      uc.status === 'REJECTED' ? styles.statusRejected :
                        styles.statusPending
                  ]}>
                    <Text style={styles.statusText}>{uc.status}</Text>
                  </View>
                </View>

                <View style={styles.ucDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>District:</Text>
                    <Text style={styles.detailValue}>{uc.district_name || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.detailValue}>₹{uc.amount} L</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Period:</Text>
                    <Text style={styles.detailValue}>{uc.period || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Submitted:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(uc.created_at).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                </View>

                {uc.status === 'PENDING' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(uc.id)}
                    >
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.verifyButton]}
                      onPress={() => handleVerify(uc.id)}
                    >
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>No UCs found</Text>
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
  statsCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  section: {
    gap: 12,
  },
  ucCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ucHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  ucTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusVerified: {
    backgroundColor: '#D1FAE5',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
  },
  ucDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
  },
  verifyButton: {
    backgroundColor: '#10B981',
  },
  rejectButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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

export default VerifyUCs;
