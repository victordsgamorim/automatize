/**
 * App Layout
 * Main app layout with bottom tab navigation
 * Only accessible when authenticated
 */

import { useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';
import { useAuth } from '@automatize/auth';
import {
  HomeIcon,
  UserIcon,
  BuildingIcon,
  semanticColors,
} from '@automatize/ui';

const theme = semanticColors.light;

/**
 * App Tabs Layout Component
 * Provides tab navigation for authenticated users
 */
export default function AppLayout() {
  const { currentTenant } = useAuth();
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.background.primary,
          borderBottomColor: theme.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          color: theme.text.primary,
          fontSize: 18,
          fontWeight: '600',
        },
        headerLeftLabelVisible: false,
        tabBarStyle: {
          backgroundColor: theme.background.primary,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.brand[600],
        tabBarInactiveTintColor: theme.text.tertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: currentTenant?.name || 'Home',
          headerShown: true,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          headerRight: () => null,
        }}
      />

      {/* Tenants Tab */}
      <Tabs.Screen
        name="tenants"
        options={{
          title: 'Tenants',
          tabBarLabel: 'Tenants',
          tabBarIcon: ({ color }) => <BuildingIcon color={color} />,
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <UserIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
