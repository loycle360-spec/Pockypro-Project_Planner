import { ScrollView, Text } from 'react-native';
import { Card, useTheme } from '@/components/ui';
export default function Calendar() { const c = useTheme(); return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, backgroundColor: c.background, flexGrow: 1 }}><Card><Text selectable style={{ color: c.text, fontWeight: '800', fontSize: 18 }}>Your calendar is clear</Text><Text selectable style={{ color: c.muted }}>Task dates and milestones will appear here and remain available offline.</Text></Card></ScrollView>; }
