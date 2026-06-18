import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NotificationBell from './NotificationBell';

const DashboardHeader = ({ 
  toggleSidebar, 
  breadcrumb, 
  stateName, 
  title, 
  userRole, 
  districtName,
  showNotificationBell = true 
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        
        <View style={styles.titleSection}>
          <Text style={styles.breadcrumb}>{breadcrumb}</Text>
          <Text style={styles.title}>{title || `Dashboard - ${stateName}`}</Text>
        </View>

        {showNotificationBell && (
          <NotificationBell 
            userRole={userRole}
            stateName={stateName}
            districtName={districtName}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 24,
    color: '#333',
  },
  titleSection: {
    flex: 1,
  },
  breadcrumb: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001f3f',
  },
});

export default DashboardHeader;
