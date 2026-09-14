import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { Card, useTheme } from '@/components/ui';
import { taskRepository } from '@/src/db/task-repository';
import { milestoneRepository } from '@/src/db/milestone-repository';
import { formatDate, isPast } from '@/src/lib/dates';
import type { MilestoneWithProject, TaskWithProject } from '@/src/types/project';

type Entry = { key: string; date: string; label: string; kind: 'Task' | 'Milestone'; projectId: string; projectName: string };

export default function Calendar() {
  const c = useTheme();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [tasks, milestones] = await Promise.all([taskRepository.listOpenWithProject(), milestoneRepository.listUpcomingWithProject()]);
    const taskEntries: Entry[] = tasks.filter((t): t is TaskWithProject & { dueDate: string } => Boolean(t.dueDate)).map((t) => ({ key: `task-${t.id}`, date: t.dueDate, label: t.title, kind: 'Task', projectId: t.projectId, projectName: t.projectName }));
    const milestoneEntries: Entry[] = milestones.filter((m): m is MilestoneWithProject & { targetDate: string } => Boolean(m.targetDate)).map((m) => ({ key: `milestone-${m.id}`, date: m.targetDate, label: m.name, kind: 'Milestone', projectId: m.projectId, projectName: m.projectName }));
    setEntries([...taskEntries, ...milestoneEntries].sort((a, b) => a.date.localeCompare(b.date)));
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 12, backgroundColor: c.background, flexGrow: 1 }}>
    {loading ? <ActivityIndicator color={c.primary} /> : null}
    {!loading && !entries.length ? <Card><Text selectable style={{ color: c.text, fontWeight: '800', fontSize: 18 }}>Your calendar is clear</Text><Text selectable style={{ color: c.muted }}>Task due dates and milestones will appear here and remain available offline.</Text></Card> : null}
    {entries.map((entry) => <Link key={entry.key} href={{ pathname: '/projects/[id]', params: { id: entry.projectId } }} asChild><Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text selectable style={{ color: entry.date && isPast(entry.date) ? c.danger : c.text, fontWeight: '700' }}>{formatDate(entry.date)}</Text>
        <Text selectable style={{ color: c.muted, fontSize: 12 }}>{entry.kind}{isPast(entry.date) ? ' · Overdue' : ''}</Text>
      </View>
      <Text selectable style={{ color: c.text }}>{entry.label}</Text>
      <Text selectable style={{ color: c.muted, fontSize: 12 }}>{entry.projectName}</Text>
    </Card></Link>)}
  </ScrollView>;
}
