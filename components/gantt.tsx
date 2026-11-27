import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/components/ui';
import { buildTimescale, computeScale, offsetOf, type GanttRow } from '@/src/lib/gantt';
import { formatDate } from '@/src/lib/dates';

const ROW = 28;
const TIER = 20;
const LEFT = 176;

// MS Project style Gantt: outline table on the left, bar chart with two-tier timescale on the right.
// Summary rows are black bars with end caps, tasks are blue (red when critical), milestones are diamonds.
export function Gantt({ rows, today }: { rows: GanttRow[]; today: string }) {
  const c = useTheme();
  const scale = computeScale(rows, today);
  const dayWidth = Math.max(6, Math.min(16, Math.floor(1400 / scale.totalDays)));
  const { months, ticks } = buildTimescale(scale);
  const width = scale.totalDays * dayWidth;
  const todayX = offsetOf(today, scale) * dayWidth + dayWidth / 2;
  const bodyHeight = rows.length * ROW;

  const bar = (row: GanttRow) => {
    if (!row.start || !row.end) return null;
    const left = offsetOf(row.start, scale) * dayWidth;
    const span = Math.max(1, offsetOf(row.end, scale) - offsetOf(row.start, scale) + 1) * dayWidth;
    if (row.kind === 'milestone') return <View style={{ position: 'absolute', left: left + dayWidth / 2 - 7, top: (ROW - 14) / 2, width: 14, height: 14, transform: [{ rotate: '45deg' }], backgroundColor: row.critical ? c.criticalBar : c.summaryBar }} />;
    if (row.kind === 'summary') return <>
      <View style={{ position: 'absolute', left, top: ROW / 2 - 4, width: span, height: 8, backgroundColor: c.summaryBar }} />
      <View style={{ position: 'absolute', left, top: ROW / 2 - 4, width: 3, height: 14, backgroundColor: c.summaryBar }} />
      <View style={{ position: 'absolute', left: left + span - 3, top: ROW / 2 - 4, width: 3, height: 14, backgroundColor: c.summaryBar }} />
    </>;
    return <View style={{ position: 'absolute', left, top: (ROW - 14) / 2, width: span, height: 14, backgroundColor: row.critical ? c.criticalBar : c.taskBar }} />;
  };

  return <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: c.border, backgroundColor: c.surface }}>
    <View style={{ width: LEFT, borderRightWidth: 1, borderRightColor: c.border }}>
      <View style={{ height: TIER * 2, flexDirection: 'row', backgroundColor: c.header, borderBottomWidth: 1, borderBottomColor: c.border, alignItems: 'center' }}>
        <Text style={{ width: 36, paddingLeft: 6, fontWeight: '700', fontSize: 11, color: c.text }}>ID</Text>
        <Text style={{ flex: 1, fontWeight: '700', fontSize: 11, color: c.text }}>Task Name</Text>
      </View>
      {rows.map((row) => <Pressable key={row.key} accessibilityRole="button" accessibilityLabel={`${row.name}${row.end ? `, ${formatDate(row.end)}` : ''}`} onPress={() => router.push({ pathname: '/projects/[id]', params: { id: row.projectId } })} style={{ height: ROW, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.grid }}>
        <Text style={{ width: 36, paddingLeft: 6, fontSize: 11, color: c.muted }}>{row.wbs}</Text>
        <Text numberOfLines={1} style={{ flex: 1, paddingLeft: row.kind === 'summary' ? 0 : 10, paddingRight: 4, fontSize: 12, fontWeight: row.kind === 'summary' ? '700' : '400', color: row.critical ? c.criticalBar : c.text }}>{row.name}</Text>
      </Pressable>)}
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ width }}>
      <View style={{ width }}>
        <View style={{ height: TIER, flexDirection: 'row', backgroundColor: c.header }}>
          {months.map((m) => <View key={m.label} style={{ width: m.days * dayWidth, justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: c.border, borderBottomWidth: 1, borderBottomColor: c.border }}><Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '700', color: c.text, paddingLeft: 4 }}>{m.label}</Text></View>)}
        </View>
        <View style={{ height: TIER, backgroundColor: c.header, borderBottomWidth: 1, borderBottomColor: c.border }}>
          {ticks.map((t) => <Text key={t.offset} style={{ position: 'absolute', left: t.offset * dayWidth + 2, top: 3, fontSize: 10, color: c.muted }}>{t.label}</Text>)}
        </View>
        <View style={{ height: bodyHeight }}>
          {ticks.map((t) => <View key={t.offset} style={{ position: 'absolute', left: t.offset * dayWidth, top: 0, bottom: 0, width: 1, backgroundColor: c.grid }} />)}
          {rows.map((row, i) => <View key={row.key} style={{ position: 'absolute', left: 0, right: 0, top: i * ROW, height: ROW, borderBottomWidth: 1, borderBottomColor: c.grid }}>{bar(row)}</View>)}
          <View accessibilityLabel="Today" style={{ position: 'absolute', left: todayX, top: -TIER, bottom: 0, width: 2, backgroundColor: c.today }} />
        </View>
      </View>
    </ScrollView>
  </View>;
}
