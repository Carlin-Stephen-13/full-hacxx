import { useRouter } from 'expo-router';
import { ArrowLeftIcon, ZapIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { CATEGORY_DATA } from '@/lib/store';

type TabKey = 'today' | 'week' | 'month';

function DonutChart({ data }: { data: typeof CATEGORY_DATA.today }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 58;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * r;

  const total = data.reduce((s, d) => s + d.minutes, 0);
  let offset = 0;

  const segments = data.map((d) => {
    const pct = d.minutes / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const rotation = offset * 360 - 90;
    offset += pct;
    return { ...d, dash, gap, rotation };
  });

  return (
    <View style={donutStyles.container}>
      <Svg width={size} height={size}>
        <G>
          {segments.map((seg, i) => (
            <Circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeLinecap="butt"
              transform={`rotate(${seg.rotation}, ${cx}, ${cy})`}
            />
          ))}
        </G>
      </Svg>
      <View style={donutStyles.label}>
        <Text style={donutStyles.totalText}>{Math.round(total / 60)}h</Text>
        <Text style={donutStyles.totalSub}>total</Text>
      </View>
    </View>
  );
}

const donutStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  label: {
    position: 'absolute', alignItems: 'center',
  },
  totalText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  totalSub: { color: '#888899', fontSize: 11 },
});

function formatTime(mins: number) {
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${mins}m`;
}

export default function CategoryScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('today');
  const data = CATEGORY_DATA[tab];
  const topCategory = [...data].sort((a, b) => b.minutes - a.minutes)[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A14" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeftIcon color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>Category Breakdown</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['today', 'week', 'month'] as TabKey[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Donut Chart */}
        <View style={styles.chartSection}>
          <DonutChart data={data} />
          <View style={styles.legend}>
            {data.map((d, i) => (
              <View key={i} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                <Text style={styles.legendLabel}>{d.label}</Text>
                <Text style={styles.legendPct}>{d.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category List */}
        <Text style={styles.sectionTitle}>Breakdown</Text>
        {data.map((d, i) => (
          <View key={i} style={styles.categoryRow}>
            <View style={[styles.categoryDot, { backgroundColor: d.color }]} />
            <View style={{ flex: 1 }}>
              <View style={styles.catRowTop}>
                <Text style={styles.catName}>{d.label}</Text>
                <View style={styles.catRight}>
                  <Text style={styles.catTime}>{formatTime(d.minutes)}</Text>
                  <Text style={[styles.catPct, { color: d.color }]}>{d.percentage}%</Text>
                </View>
              </View>
              <View style={styles.catBar}>
                <View style={[styles.catFill, { width: `${d.percentage}%`, backgroundColor: d.color }]} />
              </View>
            </View>
          </View>
        ))}

        {/* Most Time Spent Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Most Time Spent:</Text>
          <View style={[styles.badgePill, { backgroundColor: `${topCategory.color}22` }]}>
            <Text style={[styles.badgePillText, { color: topCategory.color }]}>
              {topCategory.label}
            </Text>
          </View>
        </View>

        {/* Insight */}
        <View style={styles.insightBanner}>
          <ZapIcon color="#6366F1" size={15} />
          <Text style={styles.insightText}>
            "{topCategory.percentage}% of your {tab} usage is {topCategory.label} — try replacing 30 minutes with a focused work session."
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
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#1B1B3A',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },

  tabRow: {
    flexDirection: 'row', gap: 8, marginBottom: 28,
    backgroundColor: '#13132A', borderRadius: 12, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#6366F1' },
  tabText: { color: '#666677', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#FFFFFF' },

  chartSection: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 28, gap: 16,
  },
  legend: { flex: 1, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, color: '#CCCCDD', fontSize: 13, fontWeight: '500' },
  legendPct: { color: '#888899', fontSize: 13, fontWeight: '600' },

  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },

  categoryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#13132A', borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#1E1E3A',
  },
  categoryDot: { width: 12, height: 12, borderRadius: 6 },
  catRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catName: { color: '#DDDDEE', fontSize: 14, fontWeight: '600' },
  catRight: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  catTime: { color: '#888899', fontSize: 13 },
  catPct: { fontSize: 13, fontWeight: '700' },
  catBar: { height: 4, backgroundColor: '#2A2A4A', borderRadius: 2 },
  catFill: { height: 4, borderRadius: 2 },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginVertical: 16,
  },
  badgeLabel: { color: '#888899', fontSize: 13 },
  badgePill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  badgePillText: { fontSize: 13, fontWeight: '700' },

  insightBanner: {
    backgroundColor: '#1B1B3A', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderWidth: 1, borderColor: '#6366F133',
  },
  insightText: { color: '#AAAACC', fontSize: 12, flex: 1, lineHeight: 18 },
});
