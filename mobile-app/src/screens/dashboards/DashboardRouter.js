import React from 'react';
import { useAuth, ROLES } from '../../context/AuthContext';
import MinistryDashboard from './MinistryDashboard';
import StateDashboard from './StateDashboard';
import DistrictDashboard from './DistrictDashboard';
import GPDashboard from './GPDashboard';
import ImplementingAgencyDashboard from './ImplementingAgencyDashboard';
import ExecutingAgencyDashboard from './ExecutingAgencyDashboard';
import { View, Text, StyleSheet } from 'react-native';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user || !user.role) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No user role found</Text>
      </View>
    );
  }

  switch (user.role) {
    case ROLES.MINISTRY:
      return <MinistryDashboard />;

    case ROLES.STATE:
      return <StateDashboard />;

    case ROLES.DISTRICT:
      return <DistrictDashboard />;

    case ROLES.GP:
      return <GPDashboard />;

    case ROLES.DEPARTMENT:
      return <ImplementingAgencyDashboard />;

    case ROLES.CONTRACTOR:
      return <ExecutingAgencyDashboard />;

    case ROLES.IMPLEMENTING_AGENCY:
      return <ImplementingAgencyDashboard />;

    case ROLES.EXECUTING_AGENCY:
      return <ExecutingAgencyDashboard />;

    default:
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unknown role: {user.role}</Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#c00',
    textAlign: 'center',
  },
});

export default DashboardRouter;
