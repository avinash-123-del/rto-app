import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuth } from '../../src/contexts/AuthContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

     if (mobile.length ===10 && !/^[6-9]\d{9}$/.test(mobile)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: name,
        email: email,
        phoneNumber: mobile,
        password,
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={20}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 bg-white px-6 py-10">
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mb-3">
              <Ionicons name="person-add" size={32} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-800">Create Account</Text>
            <Text className="text-gray-500 mt-1">Sign up to get started</Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Full Name *</Text>
            <View className="flex-row items-center bg-gray-100 rounded-lg px-4">
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 py-4 px-3 text-gray-800"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                autoComplete="name"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Email *</Text>
            <View className="flex-row items-center bg-gray-100 rounded-lg px-4">
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 py-4 px-3 text-gray-800"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoComplete="email"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Mobile</Text>
            <View className="flex-row items-center bg-gray-100 rounded-lg px-4">
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 py-4 px-3 text-gray-800"
                placeholder="Enter your mobile number"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Password *</Text>
            <View className="flex-row items-center bg-gray-100 rounded-lg px-4">
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 py-4 px-3 text-gray-800"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#6B7280"
                />
              </Pressable>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Confirm Password *</Text>
            <View className="flex-row items-center bg-gray-100 rounded-lg px-4">
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 py-4 px-3 text-gray-800"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className="bg-blue-500 py-4 rounded-lg items-center mb-4"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">Create Account</Text>
            )}
          </Pressable>

          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-blue-500 font-semibold">Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAwareScrollView>
  );
}
