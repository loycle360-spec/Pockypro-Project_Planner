import '@/global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/components/ui';
import { useAppStore } from '@/src/stores/app-store';
export default function RootLayout() { const c = useTheme(); const initialize = useAppStore((s) => s.initialize); useEffect(() => { void initialize(); }, [initialize]); return <><StatusBar style="light" /><Stack screenOptions={{ headerBackTitle: 'Back', headerStyle: { backgroundColor: c.ribbon }, headerTintColor: c.ribbonText, headerTitleStyle: { fontWeight: '600', fontSize: 16 }, contentStyle: { backgroundColor: c.background } }}><Stack.Screen name="index" options={{ headerShown: false }} /><Stack.Screen name="onboarding" options={{ headerShown: false }} /><Stack.Screen name="(tabs)" options={{ headerShown: false }} /><Stack.Screen name="projects/new" options={{ presentation: 'modal', title: 'New project' }} /><Stack.Screen name="projects/[id]" options={{ title: 'Project overview' }} /><Stack.Screen name="projects/edit/[id]" options={{ presentation: 'modal', title: 'Edit project' }} /><Stack.Screen name="more/about" options={{ title: 'About ORIGENTEK' }} /></Stack></>; }
