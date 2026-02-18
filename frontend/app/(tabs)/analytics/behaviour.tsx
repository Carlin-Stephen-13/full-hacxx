import { useRouter } from 'expo-router';
import { ArrowLeftIcon, ArrowRightIcon, BrainIcon, LightbulbIcon, ZapIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { DISTRACTION_LOOPS } from '@/lib/store';

const LOOP_PATTERN_TIMES = [
  { time: '8:30 AM', label: 'Morning check-in' },
  { time: '2:15 PM', label: 'Post-lunch drift' },
  { time: '10:45 PM', label: 'Late-night scroll' },
];

const SUGGESTIONS = [
  'Set a 15-minute timer before opening social apps.',
  'Enable Focus Mode during your peak distraction hours (2–3 PM).',
  'Replace one loop session with a 5-minute walk.',
  'Turn off notifications for Instagram between 9 PM–9 AM.',
];

export default function BehaviourScreen() {
  const router = useRouter();
  const [notifVisible, setNotifVisible] = useState(false);
  const loopApps = ['Instagram', 'WhatsApp', 'YouTube', 'Back to Instagram'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A14" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeftIcon color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>Behaviour Patterns</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.subtitleRow}>
          <BrainIcon color="#F59E0B" size={14} />
          <Text style={styles.subtitle}>Long-Term Analysis</Text>
        </View>

        {/* Behavior Loop Insight */}
        <View style={styles.loopCard}>
          <Text style={styles.loopCardTitle}>Behavior Loop Insight</Text>
          <Text style={styles.loopCardSub}>Most Common Distraction Loop</Text>

          <View style={styles.loopChain}>
            {loopApps.map((app, i) => (
              <View key={i} style={styles.loopStepCol}>
                <View
                  style={[
                    styles.loopStep,
                    i === 0 && { borderColor: '#E1306C', backgroundColor: '#2A0A15' },
                    i === 1 && { borderColor: '#25D366', backgroundColor: '#0A2A14' },
                    i === 2 && { borderColor: '#FF0000', backgroundColor: '#2A0A0A' },
                    i === 3 && { borderColor: '#E1306C', backgroundColor: '#2A0A15', opacity: 0.7 },
                  ]}>
                  <Text style={styles.loopStepText}>{app}</Text>
                  {i < DISTRACTION_LOOPS.length && (
                    <Text style={styles.loopTime}>({DISTRACTION_LOOPS[i]?.minutes}m)</Text>
                  )}
                </View>
                {i < loopApps.length - 1 && (
                  <View style={styles.arrowDown}>
                    <ArrowRightIcon
                      color="#666677"
                      size={14}
                      style={{ transform: [{ rotate: '90deg' }] }}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Loop Stats */}
          <View style={styles.loopStats}>
            <View style={styles.loopStatItem}>
              <Text style={styles.loopStatVal}>3.2x</Text>
              <Text style={styles.loopStatLabel}>Daily avg loops</Text>
            </View>
            <View style={styles.loopStatItem}>
              <Text style={styles.loopStatVal}>47m</Text>
              <Text style={styles.loopStatLabel}>Avg loop duration</Text>
            </View>
            <View style={styles.loopStatItem}>
              <Text style={styles.loopStatVal}>~21</Text>
              <Text style={styles.loopStatLabel}>Loops this week</Text>
            </View>
          </View>
        </View>

        {/* When Loops Occur */}
        <Text style={styles.sectionTitle}>When Loops Occur</Text>
        <View style={styles.timingCard}>
          {LOOP_PATTERN_TIMES.map((t, i) => (
            <View key={i} style={styles.timingRow}>
              <View style={styles.timingDot} />
              <View>
                <Text style={styles.timingTime}>{t.time}</Text>
                <Text style={styles.timingLabel}>{t.label}</Text>
              </View>
            </View>
          ))}
          <View style={styles.timelineBar}>
            <View style={[styles.timelineFill, { width: '30%', backgroundColor: '#F59E0B' }]} />
            <View style={[styles.timelineFill, { width: '45%', backgroundColor: '#EF4444' }]} />
            <View style={[styles.timelineFill, { width: '25%', backgroundColor: '#6366F1' }]} />
          </View>
          <View style={styles.timeLegend}>
            <Text style={styles.timeLegendText}>Morning</Text>
            <Text style={styles.timeLegendText}>Afternoon</Text>
            <Text style={styles.timeLegendText}>Night</Text>
          </View>
        </View>

        {/* Weekly Pattern */}
        <Text style={styles.sectionTitle}>Weekly Loop Frequency</Text>
        <View style={styles.weekCard}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const counts = [2, 4, 1, 5, 3, 6, 4];
            return (
              <View key={i} style={styles.weekCol}>
                <View style={[styles.weekBar, { height: counts[i] * 10 }]} />
                <Text style={styles.weekDay}>{day}</Text>
              </View>
            );
          })}
        </View>

        {/* Suggestions */}
        <Text style={styles.sectionTitle}>Suggestions</Text>
        {SUGGESTIONS.map((s, i) => (
          <View key={i} style={styles.suggestionRow}>
            <LightbulbIcon color="#F59E0B" size={15} />
            <Text style={styles.suggestionText}>{s}</Text>
          </View>
        ))}

        {/* Notification CTA */}
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => setNotifVisible(true)}>
          <ZapIcon color="#FFFFFF" size={16} />
          <Text style={styles.notifBtnText}>Enable Loop Break Notifications</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Notification Modal */}
      <Modal
        visible={notifVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotifVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <ZapIcon color="#6366F1" size={28} />
            </View>
            <Text style={styles.modalTitle}>Loop Break Alert</Text>
            <Text style={styles.modalBody}>
              You've been in a distraction loop for 15 minutes.
              {'\n\n'}Instagram → WhatsApp → YouTube
              {'\n\n'}Take a 5-minute break or start Focus Mode now.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setNotifVisible(false)}>
              <Text style={styles.modalBtnText}>Start Focus Mode</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setNotifVisible(false)}>
              <Text style={styles.modalDismiss}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A14' },
  scroll: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 30 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#1B1B3A',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  subtitle: { color: '#F59E0B', fontSize: 13, fontWeight: '600' },

  // Loop Card
  loopCard: {
    backgroundColor: '#13132A', borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: '#2A2A4A', marginBottom: 20,
  },
  loopCardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  loopCardSub: { color: '#888899', fontSize: 12, marginBottom: 20 },
  loopChain: { alignItems: 'center', gap: 0, marginBottom: 20 },
  loopStepCol: { alignItems: 'center' },
  loopStep: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10,
    alignItems: 'center', minWidth: 160,
  },
  loopStepText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  loopTime: { color: '#888899', fontSize: 11, marginTop: 2 },
  arrowDown: { marginVertical: 6 },

  loopStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  loopStatItem: { alignItems: 'center' },
  loopStatVal: { color: '#F59E0B', fontSize: 20, fontWeight: '800' },
  loopStatLabel: { color: '#666677', fontSize: 11, marginTop: 2 },

  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },

  // Timing
  timingCard: {
    backgroundColor: '#13132A', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#2A2A4A', marginBottom: 20, gap: 12,
  },
  timingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' },
  timingTime: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  timingLabel: { color: '#888899', fontSize: 11 },
  timelineBar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  timelineFill: { height: 6 },
  timeLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  timeLegendText: { color: '#555566', fontSize: 10 },

  // Week
  weekCard: {
    backgroundColor: '#13132A', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#2A2A4A', marginBottom: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  weekCol: { alignItems: 'center', gap: 6 },
  weekBar: { width: 24, backgroundColor: '#F59E0B', borderRadius: 6, opacity: 0.8 },
  weekDay: { color: '#666677', fontSize: 11 },

  // Suggestions
  suggestionRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#1A1A14', borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#F59E0B22',
  },
  suggestionText: { color: '#CCCCAA', fontSize: 13, flex: 1, lineHeight: 18 },

  // Notif Button
  notifBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#6366F1', borderRadius: 14, padding: 16, marginTop: 16,
  },
  notifBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: '#13132A', borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: '#2A2A4A', alignItems: 'center', width: '100%',
  },
  modalIcon: {
    width: 60, height: 60, borderRadius: 18, backgroundColor: '#1B1B3A',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  modalBody: { color: '#AAAACC', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalBtn: {
    backgroundColor: '#6366F1', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14,
    width: '100%', alignItems: 'center', marginBottom: 12,
  },
  modalBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  modalDismiss: { color: '#666677', fontSize: 13, fontWeight: '500' },
});
