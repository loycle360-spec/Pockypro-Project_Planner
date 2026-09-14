import { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import { Button, Field, useTheme } from '@/components/ui';
import { validateProject } from '@/src/lib/validation';
import { useProjectStore } from '@/src/stores/project-store';
import type { ProjectDraft } from '@/src/types/project';

const initial: ProjectDraft = { name: '', description: '', purpose: '', problem: '', objectives: '', successCriteria: '', sponsor: '', projectManager: '', startDate: null, targetDate: null, methodology: 'Hybrid', status: 'Planning', priority: 'Medium' };

export default function NewProject() {
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const create = useProjectStore((s) => s.create);
  const c = useTheme();
  const set = (key: keyof ProjectDraft) => (value: string) => setDraft((old) => ({ ...old, [key]: value }));

  const save = async () => {
    const error = validateProject(draft);
    if (error) return Alert.alert('Check your project', error);
    setSaving(true);
    try { const project = await create(draft); router.replace({ pathname: '/projects/[id]', params: { id: project.id } }); }
    catch (err) { Alert.alert('Unable to save', err instanceof Error ? err.message : 'Unable to save this project.'); }
    finally { setSaving(false); }
  };

  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 16, backgroundColor: c.background }}>
    <Text selectable style={{ color: c.muted }}>Start with the essentials. You can enrich the project brief later.</Text>
    <Field label="Project name" value={draft.name} onChangeText={set('name')} />
    <Field label="Description" value={draft.description} onChangeText={set('description')} multiline />
    <Field label="Purpose" value={draft.purpose} onChangeText={set('purpose')} multiline />
    <Field label="Objectives" value={draft.objectives} onChangeText={set('objectives')} multiline />
    <Field label="Sponsor" value={draft.sponsor} onChangeText={set('sponsor')} />
    <Field label="Project manager" value={draft.projectManager} onChangeText={set('projectManager')} />
    <Button title={saving ? 'Saving…' : 'Create Project'} disabled={saving} onPress={() => void save()} />
  </ScrollView>;
}
