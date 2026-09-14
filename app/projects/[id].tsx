import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Circle, Plus } from 'lucide-react-native';
import { Button, Card, EmptyRow, Field, HealthBadge, Segmented, useTheme } from '@/components/ui';
import { projectRepository } from '@/src/db/project-repository';
import { useProjectDetailStore } from '@/src/stores/project-detail-store';
import { formatDate } from '@/src/lib/dates';
import { issueStatuses, milestoneStatuses, projectPriorities, riskScale, riskStatuses } from '@/src/lib/options';
import { validateIssue, validateMilestone, validateNote, validateRisk, validateStakeholder, validateTask } from '@/src/lib/validation';
import type { ProjectPriority } from '@/src/types/project';

function SectionHeader({ title, count, adding, onToggleAdd, theme }: { title: string; count: number; adding: boolean; onToggleAdd: () => void; theme: ReturnType<typeof useTheme> }) {
  return <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    <Text selectable style={{ color: theme.text, fontWeight: '800', fontSize: 16 }}>{title} ({count})</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`Add ${title.toLowerCase()}`} onPress={onToggleAdd} style={{ padding: 6, borderRadius: 99, backgroundColor: adding ? theme.tint : 'transparent' }}>
      <Plus color={theme.primary} size={20} />
    </Pressable>
  </View>;
}

