import { useRouter } from 'expo-router';
import {
  AlertTriangleIcon,
  BrainIcon,
  ChevronRightIcon,
  ClockIcon,
  SmartphoneIcon,
  TrendingUpIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
  Modal,
  Animated,
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
  const [popupVisible, setPopupVisible] = useState(false);
  const [autoPopupShown, setAutoPopupShown] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  // Auto-show popup after 2 seconds
  useEffect(() => {
    if (!autoPopupShown) {
      const timer = setTimeout(() => {
        setAutoPopupShown(true);
        openPopup();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const openPopup = () => {
    setPopupVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closePopup = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setPopupVisible(false));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A14" />

      {/* Distraction Loop Popup Modal */}
      <Modal
        visible={popupVisible}
        transparent
        animationType="none"
        onRequestClose={closePopup}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closePopup}>
          <Animated.View
            style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              {/* Handle */}
              <View style={styles.modalHandle} />

              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalIconBadge}>
                  <AlertTriangleIcon color="#F59E0B" size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Distraction Loop Detected</Text>
                  <Text style={styles.modalSubtitle}>Just now · 3 apps involved</Text>
                </View>
                <TouchableOpacity onPress={closePopup} style={styles.modalClose}>
                  <XIcon color="#555566" size={18} />
                </TouchableOpacity>
              </View>

              {/* Loop Chain */}
              <View style={styles.chainRow}>
                {['📸 Instagram', '💬 WhatsApp', '▶️ YouTube'].map((app, i, arr) => (
                  <React.Fragment key={i}>
                    <View style={styles.chainChip}>
                      <Text style={styles.chainChipText}>{app}</Text>
                    </View>
                    {i < arr.length - 1 && (
                      <Text style={styles.chainArrow}>→</Text>
                    )}
                  </React.Fragment>
                ))}
              </View>

              {/* Stats */}
              <View style={styles.modalStatsRow}>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatVal}>3×</Text>
                  <Text style={styles.modalStatLabel}>Today</Text>
                </View>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatVal}>47m</Text>
                  <Text style={styles.modalStatLabel}>Time Lost</Text>
                </View>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatVal}>2:30 PM</Text>
                  <Text style={styles.modalStatLabel}>Last Loop</Text>
                </View>
              </View>

              {/* Suggestion */}
              <View style={styles.modalSuggestion}>
                <BrainIcon color="#6366F1" size={14} />
                <Text style={styles.modalSuggestionText}>
                  This loop usually starts after checking Instagram. Try enabling Focus Mode to break the cycle.
                </Text>
              </View>

              {/* Actions */}
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => { closePopup(); router.push('/(tabs)/focus'); }}>
                <ZapIcon color="#FFF" size={16} />
                <Text style={styles.modalBtnText}>Enable Focus Mode Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={() => { closePopup(); router.push('/analytics/distraction'); }}>
                <Text style={styles.modalBtnSecondaryText}>View Distraction Analysis</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

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
          <TouchableOpacity style={styles.notifBanner} onPress={openPopup}>
            <AlertTriangleIcon color="#F59E0B" size={16} />
            <Text style={styles.notifText}>
              Distraction loop detected: Instagram → WhatsApp → YouTube
            </Text>
            <ChevronRightIcon color="#F59E0B" size={14} />
          </TouchableOpacity>

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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#13132A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: '#2A2A4A',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#3A3A5A', alignSelf: 'center', marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20,
  },
  modalIconBadge: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: '#2A1E00', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#F59E0B44',
  },
  modalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  modalSubtitle: { color: '#888899', fontSize: 12, marginTop: 2 },
  modalClose: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#1E1E3A', alignItems: 'center', justifyContent: 'center',
  },
  chainRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap',
  },
  chainChip: {
    backgroundColor: '#1E1E3A', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: '#F59E0B44',
  },
  chainChipText: { color: '#F59E0B', fontSize: 12, fontWeight: '700' },
  chainArrow: { color: '#555566', fontSize: 16, fontWeight: '700' },
  modalStatsRow: {
    flexDirection: 'row', gap: 10, marginBottom: 18,
  },
  modalStat: {
    flex: 1, backgroundColor: '#1B1B3A', borderRadius: 12, padding: 14,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#2A2A4A',
  },
  modalStatVal: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  modalStatLabel: { color: '#888899', fontSize: 11 },
  modalSuggestion: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#1B1B3A', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#6366F133', marginBottom: 20,
  },
  modalSuggestionText: { color: '#AAAACC', fontSize: 12, flex: 1, lineHeight: 18 },
  modalBtn: {
    backgroundColor: '#6366F1', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 10,
  },
  modalBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  modalBtnSecondary: {
    backgroundColor: '#1E1E3A', borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#2A2A4A',
  },
  modalBtnSecondaryText: { color: '#AAAACC', fontSize: 14, fontWeight: '600' },
});
