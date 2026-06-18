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

const ApproveProposals = ({ stateName }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [filter, setFilter] = useState('pending');

  const fetchProposals = async () => {
    try {
      setLoading(true);

      const cleanStateName = stateName?.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
      const response = await fetch(`${API_BASE_URL}/proposals/state?stateName=${encodeURIComponent(cleanStateName)}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('📋 Total proposals fetched:', result.data?.length || 0);
          const pending = result.data?.filter(p => p.status === 'SUBMITTED' || p.status === 'PENDING_REVIEW') || [];
          console.log('📋 Pending proposals:', pending.length);
          if (pending.length > 0) {
            console.log('📋 First pending proposal:', {
              id: pending[0].id,
              project_name: pending[0].project_name,
              district_name: pending[0].district_name,
              status: pending[0].status
            });
          }
          setProposals(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stateName) {
      fetchProposals();
    }
  }, [stateName]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProposals();
    setRefreshing(false);
  };

  const handleApprove = async (proposalId) => {
    Alert.alert(
      'Approve Proposal',
      'Are you sure you want to approve this proposal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'APPROVED_BY_STATE' })
              });

              if (response.ok) {
                Alert.alert('Success', 'Proposal approved successfully');
                await fetchProposals();
              } else {
                Alert.alert('Error', 'Failed to approve proposal');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to approve proposal');
            }
          }
        }
      ]
    );
  };

  const handleReject = async (proposalId) => {
    Alert.alert(
      'Reject Proposal',
      'Are you sure you want to reject this proposal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'REJECTED' })
              });

              if (response.ok) {
                Alert.alert('Success', 'Proposal rejected');
                await fetchProposals();
              } else {
                Alert.alert('Error', 'Failed to reject proposal');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to reject proposal');
            }
          }
        }
      ]
    );
  };

  const filteredProposals = proposals.filter(p => {
    if (filter === 'pending') return p.status === 'SUBMITTED' || p.status === 'PENDING_REVIEW';
    if (filter === 'approved') return p.status === 'APPROVED_BY_STATE';
    if (filter === 'rejected') return p.status === 'REJECTED';
    return true;
  });

  const pendingCount = proposals.filter(p => p.status === 'SUBMITTED' || p.status === 'PENDING_REVIEW').length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading proposals...</Text>
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
          <Text style={styles.statsLabel}>PENDING APPROVALS</Text>
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
            style={[styles.filterButton, filter === 'approved' && styles.filterButtonActive]}
            onPress={() => setFilter('approved')}
          >
            <Text style={[styles.filterText, filter === 'approved' && styles.filterTextActive]}>
              Approved
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

        {/* Proposals List */}
        <View style={styles.section}>
          {filteredProposals.length > 0 ? (
            filteredProposals.map((proposal, index) => (
              <View key={index} style={styles.proposalCard}>
                <View style={styles.proposalHeader}>
                  <Text style={styles.proposalTitle}>{proposal.project_name || 'Proposal'}</Text>
                  <View style={[
                    styles.statusBadge,
                    proposal.status === 'APPROVED_BY_STATE' ? styles.statusApproved :
                      proposal.status === 'REJECTED' ? styles.statusRejected :
                        styles.statusPending
                  ]}>
                    <Text style={styles.statusText}>{proposal.status}</Text>
                  </View>
                </View>

                <View style={styles.proposalDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>District:</Text>
                    <Text style={styles.detailValue}>{proposal.district_name || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Component:</Text>
                    <Text style={styles.detailValue}>{proposal.component || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estimated Cost:</Text>
                    <Text style={styles.detailValue}>₹{proposal.estimated_cost} L</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Submitted:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(proposal.created_at).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                </View>

                {(proposal.status === 'SUBMITTED' || proposal.status === 'PENDING_REVIEW') && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(proposal.id)}
                    >
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApprove(proposal.id)}
                    >
                      <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No proposals found</Text>
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
    backgroundColor: '#FEF3C7',
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
    color: '#F59E0B',
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
  proposalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  proposalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  proposalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusApproved: {
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
  proposalDetails: {
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
  approveButton: {
    backgroundColor: '#7C3AED',
  },
  rejectButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  approveButtonText: {
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

export default ApproveProposals;
