import { create } from 'zustand';
import { projectRepository } from '@/src/db/project-repository';
import type { Project, ProjectDraft } from '@/src/types/project';
type ProjectState = { projects: Project[]; loading: boolean; error: string | null; load: (search?: string) => Promise<void>; create: (draft: ProjectDraft) => Promise<Project>; };
export const useProjectStore = create<ProjectState>((set) => ({ projects: [], loading: false, error: null, load: async (search = '') => { set({ loading: true, error: null }); try { set({ projects: await projectRepository.list(search), loading: false }); } catch { set({ loading: false, error: 'Unable to load projects. Your data remains safely stored on this device.' }); } }, create: async (draft) => { try { const project = await projectRepository.create(draft); set((state) => ({ projects: [project, ...state.projects] })); return project; } catch { throw new Error('Unable to save this project. Your existing data has not been changed.'); } } }));
