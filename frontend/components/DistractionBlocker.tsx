import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  useRef,
} from 'react-native';
import { ZapIcon, ShieldIcon, XIcon, AlertTriangleIcon } from 'lucide-react-native';
import { loadSessionSync, FocusSession } from '../lib/focusSession';

function formatTimeLeft(endsAt: number) {
  const ms = Math.max(0, endsAt - Date.now());
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function DistractionBlocker() {
  const [session, setSession] = useState<FocusSession | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  // Poll timeLeft every second when overlay is showing
  useEffect(() => {
    if (!visible || !session) return;
    const iv = setInterval(() => {
      const tl = formatTimeLeft(session.endsAt);
      setTimeLeft(tl);
      if (Date.now() > session.endsAt) {
        setVisible(false);
        clearInterval(iv);
      }
    }, 1000);
    setTimeLeft(formatTimeLeft(session.endsAt));
    return () => clearInterval(iv);
  }, [visible, session]);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  // Web visibility / blur detection
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const s = loadSessionSync();
        if (s && s.active) {
          setSession(s);
          setDismissed(false);
          setVisible(true);
          triggerShake();
        }
      }
    };

    const handleFocus = () => {
      const s = loadSessionSync();
      if (s && s.active) {
        setSession(s);
        setDismissed(false);
        setVisible(true);
        triggerShake();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [triggerShake]);

  // Also listen for a custom event dispatched when session starts
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const s = loadSessionSync();
      if (s) { setSession(s); }
    };
    window.addEventListener('focusSessionStarted', handler);
    window.addEventListener('focusSessionEnded', () => {
      setVisible(false);
      setSession(null);
    });
    return () => {
      window.removeEventListener('focusSessionStarted', handler);
    };
  }, []);

  if (!visible || !session) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        {/* Shield icon */}
        <View style={styles.shieldWrap}>
          <ShieldIcon color="#6366F1" size={64} />
        </View>

        <Text style={styles.title}>Focus Mode Active</Text>
        <Text style={styles.subtitle}>
          You left the app. Stay on track — your session is still running.
        </Text>

        {/* Timer */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Time Remaining</Text>
          <Text style={styles.timerText}>{timeLeft}</Text>
        </View>

        {/* Blocked apps list */}
        <View style={styles.blockedCard}>
          <View style={styles.blockedHeader}>
            <AlertTriangleIcon color="#F59E0B" size={16} />
            <Text style={styles.blockedTitle}>Blocked Apps This Session</Text>
          </View>
          <View style={styles.blockedChips}>
            {session.blockedApps.map((app) => (
              <View key={app} style={styles.chip}>
                <Text style={styles.chipText}>{app}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Back to focus */}
        <TouchableOpacity style={styles.backBtn} onPress={() => setVisible(false)}>
          <ZapIcon color="#FFF" size={18} />
          <Text style={styles.backBtnText}>Back to Focus</Text>
        </TouchableOpacity>

        {/* Dismiss with shame message */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={() => { setDismissed(true); setVisible(false); }}>
            <XIcon color="#555566" size={14} />
            <Text style={styles.dismissText}>Ignore & continue anyway</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#07071A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  shieldWrap: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: '#13132A',
    borderWidth: 2,
    borderColor: '#6366F144',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#888899',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 32,
    maxWidth: 300,
  },
  timerCard: {
    backgroundColor: '#13132A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6366F133',
    marginBottom: 16,
    width: '100%',
  },
  timerLabel: {
    color: '#888899',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerText: {
    color: '#6366F1',
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: 4,
  },
  blockedCard: {
    backgroundColor: '#13132A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    marginBottom: 28,
    width: '100%',
  },
  blockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  blockedTitle: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
  },
  blockedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#2A2A4A',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#3A3A5A',
  },
  chipText: {
    color: '#CCCCFF',
    fontSize: 12,
    fontWeight: '600',
  },
  backBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    width: '100%',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
  },
  dismissText: {
    color: '#555566',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
