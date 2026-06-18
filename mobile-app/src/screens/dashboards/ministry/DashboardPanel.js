import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    RefreshControl
} from 'react-native';

const { width } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.60.81:5001/api';

const DashboardPanel = ({ refreshing, onRefresh }) => {
    const [stats, setStats] = useState({
        totalStates: 0,
        totalDistricts: 0,
        totalProjects: 0,
        totalFundAllocated: 0,
        projectsCompleted: 0,
        projectsOngoing: 0,
        projectsApproved: 0,
        projectsProposed: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, [refreshing]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/ministry-stats`);
            const result = await response.json();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Error fetching ministry stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0 Cr';
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    };

    return (
        <ScrollView
            refreshControl={
                <RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />
            }
            style={styles.container}
        >
            <View style={styles.dashboardPanel}>
                {/* National Statistics */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>National Statistics</Text>
                </View>
                <View style={styles.statsGrid}>
                    {/* States/UTs */}
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#E0E7FF' }]}>
                            <Text style={styles.statIconText}>🏛️</Text>
                        </View>
                        <Text style={styles.statValue}>{stats.totalStates || 0}</Text>
                        <Text style={styles.statLabel}>STATES/UTS</Text>
                    </View>

                    {/* Districts */}
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                            <Text style={styles.statIconText}>📍</Text>
                        </View>
                        <Text style={styles.statValue}>{stats.totalDistricts || 0}</Text>
                        <Text style={styles.statLabel}>DISTRICTS</Text>
                    </View>

                    {/* Total Projects */}
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#DBEAFE' }]}>
                            <Text style={styles.statIconText}>📋</Text>
                        </View>
                        <Text style={styles.statValue}>{stats.totalProjects || 0}</Text>
                        <Text style={styles.statLabel}>TOTAL PROJECTS</Text>
                    </View>

                    {/* Fund Allocated */}
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#D1FAE5' }]}>
                            <Text style={styles.statIconText}>💰</Text>
                        </View>
                        <Text style={styles.statValue}>{formatCurrency(stats.totalFundAllocated)}</Text>
                        <Text style={styles.statLabel}>FUND ALLOCATED</Text>
                    </View>
                </View>

                {/* Project Status Overview */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Project Status Overview</Text>
                </View>
                <View style={styles.statsGrid}>
                    {/* Completed */}
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#D1FAE5' }]}>
                            <Text style={styles.statIconText}>✅</Text>
                        </View>
                        <Text style={styles.statValue}>{stats.projectsCompleted || 0}</Text>
                        <Text style={styles.statLabel}>COMPLETED</Text>
                    </View>

                    {/* Ongoing */}
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                            <Text style={styles.statIconText}>🚧</Text>
                        </View>
                        <Text style={styles.statValue}>{stats.projectsOngoing || 0}</Text>
                        <Text style={styles.statLabel}>ONGOING</Text>
                    </View>

                    {/* Approved */}
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#E0E7FF' }]}>
                            <Text style={styles.statIconText}>👍</Text>
                        </View>
                        <Text style={styles.statValue}>{stats.projectsApproved || 0}</Text>
                        <Text style={styles.statLabel}>APPROVED</Text>
                    </View>

                    {/* Pending */}
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#FEE2E2' }]}>
                            <Text style={styles.statIconText}>⏳</Text>
                        </View>
                        <Text style={styles.statValue}>{stats.projectsProposed || 0}</Text>
                        <Text style={styles.statLabel}>PENDING</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dashboardPanel: {
        padding: 16,
    },
    sectionHeader: {
        marginBottom: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#001f3f',
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
        fontSize: 24, // Slightly smaller than state dashboard to fit larger numbers if needed
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
});

export default DashboardPanel;
