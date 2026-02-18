import { useRouter } from 'expo-router';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BrainIcon,
  ChevronRightIcon,
  ClockIcon,
  SmartphoneIcon,
  TrendingUpIcon,
  ZapIcon,
} from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {
  APP_USAGE_DATA,
  FOCUS_SCORE,
  LONGEST_SESSION,
  MOST_USED_APP,
  TOTAL_SCREEN_TIME,
  UNLOCK_COUNT,
} from '@/lib/store';

export default function HomeScreen() {
  const router = useRouter();
  const topApps = APP_USAGE_DATA.slice(0, 3);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A14" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>User 👋</Text>
          </View>
          <View style={styles.headerBadge}>
            <BrainIcon color="#6366F1" size={18} />
          </View>
        </View>

        {/* Focus Score Ring */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreInner}>
            <View style={styles.scoreRingOuter}>
              <View style={styles.scoreRingInner}>
                <Text style={styles.scoreValue}>{FOCUS_SCORE}</Text>
                <Text style={styles.scoreLabel}>Focus Score</Text>
              </View>
            </View>
            <View style={styles.scoreRight}>
              <Text style={styles.scoreSub}>Today's Summary</Text>
              <View style={styles.scoreTagRow}>
                <View style={[styles.scoreTag, { backgroundColor: '#1E2A4A' }]}>
                  <TrendingUpIcon color="#6366F1" size={12} />
                  <Text style={[styles.scoreTagText, { color: '#6366F1' }]}>+5 vs yesterday</Text>
                </View>
              </View>
              <Text style={styles.scoreDesc}>
                You've been mostly focused. Reduce social media usage to improve your score.
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <SmartphoneIcon color="#F59E0B" size={18} />
            <Text style={styles.statValue}>{TOTAL_SCREEN_TIME}</Text>
            <Text style={styles.statLabel}>Screen Time</Text>
          </View>
          <View style={styles.statCard}>
            <ClockIcon color="#10B981" size={18} />
            <Text style={styles.statValue}>{LONGEST_SESSION}</Text>
            <Text style={styles.statLabel}>Longest Focus</Text>
          </View>
          <View style={styles.statCard}>
            <AlertTriangleIcon color="#EF4444" size={18} />
            <Text style={styles.statValue}>{UNLOCK_COUNT}</Text>
            <Text style={styles.statLabel}>Unlocks</Text>
          </View>
        </View>

        {/* Most Used App */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Most Used App</Text>
        </View>
        <View style={styles.mostUsedCard}>
          <Text style={styles.mostUsedIcon}>▶️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.mostUsedName}>{MOST_USED_APP}</Text>
            <Text style={styles.mostUsedTime}>1h 22m today</Text>
          </View>
          <View style={styles.mostUsedBadge}>
            <Text style={styles.mostUsedBadgeText}>Entertainment</Text>
          </View>
        </View>

        {/* Top Apps */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>App Usage Today</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/analytics')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {topApps.map((app, i) => (
          <View key={i} style={styles.appRow}>
            <Text style={styles.appIcon}>{app.icon}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.appRowTop}>
                <Text style={styles.appName}>{app.name}</Text>
                <Text style={styles.appTime}>{app.todayMinutes}m</Text>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((app.todayMinutes / 120) * 100, 100)}%`,
                      backgroundColor: app.color,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: '#1B1B3A' }]}
            onPress={() => router.push('/(tabs)/focus')}>
            <ZapIcon color="#6366F1" size={22} />
            <Text style={styles.quickBtnText}>Start Focus Mode</Text>
            <ChevronRightIcon color="#6366F1" size={16} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: '#1A2A1A' }]}
            onPress={() => router.push('/(tabs)/analytics')}>
            <TrendingUpIcon color="#10B981" size={22} />
            <Text style={styles.quickBtnText}>View Analytics</Text>
            <ChevronRightIcon color="#10B981" size={16} />
          </TouchableOpacity>
        </View>

        {/* Notification Banner */}
        <View style={styles.notifBanner}>
          <AlertTriangleIcon color="#F59E0B" size={16} />
          <Text style={styles.notifText}>
            Distraction loop detected: Instagram → WhatsApp → YouTube
          </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { color: '#888899', fontSize: 14, fontWeight: '500' },
  userName: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1B1B3A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Score Card
  scoreCard: {
    backgroundColor: '#13132A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  scoreInner: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  scoreRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B1B3A',
  },
  scoreRingInner: { alignItems: 'center' },
  scoreValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  scoreLabel: { color: '#888899', fontSize: 10, fontWeight: '600' },
  scoreRight: { flex: 1 },
  scoreSub: { color: '#888899', fontSize: 11, fontWeight: '600', marginBottom: 8 },
  scoreTagRow: { flexDirection: 'row', marginBottom: 8 },
  scoreTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreTagText: { fontSize: 11, fontWeight: '600' },
  scoreDesc: { color: '#666677', fontSize: 12, lineHeight: 17 },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#13132A',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#1E1E3A',
  },
  statValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  statLabel: { color: '#666677', fontSize: 10, fontWeight: '500', textAlign: 'center' },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  seeAll: { color: '#6366F1', fontSize: 13, fontWeight: '600' },

  // Most Used
  mostUsedCard: {
    backgroundColor: '#13132A',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E3A',
  },
  mostUsedIcon: { fontSize: 28 },
  mostUsedName: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  mostUsedTime: { color: '#888899', fontSize: 12, marginTop: 2 },
  mostUsedBadge: {
    backgroundColor: '#2A1A1A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  mostUsedBadgeText: { color: '#FF6B6B', fontSize: 11, fontWeight: '600' },

  // App Rows
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#13132A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  appIcon: { fontSize: 22 },
  appRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  appName: { color: '#DDDDEE', fontSize: 14, fontWeight: '600' },
  appTime: { color: '#888899', fontSize: 13, fontWeight: '600' },
  progressBg: { height: 4, backgroundColor: '#2A2A4A', borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },

  // Quick Actions
  quickActions: { gap: 10, marginBottom: 16 },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
  },
  quickBtnText: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

  // Notification Banner
  notifBanner: {
    backgroundColor: '#2A1E00',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#F59E0B44',
  },
  notifText: { color: '#F59E0B', fontSize: 12, flex: 1, lineHeight: 17 },
});
