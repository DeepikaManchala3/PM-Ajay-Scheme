import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-6">
      <View className="flex-row justify-between items-center mb-8">
        <View>
             <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
             <Text className="text-gray-500 text-sm">Welcome Back!</Text>
        </View>
        <TouchableOpacity 
            onPress={logout}
            className="bg-red-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Logout</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <Text className="text-gray-500 mb-1 uppercase text-xs tracking-wider">Logged in as</Text>
        <Text className="text-lg font-semibold text-gray-800">{user?.email}</Text>
        <Text className="text-blue-600 mt-2">{user?.role}</Text>
      </View>

      <View className="flex-row flex-wrap justify-between">
         {/* Simple Dashboard Cards */}
         <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 aspect-square justify-center items-center cursor-pointer">
            <Text className="text-3xl font-bold text-blue-600 mb-2">12</Text>
            <Text className="text-gray-500 text-center text-xs">Active Projects</Text>
         </View>
         <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 aspect-square justify-center items-center">
            <Text className="text-3xl font-bold text-green-600 mb-2">₹4.5Cr</Text>
            <Text className="text-gray-500 text-center text-xs">Funds Allocated</Text>
         </View>
          <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 aspect-square justify-center items-center">
            <Text className="text-3xl font-bold text-orange-600 mb-2">8</Text>
            <Text className="text-gray-500 text-center text-xs">Pending Proposals</Text>
         </View>
         <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 aspect-square justify-center items-center">
            <Text className="text-3xl font-bold text-purple-600 mb-2">95%</Text>
            <Text className="text-gray-500 text-center text-xs">Utilization</Text>
         </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
