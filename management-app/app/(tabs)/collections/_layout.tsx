import { Stack } from "expo-router";

export default function CollectionsStack() {
  return (
    <Stack>
      <Stack.Screen name="collections" options={{ headerShown: false }} />
      <Stack.Screen name="collectionDetails" options={{ headerShown: false }} />
    </Stack>
  );
}