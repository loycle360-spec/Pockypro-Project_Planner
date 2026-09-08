import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppStore } from '@/src/stores/app-store';
import { useTheme } from '@/components/ui';
export default function Index() { const { ready, onboardingComplete } = useAppStore(); const c = useTheme(); if (!ready) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.background }}><ActivityIndicator color={c.primary} /></View>; return <Redirect href={onboardingComplete ? '/(tabs)' : '/onboarding'} />; }
