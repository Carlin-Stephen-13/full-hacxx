import { useRouter } from 'expo-router';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  LayersIcon,
  LightbulbIcon,
  ZapIcon,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { DISTRACTION_TRIGGERS } from '@/lib/store';

const DISTRACTION_EVENTS = [
  {
    time: '9:12 AM',
    app: 'Instagram',
    trigger: 'Morning notification',
    duration: '18m',
    severity: 'medium',
    corrective: 'Put phone face-down',
  },
  {
    time: '2:05 PM',
    app: 'YouTube',
    trigger: 'Post-lunch boredom',
    duration: '34m',
    severity: 'high',
    corrective: 'Start Focus Mode',
  },
  {
    time: '4:30 PM',
    app: 'Twitter/X',
    trigger: 'Break overshoot',
    duration: '22m',
    severity: 'medium',
    corrective: 'Set 5-min break timer',
  },
  {
    time: '10:55 PM',
    app: 'TikTok',
    trigger: 'Late-night scroll habit',
    duration: '55m',
    severity: 'high',
    corrective: 'Block apps after 10 PM',
  },
];

const CORRECTIVE_ACTIONS = [
  { icon: '🚫', action: 'Block high-distraction apps after 10 PM', done: false },
  { icon: '⏱️', action: 'Use 25-min Pomodoro focus sessions', done: true },
  { icon: '📵', action: 'Turn off notifications 2–4 PM', done: false },
  { icon: '🚶', action: 'Walk for 5 min after each loop detected', done: false },
  { icon: '🌙', action: 'Phone off 30 min before bed', done: true },
];

