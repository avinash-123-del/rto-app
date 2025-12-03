import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#032a69',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 85,
          marginBottom:0,
          zIndex: 1000,
        },
        headerStyle: {
          backgroundColor: '#02245c',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}

    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerTitle: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerRight: () => headerRight(router),
          headerLeft: () => headerLeft(router),
        }}
      />
      <Tabs.Screen
        name="parties"
        options={{
          title: 'Parties',
          headerTitle: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
          headerRight: () => headerRight(router),
          headerLeft: () => headerLeft(router),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          headerTitle: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
          headerRight: () => headerRight(router),
          headerLeft: () => headerLeft(router),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          headerTitle: '',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size} color={color} />
          ),
          headerRight: () => headerRight(router),
          headerLeft: () => headerLeft(router),
        }}
      />
      <Tabs.Screen
        name="partyDetails"
        options={{
          title: 'Party Details',
          headerTitle: '',
          href: null, // This hides it from the tab bar
          headerRight: () => headerRight(router),
          headerLeft: () => headerLeft(router),
        }}
      />
    </Tabs>
  );
}

const headerRight = (router) => (
  <View className="flex-row items-center gap-4 mr-4">
    <TouchableOpacity onPress={() => router.push('/notifications')}>
      <Ionicons name="notifications-outline" size={24} color="white" />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => router.push('/profile')}>
      <Ionicons name="person-circle-outline" size={24} color="white" />
    </TouchableOpacity>
  </View>
);

const headerLeft = (router) => (
  <View className="flex-row items-end gap-2 ml-4">
    <Ionicons name="document-attach-outline" size={20} color="white" />
    <Text className="text-white text-lg font-bold">RTO App</Text>
  </View>
);