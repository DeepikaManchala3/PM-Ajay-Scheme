import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { supabase } from '../../../lib/supabaseClient';

const { width } = Dimensions.get('window');

const FundsReceivedFromMinistry = ({ formatCurrency }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fundsData, setFundsData] = useState({
    totalReceived: 0,
    totalReleased: 0,
    balance: 0,
    transactions: []
  });

  const fetchFundsData = async () => {
    try {
      setLoading(true);

      // Fetch fund releases from ministry (state_fund_releases)
      const { data: releases, error } = await supabase
        .from('state_fund_releases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalReceived = releases?.reduce((sum, r) => sum + (parseFloat(r.amount_rupees) || 0), 0) || 0;
      
      // Fetch fund releases to districts
      const { data: districtReleases, error: distError } = await supabase
        .from('fund_releases')
        .select('*')
        .order('created_at', { ascending: false });

      if (distError) throw distError;

      const totalReleased = districtReleases?.reduce((sum, r) => sum + (parseFloat(r.amount_rupees) || 0), 0) || 0;

      setFundsData({
        totalReceived,
        totalReleased,
        balance: totalReceived - totalReleased,
        transactions: releases || []
      });
    } catch (error) {
      console.error('Error fetching funds data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFundsData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFundsData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading funds data...</Text>
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
        {/* Summary Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>{formatCurrency(fundsData.totalReceived)}</Text>
            <Text style={styles.statLabel}>TOTAL RECEIVED</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.statIcon}>📤</Text>
            <Text style={styles.statValue}>{formatCurrency(fundsData.totalReleased)}</Text>
            <Text style={styles.statLabel}>RELEASED TO DISTRICTS</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.statIcon}>💵</Text>
            <Text style={styles.statValue}>{formatCurrency(fundsData.balance)}</Text>
            <Text style={styles.statLabel}>AVAILABLE BALANCE</Text>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fund Receipt History</Text>
          
          {fundsData.transactions.length > 0 ? (
            fundsData.transactions.map((transaction, index) => (
              <View key={index} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    transaction.status === 'approved' ? styles.statusApproved : styles.statusPending
                  ]}>
                    <Text style={styles.statusText}>
                      {transaction.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.transactionBody}>
                  <View style={styles.transactionRow}>
                    <Text style={styles.transactionLabel}>Amount:</Text>
                    <Text style={styles.transactionAmount}>
                      {formatCurrency(transaction.amount_rupees || transaction.amount)}
                    </Text>
                  </View>

                  {transaction.fund_type && (
                    <View style={styles.transactionRow}>
                      <Text style={styles.transactionLabel}>Fund Type:</Text>
                      <Text style={styles.transactionValue}>{transaction.fund_type}</Text>
                    </View>
                  )}

                  {transaction.financial_year && (
                    <View style={styles.transactionRow}>
                      <Text style={styles.transactionLabel}>Financial Year:</Text>
                      <Text style={styles.transactionValue}>{transaction.financial_year}</Text>
                    </View>
                  )}

                  {transaction.remarks && (
                    <View style={styles.transactionRow}>
                      <Text style={styles.transactionLabel}>Remarks:</Text>
                      <Text style={styles.transactionValue}>{transaction.remarks}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No fund receipts recorded yet</Text>
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
  statsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
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
    textAlign: 'center',
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
  transactionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  transactionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusApproved: {
    backgroundColor: '#D1FAE5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
  },
  transactionBody: {
    gap: 8,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  transactionValue: {
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

export default FundsReceivedFromMinistry;
