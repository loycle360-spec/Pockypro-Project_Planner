import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { Card, HealthBadge, useTheme } from '@/components/ui';
import { useProjectStore } from '@/src/stores/project-store';
import { formatDate } from '@/src/lib/dates';

export default function Projects() {
  const { projects, load, loading, error } = useProjectStore();
  const [search, setSearch] = useState('');
  const c = useTheme();
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects.filter((project) => project.name.toLowerCase().includes(term) || project.description.toLowerCase().includes(term));
  }, [projects, search]);

  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 12, backgroundColor: c.background, flexGrow: 1 }}>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', borderWidth: 1, borderColor: c.border, borderRadius: 2, paddingHorizontal: 12, backgroundColor: c.surface }}>
      <Search color={c.muted} size={18} />
      <TextInput accessibilityLabel="Search projects" value={search} onChangeText={setSearch} placeholder="Search projects" placeholderTextColor={c.muted} style={{ flex: 1, paddingVertical: 12, color: c.text }} />
    </View>
    <Link href="/projects/new" asChild><Pressable accessibilityRole="button" accessibilityLabel="Create project" style={{ backgroundColor: c.primary, minHeight: 48, borderRadius: 2, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 }}><Plus color="#fff" size={20} /><Text style={{ color: '#fff', fontWeight: '800' }}>Create Project</Text></Pressable></Link>
    {loading ? <ActivityIndicator color={c.primary} /> : null}
    {error ? <Text selectable style={{ color: c.danger }}>{error}</Text> : null}
    {!loading && !error && !visible.length ? <Card>
      <Text selectable style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{search.trim() ? 'No matching projects' : 'No projects yet'}</Text>
      <Text selectable style={{ color: c.muted }}>{search.trim() ? 'Try a different search term.' : 'Create your first project and start planning.'}</Text>
    </Card> : null}
    {visible.map((project) => <Link href={{ pathname: '/projects/[id]', params: { id: project.id } }} asChild key={project.id}>
      <Pressable accessibilityRole="link"><Card><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}><Text selectable style={{ color: c.text, fontSize: 17, fontWeight: '800', flex: 1 }}>{project.name}</Text><HealthBadge health={project.health} /></View><Text selectable numberOfLines={2} style={{ color: c.muted }}>{project.description || 'No description added yet.'}</Text><Text selectable style={{ color: c.muted, fontSize: 13 }}>{project.status} · Target {formatDate(project.targetDate)}</Text></Card></Pressable>
    </Link>)}
  </ScrollView>;
}
