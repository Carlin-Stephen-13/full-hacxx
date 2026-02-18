import { Tabs } from 'expo-router';
import { HomeIcon, BarChart2Icon, ZapIcon, UserIcon } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F0F1A',
          borderTopColor: '#1E1E2E',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#555570',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="analytics/index"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <BarChart2Icon color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? '#6366F1' : '#1E1E2E',
                borderRadius: 16,
                width: 44,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ZapIcon color={focused ? '#fff' : color} size={20} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size - 2} />,
        }}
      />
    </Tabs>
  );
}
