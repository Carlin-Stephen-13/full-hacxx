import { Stack } from 'expo-router';

export default function AnalyticsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="category" />
      <Stack.Screen name="behaviour" />
      <Stack.Screen name="distraction" />
    </Stack>
  );
}
