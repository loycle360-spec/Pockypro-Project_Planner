import { ScrollView, Text } from 'react-native';
import { Card, useTheme } from '@/components/ui';
export default function Tasks() { const c = useTheme(); return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, backgroundColor: c.background, flexGrow: 1 }}><Card><Text selectable style={{ color: c.text, fontWeight: '800', fontSize: 18 }}>No tasks yet</Text><Text selectable style={{ color: c.muted }}>Create a project first, then add work items from its Plan area.</Text></Card></ScrollView>; }
