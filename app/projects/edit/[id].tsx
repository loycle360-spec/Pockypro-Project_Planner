import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button, Field, Segmented, useTheme } from '@/components/ui';
import { projectRepository } from '@/src/db/project-repository';
import { useProjectDetailStore } from '@/src/stores/project-detail-store';
import { validateProject } from '@/src/lib/validation';
import { methodologies, projectPriorities, projectStatuses } from '@/src/lib/options';
import type { ProjectDraft } from '@/src/types/project';

export default function EditProject() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useTheme();
  const [draft, setDraft] = useState<ProjectDraft | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (id) void projectRepository.get(id).then((project) => { if (project) setDraft({ ...project }); }); }, [id]);

  const set = (key: keyof ProjectDraft) => (value: string) => setDraft((old) => (old ? { ...old, [key]: value } : old));

  const save = async () => {
    if (!draft || !id) return;
    const error = validateProject(draft);
    if (error) return Alert.alert('Check your project', error);
    setSaving(true);
    try { await projectRepository.update(id, draft); await useProjectDetailStore.getState().load(id); router.back(); }
    catch { Alert.alert('Unable to save', 'Unable to save these changes. Your existing data has not been changed.'); }
    finally { setSaving(false); }
  };

  if (!draft) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.background }}><ActivityIndicator color={c.primary} /></View>;

  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 16, backgroundColor: c.background }}>
    <Stack.Screen options={{ title: 'Edit project' }} />
    <Field label="Project name" value={draft.name} onChangeText={set('name')} />
    <Field label="Description" value={draft.description} onChangeText={set('description')} multiline />
    <Field label="Purpose" value={draft.purpose} onChangeText={set('purpose')} multiline />
    <Field label="Objectives" value={draft.objectives} onChangeText={set('objectives')} multiline />
    <Field label="Sponsor" value={draft.sponsor} onChangeText={set('sponsor')} />
    <Field label="Project manager" value={draft.projectManager} onChangeText={set('projectManager')} />
    <Segmented label="Status" options={projectStatuses} value={draft.status} onChange={(status) => setDraft((old) => (old ? { ...old, status } : old))} />
    <Segmented label="Priority" options={projectPriorities} value={draft.priority} onChange={(priority) => setDraft((old) => (old ? { ...old, priority } : old))} />
    <Segmented label="Methodology" options={methodologies} value={draft.methodology} onChange={(methodology) => setDraft((old) => (old ? { ...old, methodology } : old))} />
    <Button title={saving ? 'Saving…' : 'Save changes'} disabled={saving} onPress={() => void save()} />
    <Text selectable style={{ color: c.muted, fontSize: 12, textAlign: 'center' }}>Changes are saved to this device only.</Text>
  </ScrollView>;
}
