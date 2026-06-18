import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('PMajay@2024#Demo');
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [buttonActive, setButtonActive] = useState(false);
  const { login, loading } = useAuth();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Simulate connection check
      setConnectionStatus('connected');
    } catch (err) {
      setConnectionStatus('error');
    }
  };

  const handleLogin = async () => {
    setError('');
    setButtonActive(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setButtonActive(false);
    }
  };

  const ConnectionStatusBadge = () => {
    if (connectionStatus === 'checking') {
      return (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>📡 Checking connection...</Text>
        </View>
      );
    }
    if (connectionStatus === 'error') {
      return (
        <View style={[styles.statusBadge, styles.statusError]}>
          <Text style={styles.statusTextError}>❌ Server Unreachable</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, styles.statusSuccess]}>
        <Text style={styles.statusTextSuccess}>✅ Server Connected</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header />

        {/* Login Content */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.1)']}
          style={styles.loginContainer}
        >
          <View style={styles.loginCard}>
            {/* Logo Section */}
            <View style={styles.loginHeader}>
              <Image
                source={require('../../assets/images/emblem.png')}
                style={styles.loginLogo}
                resizeMode="contain"
              />
              <Text style={styles.loginTitle}>PM-AJAY Portal</Text>
              <Text style={styles.loginSubtitle}>
                Ministry of Social Justice & Empowerment
              </Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorAlert}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Connection Status */}
            <ConnectionStatusBadge />

            {/* Form */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email Address</Text>
              <TextInput
                style={styles.formControl}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Password</Text>
              <TextInput
                style={styles.formControl}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                buttonActive && styles.loginButtonActive,
                loading && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Footer Links */}
            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
              <View style={styles.contactRow}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Contact Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Footer */}
        <Footer />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loginContainer: {
    flex: 1,
    minHeight: 500,
    justifyContent: 'center',
    padding: 16,
    paddingVertical: 40,
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FF9933', // Saffron border
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 25,
    elevation: 10,
    padding: width < 360 ? 24 : 32,
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: width < 360 ? 24 : 32,
  },
  loginLogo: {
    height: width < 360 ? 80 : 100,
    width: width < 360 ? 80 : 100,
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: width < 360 ? 22 : 28,
    fontWeight: 'bold',
    color: '#001f3f', // Navy color
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorAlert: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c00',
    textAlign: 'center',
    fontSize: 14,
  },
  statusBadge: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  statusSuccess: {
    backgroundColor: '#e8f5e9',
  },
  statusError: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  statusTextSuccess: {
    fontSize: 12,
    textAlign: 'center',
    color: '#2e7d32',
  },
  statusTextError: {
    fontSize: 12,
    textAlign: 'center',
    color: '#c62828',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formControl: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#ae5b09', // Primary color from web
    paddingVertical: 16,
    borderRadius: 50, // Fully rounded like web
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonActive: {
    shadowColor: '#ae5b09',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerLinks: {
    marginTop: 24,
    alignItems: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    fontSize: 14,
    color: '#ae5b09',
    fontWeight: '600',
  },
});

export default LoginScreen;
