import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { Circle } from 'lucide-react-native';
import { Card, Field, Segmented, TableHeader, useTheme } from '@/components/ui';
import { taskRepository } from '@/src/db/task-repository';
import { projectRepository } from '@/src/db/project-repository';
import { formatDate, isPast } from '@/src/lib/dates';
import type { TaskWithProject } from '@/src/types/project';

const filters = ['All', 'Overdue'] as const;

export default function Tasks() {
  const c = useTheme();
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');

  const load = useCallback(async () => { setLoading(true); setTasks(await taskRepository.listOpenWithProject()); setLoading(false); }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const complete = async (task: TaskWithProject) => { await taskRepository.setStatus(task.id, 'Done'); await projectRepository.recalculateHealth(task.projectId); void load(); };

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return tasks.filter((task) => (!term || task.title.toLowerCase().includes(term) || task.projectName.toLowerCase().includes(term)) && (filter === 'All' || Boolean(task.dueDate && isPast(task.dueDate))));
  }, [tasks, query, filter]);

  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 12, backgroundColor: c.background, flexGrow: 1 }}>
    {loading ? <ActivityIndicator color={c.primary} /> : null}
    {!loading && tasks.length ? <View style={{ gap: 10 }}><Field label="Search" value={query} onChangeText={setQuery} placeholder="Search tasks or projects" /><Segmented label="Show" options={filters} value={filter} onChange={setFilter} /></View> : null}
    {!loading && !tasks.length ? <Card><Text selectable style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>No tasks yet</Text><Text selectable style={{ color: c.muted }}>Create a project first, then add work items from its Plan area.</Text></Card> : null}
    {!loading && tasks.length && !visible.length ? <Card><Text selectable style={{ color: c.muted }}>No tasks match your search.</Text></Card> : null}
    {visible.length ? <View>
      <TableHeader columns={[{ label: 'ID', width: 36 }, { label: 'Task Name', flex: 1 }, { label: 'Due', width: 92 }]} />
      {visible.map((task, i) => { const late = Boolean(task.dueDate && isPast(task.dueDate)); return <View key={task.id} style={{ flexDirection: 'row', alignItems: 'stretch', backgroundColor: c.surface, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: c.border }}>
        <Text style={{ width: 36, padding: 8, fontSize: 12, color: c.muted }}>{i + 1}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Mark ${task.title} as done`} onPress={() => void complete(task)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderLeftWidth: 1, borderLeftColor: c.grid }}>
          {late ? <Circle color={c.danger} size={16} /> : <Circle color={c.muted} size={16} />}
          <View style={{ flex: 1 }}>
            <Text selectable style={{ color: late ? c.danger : c.text, fontSize: 13, fontWeight: '600' }}>{task.title}</Text>
            <Link href={{ pathname: '/projects/[id]', params: { id: task.projectId } }}><Text selectable style={{ color: c.primary, fontSize: 11 }}>{task.projectName}</Text></Link>
          </View>
        </Pressable>
        <Text style={{ width: 92, padding: 8, fontSize: 12, color: late ? c.danger : c.text, borderLeftWidth: 1, borderLeftColor: c.grid }}>{task.dueDate ? formatDate(task.dueDate) : '—'}</Text>
      </View>; })}
    </View> : null}
  </ScrollView>;
}
