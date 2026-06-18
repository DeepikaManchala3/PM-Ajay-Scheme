import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ExecutingAgencyDashboard = () => {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.dashboardCard}>
          <Text style={styles.title}>Executing Agency Dashboard</Text>
          <Text style={styles.subtitle}>Contractor Portal</Text>
          <Text style={styles.description}>
            Welcome to the PM-AJAY Executing Agency Dashboard. View assigned works, update progress, and submit completion reports.
          </Text>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dashboardCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001f3f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});

export default ExecutingAgencyDashboard;