export default function ProjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useTheme();
  const { project, tasks, milestones, risks, issues, stakeholders, notes, loading, error, load, addTask, setTaskStatus, addMilestone, setMilestoneStatus, addRisk, setRiskStatus, addIssue, setIssueStatus, addStakeholder, addNote } = useProjectDetailStore();

  useEffect(() => { if (id) void load(id); }, [id, load]);

  const [addingTask, setAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');

  const [addingMilestone, setAddingMilestone] = useState(false);
  const [milestoneName, setMilestoneName] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');

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

  const archive = () => Alert.alert('Archive project', 'Archived projects are hidden from your active list but not deleted.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Archive', style: 'destructive', onPress: () => { if (!id) return; void projectRepository.archive(id).then(() => router.replace('/(tabs)/projects')); } },
  ]);

  if (loading && !project) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.background }}><ActivityIndicator color={c.primary} /></View>;
  if (!project) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.background, padding: 16 }}><Text selectable style={{ color: c.muted, textAlign: 'center' }}>{error ?? 'This project could not be found.'}</Text></View>;

  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 12, backgroundColor: c.background }}>
    <Stack.Screen options={{ title: project.name }} />

    <Card>
      <Text selectable style={{ color: c.text, fontSize: 24, fontWeight: '800' }}>{project.name}</Text>
      <HealthBadge health={project.health} />
      <Text selectable style={{ color: c.muted }}>{project.description || 'No description has been added.'}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Link href={{ pathname: '/projects/edit/[id]', params: { id: project.id } }} asChild><View style={{ flex: 1 }}><Button title="Edit" variant="secondary" onPress={() => {}} /></View></Link>
        <View style={{ flex: 1 }}><Button title="Archive" variant="secondary" onPress={archive} /></View>
      </View>
    </Card>

    <Card>
      <Text selectable style={{ color: c.text, fontWeight: '800' }}>Overview</Text>
      <Text selectable style={{ color: c.muted }}>Status: {project.status}</Text>
      <Text selectable style={{ color: c.muted }}>Priority: {project.priority}</Text>
      <Text selectable style={{ color: c.muted }}>Methodology: {project.methodology}</Text>
      <Text selectable style={{ color: c.muted }}>Target: {formatDate(project.targetDate)}</Text>
    </Card>

    <Card>
      <Text selectable style={{ color: c.text, fontWeight: '800' }}>Project brief</Text>
      <Text selectable style={{ color: c.muted }}>Purpose: {project.purpose || 'Not yet defined'}</Text>
      <Text selectable style={{ color: c.muted }}>Objectives: {project.objectives || 'Not yet defined'}</Text>
    </Card>

    <Card>
      <SectionHeader title="Tasks" count={tasks.length} adding={addingTask} onToggleAdd={() => setAddingTask((v) => !v)} theme={c} />
      {addingTask ? <View style={{ gap: 8 }}>
        <Field label="Title" value={taskTitle} onChangeText={setTaskTitle} placeholder="What needs doing?" />
        <Field label="Due date (YYYY-MM-DD, optional)" value={taskDue} onChangeText={setTaskDue} placeholder="2026-03-01" />
        <Button title="Add task" onPress={() => { const draft = { title: taskTitle, dueDate: taskDue.trim() || null }; const err = validateTask(draft); if (err) return Alert.alert('Check this task', err); void addTask(draft).then(() => { setTaskTitle(''); setTaskDue(''); setAddingTask(false); }); }} />
      </View> : null}
      {tasks.length ? tasks.map((task) => <Pressable key={task.id} accessibilityRole="button" accessibilityLabel={`Mark ${task.title} as ${task.status === 'Done' ? 'not done' : 'done'}`} onPress={() => void setTaskStatus(task.id, task.status === 'Done' ? 'To Do' : 'Done')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {task.status === 'Done' ? <CheckCircle2 color={c.success} size={20} /> : <Circle color={c.muted} size={20} />}
        <View style={{ flex: 1 }}>
          <Text selectable style={{ color: c.text, textDecorationLine: task.status === 'Done' ? 'line-through' : 'none' }}>{task.title}</Text>
          {task.dueDate ? <Text selectable style={{ color: c.muted, fontSize: 12 }}>Due {formatDate(task.dueDate)}</Text> : null}
        </View>
      </Pressable>) : <EmptyRow text="No tasks yet." />}
    </Card>

    <Card>
      <SectionHeader title="Milestones" count={milestones.length} adding={addingMilestone} onToggleAdd={() => setAddingMilestone((v) => !v)} theme={c} />
      {addingMilestone ? <View style={{ gap: 8 }}>
        <Field label="Name" value={milestoneName} onChangeText={setMilestoneName} placeholder="e.g. Phase 1 sign-off" />
        <Field label="Target date (YYYY-MM-DD, optional)" value={milestoneDate} onChangeText={setMilestoneDate} placeholder="2026-03-01" />
        <Button title="Add milestone" onPress={() => { const draft = { name: milestoneName, targetDate: milestoneDate.trim() || null }; const err = validateMilestone(draft); if (err) return Alert.alert('Check this milestone', err); void addMilestone(draft).then(() => { setMilestoneName(''); setMilestoneDate(''); setAddingMilestone(false); }); }} />
      </View> : null}
      {milestones.length ? milestones.map((milestone) => <View key={milestone.id} style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text selectable style={{ color: c.text, fontWeight: '600', flex: 1 }}>{milestone.name}</Text>
          <Text selectable style={{ color: c.muted, fontSize: 12 }}>{formatDate(milestone.targetDate)}</Text>
        </View>
        <Segmented label="Status" options={milestoneStatuses} value={milestone.status} onChange={(status) => void setMilestoneStatus(milestone.id, status)} />
      </View>) : <EmptyRow text="No milestones yet." />}
    </Card>

    <Card>
      <SectionHeader title="Risks" count={risks.length} adding={addingRisk} onToggleAdd={() => setAddingRisk((v) => !v)} theme={c} />
      {addingRisk ? <View style={{ gap: 8 }}>
        <Field label="Risk" value={riskText} onChangeText={setRiskText} placeholder="What could go wrong?" multiline />
        <Segmented label="Probability (1–5)" options={riskScale} value={riskProbability} onChange={setRiskProbability} />
        <Segmented label="Impact (1–5)" options={riskScale} value={riskImpact} onChange={setRiskImpact} />
        <Button title="Add risk" onPress={() => { const draft = { risk: riskText, probability: Number(riskProbability), impact: Number(riskImpact) }; const err = validateRisk(draft); if (err) return Alert.alert('Check this risk', err); void addRisk(draft).then(() => { setRiskText(''); setRiskProbability('3'); setRiskImpact('3'); setAddingRisk(false); }); }} />
      </View> : null}
      {risks.length ? risks.map((risk) => <View key={risk.id} style={{ gap: 4 }}>
        <Text selectable style={{ color: c.text, fontWeight: '600' }}>{risk.risk}</Text>
        <Text selectable style={{ color: c.muted, fontSize: 12 }}>Probability {risk.probability} · Impact {risk.impact}</Text>
        <Segmented label="Status" options={riskStatuses} value={risk.status} onChange={(status) => void setRiskStatus(risk.id, status)} />
      </View>) : <EmptyRow text="No risks logged yet." />}
    </Card>

    <Card>
      <SectionHeader title="Issues" count={issues.length} adding={addingIssue} onToggleAdd={() => setAddingIssue((v) => !v)} theme={c} />
      {addingIssue ? <View style={{ gap: 8 }}>
        <Field label="Title" value={issueTitle} onChangeText={setIssueTitle} placeholder="What's happening now?" />
        <Segmented label="Priority" options={projectPriorities} value={issuePriority} onChange={setIssuePriority} />
        <Button title="Add issue" onPress={() => { const draft = { title: issueTitle, priority: issuePriority }; const err = validateIssue(draft); if (err) return Alert.alert('Check this issue', err); void addIssue(draft).then(() => { setIssueTitle(''); setIssuePriority('Medium'); setAddingIssue(false); }); }} />
      </View> : null}
      {issues.length ? issues.map((issue) => <View key={issue.id} style={{ gap: 4 }}>
        <Text selectable style={{ color: c.text, fontWeight: '600' }}>{issue.title}</Text>
        <Text selectable style={{ color: c.muted, fontSize: 12 }}>Priority: {issue.priority}</Text>
        <Segmented label="Status" options={issueStatuses} value={issue.status} onChange={(status) => void setIssueStatus(issue.id, status)} />
      </View>) : <EmptyRow text="No issues logged yet." />}
    </Card>

    <Card>
      <SectionHeader title="Stakeholders" count={stakeholders.length} adding={addingStakeholder} onToggleAdd={() => setAddingStakeholder((v) => !v)} theme={c} />
      {addingStakeholder ? <View style={{ gap: 8 }}>
        <Field label="Name" value={stakeholderName} onChangeText={setStakeholderName} placeholder="Full name" />
        <Field label="Role (optional)" value={stakeholderRole} onChangeText={setStakeholderRole} placeholder="e.g. Sponsor" />
        <Button title="Add stakeholder" onPress={() => { const draft = { name: stakeholderName, role: stakeholderRole }; const err = validateStakeholder(draft); if (err) return Alert.alert('Check this stakeholder', err); void addStakeholder(draft).then(() => { setStakeholderName(''); setStakeholderRole(''); setAddingStakeholder(false); }); }} />
      </View> : null}
      {stakeholders.length ? stakeholders.map((stakeholder) => <View key={stakeholder.id}>
        <Text selectable style={{ color: c.text, fontWeight: '600' }}>{stakeholder.name}</Text>
        {stakeholder.role ? <Text selectable style={{ color: c.muted, fontSize: 12 }}>{stakeholder.role}</Text> : null}
      </View>) : <EmptyRow text="No stakeholders added yet." />}
    </Card>

    <Card>
      <SectionHeader title="Notes" count={notes.length} adding={addingNote} onToggleAdd={() => setAddingNote((v) => !v)} theme={c} />
      {addingNote ? <View style={{ gap: 8 }}>
        <Field label="Note" value={noteBody} onChangeText={setNoteBody} placeholder="Add a note for this project" multiline />
        <Button title="Add note" onPress={() => { const draft = { body: noteBody }; const err = validateNote(draft); if (err) return Alert.alert('Check this note', err); void addNote(draft).then(() => { setNoteBody(''); setAddingNote(false); }); }} />
      </View> : null}
      {notes.length ? notes.map((note) => <View key={note.id} style={{ gap: 2 }}>
        <Text selectable style={{ color: c.text }}>{note.body}</Text>
        <Text selectable style={{ color: c.muted, fontSize: 11 }}>{formatDate(note.createdAt.slice(0, 10))}</Text>
      </View>) : <EmptyRow text="No notes yet." />}
    </Card>

    <Card>
      <Text selectable style={{ color: c.text, fontWeight: '800' }}>Pocket Project Health Indicator</Text>
      <Text selectable style={{ color: c.muted }}>An indicative planning aid based on overdue tasks, delayed milestones, unresolved critical risks and open high-priority issues. Not a professional assurance assessment.</Text>
    </Card>
  </ScrollView>;
}
