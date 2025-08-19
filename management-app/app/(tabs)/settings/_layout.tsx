import { Stack } from "expo-router";

export default function SettingsStack() {
  return (
    <Stack>
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="collectionData" options={{ headerShown: false }} />
    </Stack>
  );
}