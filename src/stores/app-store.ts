import { create } from 'zustand';
import { projectRepository } from '@/src/db/project-repository';
type AppState = { ready: boolean; onboardingComplete: boolean; initialize: () => Promise<void>; completeOnboarding: () => Promise<void>; };
export const useAppStore = create<AppState>((set) => ({ ready: false, onboardingComplete: false, initialize: async () => { const onboardingComplete = await projectRepository.isOnboarded(); set({ onboardingComplete, ready: true }); }, completeOnboarding: async () => { await projectRepository.setOnboarded(); set({ onboardingComplete: true }); } }));
