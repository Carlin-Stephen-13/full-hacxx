import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { ErrorBoundary } from './error-boundary';
import DistractionBlocker from '@/components/DistractionBlocker';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ErrorBoundary>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'dark']}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
        <DistractionBlocker />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
