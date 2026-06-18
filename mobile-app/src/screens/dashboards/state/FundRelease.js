import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.60.81:5001/api';

const FundRelease = ({ formatCurrency, stateId, stateCode, stateName }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [releasedFunds, setReleasedFunds] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [totalReleased, setTotalReleased] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    districtId: '',
    amount: '',
    component: 'Adarsh Gram',
    date: new Date().toISOString().slice(0, 10),
  });

  const fetchReleasedFunds = async () => {
    try {
      setLoading(true);

      const cleanStateName = stateName?.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
      const response = await fetch(`${API_BASE_URL}/funds/district-releases?stateName=${encodeURIComponent(cleanStateName)}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const formattedData = result.data.map(item => ({
            id: item.id,
            districtName: item.districts?.name || 'Unknown',
            component: item.component,
            amountInRupees: item.amount_rupees,
            date: item.release_date,
            remarks: item.remarks
          }));
          setReleasedFunds(formattedData);

          const total = formattedData.reduce((sum, f) => sum + (parseFloat(f.amountInRupees) || 0), 0);
          setTotalReleased(total);
        }
      }
    } catch (error) {
      console.error('Error fetching released funds:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const cleanStateName = stateName?.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
      const response = await fetch(`${API_BASE_URL}/state-admins/districts?stateName=${encodeURIComponent(cleanStateName)}`);
      const result = await response.json();
      if (result.success) {
        setDistricts(result.data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  useEffect(() => {
    if (stateName) {
      fetchDistricts();
      fetchReleasedFunds();
    }
  }, [stateName]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReleasedFunds();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!formData.districtId || !formData.amount) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const cleanStateName = stateName?.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
      const response = await fetch(`${API_BASE_URL}/funds/release-to-district`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          districtId: formData.districtId,
          amountRupees: parseFloat(formData.amount),
          component: formData.component,
          releaseDate: formData.date,
          stateName: cleanStateName
        })
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert('Success', 'Fund released successfully');
        setIsModalOpen(false);
        setFormData({
          districtId: '',
          amount: '',
          component: 'Adarsh Gram',
          date: new Date().toISOString().slice(0, 10),
        });
        await fetchReleasedFunds();
      } else {
        Alert.alert('Error', result.error || 'Failed to release fund');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to release fund');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading fund releases...</Text>
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
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsIcon}>💸</Text>
          <Text style={styles.statsValue}>{formatCurrency(totalReleased)}</Text>
          <Text style={styles.statsLabel}>TOTAL RELEASED TO DISTRICTS</Text>
        </View>

        {/* Release Fund Button */}
        <TouchableOpacity
          style={styles.releaseButton}
          onPress={() => setIsModalOpen(true)}
        >
          <Text style={styles.releaseButtonText}>+ Release New Fund</Text>
        </TouchableOpacity>

        {/* Released Funds List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fund Release History</Text>

          {releasedFunds.length > 0 ? (
            releasedFunds.map((fund, index) => (
              <View key={index} style={styles.fundCard}>
                <View style={styles.fundHeader}>
                  <Text style={styles.fundDistrict}>{fund.districtName}</Text>
                  <Text style={styles.fundAmount}>{formatCurrency(fund.amountInRupees)}</Text>
                </View>

                <View style={styles.fundDetails}>
                  <View style={styles.fundRow}>
                    <Text style={styles.fundLabel}>Component:</Text>
                    <Text style={styles.fundValue}>{fund.component}</Text>
                  </View>
                  <View style={styles.fundRow}>
                    <Text style={styles.fundLabel}>Date:</Text>
                    <Text style={styles.fundValue}>
                      {new Date(fund.date).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                  {fund.remarks && (
                    <View style={styles.fundRow}>
                      <Text style={styles.fundLabel}>Remarks:</Text>
                      <Text style={styles.fundValue}>{fund.remarks}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No fund releases recorded yet</Text>
            </View>
          )}
        </View>

        {/* Release Fund Modal */}
        <Modal
          visible={isModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Release Fund to District</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>District *</Text>
                <View style={styles.pickerContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Select district"
                    value={districts.find(d => d.id === formData.districtId)?.name || ''}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount in Rupees"
                  keyboardType="numeric"
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Component</Text>
                <View style={styles.pickerContainer}>
                  <TextInput
                    style={styles.input}
                    value={formData.component}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsModalOpen(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Release Fund</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    backgroundColor: '#DBEAFE',
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
  statsIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  releaseButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  releaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  fundCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  fundDistrict: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  fundAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  fundDetails: {
    gap: 8,
  },
  fundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fundLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  fundValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  submitButton: {
    backgroundColor: '#7C3AED',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FundRelease;
