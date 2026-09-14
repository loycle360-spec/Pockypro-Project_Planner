import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { Card, useTheme } from '@/components/ui';
import { taskRepository } from '@/src/db/task-repository';
import { projectRepository } from '@/src/db/project-repository';
import { formatDate, isPast } from '@/src/lib/dates';
import type { TaskWithProject } from '@/src/types/project';

export default function Tasks() {
  const c = useTheme();
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => { setLoading(true); setTasks(await taskRepository.listOpenWithProject()); setLoading(false); }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const complete = async (task: TaskWithProject) => { await taskRepository.setStatus(task.id, 'Done'); await projectRepository.recalculateHealth(task.projectId); void load(); };

  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 12, backgroundColor: c.background, flexGrow: 1 }}>
    {loading ? <ActivityIndicator color={c.primary} /> : null}
    {!loading && !tasks.length ? <Card><Text selectable style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>No tasks yet</Text><Text selectable style={{ color: c.muted }}>Create a project first, then add work items from its Plan area.</Text></Card> : null}
    {tasks.map((task) => <Card key={task.id}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Mark ${task.title} as done`} onPress={() => void complete(task)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Circle color={task.dueDate && isPast(task.dueDate) ? c.danger : c.muted} size={20} />
        <View style={{ flex: 1 }}>
          <Text selectable style={{ color: c.text, fontWeight: '600' }}>{task.title}</Text>
          <Link href={{ pathname: '/projects/[id]', params: { id: task.projectId } }}><Text selectable style={{ color: c.primary, fontSize: 12 }}>{task.projectName}</Text></Link>
          {task.dueDate ? <Text selectable style={{ color: task.dueDate && isPast(task.dueDate) ? c.danger : c.muted, fontSize: 12 }}>Due {formatDate(task.dueDate)}{isPast(task.dueDate) ? ' · Overdue' : ''}</Text> : null}
        </View>
        <CheckCircle2 color={c.border} size={20} />
      </Pressable>
    </Card>)}
  </ScrollView>;
}
