import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const Header = () => {
  return (
    <View style={styles.headerContainer}>
      {/* Top Bar */}
      <View style={styles.headerTop} />

      {/* Main Header */}
      <View style={styles.headerMain}>
        <View style={styles.headerContent}>
          {/* Left Logo - Adarsh Gram */}
          <View style={styles.headerLogos}>
            <Image
              source={require('../../assets/images/adarsh-gram.png')}
              style={styles.logoEmblem}
              resizeMode="contain"
            />
          </View>

          {/* Title Section */}
          <View style={styles.headerTitle}>
            <Text style={styles.titleText}>
              Pradhan Mantri Anusuchit Jaati{'\n'}Abhyuday Yojna (PM-AJAY)
            </Text>
            <Text style={styles.subtitleText}>
              Department of Social Justice & Empowerment,{'\n'}
              Ministry of Social Justice & Empowerment,{'\n'}
              Government of India
            </Text>
          </View>

          {/* Right Logo - Amrit */}
          <View style={styles.headerLogos}>
            <Image
              source={require('../../assets/images/logo-amrit.png')}
              style={styles.logoEmblem}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
  },
  headerTop: {
    backgroundColor: '#FF9933', // Saffron color
    height: 43,
  },
  headerMain: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: width < 360 ? 8 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: width < 360 ? 8 : 16,
  },
  headerLogos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmblem: {
    height: width < 360 ? 50 : width < 768 ? 60 : 80,
    width: width < 360 ? 50 : width < 768 ? 60 : 80,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  titleText: {
    color: '#001f3f',
    fontSize: width < 360 ? 11 : width < 768 ? 13 : 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: width < 360 ? 15 : width < 768 ? 17 : 18,
  },
  subtitleText: {
    fontSize: width < 360 ? 8 : width < 768 ? 9 : 10,
    color: '#001f3f',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: width < 360 ? 12 : 14,
  },
});

export default Header;
