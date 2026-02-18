import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY = 'focus_session_v1';

export interface FocusSession {
  active: boolean;
  blockedApps: string[];
  durationMinutes: number;
  startedAt: number; // epoch ms
  endsAt: number;    // epoch ms
}

export async function saveSession(session: FocusSession) {
  await AsyncStorage.setItem(KEY, JSON.stringify(session));
  // Also write to localStorage for web so other hooks can read synchronously
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  }
}

export async function clearSession() {
  await AsyncStorage.removeItem(KEY);
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.removeItem(KEY);
  }
}

export async function loadSession(): Promise<FocusSession | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const s: FocusSession = JSON.parse(raw);
    // If session already expired, clean it up
    if (Date.now() > s.endsAt) {
      await clearSession();
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

/** Synchronous read for web (used in visibility-change handler) */
export function loadSessionSync(): FocusSession | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const s: FocusSession = JSON.parse(raw);
    if (Date.now() > s.endsAt) return null;
    return s;
  } catch {
    return null;
  }
}
