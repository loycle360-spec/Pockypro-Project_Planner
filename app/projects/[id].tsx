import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react-native';
import { Button, Card, EmptyRow, Field, HealthBadge, Segmented, useTheme } from '@/components/ui';
import { projectRepository } from '@/src/db/project-repository';
import { useProjectDetailStore } from '@/src/stores/project-detail-store';
import { addDays, formatDate, normalizeDateInput, todayKey } from '@/src/lib/dates';
import { issueStatuses, milestoneStatuses, projectPriorities, riskScale, riskStatuses } from '@/src/lib/options';
import { validateIssue, validateMilestone, validateNote, validateRisk, validateStakeholder, validateTask } from '@/src/lib/validation';
import type { ProjectPriority } from '@/src/types/project';

function SectionHeader({ title, count, adding, onToggleAdd, theme }: { title: string; count: number; adding: boolean; onToggleAdd: () => void; theme: ReturnType<typeof useTheme> }) {
  return <View style={{ gap: 8 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text selectable style={{ color: theme.text, fontWeight: '800', fontSize: 16 }}>{title} ({count})</Text>
      <Button title={adding ? `Hide ${title} form` : `Add ${title}`} variant="secondary" onPress={onToggleAdd} accessibilityLabel={adding ? `Hide ${title.toLowerCase()} form` : `Add ${title.toLowerCase()}`} />
    </View>
  </View>;
}

function DeleteButton({ label, theme, onConfirm }: { label: string; theme: ReturnType<typeof useTheme>; onConfirm: () => void }) {
  const confirm = () => Alert.alert('Remove this item?', `${label} will be permanently removed from this project.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: onConfirm }]);
  return <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${label}`} onPress={confirm} style={({ pressed }) => ({ padding: 8, opacity: pressed ? .6 : 1 })}><Trash2 color={theme.danger} size={16} /></Pressable>;
}

function DateEntry({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  const c = useTheme();
  const setDate = (date: string | null) => onChangeText(date ?? '');
  return <View style={{ gap: 6 }}>
    <Field label={label} value={value} onChangeText={onChangeText} placeholder="YYYY-MM-DD, today, tomorrow, or MM/DD/YYYY" />
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ gap: 6 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Use today" onPress={() => setDate(todayKey())} style={({ pressed }) => ({ borderWidth: 1, borderColor: c.border, backgroundColor: c.header, paddingVertical: 8, paddingHorizontal: 10, opacity: pressed ? .7 : 1 })}><Text style={{ color: c.text, fontWeight: '600', fontSize: 12 }}>Today</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Use tomorrow" onPress={() => setDate(addDays(todayKey(), 1))} style={({ pressed }) => ({ borderWidth: 1, borderColor: c.border, backgroundColor: c.header, paddingVertical: 8, paddingHorizontal: 10, opacity: pressed ? .7 : 1 })}><Text style={{ color: c.text, fontWeight: '600', fontSize: 12 }}>Tomorrow</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Use one week from today" onPress={() => setDate(addDays(todayKey(), 7))} style={({ pressed }) => ({ borderWidth: 1, borderColor: c.border, backgroundColor: c.header, paddingVertical: 8, paddingHorizontal: 10, opacity: pressed ? .7 : 1 })}><Text style={{ color: c.text, fontWeight: '600', fontSize: 12 }}>+7 days</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Clear date" onPress={() => setDate(null)} style={({ pressed }) => ({ borderWidth: 1, borderColor: c.border, backgroundColor: c.header, paddingVertical: 8, paddingHorizontal: 10, opacity: pressed ? .7 : 1 })}><Text style={{ color: c.muted, fontWeight: '600', fontSize: 12 }}>Clear</Text></Pressable>
    </ScrollView>
  </View>;
}

function parseDateOrAlert(value: string, label: string): string | null | false {
  const normalized = normalizeDateInput(value);
  if (value.trim() && !normalized) { Alert.alert('Check this date', `${label} must be a valid date such as 2026-03-01, 03/01/2026, today, or tomorrow.`); return false; }
  return normalized;
}

export default function ProjectDetail() {
  const { id, open } = useLocalSearchParams<{ id: string; open?: string }>();
  const c = useTheme();
  const { project, tasks, milestones, risks, issues, stakeholders, notes, loading, error, load, addTask, setTaskStatus, removeTask, addMilestone, setMilestoneStatus, removeMilestone, addRisk, setRiskStatus, removeRisk, addIssue, setIssueStatus, removeIssue, addStakeholder, removeStakeholder, addNote, removeNote } = useProjectDetailStore();

  useEffect(() => { if (id) void load(id); }, [id, load]);
  const [addingTask, setAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState(todayKey());
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [milestoneName, setMilestoneName] = useState('');
  const [milestoneDate, setMilestoneDate] = useState(todayKey());
  const [addingRisk, setAddingRisk] = useState(false);
  const [riskText, setRiskText] = useState('');
  const [riskProbability, setRiskProbability] = useState<'1' | '2' | '3' | '4' | '5'>('3');
  const [riskImpact, setRiskImpact] = useState<'1' | '2' | '3' | '4' | '5'>('3');
  const [addingIssue, setAddingIssue] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issuePriority, setIssuePriority] = useState<ProjectPriority>('Medium');
  const [addingStakeholder, setAddingStakeholder] = useState(false);
  const [stakeholderName, setStakeholderName] = useState('');
  const [stakeholderRole, setStakeholderRole] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [noteBody, setNoteBody] = useState('');

  useEffect(() => { if (open === 'task') setAddingTask(true); else if (open === 'risk') setAddingRisk(true); }, [open]);
  const archive = () => Alert.alert('Archive project', 'Archived projects are hidden from your active list but not deleted.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Archive', style: 'destructive', onPress: () => { if (!id) return; void projectRepository.archive(id).then(() => router.replace('/(tabs)/projects')); } }]);
  if (loading && !project) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.background }}><ActivityIndicator color={c.primary} /></View>;
  if (!project) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.background, padding: 16 }}><Text selectable style={{ color: c.muted, textAlign: 'center' }}>{error ?? 'This project could not be found.'}</Text></View>;

  return <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator contentContainerStyle={{ padding: 16, gap: 12, backgroundColor: c.background }}>
    <Stack.Screen options={{ title: project.name }} />
    <Card><Text selectable style={{ color: c.text, fontSize: 24, fontWeight: '800' }}>{project.name}</Text><HealthBadge health={project.health} /><Text selectable style={{ color: c.muted }}>{project.description || 'No description has been added.'}</Text><View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Link href={{ pathname: '/projects/edit/[id]', params: { id: project.id } }} asChild><View><Button title="Edit project" variant="secondary" onPress={() => {}} /></View></Link></View><View style={{ flex: 1 }}><Button title="Archive project" variant="secondary" onPress={archive} /></View></View></Card>
    <Card><Text selectable style={{ color: c.text, fontWeight: '800' }}>Overview</Text><Text selectable style={{ color: c.muted }}>Status: {project.status}</Text><Text selectable style={{ color: c.muted }}>Priority: {project.priority}</Text><Text selectable style={{ color: c.muted }}>Methodology: {project.methodology}</Text><Text selectable style={{ color: c.muted }}>Target: {formatDate(project.targetDate)}</Text></Card>
    <Card><Text selectable style={{ color: c.text, fontWeight: '800' }}>Project brief</Text><Text selectable style={{ color: c.muted }}>Purpose: {project.purpose || 'Not yet defined'}</Text><Text selectable style={{ color: c.muted }}>Objectives: {project.objectives || 'Not yet defined'}</Text></Card>

    <Card><SectionHeader title="Tasks" count={tasks.length} adding={addingTask} onToggleAdd={() => setAddingTask((v) => !v)} theme={c} />
      {addingTask ? <View style={{ gap: 8 }}><Field label="Task title" value={taskTitle} onChangeText={setTaskTitle} placeholder="What needs doing?" /><DateEntry label="Due date" value={taskDue} onChangeText={setTaskDue} /><Button title="Add Task" onPress={() => { const dueDate = parseDateOrAlert(taskDue, 'The due date'); if (dueDate === false) return; const draft = { title: taskTitle, dueDate }; const err = validateTask(draft); if (err) return Alert.alert('Check this task', err); void addTask(draft).then(() => { setTaskTitle(''); setTaskDue(todayKey()); }); }} /></View> : null}
      {tasks.length ? tasks.map((task) => <View key={task.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 }}><Pressable accessibilityRole="button" accessibilityLabel={`Mark ${task.taskCode} ${task.title} as ${task.status === 'Done' ? 'not done' : 'done'}`} onPress={() => void setTaskStatus(task.id, task.status === 'Done' ? 'To Do' : 'Done')} style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, opacity: pressed ? .7 : 1 })}>{task.status === 'Done' ? <CheckCircle2 color={c.success} size={20} /> : <Circle color={c.muted} size={20} />}<View style={{ flex: 1, gap: 2 }}><Text selectable style={{ color: c.text, textDecorationLine: task.status === 'Done' ? 'line-through' : 'none' }}>{task.taskCode} · {task.title}</Text><Text selectable style={{ color: c.muted, fontSize: 12 }}>WBS {task.wbsId} · Due {formatDate(task.dueDate)}</Text></View></Pressable><DeleteButton label={task.title} theme={c} onConfirm={() => void removeTask(task.id)} /></View>) : <EmptyRow text="No tasks yet." />}
    </Card>

    <Card><SectionHeader title="Milestones" count={milestones.length} adding={addingMilestone} onToggleAdd={() => setAddingMilestone((v) => !v)} theme={c} />
      {addingMilestone ? <View style={{ gap: 8 }}><Field label="Milestone name" value={milestoneName} onChangeText={setMilestoneName} placeholder="e.g. Phase 1 sign-off" /><DateEntry label="Target date" value={milestoneDate} onChangeText={setMilestoneDate} /><Button title="Add Milestone" onPress={() => { const targetDate = parseDateOrAlert(milestoneDate, 'The target date'); if (targetDate === false) return; const draft = { name: milestoneName, targetDate }; const err = validateMilestone(draft); if (err) return Alert.alert('Check this milestone', err); void addMilestone(draft).then(() => { setMilestoneName(''); setMilestoneDate(todayKey()); }); }} /></View> : null}
      {milestones.length ? milestones.map((milestone) => <View key={milestone.id} style={{ gap: 4, paddingVertical: 4 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text selectable style={{ color: c.text, fontWeight: '600', flex: 1 }}>{milestone.name}</Text><Text selectable style={{ color: c.muted, fontSize: 12 }}>{formatDate(milestone.targetDate)}</Text><DeleteButton label={milestone.name} theme={c} onConfirm={() => void removeMilestone(milestone.id)} /></View><Segmented label="Status" options={milestoneStatuses} value={milestone.status} onChange={(status) => void setMilestoneStatus(milestone.id, status)} /></View>) : <EmptyRow text="No milestones yet." />}
    </Card>

    <Card><SectionHeader title="Risks" count={risks.length} adding={addingRisk} onToggleAdd={() => setAddingRisk((v) => !v)} theme={c} />
      {addingRisk ? <View style={{ gap: 8 }}><Field label="Risk" value={riskText} onChangeText={setRiskText} placeholder="What could go wrong?" multiline /><Segmented label="Probability (1–5)" options={riskScale} value={riskProbability} onChange={setRiskProbability} /><Segmented label="Impact (1–5)" options={riskScale} value={riskImpact} onChange={setRiskImpact} /><Button title="Add Risk" onPress={() => { const draft = { risk: riskText, probability: Number(riskProbability), impact: Number(riskImpact) }; const err = validateRisk(draft); if (err) return Alert.alert('Check this risk', err); void addRisk(draft).then(() => { setRiskText(''); setRiskProbability('3'); setRiskImpact('3'); }); }} /></View> : null}
      {risks.length ? risks.map((risk) => <View key={risk.id} style={{ gap: 4, paddingVertical: 4 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}><Text selectable style={{ color: c.text, fontWeight: '600', flex: 1 }}>{risk.risk}</Text><DeleteButton label={risk.risk} theme={c} onConfirm={() => void removeRisk(risk.id)} /></View><Text selectable style={{ color: c.muted, fontSize: 12 }}>Probability {risk.probability} · Impact {risk.impact}</Text><Segmented label="Status" options={riskStatuses} value={risk.status} onChange={(status) => void setRiskStatus(risk.id, status)} /></View>) : <EmptyRow text="No risks logged yet." />}
    </Card>

    <Card><SectionHeader title="Issues" count={issues.length} adding={addingIssue} onToggleAdd={() => setAddingIssue((v) => !v)} theme={c} />
      {addingIssue ? <View style={{ gap: 8 }}><Field label="Issue title" value={issueTitle} onChangeText={setIssueTitle} placeholder="What's happening now?" /><Segmented label="Priority" options={projectPriorities} value={issuePriority} onChange={setIssuePriority} /><Button title="Add Issue" onPress={() => { const draft = { title: issueTitle, priority: issuePriority }; const err = validateIssue(draft); if (err) return Alert.alert('Check this issue', err); void addIssue(draft).then(() => { setIssueTitle(''); setIssuePriority('Medium'); }); }} /></View> : null}
      {issues.length ? issues.map((issue) => <View key={issue.id} style={{ gap: 4, paddingVertical: 4 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}><Text selectable style={{ color: c.text, fontWeight: '600', flex: 1 }}>{issue.title}</Text><DeleteButton label={issue.title} theme={c} onConfirm={() => void removeIssue(issue.id)} /></View><Text selectable style={{ color: c.muted, fontSize: 12 }}>Priority: {issue.priority}</Text><Segmented label="Status" options={issueStatuses} value={issue.status} onChange={(status) => void setIssueStatus(issue.id, status)} /></View>) : <EmptyRow text="No issues logged yet." />}
    </Card>

    <Card><SectionHeader title="Stakeholders" count={stakeholders.length} adding={addingStakeholder} onToggleAdd={() => setAddingStakeholder((v) => !v)} theme={c} />
      {addingStakeholder ? <View style={{ gap: 8 }}><Field label="Name" value={stakeholderName} onChangeText={setStakeholderName} placeholder="Full name" /><Field label="Role (optional)" value={stakeholderRole} onChangeText={setStakeholderRole} placeholder="e.g. Sponsor" /><Button title="Add Stakeholder" onPress={() => { const draft = { name: stakeholderName, role: stakeholderRole }; const err = validateStakeholder(draft); if (err) return Alert.alert('Check this stakeholder', err); void addStakeholder(draft).then(() => { setStakeholderName(''); setStakeholderRole(''); }); }} /></View> : null}
      {stakeholders.length ? stakeholders.map((stakeholder) => <View key={stakeholder.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}><View style={{ flex: 1 }}><Text selectable style={{ color: c.text, fontWeight: '600' }}>{stakeholder.name}</Text>{stakeholder.role ? <Text selectable style={{ color: c.muted, fontSize: 12 }}>{stakeholder.role}</Text> : null}</View><DeleteButton label={stakeholder.name} theme={c} onConfirm={() => void removeStakeholder(stakeholder.id)} /></View>) : <EmptyRow text="No stakeholders added yet." />}
    </Card>

    <Card><SectionHeader title="Notes" count={notes.length} adding={addingNote} onToggleAdd={() => setAddingNote((v) => !v)} theme={c} />
      {addingNote ? <View style={{ gap: 8 }}><Field label="Note" value={noteBody} onChangeText={setNoteBody} placeholder="Add a note for this project" multiline /><Button title="Add Note" onPress={() => { const draft = { body: noteBody }; const err = validateNote(draft); if (err) return Alert.alert('Check this note', err); void addNote(draft).then(() => setNoteBody('')); }} /></View> : null}
      {notes.length ? notes.map((note) => <View key={note.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, paddingVertical: 4 }}><View style={{ flex: 1, gap: 2 }}><Text selectable style={{ color: c.text }}>{note.body}</Text><Text selectable style={{ color: c.muted, fontSize: 11 }}>{formatDate(note.createdAt.slice(0, 10))}</Text></View><DeleteButton label="This note" theme={c} onConfirm={() => void removeNote(note.id)} /></View>) : <EmptyRow text="No notes yet." />}
    </Card>
    <Card><Text selectable style={{ color: c.text, fontWeight: '800' }}>Pocket Project Health Indicator</Text><Text selectable style={{ color: c.muted }}>An indicative planning aid based on overdue tasks, delayed milestones, unresolved critical risks and open high-priority issues. Not a professional assurance assessment.</Text></Card>
  </ScrollView>;
}
