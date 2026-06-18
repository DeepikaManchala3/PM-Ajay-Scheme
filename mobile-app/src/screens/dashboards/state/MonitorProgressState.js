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

const MonitorProgressState = ({ stateName, stateId }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progressData, setProgressData] = useState({
    totalProjects: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    districtProgress: []
  });

  const fetchProgressData = async () => {
    try {
      setLoading(true);

      // Fetch proposals for the state
      const { data: districts, error: distError } = await supabase
        .from('districts')
        .select('id, name')
        .eq('state_id', stateId);

      if (distError) throw distError;

      const districtIds = districts?.map(d => d.id) || [];

      const { data: proposals, error } = await supabase
        .from('district_proposals')
        .select('id, status, district_id')
        .in('district_id', districtIds);

      if (error) throw error;

      // Calculate statistics
      const stats = {
        totalProjects: proposals?.length || 0,
        completed: proposals?.filter(p => p.status === 'APPROVED_BY_MINISTRY').length || 0,
        inProgress: proposals?.filter(p => p.status === 'APPROVED_BY_STATE' || p.status === 'SUBMITTED').length || 0,
        notStarted: proposals?.filter(p => p.status === 'DRAFT' || p.status === 'REJECTED').length || 0
      };

      // Group by district
      const districtMap = {};
      proposals?.forEach(proposal => {
        const district = districts.find(d => d.id === proposal.district_id);
        const districtName = district?.name || 'Unknown';
        if (!districtMap[districtName]) {
          districtMap[districtName] = { completed: 0, inProgress: 0, notStarted: 0, total: 0 };
        }
        districtMap[districtName].total++;
        if (proposal.status === 'APPROVED_BY_MINISTRY') districtMap[districtName].completed++;
        else if (proposal.status === 'APPROVED_BY_STATE' || proposal.status === 'SUBMITTED') districtMap[districtName].inProgress++;
        else districtMap[districtName].notStarted++;
      });

      stats.districtProgress = Object.entries(districtMap).map(([name, data]) => ({
        name,
        ...data,
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }));

      setProgressData(stats);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stateId) {
      fetchProgressData();
    }
  }, [stateId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProgressData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading progress data...</Text>
      </View>
    );
  }

  const completionRate = progressData.totalProjects > 0
    ? Math.round((progressData.completed / progressData.totalProjects) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Overall Progress Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#EDE9FE' }]}>
            <Text style={styles.statValue}>{progressData.totalProjects}</Text>
            <Text style={styles.statLabel}>TOTAL PROJECTS</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.statValue}>{progressData.completed}</Text>
            <Text style={styles.statLabel}>COMPLETED</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.statValue}>{progressData.inProgress}</Text>
            <Text style={styles.statLabel}>IN PROGRESS</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
            <Text style={styles.statValue}>{progressData.notStarted}</Text>
            <Text style={styles.statLabel}>NOT STARTED</Text>
          </View>
        </View>

        {/* Completion Rate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Completion Rate</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${completionRate}%` }]} />
          </View>
          <Text style={styles.progressText}>{completionRate}% Complete</Text>
        </View>

        {/* District-wise Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>District-wise Progress</Text>
          {progressData.districtProgress.map((district, index) => (
            <View key={index} style={styles.districtCard}>
              <View style={styles.districtHeader}>
                <Text style={styles.districtName}>{district.name}</Text>
                <Text style={styles.districtRate}>{district.completionRate}%</Text>
              </View>
              
              <View style={styles.districtProgressBar}>
                <View style={[styles.districtProgress, { width: `${district.completionRate}%` }]} />
              </View>

              <View style={styles.districtStats}>
                <View style={styles.districtStat}>
                  <Text style={styles.districtStatLabel}>Total</Text>
                  <Text style={styles.districtStatValue}>{district.total}</Text>
                </View>
                <View style={styles.districtStat}>
                  <Text style={[styles.districtStatLabel, { color: '#10B981' }]}>Completed</Text>
                  <Text style={[styles.districtStatValue, { color: '#10B981' }]}>{district.completed}</Text>
                </View>
                <View style={styles.districtStat}>
                  <Text style={[styles.districtStatLabel, { color: '#F59E0B' }]}>In Progress</Text>
                  <Text style={[styles.districtStatValue, { color: '#F59E0B' }]}>{district.inProgress}</Text>
                </View>
                <View style={styles.districtStat}>
                  <Text style={[styles.districtStatLabel, { color: '#EF4444' }]}>Not Started</Text>
                  <Text style={[styles.districtStatValue, { color: '#EF4444' }]}>{district.notStarted}</Text>
                </View>
              </View>
            </View>
          ))}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
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
    marginBottom: 16,
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
  progressBarContainer: {
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
    textAlign: 'center',
  },
  districtCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  districtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  districtName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  districtRate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  districtProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  districtProgress: {
    height: '100%',
    backgroundColor: '#7C3AED',
  },
  districtStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  districtStat: {
    alignItems: 'center',
  },
  districtStatLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  districtStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
});

export default MonitorProgressState;
