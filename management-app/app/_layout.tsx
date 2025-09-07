import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { NavigationBlockProvider } from '@/contexts/NavigationBlockContext';
import { BluetoothConectionProvider } from '@/contexts/BluetoothConectionContext';
import { useEffect } from 'react';
import { initDB } from '@/data/database';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const prepararDB = async () => {
      try {
        await initDB();
        console.log("Banco inicializado!");
      } catch (e) {
        console.error("Erro ao iniciar DB:", e);
      }
    };
    prepararDB();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NavigationBlockProvider>
        <BluetoothConectionProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </BluetoothConectionProvider>
      </NavigationBlockProvider>
    </ThemeProvider>
  );
}
