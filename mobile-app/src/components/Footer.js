import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

const Footer = () => {
  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        {/* About Section */}
        <View style={styles.footerSection}>
          <Text style={styles.footerHeading}>About PM-AJAY</Text>
          <Text style={styles.footerText}>
            PM-AJAY is a comprehensive scheme for the welfare and empowerment of Scheduled Castes,
            focusing on Adarsh Gram, Grant-in-Aid, and Hostel components.
          </Text>
        </View>

        {/* Quick Links */}
        <View style={styles.footerSection}>
          <Text style={styles.footerHeading}>Quick Links</Text>
          <TouchableOpacity onPress={() => openLink('https://socialjustice.gov.in')}>
            <Text style={styles.linkText}>Ministry Website</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.linkText}>Scheme Guidelines</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.linkText}>FAQs</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.linkText}>Contact Us</Text>
          </TouchableOpacity>
        </View>

        {/* Important Links */}
        <View style={styles.footerSection}>
          <Text style={styles.footerHeading}>Important Links</Text>
          <TouchableOpacity onPress={() => openLink('https://india.gov.in')}>
            <Text style={styles.linkText}>National Portal of India</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://digitalindia.gov.in')}>
            <Text style={styles.linkText}>Digital India</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://mygov.in')}>
            <Text style={styles.linkText}>MyGov</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={styles.footerSection}>
          <Text style={styles.footerHeading}>Contact Information</Text>
          <Text style={styles.contactText}>📧 Email: pmajay@mosje.gov.in</Text>
          <Text style={styles.contactText}>📞 Helpline: 1800-XXX-XXXX</Text>
          <Text style={styles.contactText}>
            📍 Ministry of Social Justice & Empowerment{'\n'}
            Shastri Bhawan, New Delhi - 110001
          </Text>
        </View>
      </View>

      {/* Footer Bottom */}
      <View style={styles.footerBottom}>
        <Text style={styles.copyrightText}>
          © 2025 Ministry of Social Justice & Empowerment, Government of India. All Rights Reserved.
        </Text>
        <Text style={styles.updatedText}>
          Last Updated: December 8, 2025
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#434242',
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginTop: 'auto',
  },
  footerContent: {
    gap: 24,
  },
  footerSection: {
    marginBottom: 20,
  },
  footerHeading: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  footerText: {
    color: '#f1f1f1',
    fontSize: 13,
    lineHeight: 20,
  },
  linkText: {
    color: '#4fc3f7',
    fontSize: 13,
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  contactText: {
    color: '#f1f1f1',
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: '#666',
    paddingTop: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  copyrightText: {
    color: '#f1f1f1',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  updatedText: {
    color: '#f1f1f1',
    fontSize: 10,
    textAlign: 'center',
  },
});

export default Footer;
