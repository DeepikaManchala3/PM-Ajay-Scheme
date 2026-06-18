import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    Dimensions,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.60.81:5001/api';
const { height } = Dimensions.get('window');

const FundReleased = () => {
    const [releasedFunds, setReleasedFunds] = useState([]);
    const [filteredFunds, setFilteredFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statesWithAdmins, setStatesWithAdmins] = useState([]);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'completed'

    // Modal & Action States
    const [isReleaseModalVisible, setIsReleaseModalVisible] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [bankAccount, setBankAccount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchStatesWithAdmins();
    }, []);

    useEffect(() => {
        if (statesWithAdmins.length > 0) {
            fetchApprovedProjects();
        }
    }, [statesWithAdmins]);

    useEffect(() => {
        filterFunds();
    }, [releasedFunds, activeTab]);

    const filterFunds = () => {
        if (activeTab === 'pending') {
            setFilteredFunds(releasedFunds.filter(item => item.remainingAmount > 0));
        } else {
            setFilteredFunds(releasedFunds.filter(item => item.remainingAmount <= 0));
        }
    };

    const fetchStatesWithAdmins = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/state-admins`);
            const result = await response.json();
            if (result.success) {
                const uniqueStates = [...new Set(result.data.map(admin => admin.state_name))];
                setStatesWithAdmins(uniqueStates);
            }
        } catch (error) {
            console.error('Error fetching state admins:', error);
        }
    };

    const fetchApprovedProjects = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/proposals/approved`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    const filteredProjects = result.data.filter(project =>
                        statesWithAdmins.includes(project.stateName)
                    );
                    setReleasedFunds(filteredProjects);
                }
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            Alert.alert('Error', 'Failed to fetch fund release data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchStatesWithAdmins(); // Will trigger fetchApprovedProjects cascade
    };

    const handleReleaseClick = (item) => {
        setSelectedProject(item);
        setBankAccount('');
        setIsReleaseModalVisible(true);
    };

    const handleConfirmRelease = async () => {
        if (!bankAccount.trim()) {
            Alert.alert('Required', 'Please enter a bank account number');
            return;
        }

        const releaseAmount = selectedProject.minimumAllocation || selectedProject.allocatedAmount;

        if (!releaseAmount || parseFloat(releaseAmount) <= 0) {
            Alert.alert('Error', 'Invalid minimum allocation amount');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/funds/release`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stateName: selectedProject.stateName,
                    amount: (parseFloat(releaseAmount) / 100).toFixed(4),
                    amount_rupees: parseFloat(releaseAmount) * 100000,
                    component: [selectedProject.component],
                    date: new Date().toISOString().slice(0, 10),
                    officerId: `PROJ-${selectedProject.id}`,
                    remarks: `Fund release for project: ${selectedProject.projectName}`,
                    bankAccount: bankAccount
                })
            });

            const result = await response.json();

            if (result.success) {
                Alert.alert('Success', 'Funds released successfully!');
                setIsReleaseModalVisible(false);
                fetchApprovedProjects();
            } else {
                Alert.alert('Error', 'Failed to release funds');
            }
        } catch (error) {
            console.error('Error releasing funds:', error);
            Alert.alert('Error', 'Network error while releasing funds');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.stateName}>{item.stateName}</Text>
                    <View style={styles.componentBadge}>
                        <Text style={styles.componentText}>{item.component}</Text>
                    </View>
                </View>
                <View style={styles.costContainer}>
                    <Text style={styles.costLabel}>Project Cost</Text>
                    <Text style={styles.costValue}>₹{item.estimatedCost} L</Text>
                </View>
            </View>

            <Text style={styles.projectName}>{item.projectName}</Text>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Min Allocation</Text>
                    <Text style={styles.statValue}>₹{item.allocatedAmount} L</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: '#10B981' }]}>Released</Text>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>₹{item.releasedAmount} L</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: '#EF4444' }]}>Remaining</Text>
                    <Text style={[styles.statValue, { color: '#EF4444' }]}>₹{item.remainingAmount} L</Text>
                </View>
            </View>

            <View style={styles.actionContainer}>
                {item.remainingAmount > 0 ? (
                    <TouchableOpacity
                        style={styles.releaseButton}
                        onPress={() => handleReleaseClick(item)}
                    >
                        <Text style={styles.releaseButtonText}>Release Funds</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFF" />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.fullyReleasedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={styles.fullyReleasedText}>Fully Released</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Filter Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                        Release Funds
                    </Text>
                    {activeTab === 'pending' && <View style={styles.activeTabIndicator} />}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
                    onPress={() => setActiveTab('completed')}
                >
                    <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
                        Fully Released
                    </Text>
                    {activeTab === 'completed' && <View style={styles.activeTabIndicator} />}
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#001f3f" />
                </View>
            ) : (
                <FlatList
                    data={filteredFunds}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {activeTab === 'pending'
                                    ? 'No funds pending for release.'
                                    : 'No fully released projects found.'}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Fund Release Modal */}
            <Modal
                visible={isReleaseModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsReleaseModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Release Funds</Text>
                            <TouchableOpacity onPress={() => setIsReleaseModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#111827" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.projectDetailsBox}>
                            <Text style={styles.detailTitle}>Project Summary</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>State:</Text>
                                <Text style={styles.detailValue}>{selectedProject?.stateName}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Component:</Text>
                                <Text style={styles.detailValue}>{selectedProject?.component}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>To Release:</Text>
                                <Text style={styles.detailAmount}>
                                    ₹{selectedProject?.minimumAllocation || selectedProject?.allocatedAmount} Lakhs
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.inputLabel}>Bank Account Number <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter account number"
                            value={bankAccount}
                            onChangeText={setBankAccount}
                            keyboardType="numeric"
                        />
                        <Text style={styles.helperText}>Please verify account details carefully.</Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setIsReleaseModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.confirmBtn]}
                                onPress={handleConfirmRelease}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.confirmBtnText}>Confirm Release</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    // Tab Styles
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#001f3f',
        fontWeight: '600',
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: 0,
        height: 3,
        width: '100%',
        backgroundColor: '#001f3f',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },

    listContainer: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 16,
    },

    // Card Styles
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    stateName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    componentBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    componentText: {
        fontSize: 11,
        color: '#0284C7',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    costContainer: {
        alignItems: 'flex-end',
    },
    costLabel: {
        fontSize: 10,
        color: '#6B7280',
        textTransform: 'uppercase',
    },
    costValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
    },
    projectName: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 16,
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#111827',
    },
    actionContainer: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        alignItems: 'center',
    },
    releaseButton: {
        flexDirection: 'row',
        backgroundColor: '#001f3f',
        paddingVertical: 12,
        width: '100%',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    releaseButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    fullyReleasedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    fullyReleasedText: {
        color: '#10B981',
        fontWeight: '600',
        fontSize: 14,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    projectDetailsBox: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    detailTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#4B5563',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
    detailAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#059669',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
        marginBottom: 8,
    },
    helperText: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: '#F3F4F6',
    },
    confirmBtn: {
        backgroundColor: '#001f3f',
    },
    cancelBtnText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 15,
    },
    confirmBtnText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 15,
    },
});

export default FundReleased;