export default function DistractionScreen() {
  const router = useRouter();
  const [notifVisible, setNotifVisible] = useState(false);
  const [actions, setActions] = useState(CORRECTIVE_ACTIONS);

  const toggleAction = (i: number) => {
    setActions((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, done: !a.done } : a))
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A14" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeftIcon color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>Distraction Patterns</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.subtitleRow}>
          <LayersIcon color="#EF4444" size={14} />
          <Text style={styles.subtitle}>Daily Analysis</Text>
        </View>

        {/* Summary stats */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: '#EF444433', backgroundColor: '#2A0A0A' }]}>
            <Text style={[styles.summaryVal, { color: '#EF4444' }]}>4</Text>
            <Text style={styles.summaryLabel}>Distractions{'\n'}Today</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: '#F59E0B33', backgroundColor: '#2A1E00' }]}>
            <Text style={[styles.summaryVal, { color: '#F59E0B' }]}>2h 9m</Text>
            <Text style={styles.summaryLabel}>Lost to{'\n'}Distractions</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: '#6366F133', backgroundColor: '#1B1B3A' }]}>
            <Text style={[styles.summaryVal, { color: '#6366F1' }]}>2 PM</Text>
            <Text style={styles.summaryLabel}>Peak{'\n'}Distraction</Text>
          </View>
        </View>

        {/* When distraction occurs */}
        <Text style={styles.sectionTitle}>When Distraction Occurs</Text>
        <View style={styles.hourCard}>
          <View style={styles.hourRow}>
            {[6, 8, 10, 12, 14, 16, 18, 20, 22].map((h, i) => {
              const intensities = [0.1, 0.3, 0.2, 0.5, 0.9, 0.6, 0.4, 0.7, 0.95];
              return (
                <View key={i} style={styles.hourCol}>
                  <View
                    style={[
                      styles.hourBar,
                      {
                        height: Math.max(4, intensities[i] * 60),
                        backgroundColor: intensities[i] > 0.7 ? '#EF4444' : intensities[i] > 0.4 ? '#F59E0B' : '#6366F1',
                        opacity: 0.8,
                      },
                    ]}
                  />
                  <Text style={styles.hourLabel}>{h}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.hourLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>High</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Medium</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#6366F1' }]} />
              <Text style={styles.legendText}>Low</Text>
            </View>
          </View>
        </View>

        {/* Today's distraction events */}
        <Text style={styles.sectionTitle}>Today's Distraction Log</Text>
        {DISTRACTION_EVENTS.map((e, i) => (
          <View
            key={i}
            style={[
              styles.eventCard,
              { borderLeftColor: e.severity === 'high' ? '#EF4444' : '#F59E0B' },
            ]}>
            <View style={styles.eventTop}>
              <Text style={styles.eventTime}>{e.time}</Text>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: e.severity === 'high' ? '#2A0A0A' : '#2A1E00' },
                ]}>
                <Text
                  style={[
                    styles.severityText,
                    { color: e.severity === 'high' ? '#EF4444' : '#F59E0B' },
                  ]}>
                  {e.severity.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.eventApp}>{e.app}</Text>
            <Text style={styles.eventTrigger}>Trigger: {e.trigger}</Text>
            <View style={styles.eventBottom}>
              <Text style={styles.eventDuration}>⏱ {e.duration}</Text>
              <View style={styles.correctiveRow}>
                <CheckCircleIcon color="#10B981" size={12} />
                <Text style={styles.correctiveText}>{e.corrective}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Triggers */}
        <Text style={styles.sectionTitle}>Distraction Triggers</Text>
        {DISTRACTION_TRIGGERS.map((t, i) => (
          <View key={i} style={styles.triggerRow}>
            <AlertTriangleIcon
              color={t.severity === 'high' ? '#EF4444' : '#F59E0B'}
              size={16}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.triggerText}>{t.trigger}</Text>
              <Text style={styles.triggerFreq}>Frequency: {t.frequency}</Text>
            </View>
          </View>
        ))}

        {/* Corrective Actions */}
        <Text style={styles.sectionTitle}>Corrective Actions</Text>
        {actions.map((a, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.actionRow, a.done && styles.actionDone]}
            onPress={() => toggleAction(i)}>
            <Text style={styles.actionIcon}>{a.icon}</Text>
            <Text style={[styles.actionText, a.done && styles.actionTextDone]}>{a.action}</Text>
            {a.done && <CheckCircleIcon color="#10B981" size={18} />}
          </TouchableOpacity>
        ))}

        {/* Suggestions */}
        <TouchableOpacity style={styles.suggBtn} onPress={() => setNotifVisible(true)}>
          <LightbulbIcon color="#0A0A14" size={16} />
          <Text style={styles.suggBtnText}>Get Personalized Suggestions</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Suggestion Modal */}
      <Modal
        visible={notifVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotifVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ZapIcon color="#EF4444" size={28} style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>Distraction Alert</Text>
            <Text style={styles.modalBody}>
              You're spending most of your distraction time after 2 PM. Your loop starts with YouTube (34m) and peaks at 10 PM with TikTok (55m).
            </Text>
            <View style={styles.modalSugg}>
              <Text style={styles.modalSuggTitle}>Recommended Action:</Text>
              <Text style={styles.modalSuggText}>
                Enable Focus Mode from 2–5 PM and block TikTok after 10 PM to recover ~89 minutes daily.
              </Text>
            </View>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setNotifVisible(false)}>
              <Text style={styles.modalBtnText}>Got it!</Text>
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
  subtitle: { color: '#EF4444', fontSize: 13, fontWeight: '600' },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1, borderRadius: 14, padding: 14, alignItems: 'center',
    gap: 6, borderWidth: 1,
  },
  summaryVal: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { color: '#888899', fontSize: 10, fontWeight: '500', textAlign: 'center' },

  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 4 },

  // Hour chart
  hourCard: {
    backgroundColor: '#13132A', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#2A2A4A', marginBottom: 20,
  },
  hourRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    height: 70, marginBottom: 8,
  },
  hourCol: { alignItems: 'center', gap: 4 },
  hourBar: { width: 22, borderRadius: 5 },
  hourLabel: { color: '#555566', fontSize: 10 },
  hourLegend: { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#888899', fontSize: 11 },

  // Events
  eventCard: {
    backgroundColor: '#13132A', borderRadius: 12, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#2A2A4A', borderLeftWidth: 3,
  },
  eventTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  eventTime: { color: '#888899', fontSize: 12 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  severityText: { fontSize: 10, fontWeight: '700' },
  eventApp: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  eventTrigger: { color: '#888899', fontSize: 12, marginBottom: 8 },
  eventBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventDuration: { color: '#AAAACC', fontSize: 12, fontWeight: '600' },
  correctiveRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  correctiveText: { color: '#10B981', fontSize: 11 },

  // Triggers
  triggerRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#13132A', borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#2A2A4A',
  },
  triggerText: { color: '#DDDDEE', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  triggerFreq: { color: '#666677', fontSize: 11 },

  // Actions
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#13132A', borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#2A2A4A',
  },
  actionDone: { borderColor: '#10B98133', backgroundColor: '#0D2A1A' },
  actionIcon: { fontSize: 18 },
  actionText: { flex: 1, color: '#DDDDEE', fontSize: 13, fontWeight: '500' },
  actionTextDone: { color: '#10B981', textDecorationLine: 'line-through' },

  suggBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#EF4444', borderRadius: 14, padding: 16, marginTop: 16,
  },
  suggBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#13132A', borderRadius: 28, padding: 28,
    borderWidth: 1, borderColor: '#2A2A4A', alignItems: 'center',
    marginHorizontal: 8, marginBottom: 8,
  },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  modalBody: { color: '#AAAACC', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  modalSugg: {
    backgroundColor: '#1B1B3A', borderRadius: 12, padding: 14,
    width: '100%', marginBottom: 20,
  },
  modalSuggTitle: { color: '#6366F1', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  modalSuggText: { color: '#CCCCDD', fontSize: 12, lineHeight: 18 },
  modalBtn: {
    backgroundColor: '#EF4444', borderRadius: 12,
    paddingHorizontal: 40, paddingVertical: 14, width: '100%', alignItems: 'center',
  },
  modalBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
