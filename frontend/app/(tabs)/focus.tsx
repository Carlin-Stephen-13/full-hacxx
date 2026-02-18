import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  StatusBar,
  Animated,
  Modal,
  Platform,
} from 'react-native';
import { ZapIcon, CheckSquareIcon, SquareIcon, BellOffIcon, TrophyIcon, XIcon, StarIcon } from 'lucide-react-native';
import { saveSession, clearSession, loadSession } from '@/lib/focusSession';

const APPS_TO_BLOCK = [
  { name: 'Instagram', icon: '📸', category: 'Social' },
  { name: 'YouTube', icon: '▶️', category: 'Entertainment' },
  { name: 'Twitter/X', icon: '🐦', category: 'Social' },
  { name: 'TikTok', icon: '🎵', category: 'Entertainment' },
  { name: 'WhatsApp', icon: '💬', category: 'Social' },
  { name: 'Reddit', icon: '🔴', category: 'Social' },
];

const TIMER_PRESETS = [15, 25, 50, 90];

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function FocusScreen() {
  const [focusOn, setFocusOn] = useState(false);
  const [blocked, setBlocked] = useState<Set<string>>(new Set(['Instagram', 'YouTube', 'Twitter/X']));
  const [timerPreset, setTimerPreset] = useState(25);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [completed, setCompleted] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const celebSlide = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    setTimeLeft(timerPreset * 60);
    setRunning(false);
    setCompleted(false);
  }, [timerPreset]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (running && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && running) {
      setRunning(false);
      setCompleted(true);
      // Show celebration popup
      setCelebrationVisible(true);
      Animated.spring(celebSlide, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
    return () => { if (interval) clearInterval(interval); };
  }, [running, timeLeft]);

  useEffect(() => {
    if (running) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [running]);

  const closeCelebration = () => {
    Animated.timing(celebSlide, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setCelebrationVisible(false));
  };

  const toggleBlocked = (name: string) => {
    setBlocked((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleStart = async () => {
    if (!focusOn) setFocusOn(true);
    setCompleted(false);
    const durationMs = timerPreset * 60 * 1000;
    const now = Date.now();
    const session = {
      active: true,
      blockedApps: Array.from(blocked),
      durationMinutes: timerPreset,
      startedAt: now,
      endsAt: now + durationMs,
    };
    await saveSession(session);
    // Notify DistractionBlocker that a session has started
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('focusSessionStarted'));
    }
    setTimeLeft(timerPreset * 60);
    setRunning(true);
  };

  const handleStop = async () => {
    setRunning(false);
    setTimeLeft(timerPreset * 60);
    await clearSession();
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('focusSessionEnded'));
    }
  };

  const progress = 1 - timeLeft / (timerPreset * 60);
  const circumference = 2 * Math.PI * 80;
  const strokeDash = progress * circumference;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A14" />

      {/* Session Complete Celebration Modal */}
      <Modal
        visible={celebrationVisible}
        transparent
        animationType="none"
        onRequestClose={closeCelebration}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeCelebration}>
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: celebSlide }] }]}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.modalHandle} />

              {/* Trophy */}
              <View style={styles.celebCenter}>
                <View style={styles.trophyBadge}>
                  <TrophyIcon color="#F59E0B" size={40} />
                </View>
                <Text style={styles.celebTitle}>Session Complete!</Text>
                <Text style={styles.celebSubtitle}>
                  You completed a {timerPreset}-minute focus session. Amazing work!
                </Text>
              </View>

              {/* Stats */}
              <View style={styles.celebStatsRow}>
                <View style={styles.celebStat}>
                  <Text style={styles.celebStatVal}>{timerPreset}m</Text>
                  <Text style={styles.celebStatLabel}>Focused</Text>
                </View>
                <View style={styles.celebStat}>
                  <Text style={styles.celebStatVal}>{blocked.size}</Text>
                  <Text style={styles.celebStatLabel}>Apps Blocked</Text>
                </View>
                <View style={styles.celebStat}>
                  <Text style={styles.celebStatVal}>+5</Text>
                  <Text style={styles.celebStatLabel}>Focus Score</Text>
                </View>
              </View>

              {/* Streak badge */}
              <View style={styles.streakRow}>
                <StarIcon color="#F59E0B" size={14} />
                <Text style={styles.streakText}>3-day focus streak! Keep it up!</Text>
              </View>

              <TouchableOpacity
                style={styles.celebBtn}
                onPress={() => {
                  closeCelebration();
                  setTimeLeft(timerPreset * 60);
                  setCompleted(false);
                }}>
                <ZapIcon color="#FFF" size={16} />
                <Text style={styles.celebBtnText}>Start Another Session</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.celebBtnSecondary} onPress={closeCelebration}>
                <Text style={styles.celebBtnSecondaryText}>Done for Now</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Focus Mode</Text>
          <View style={styles.headerStatus}>
            <View style={[styles.statusDot, { backgroundColor: focusOn ? '#10B981' : '#555566' }]} />
            <Text style={[styles.statusText, { color: focusOn ? '#10B981' : '#555566' }]}>
              {focusOn ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>

        {/* Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <ZapIcon color="#6366F1" size={22} />
            <View>
              <Text style={styles.toggleTitle}>Focus Mode</Text>
              <Text style={styles.toggleSub}>
                {focusOn ? 'Apps are being blocked' : 'Enable to block distractions'}
              </Text>
            </View>
          </View>
          <Switch
            value={focusOn}
            onValueChange={(v) => {
              setFocusOn(v);
              if (!v) { setRunning(false); setTimeLeft(timerPreset * 60); }
            }}
            trackColor={{ false: '#2A2A4A', true: '#6366F1' }}
            thumbColor={focusOn ? '#FFFFFF' : '#888899'}
          />
        </View>

        {/* Timer Circle */}
        <Animated.View style={[styles.timerSection, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.timerCircleOuter}>
            <View style={styles.timerCircle}>
              {completed ? (
                <View style={styles.completedInner}>
                  <TrophyIcon color="#F59E0B" size={36} />
                  <Text style={styles.completedText}>Done!</Text>
                </View>
              ) : (
                <View style={styles.timerInner}>
                  <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                  <Text style={styles.timerSub}>{running ? 'Focusing...' : 'Ready'}</Text>
                </View>
              )}
            </View>
            {/* Progress arc indicator */}
            <View
              style={[
                styles.progressArc,
                {
                  borderColor: running ? '#6366F1' : '#2A2A4A',
                  borderTopColor: running ? '#10B981' : '#2A2A4A',
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* Timer Presets */}
        <Text style={styles.sectionTitle}>Set Focus Timer</Text>
        <View style={styles.presetsRow}>
          {TIMER_PRESETS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setTimerPreset(p)}
              style={[styles.presetBtn, timerPreset === p && styles.presetBtnActive]}>
              <Text style={[styles.presetText, timerPreset === p && styles.presetTextActive]}>
                {p}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Start / Stop */}
        <View style={styles.controlRow}>
          {running ? (
            <TouchableOpacity style={[styles.startBtn, styles.stopBtn]} onPress={handleStop}>
              <Text style={styles.startBtnText}>Stop Session</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
              <ZapIcon color="#FFFFFF" size={18} />
              <Text style={styles.startBtnText}>
                {completed ? 'Start New Session' : 'Start'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Apps to Block */}
        <Text style={styles.sectionTitle}>Select Apps to Block</Text>
        <View style={styles.appGrid}>
          {APPS_TO_BLOCK.map((app, i) => {
            const isBlocked = blocked.has(app.name);
            return (
              <TouchableOpacity
                key={i}
                onPress={() => toggleBlocked(app.name)}
                style={[styles.appBlockCard, isBlocked && styles.appBlockCardActive]}>
                <View style={styles.appBlockCheck}>
                  {isBlocked ? (
                    <CheckSquareIcon color="#6366F1" size={18} />
                  ) : (
                    <SquareIcon color="#555566" size={18} />
                  )}
                </View>
                <Text style={styles.appBlockIcon}>{app.icon}</Text>
                <Text style={[styles.appBlockName, isBlocked && styles.appBlockNameActive]}>
                  {app.name}
                </Text>
                <Text style={styles.appBlockCat}>{app.category}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Blocking summary */}
        {blocked.size > 0 && (
          <View style={styles.blockingSummary}>
            <BellOffIcon color="#6366F1" size={14} />
            <Text style={styles.blockingText}>
              {blocked.size} app{blocked.size > 1 ? 's' : ''} will be blocked during focus sessions
            </Text>
          </View>
        )}

        {/* Todos / Notes */}
        <View style={styles.todoHint}>
          <Text style={styles.todoHintTitle}>Focus Todos</Text>
          <Text style={styles.todoHintText}>
            Write down what you plan to accomplish during this focus session to stay on track.
          </Text>
          <View style={styles.todoList}>
            {['Finish chapter 3', 'Reply to emails', 'Review project plan'].map((t, i) => (
              <View key={i} style={styles.todoItem}>
                <View style={styles.todoDot} />
                <Text style={styles.todoText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A14' },
  scroll: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 30 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  headerStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },

  toggleCard: {
    backgroundColor: '#13132A', borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#2A2A4A', marginBottom: 24,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  toggleTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  toggleSub: { color: '#888899', fontSize: 12, marginTop: 2 },

  // Timer
  timerSection: { alignItems: 'center', marginBottom: 24 },
  timerCircleOuter: {
    width: 200, height: 200, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  timerCircle: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: '#13132A', borderWidth: 4, borderColor: '#2A2A4A',
    alignItems: 'center', justifyContent: 'center',
  },
  progressArc: {
    position: 'absolute', width: 192, height: 192,
    borderRadius: 96, borderWidth: 4,
  },
  timerInner: { alignItems: 'center' },
  timerText: { color: '#FFFFFF', fontSize: 40, fontWeight: '800', letterSpacing: 2 },
  timerSub: { color: '#888899', fontSize: 13, marginTop: 4 },
  completedInner: { alignItems: 'center', gap: 8 },
  completedText: { color: '#F59E0B', fontSize: 22, fontWeight: '800' },

  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },

  presetsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  presetBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#13132A', borderWidth: 1, borderColor: '#2A2A4A', alignItems: 'center',
  },
  presetBtnActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  presetText: { color: '#888899', fontSize: 14, fontWeight: '700' },
  presetTextActive: { color: '#FFFFFF' },

  controlRow: { marginBottom: 28 },
  startBtn: {
    backgroundColor: '#6366F1', borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  stopBtn: { backgroundColor: '#EF4444' },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  // App Grid
  appGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  appBlockCard: {
    width: '30%', backgroundColor: '#13132A', borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#2A2A4A', position: 'relative',
  },
  appBlockCardActive: { borderColor: '#6366F155', backgroundColor: '#1B1B3A' },
  appBlockCheck: { position: 'absolute', top: 8, right: 8 },
  appBlockIcon: { fontSize: 24 },
  appBlockName: { color: '#888899', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  appBlockNameActive: { color: '#CCCCFF' },
  appBlockCat: { color: '#555566', fontSize: 9 },

  blockingSummary: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1B1B3A', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#6366F133', marginBottom: 20,
  },
  blockingText: { color: '#AAAACC', fontSize: 12 },

  // Todos
  todoHint: {
    backgroundColor: '#13132A', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#2A2A4A',
  },
  todoHintTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  todoHintText: { color: '#888899', fontSize: 12, lineHeight: 17, marginBottom: 14 },
  todoList: { gap: 10 },
  todoItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  todoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6366F1' },
  todoText: { color: '#CCCCDD', fontSize: 13 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#13132A', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36, borderTopWidth: 1, borderColor: '#2A2A4A',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#3A3A5A', alignSelf: 'center', marginBottom: 20,
  },

  // Celebration
  celebCenter: { alignItems: 'center', marginBottom: 24 },
  trophyBadge: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#2A1E00',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#F59E0B55', marginBottom: 16,
  },
  celebTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  celebSubtitle: { color: '#888899', fontSize: 13, textAlign: 'center', lineHeight: 19 },
  celebStatsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  celebStat: {
    flex: 1, backgroundColor: '#1B1B3A', borderRadius: 12, padding: 14,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#2A2A4A',
  },
  celebStatVal: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  celebStatLabel: { color: '#888899', fontSize: 11 },
  streakRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#2A1E00', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#F59E0B33', marginBottom: 20,
  },
  streakText: { color: '#F59E0B', fontSize: 13, fontWeight: '600' },
  celebBtn: {
    backgroundColor: '#6366F1', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 10,
  },
  celebBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  celebBtnSecondary: {
    backgroundColor: '#1E1E3A', borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#2A2A4A',
  },
  celebBtnSecondaryText: { color: '#AAAACC', fontSize: 14, fontWeight: '600' },
});
