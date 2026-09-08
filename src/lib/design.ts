import { Platform } from 'react-native';

export const palette = {
  light: { background: '#F7F8FA', surface: '#FFFFFF', text: '#17212B', muted: '#64748B', border: '#E2E8F0', primary: '#175CD3', success: '#027A48', warning: '#B54708', danger: '#B42318', tint: '#EFF6FF' },
  dark: { background: '#101828', surface: '#182230', text: '#F8FAFC', muted: '#94A3B8', border: '#344054', primary: '#84ADFF', success: '#6CE9A6', warning: '#FEC84B', danger: '#FEA3A3', tint: '#1D2939' },
};
export const tokens = { space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }, radius: { sm: 8, md: 12, lg: 18 }, icon: { sm: 18, md: 22, lg: 28 }, duration: { fast: 150, normal: 250 }, shadow: Platform.select({ web: '0 2px 10px rgba(16,24,40,.08)', default: undefined }) };
