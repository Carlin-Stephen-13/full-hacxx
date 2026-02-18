import { useRouter } from 'expo-router';
import {
  BarChart2Icon,
  BrainIcon,
  ChevronRightIcon,
  LayersIcon,
  PieChartIcon,
  ZapIcon,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import {
  APP_USAGE_DATA,
  WEEKLY_BAR_DATA,
  FOCUS_SCORE,
  TOTAL_SCREEN_TIME,
  UNLOCK_COUNT,
} from '@/lib/store';

const BAR_MAX = 500;

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const height = Math.max(4, (value / max) * 80);
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={{ width: 28, height: 80, justifyContent: 'flex-end' }}>
        <View style={{ width: 28, height, backgroundColor: color, borderRadius: 6 }} />
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'screen' | 'focus'>('screen');

  const insightCards = [
    { label: 'Focus Score', value: `${FOCUS_SCORE}%`, icon: '🎯', color: '#6366F1', bg: '#1B1B3A' },
    { label: 'Screen Time', value: TOTAL_SCREEN_TIME, icon: '📱', color: '#F59E0B', bg: '#2A1E00' },
    { label: 'Unlocks', value: String(UNLOCK_COUNT), icon: '🔓', color: '#EF4444', bg: '#2A1010' },
    { label: 'Focus Sessions', value: '3', icon: '⚡', color: '#10B981', bg: '#0D2A1A' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A14" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <View style={styles.headerBadge}>
            <BarChart2Icon color="#6366F1" size={18} />
          </View>
        </View>

        {/* Daily Stats Grid */}
        <Text style={styles.sectionTitle}>Daily Overview</Text>
        <View style={styles.statsGrid}>
          {insightCards.map((c, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: c.bg, borderColor: `${c.color}33` }]}>
              <Text style={styles.statIcon}>{c.icon}</Text>
              <Text style={[styles.statVal, { color: c.color }]}>{c.value}</Text>
              <Text style={styles.statLabel}>{c.label}</Text>
            </View>
          ))}
        </View>

        {/* Bar Chart - Screen Time vs Focus */}
        <Text style={styles.sectionTitle}>Weekly Usage</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartTabRow}>
            <TouchableOpacity
              onPress={() => setActiveTab('screen')}
              style={[styles.chartTab, activeTab === 'screen' && styles.chartTabActive]}>
              <Text style={[styles.chartTabText, activeTab === 'screen' && styles.chartTabTextActive]}>
                Screen Time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('focus')}
              style={[styles.chartTab, activeTab === 'focus' && styles.chartTabActive]}>
              <Text style={[styles.chartTabText, activeTab === 'focus' && styles.chartTabTextActive]}>
                Focus
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.barsRow}>
            {WEEKLY_BAR_DATA.map((d, i) => {
              const val = activeTab === 'screen' ? d.screen : d.focus;
              const color = activeTab === 'screen' ? '#6366F1' : '#10B981';
              return (
                <View key={i} style={styles.barCol}>
                  <MiniBar value={val} max={BAR_MAX} color={color} />
                  <Text style={styles.barLabel}>{d.day}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: activeTab === 'screen' ? '#6366F1' : '#10B981' }]} />
            <Text style={styles.legendText}>
              {activeTab === 'screen' ? 'Screen Time (min)' : 'Focus Time (min)'}
            </Text>
          </View>
        </View>

        {/* Digital Wellbeing Style Stats */}
        <Text style={styles.sectionTitle}>Wellbeing Stats</Text>
        <View style={styles.wellbeingCard}>
          {APP_USAGE_DATA.slice(0, 5).map((app, i) => (
            <View key={i} style={styles.wellbeingRow}>
              <Text style={styles.wbIcon}>{app.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.wbRowTop}>
                  <Text style={styles.wbName}>{app.name}</Text>
                  <Text style={styles.wbTime}>{app.todayMinutes}m</Text>
                </View>
                <View style={styles.wbBar}>
                  <View
                    style={[
                      styles.wbFill,
                      {
                        width: `${Math.min((app.todayMinutes / 100) * 100, 100)}%`,
                        backgroundColor: app.color,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Analysis Sub-pages */}
        <Text style={styles.sectionTitle}>Deep Analysis</Text>
        <View style={styles.deepGrid}>
          <TouchableOpacity
            style={styles.deepCard}
            onPress={() => router.push('/analytics/category')}>
            <PieChartIcon color="#6366F1" size={24} />
            <Text style={styles.deepTitle}>Category Breakdown</Text>
            <Text style={styles.deepDesc}>See which app categories consume most of your time</Text>
            <View style={styles.deepArrow}>
              <ChevronRightIcon color="#6366F1" size={16} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deepCard}
            onPress={() => router.push('/analytics/behaviour')}>
            <BrainIcon color="#F59E0B" size={24} />
            <Text style={styles.deepTitle}>Behaviour Patterns</Text>
            <Text style={styles.deepDesc}>Identify long-term distraction loops and habits</Text>
            <View style={styles.deepArrow}>
              <ChevronRightIcon color="#F59E0B" size={16} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deepCard}
            onPress={() => router.push('/analytics/distraction')}>
            <LayersIcon color="#EF4444" size={24} />
            <Text style={styles.deepTitle}>Distraction Patterns</Text>
            <Text style={styles.deepDesc}>Daily analysis of when & how you get distracted</Text>
            <View style={styles.deepArrow}>
              <ChevronRightIcon color="#EF4444" size={16} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Insights */}
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.insightBanner}>
          <ZapIcon color="#6366F1" size={16} />
          <Text style={styles.insightText}>
            High social media usage after 9PM detected. Consider enabling Focus Mode earlier in the evening.
          </Text>
        </View>
        <View style={[styles.insightBanner, { borderColor: '#F59E0B44', backgroundColor: '#2A1E00' }]}>
          <ZapIcon color="#F59E0B" size={16} />
          <Text style={[styles.insightText, { color: '#F59E0B' }]}>
            Your most productive day this week was Wednesday with 75 min of focused work.
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
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  headerBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#1B1B3A', alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: {
    color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 4,
  },

  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    width: '47%', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1,
  },
  statIcon: { fontSize: 22 },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#888899', fontSize: 11, fontWeight: '500' },

  // Chart
  chartCard: {
    backgroundColor: '#13132A', borderRadius: 18, padding: 18, marginBottom: 20,
    borderWidth: 1, borderColor: '#2A2A4A',
  },
  chartTabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chartTab: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8, backgroundColor: '#1E1E3A',
  },
  chartTabActive: { backgroundColor: '#6366F1' },
  chartTabText: { color: '#666677', fontSize: 13, fontWeight: '600' },
  chartTabTextActive: { color: '#FFFFFF' },
  barsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barCol: { alignItems: 'center', gap: 6 },
  barLabel: { color: '#666677', fontSize: 11 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#888899', fontSize: 12 },

  // Wellbeing
  wellbeingCard: {
    backgroundColor: '#13132A', borderRadius: 18, padding: 18, marginBottom: 20,
    borderWidth: 1, borderColor: '#2A2A4A', gap: 14,
  },
  wellbeingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wbIcon: { fontSize: 20 },
  wbRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  wbName: { color: '#DDDDEE', fontSize: 13, fontWeight: '600' },
  wbTime: { color: '#888899', fontSize: 13 },
  wbBar: { height: 4, backgroundColor: '#2A2A4A', borderRadius: 2 },
  wbFill: { height: 4, borderRadius: 2 },

  // Deep Analysis cards
  deepGrid: { gap: 10, marginBottom: 20 },
  deepCard: {
    backgroundColor: '#13132A', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#2A2A4A',
  },
  deepTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 10, marginBottom: 4 },
  deepDesc: { color: '#666677', fontSize: 12, lineHeight: 17 },
  deepArrow: { alignSelf: 'flex-end', marginTop: 8 },

  // Insights
  insightBanner: {
    backgroundColor: '#1B1B3A', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderWidth: 1, borderColor: '#6366F144', marginBottom: 10,
  },
  insightText: { color: '#AAAACC', fontSize: 12, flex: 1, lineHeight: 17 },
});
