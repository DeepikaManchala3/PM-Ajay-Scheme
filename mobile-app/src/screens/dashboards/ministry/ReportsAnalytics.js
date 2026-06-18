import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ReportsAnalytics = () => {
    return (
        <View style={styles.container}>
            <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderIcon}>📋</Text>
                <Text style={styles.placeholderTitle}>Reports & Analytics</Text>
                <Text style={styles.placeholderText}>
                    This feature is coming soon!
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    placeholderContainer: {
        flex: 1,
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
    },
    placeholderIcon: {
        fontSize: 80,
        marginBottom: 20,
        opacity: 0.3,
    },
    placeholderTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    placeholderText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default ReportsAnalytics;
