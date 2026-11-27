import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { Gantt } from '@/components/gantt';
import { Card, TableHeader, useTheme } from '@/components/ui';
import { projectRepository } from '@/src/db/project-repository';
import { taskRepository } from '@/src/db/task-repository';
import { milestoneRepository } from '@/src/db/milestone-repository';
import { todayKey, formatDate, isPast } from '@/src/lib/dates';
import { buildGanttRows } from '@/src/lib/gantt';
import type { Milestone, Project, Task } from '@/src/types/project';

export default function Calendar() {
  const c = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, t, m] = await Promise.all([projectRepository.list(), taskRepository.listOpenWithProject(), milestoneRepository.listUpcomingWithProject()]);
    setProjects(p); setTasks(t); setMilestones(m); setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const today = todayKey();
  const rows = useMemo(() => buildGanttRows(projects, tasks, milestones, today), [projects, tasks, milestones, today]);
  const dated = rows.filter((r) => r.kind !== 'summary');
  const hasBars = rows.some((r) => r.start);

  const Legend = ({ color, label, diamond = false }: { color: string; label: string; diamond?: boolean }) => <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: diamond ? 10 : 14, height: diamond ? 10 : 8, backgroundColor: color, transform: diamond ? [{ rotate: '45deg' }] : undefined }} /><Text style={{ color: c.muted, fontSize: 11 }}>{label}</Text></View>;

  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 12, gap: 12, backgroundColor: c.background, flexGrow: 1 }}>
    {loading ? <ActivityIndicator color={c.primary} /> : null}
    {!loading && !hasBars ? <Card><Text selectable style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>Your schedule is clear</Text><Text selectable style={{ color: c.muted }}>Project dates, task due dates and milestones appear here as a Gantt chart and remain available offline.</Text></Card> : null}
    {!loading && hasBars ? <>
      <Gantt rows={rows} today={today} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        <Legend color={c.summaryBar} label="Project" /><Legend color={c.taskBar} label="Task" /><Legend color={c.criticalBar} label="Overdue" /><Legend color={c.summaryBar} label="Milestone" diamond /><Legend color={c.today} label="Today" />
      </View>
      {dated.length ? <View>
        <TableHeader columns={[{ label: 'Due', width: 96 }, { label: 'Name', flex: 1 }, { label: 'Type', width: 80 }]} />
        {dated.map((row) => <Link key={row.key} href={{ pathname: '/projects/[id]', params: { id: row.projectId } }} asChild><Pressable accessibilityRole="link" style={{ flexDirection: 'row', backgroundColor: c.surface, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: c.border }}>
          <Text style={{ width: 96, padding: 8, fontSize: 12, color: isPast(row.end) ? c.danger : c.text }}>{formatDate(row.end)}</Text>
          <Text style={{ flex: 1, padding: 8, fontSize: 12, color: c.text, borderLeftWidth: 1, borderLeftColor: c.grid }}>{row.name}</Text>
          <Text style={{ width: 80, padding: 8, fontSize: 12, color: c.muted, borderLeftWidth: 1, borderLeftColor: c.grid }}>{row.kind === 'milestone' ? 'Milestone' : 'Task'}{row.critical ? ' ⚑' : ''}</Text>
        </Pressable></Link>)}
      </View> : null}
    </> : null}
  </ScrollView>;
}
