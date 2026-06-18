import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const DashboardSidebar = ({ menuItems, user, isOpen, onClose }) => {
  const userData = user || {
    full_name: 'Admin',
    email: ''
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sidebar}>
          {/* Logo and Profile Section */}
          <View style={styles.logoSection}>
            <Image
              source={require('../../assets/images/logo-amrit.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>{userData.full_name}</Text>
          </View>

          {/* Navigation Menu */}
          <ScrollView style={styles.navContainer}>
            {menuItems.map((item, index) => (
              <View key={index}>
                <TouchableOpacity
                  style={[
                    styles.navItem,
                    item.active && styles.navItemActive,
                    item.isLogout && styles.navItemLogout
                  ]}
                  onPress={() => {
                    if (item.action) {
                      item.action();
                    }
                    if (!item.isLogout) {
                      onClose();
                    }
                  }}
                >
                  <View style={styles.navIcon}>{item.icon}</View>
                  <Text
                    style={[
                      styles.navLabel,
                      item.active && styles.navLabelActive,
                      item.isLogout && styles.navLabelLogout
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
                {/* Orange separator line (75% width) */}
                {index < menuItems.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </ScrollView>
        </View>
        
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: width * 0.75,
    maxWidth: 300,
    backgroundColor: '#F9FAFB',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  logoSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  navContainer: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 20,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: '#FFF5EB',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9933',
  },
  navItemLogout: {
    marginTop: 8,
  },
  navIcon: {
    width: 28,
    marginRight: 16,
    alignItems: 'center',
  },
  navLabel: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  navLabelActive: {
    color: '#FF9933',
    fontWeight: '600',
  },
  navLabelLogout: {
    color: '#DC2626',
  },
  separator: {
    height: 1,
    backgroundColor: '#FF9933',
    width: '75%',
    alignSelf: 'center',
    opacity: 0.3,
    marginVertical: 4,
  },
});

export default DashboardSidebar;
