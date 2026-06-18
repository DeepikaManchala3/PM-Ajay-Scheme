import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Alert,
    Modal as RNModal,
    RefreshControl,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.60.81:5001/api';
const { height } = Dimensions.get('window');

const ManageStateAdmins = () => {
    // Data States
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [states, setStates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState('All');

    // Filter Modal States
    const [isStateModalVisible, setIsStateModalVisible] = useState(false);
    const [stateSearchQuery, setStateSearchQuery] = useState('');

    // Add/Edit Modal States
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        admin_name: '',
        state_name: '',
        phone_no: '',
        email: '',
        bank_account_number: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // State Picker for Form
    const [isFormStatePickerVisible, setIsFormStatePickerVisible] = useState(false);

    useEffect(() => {
        fetchStateAdmins();
        fetchStates(); // Fetch complete list of states for the dropdown
    }, []);

    const fetchStateAdmins = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/state-admins`);
            const result = await response.json();

            if (result.success) {
                setAdmins(result.data);
                setFilteredAdmins(result.data);

                // If we don't have a separate states endpoint, we can extract from here, 
                // but usually for "Add New" we want all possible states, not just ones with admins.
                // For now, let's extract unique states from existing admins + maybe some hardcoded if api fails
                // But ideally we should fetch from detailed state list.
            } else {
                console.error('Failed to fetch state admins:', result.error);
                Alert.alert('Error', 'Failed to fetch state admins data');
            }
        } catch (error) {
            console.error('Error fetching state admins:', error);
            Alert.alert('Error', 'Network request failed');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch all states for the dropdown
    const fetchStates = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/states`);
            // If this endpoint doesn't exist, we fallback or use the ones from admins list
            // Assuming it might fail if not implemented, we wrap in try/catch safely
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    // Assuming result.data is array of objects {name: '...'} or strings
                    const stateNames = result.data.map(s => s.name || s).sort();
                    setStates(stateNames);
                    return;
                }
            }
        } catch (e) {
            console.log('States endpoint might not exist, using extraction fallback');
        }

        // Fallback: This will only allow adding admins for states that already have an admin (if we only extract unique).
        // To properly support adding for NEW states, ideally we need a list of all India states.
        // Let's hardcode a few if the list is empty or just use what we have.
        // For widely used apps, hardcoding the list of Indian states is acceptable fallback.
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStateAdmins();
    };

    // --- Search & Filter Logic ---
    const filterData = (query, state) => {
        let filtered = admins;

        if (state !== 'All') {
            filtered = filtered.filter(admin => admin.state_name === state);
        }

        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(admin =>
                (admin.admin_name && admin.admin_name.toLowerCase().includes(lowerQuery)) ||
                (admin.state_name && admin.state_name.toLowerCase().includes(lowerQuery)) ||
                (admin.email && admin.email.toLowerCase().includes(lowerQuery))
            );
        }
        setFilteredAdmins(filtered);
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        filterData(text, selectedState);
    };

    const handleStateFilter = (state) => {
        setSelectedState(state);
        filterData(searchQuery, state);
    };

    // --- Add Admin Logic ---
    const handleAddNew = () => {
        setFormData({
            admin_name: '',
            state_name: '',
            phone_no: '',
            email: '',
            bank_account_number: ''
        });
        setFormErrors({});
        setIsAddModalVisible(true);
    };

    const validateForm = () => {
        let errors = {};
        if (!formData.admin_name.trim()) errors.admin_name = 'Name is required';
        if (!formData.state_name) errors.state_name = 'State is required';

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email address';
        }

        if (!formData.phone_no.trim()) {
            errors.phone_no = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone_no)) {
            errors.phone_no = 'Phone must be 10 digits';
        }

        if (!formData.bank_account_number.trim()) errors.bank_account_number = 'Bank account is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/state-admins`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                Alert.alert('Success', 'State Admin added successfully');
                setIsAddModalVisible(false);
                fetchStateAdmins(); // Refresh list
            } else {
                Alert.alert('Error', result.error || 'Failed to add admin');
            }
        } catch (error) {
            console.error('Error adding admin:', error);
            Alert.alert('Error', 'Failed to submit data. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Helpers ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'Activated': return '#10B981';
            case 'Active': return '#3B82F6';
            default: return '#6B7280';
        }
    };

    const getStatusBgColor = (status) => {
        switch (status) {
            case 'Activated': return '#D1FAE5';
            case 'Active': return '#DBEAFE';
            default: return '#F3F4F6';
        }
    };

    const renderAdminItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {item.admin_name ? item.admin_name.charAt(0).toUpperCase() : '?'}
                    </Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.adminName}>{item.admin_name || 'Unknown Name'}</Text>
                    <Text style={styles.stateName}>{item.state_name || 'Unknown State'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status || 'Inactive'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>{item.email || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>{item.phone_no || 'N/A'}</Text>
                </View>
            </View>
        </View>
    );

    // States list extraction if API failed or for dropdown
    // If states array is empty/small, we can rely on extracted unique states from admins + extra logic
    // For this implementation, we will use the `states` state which tries to fetch all, or unique from admins
    const uniqueStates = states.length > 0 ? states : ['All', ...new Set(admins.map(a => a.state_name))].sort().filter(s => s !== 'All');

    // Filter Modal
    const renderStateFilterModal = () => {
        const filteredStateList = uniqueStates.filter(state =>
            state.toLowerCase().includes(stateSearchQuery.toLowerCase())
        );

        return (
            <RNModal
                visible={isStateModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsStateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter by State</Text>
                            <TouchableOpacity onPress={() => setIsStateModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#111827" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalSearchContainer}>
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                style={styles.modalSearchInput}
                                placeholder="Search state..."
                                value={stateSearchQuery}
                                onChangeText={setStateSearchQuery}
                            />
                        </View>
                        <FlatList
                            data={filteredStateList}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.stateOption,
                                        selectedState === item && styles.selectedStateOption
                                    ]}
                                    onPress={() => {
                                        handleStateFilter(item);
                                        setIsStateModalVisible(false);
                                        setStateSearchQuery('');
                                    }}
                                >
                                    <Text style={[
                                        styles.stateOptionText,
                                        selectedState === item && styles.selectedStateOptionText
                                    ]}>
                                        {item}
                                    </Text>
                                    {selectedState === item && (
                                        <Ionicons name="checkmark" size={20} color="#001f3f" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </RNModal>
        );
    };

    // Form State Selection Modal
    const renderFormStatePicker = () => {
        const filteredStateList = uniqueStates.filter(state =>
            state.toLowerCase().includes(stateSearchQuery.toLowerCase())
        );

        return (
            <RNModal
                visible={isFormStatePickerVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsFormStatePickerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select State</Text>
                            <TouchableOpacity onPress={() => setIsFormStatePickerVisible(false)}>
                                <Ionicons name="close" size={24} color="#111827" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalSearchContainer}>
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                style={styles.modalSearchInput}
                                placeholder="Search state..."
                                value={stateSearchQuery}
                                onChangeText={setStateSearchQuery}
                            />
                        </View>
                        <FlatList
                            data={filteredStateList}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.stateOption,
                                        formData.state_name === item && styles.selectedStateOption
                                    ]}
                                    onPress={() => {
                                        setFormData(prev => ({ ...prev, state_name: item }));
                                        setIsFormStatePickerVisible(false);
                                        setStateSearchQuery('');
                                    }}
                                >
                                    <Text style={[
                                        styles.stateOptionText,
                                        formData.state_name === item && styles.selectedStateOptionText
                                    ]}>
                                        {item}
                                    </Text>
                                    {formData.state_name === item && (
                                        <Ionicons name="checkmark" size={20} color="#001f3f" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </RNModal>
        );
    };

    const renderAddModal = () => (
        <RNModal
            visible={isAddModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsAddModalVisible(false)}
        >
            <View style={styles.fullScreenModal}>
                <View style={styles.fullScreenHeader}>
                    <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.fullScreenTitle}>Add New State Admin</Text>
                    <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} style={styles.saveButton}>
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">

                    {/* Admin Name */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Admin Name <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, formErrors.admin_name && styles.inputError]}
                            placeholder="e.g. Rajesh Kumar"
                            value={formData.admin_name}
                            onChangeText={text => setFormData({ ...formData, admin_name: text })}
                        />
                        {formErrors.admin_name && <Text style={styles.errorText}>{formErrors.admin_name}</Text>}
                    </View>

                    {/* State Selection */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>State <Text style={styles.required}>*</Text></Text>
                        <TouchableOpacity
                            style={[styles.input, styles.selectInput, formErrors.state_name && styles.inputError]}
                            onPress={() => setIsFormStatePickerVisible(true)}
                        >
                            <Text style={formData.state_name ? styles.inputText : styles.placeholderText}>
                                {formData.state_name || 'Select a state'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                        {formErrors.state_name && <Text style={styles.errorText}>{formErrors.state_name}</Text>}
                    </View>

                    {/* Email */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, formErrors.email && styles.inputError]}
                            placeholder="e.g. admin@state.gov.in"
                            value={formData.email}
                            onChangeText={text => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
                    </View>

                    {/* Phone */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, formErrors.phone_no && styles.inputError]}
                            placeholder="e.g. 9876543210"
                            value={formData.phone_no}
                            onChangeText={text => setFormData({ ...formData, phone_no: text })}
                            keyboardType="number-pad"
                            maxLength={10}
                        />
                        {formErrors.phone_no && <Text style={styles.errorText}>{formErrors.phone_no}</Text>}
                    </View>

                    {/* Bank Account */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Bank Account Number <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, formErrors.bank_account_number && styles.inputError]}
                            placeholder="e.g. 123456789012"
                            value={formData.bank_account_number}
                            onChangeText={text => setFormData({ ...formData, bank_account_number: text })}
                            keyboardType="numeric"
                        />
                        {formErrors.bank_account_number && <Text style={styles.errorText}>{formErrors.bank_account_number}</Text>}
                        <Text style={styles.helperText}>Used for fund transfers. Stored securely.</Text>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </RNModal>
    );

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search admins..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

            {/* Actions Row */}
            <View style={styles.actionsContainer}>
                {/* Filter Button */}
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setIsStateModalVisible(true)}
                >
                    <View style={styles.filterButtonContent}>
                        <Ionicons name="filter" size={18} color={selectedState !== 'All' ? '#FFFFFF' : '#4B5563'} />
                        <Text style={[
                            styles.filterButtonText,
                            selectedState !== 'All' && styles.activeFilterButtonText
                        ]}>
                            {selectedState === 'All' ? 'Filter State' : selectedState}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color={selectedState !== 'All' ? '#FFFFFF' : '#4B5563'} />
                    </View>
                </TouchableOpacity>

                {/* Add New Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddNew}
                >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Add Admin</Text>
                </TouchableOpacity>
            </View>

            {selectedState !== 'All' && (
                <View style={styles.activeFilterRow}>
                    <Text style={styles.activeFilterLabel}>Filtered by: {selectedState}</Text>
                    <TouchableOpacity onPress={() => handleStateFilter('All')}>
                        <Text style={styles.clearFilterText}>Clear</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#001f3f" />
                </View>
            ) : (
                <FlatList
                    data={filteredAdmins}
                    renderItem={renderAdminItem}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No state admins found.</Text>
                        </View>
                    }
                />
            )}

            {renderStateFilterModal()}
            {renderFormStatePicker()}
            {renderAddModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 12,
    },
    filterButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
    },
    filterButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    activeFilterButtonText: {
        color: '#111827',
        fontWeight: '600',
    },
    addButton: {
        flex: 0.8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#001f3f',
        borderRadius: 12,
        paddingVertical: 10,
        gap: 6,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    activeFilterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        marginBottom: 8,
    },
    activeFilterLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    clearFilterText: {
        fontSize: 12,
        color: '#001f3f',
        fontWeight: '600',
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
        height: height * 0.7,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    modalSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 16,
    },
    modalSearchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#111827',
    },
    stateOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    selectedStateOption: {
        backgroundColor: '#F0F9FF',
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    stateOptionText: {
        fontSize: 16,
        color: '#374151',
    },
    selectedStateOptionText: {
        color: '#001f3f',
        fontWeight: '600',
    },

    // Full Screen Modal (Add Form)
    fullScreenModal: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    fullScreenHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    fullScreenTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    saveButton: {
        backgroundColor: '#001f3f',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    formContainer: {
        padding: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#111827',
    },
    selectInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputText: {
        color: '#111827',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    helperText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },

    // List Styles
    listContainer: {
        padding: 16,
        paddingTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E0E7FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    headerInfo: {
        flex: 1,
    },
    adminName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    stateName: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    cardBody: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default ManageStateAdmins;
