import { ReactNode, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import { ArrowRight, CircleAlert, Clock3 } from 'lucide-react-native';
import { Button, Card, HealthBadge, useTheme } from '@/components/ui';
import { useProjectStore } from '@/src/stores/project-store';
import { taskRepository } from '@/src/db/task-repository';
import { formatDate, isPast, todayKey } from '@/src/lib/dates';
import type { TaskWithProject } from '@/src/types/project';

function Metric({ label, value, tone, icon }: { label: string; value: number; tone: string; icon: ReactNode }) {
  const c = useTheme();
  return <Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>{icon}<Text style={{ color: c.muted, fontSize: 12, fontWeight: '700' }}>{label.toUpperCase()}</Text></View><Text selectable style={{ color: tone, fontSize: 30, fontWeight: '800' }}>{value}</Text></Card>;
}

export default function Home() {
  const { projects, load } = useProjectStore();
  const c = useTheme();
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const refresh = useCallback(async () => {
    setLoadingTasks(true);
    await Promise.all([load(), taskRepository.listOpenWithProject().then(setTasks)]);
    setLoadingTasks(false);
  }, [load]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const active = projects.filter((p) => p.status !== 'Completed' && p.status !== 'Cancelled');
  const overdue = useMemo(() => tasks.filter((task) => task.dueDate && isPast(task.dueDate)), [tasks]);
  const dueToday = useMemo(() => tasks.filter((task) => task.dueDate === todayKey()), [tasks]);
  const attention = [...overdue, ...tasks.filter((task) => !overdue.includes(task) && task.dueDate)].slice(0, 4);
  const quickAdd = (kind: 'task' | 'risk') => { if (active[0]) router.push({ pathname: '/projects/[id]', params: { id: active[0].id, open: kind } }); else router.push('/projects/new'); };

  return <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator contentContainerStyle={{ padding: 16, gap: 16, backgroundColor: c.background, flexGrow: 1 }}>
    <View style={{ gap: 4 }}><Text selectable style={{ color: c.muted, fontSize: 15 }}>Good planning starts here</Text><Text selectable style={{ color: c.text, fontSize: 28, fontWeight: '800' }}>Your dashboard</Text></View>

    <View style={{ flexDirection: 'row', gap: 8 }}>
      <View style={{ flex: 1 }}><Metric label="Active projects" value={active.length} tone={c.primary} icon={<View style={{ width: 8, height: 8, backgroundColor: c.primary }} />} /></View>
      <View style={{ flex: 1 }}><Metric label="Open tasks" value={tasks.length} tone={c.text} icon={<Clock3 color={c.muted} size={16} />} /></View>
    </View>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <View style={{ flex: 1 }}><Metric label="Overdue" value={overdue.length} tone={overdue.length ? c.danger : c.success} icon={<CircleAlert color={overdue.length ? c.danger : c.success} size={16} />} /></View>
      <View style={{ flex: 1 }}><Metric label="Due today" value={dueToday.length} tone={dueToday.length ? c.warning : c.success} icon={<Clock3 color={dueToday.length ? c.warning : c.success} size={16} />} /></View>
    </View>

    <View style={{ gap: 8 }}><Text selectable style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>Quick actions</Text><Button title="New Project" accessibilityLabel="Create a new project" onPress={() => router.push('/projects/new')} /><View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Button title="Add Task" variant="secondary" accessibilityLabel={active[0] ? `Add a task to ${active[0].name}` : 'Create a project to add a task'} onPress={() => quickAdd('task')} /></View><View style={{ flex: 1 }}><Button title="Add Risk" variant="secondary" accessibilityLabel={active[0] ? `Add a risk to ${active[0].name}` : 'Create a project to add a risk'} onPress={() => quickAdd('risk')} /></View></View></View>

    <View style={{ gap: 8 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text selectable style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>Needs attention</Text><Link href="/(tabs)/tasks" asChild><Pressable accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}><Text style={{ color: c.primary, fontWeight: '700' }}>View all</Text><ArrowRight color={c.primary} size={16} /></Pressable></Link></View>{loadingTasks ? <ActivityIndicator color={c.primary} /> : attention.length ? attention.map((task) => <Link key={task.id} href={{ pathname: '/projects/[id]', params: { id: task.projectId } }} asChild><Pressable><Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: c.text, fontWeight: '700' }}>{task.title}</Text><Text selectable style={{ color: c.muted, fontSize: 12 }}>{task.projectName} · Due {formatDate(task.dueDate)}</Text></View><Text style={{ color: task.dueDate && isPast(task.dueDate) ? c.danger : c.warning, fontWeight: '700', fontSize: 12 }}>{task.dueDate && isPast(task.dueDate) ? 'OVERDUE' : 'UP NEXT'}</Text></View></Card></Pressable></Link>) : <Card><Text selectable style={{ color: c.text, fontWeight: '700' }}>You’re all caught up</Text><Text selectable style={{ color: c.muted }}>No dated open tasks need attention right now.</Text></Card>}</View>

    <View style={{ gap: 8 }}><Text selectable style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>Project health</Text>{active.length ? active.slice(0, 3).map((p) => <Card key={p.id}><Text selectable style={{ color: c.text, fontWeight: '700' }}>{p.name}</Text><HealthBadge health={p.health} /></Card>) : <Card><Text selectable style={{ color: c.muted }}>Create a project to start tracking delivery health.</Text></Card>}</View>
    <Card><Text selectable style={{ color: c.text, fontWeight: '800' }}>Pocket Project Health Indicator</Text><Text selectable style={{ color: c.muted }}>An indicative planning aid based on overdue tasks, delayed milestones, unresolved critical risks and open high-priority issues.</Text></Card>
  </ScrollView>;
}
