import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Switch,
} from 'react-native';
import {
  UserIcon,
  BellIcon,
  ShieldIcon,
  TrendingUpIcon,
  LogOutIcon,
  ChevronRightIcon,
  StarIcon,
  TargetIcon,
} from 'lucide-react-native';
import { FOCUS_SCORE, FOCUS_SESSIONS, TOTAL_SCREEN_TIME } from '@/lib/store';

export default function ProfileScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [loopAlerts, setLoopAlerts] = React.useState(true);
  const [dailyReport, setDailyReport] = React.useState(false);

  const completedSessions = FOCUS_SESSIONS.filter((s) => s.completed).length;
  const totalFocusMins = FOCUS_SESSIONS.filter((s) => s.completed).reduce((s, sess) => s + sess.durationMinutes, 0);

  const badges = [
    { icon: '🔥', label: '7-Day Streak', earned: true },
    { icon: '⚡', label: '10 Sessions', earned: true },
    { icon: '🎯', label: 'Focus Master', earned: false },
    { icon: '🧘', label: '2hr Session', earned: false },
  ];

  const settingsRows = [
    { icon: BellIcon, label: 'Distraction Notifications', toggle: true, value: notifications, set: setNotifications, color: '#6366F1' },
    { icon: ShieldIcon, label: 'Loop Break Alerts', toggle: true, value: loopAlerts, set: setLoopAlerts, color: '#F59E0B' },
    { icon: TrendingUpIcon, label: 'Daily Focus Report', toggle: true, value: dailyReport, set: setDailyReport, color: '#10B981' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A14" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <UserIcon color="#6366F1" size={40} />
          </View>
          <Text style={styles.userName}>User</Text>
          <Text style={styles.userEmail}>user@example.com</Text>
          <View style={styles.focusScoreBadge}>
            <StarIcon color="#F59E0B" size={14} />
            <Text style={styles.focusScoreText}>Focus Score: {FOCUS_SCORE}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: '#6366F1' }]}>{completedSessions}</Text>
            <Text style={styles.statLabel}>Sessions Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: '#10B981' }]}>{totalFocusMins}m</Text>
            <Text style={styles.statLabel}>Total Focus Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: '#F59E0B' }]}>7</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Goal */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <TargetIcon color="#6366F1" size={18} />
            <Text style={styles.goalTitle}>Daily Goal</Text>
            <Text style={styles.goalPct}>60%</Text>
          </View>
          <Text style={styles.goalSub}>2h focus / day — 72 min completed today</Text>
          <View style={styles.goalBar}>
            <View style={[styles.goalFill, { width: '60%' }]} />
          </View>
        </View>

        {/* Badges */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.badgeGrid}>
          {badges.map((b, i) => (
            <View key={i} style={[styles.badge, !b.earned && styles.badgeLocked]}>
              <Text style={styles.badgeIcon}>{b.icon}</Text>
              <Text style={[styles.badgeLabel, !b.earned && styles.badgeLabelLocked]}>
                {b.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingsCard}>
          {settingsRows.map((row, i) => (
            <View
              key={i}
              style={[styles.settingRow, i < settingsRows.length - 1 && styles.settingRowBorder]}>
              <View style={[styles.settingIcon, { backgroundColor: `${row.color}22` }]}>
                <row.icon color={row.color} size={16} />
              </View>
              <Text style={styles.settingLabel}>{row.label}</Text>
              <Switch
                value={row.value}
                onValueChange={row.set}
                trackColor={{ false: '#2A2A4A', true: row.color }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>

        {/* Navigation links */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingsCard}>
          {['Privacy Policy', 'Terms of Service', 'Rate the App', 'Help & Support'].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.settingRow, i < 3 && styles.settingRowBorder]}>
              <Text style={styles.settingLabel}>{item}</Text>
              <ChevronRightIcon color="#555566" size={16} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn}>
          <LogOutIcon color="#EF4444" size={18} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A14' },
  scroll: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 30 },
  header: { marginBottom: 24 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },

  avatarSection: { alignItems: 'center', marginBottom: 24, gap: 8 },
  avatar: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#1B1B3A',
    borderWidth: 2, borderColor: '#6366F1', alignItems: 'center', justifyContent: 'center',
  },
  userName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  userEmail: { color: '#888899', fontSize: 14 },
  focusScoreBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#2A1E00', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#F59E0B44',
  },
  focusScoreText: { color: '#F59E0B', fontSize: 13, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#13132A', borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#1E1E3A',
  },
  statVal: { fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#888899', fontSize: 10, textAlign: 'center' },

  goalCard: {
    backgroundColor: '#13132A', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#2A2A4A', marginBottom: 20,
  },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  goalTitle: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  goalPct: { color: '#6366F1', fontSize: 15, fontWeight: '800' },
  goalSub: { color: '#888899', fontSize: 12, marginBottom: 10 },
  goalBar: { height: 6, backgroundColor: '#2A2A4A', borderRadius: 3 },
  goalFill: { height: 6, backgroundColor: '#6366F1', borderRadius: 3 },

  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  badge: {
    width: '47%', backgroundColor: '#13132A', borderRadius: 14, padding: 16,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#6366F133',
  },
  badgeLocked: { borderColor: '#2A2A4A', opacity: 0.5 },
  badgeIcon: { fontSize: 28 },
  badgeLabel: { color: '#CCCCFF', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  badgeLabelLocked: { color: '#555566' },

  settingsCard: {
    backgroundColor: '#13132A', borderRadius: 16,
    borderWidth: 1, borderColor: '#2A2A4A', marginBottom: 20, overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15, gap: 14,
  },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: '#1E1E3A' },
  settingIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, color: '#DDDDEE', fontSize: 14, fontWeight: '500' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#2A0A0A', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#EF444433',
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});
