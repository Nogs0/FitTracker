import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { initDB } from '../../data/database';
import { useNavigationBlock } from '@/contexts/NavigationBlockContext';
import stylesGlobal from '@/styles/global';
export default function TabLayout() {
  const { bloqueado } = useNavigationBlock();
  const colorScheme = useColorScheme();
  useEffect(() => {
    initDB();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
        tabBarButton: (props) => (
          <HapticTab {...props} disabled={bloqueado}></HapticTab>
        ),
      }}>
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => <Fontisto name='player-settings' color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'Coletas',
          tabBarIcon: ({ color }) => <Fontisto name='heartbeat' color={color} size={20} />,
        }}
      />
    </Tabs>
  );
}
