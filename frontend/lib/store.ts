// Mock data store for the Focus app

export type AppUsage = {
  name: string;
  icon: string;
  category: 'Social' | 'Entertainment' | 'Education' | 'Productivity' | 'Other';
  todayMinutes: number;
  weekMinutes: number;
  color: string;
};

export type DistractionLoop = {
  from: string;
  to: string;
  minutes: number;
};

export type FocusSession = {
  date: string;
  durationMinutes: number;
  completed: boolean;
};

export const APP_USAGE_DATA: AppUsage[] = [
  { name: 'Instagram', icon: '📸', category: 'Social', todayMinutes: 65, weekMinutes: 310, color: '#E1306C' },
  { name: 'YouTube', icon: '▶️', category: 'Entertainment', todayMinutes: 82, weekMinutes: 420, color: '#FF0000' },
  { name: 'WhatsApp', icon: '💬', category: 'Social', todayMinutes: 38, weekMinutes: 195, color: '#25D366' },
  { name: 'Twitter/X', icon: '🐦', category: 'Social', todayMinutes: 42, weekMinutes: 220, color: '#1DA1F2' },
  { name: 'TikTok', icon: '🎵', category: 'Entertainment', todayMinutes: 55, weekMinutes: 280, color: '#010101' },
  { name: 'Notion', icon: '📓', category: 'Productivity', todayMinutes: 28, weekMinutes: 140, color: '#000000' },
  { name: 'Khan Academy', icon: '🎓', category: 'Education', todayMinutes: 20, weekMinutes: 105, color: '#14BF96' },
];

export const CATEGORY_DATA = {
  today: [
    { label: 'Social', minutes: 145, percentage: 45, color: '#6366F1' },
    { label: 'Entertainment', minutes: 82, percentage: 25, color: '#F59E0B' },
    { label: 'Education', minutes: 20, percentage: 6, color: '#10B981' },
    { label: 'Productivity', minutes: 28, percentage: 9, color: '#3B82F6' },
    { label: 'Other', minutes: 50, percentage: 15, color: '#8B5CF6' },
  ],
  week: [
    { label: 'Social', minutes: 725, percentage: 42, color: '#6366F1' },
    { label: 'Entertainment', minutes: 700, percentage: 40, color: '#F59E0B' },
    { label: 'Education', minutes: 105, percentage: 6, color: '#10B981' },
    { label: 'Productivity', minutes: 140, percentage: 8, color: '#3B82F6' },
    { label: 'Other', minutes: 70, percentage: 4, color: '#8B5CF6' },
  ],
  month: [
    { label: 'Social', minutes: 2900, percentage: 43, color: '#6366F1' },
    { label: 'Entertainment', minutes: 2600, percentage: 38, color: '#F59E0B' },
    { label: 'Education', minutes: 450, percentage: 7, color: '#10B981' },
    { label: 'Productivity', minutes: 550, percentage: 8, color: '#3B82F6' },
    { label: 'Other', minutes: 280, percentage: 4, color: '#8B5CF6' },
  ],
};

export const DISTRACTION_LOOPS: DistractionLoop[] = [
  { from: 'Instagram', to: 'WhatsApp', minutes: 15 },
  { from: 'WhatsApp', to: 'YouTube', minutes: 22 },
  { from: 'YouTube', to: 'Instagram', minutes: 18 },
];

export const WEEKLY_BAR_DATA = [
  { day: 'Mon', screen: 280, focus: 45 },
  { day: 'Tue', screen: 320, focus: 30 },
  { day: 'Wed', screen: 195, focus: 75 },
  { day: 'Thu', screen: 390, focus: 20 },
  { day: 'Fri', screen: 410, focus: 15 },
  { day: 'Sat', screen: 500, focus: 10 },
  { day: 'Sun', screen: 325, focus: 50 },
];

export const FOCUS_SESSIONS: FocusSession[] = [
  { date: '2026-02-18', durationMinutes: 50, completed: true },
  { date: '2026-02-17', durationMinutes: 25, completed: true },
  { date: '2026-02-16', durationMinutes: 50, completed: false },
  { date: '2026-02-15', durationMinutes: 25, completed: true },
];

export const DISTRACTION_TRIGGERS = [
  { trigger: 'Post-lunch drowsiness (2–3 PM)', frequency: 'Daily', severity: 'high' },
  { trigger: 'Morning notification check', frequency: 'Daily', severity: 'medium' },
  { trigger: 'Study break overshoot', frequency: '4x/week', severity: 'high' },
  { trigger: 'Late night scroll', frequency: '3x/week', severity: 'medium' },
];

export const FOCUS_SCORE = 78;
export const TOTAL_SCREEN_TIME = '5h 25m';
export const UNLOCK_COUNT = 47;
export const MOST_USED_APP = 'YouTube';
export const LONGEST_SESSION = '1h 22m';
