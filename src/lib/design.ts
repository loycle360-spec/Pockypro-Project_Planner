import { Platform } from 'react-native';

// Visual language modelled on Microsoft Project: green Office ribbon, flat bordered grid,
// blue task bars, red critical bars, black summary bars and milestone diamonds.
export const palette = {
  light: { background: '#EDEDED', surface: '#FFFFFF', text: '#262626', muted: '#595959', border: '#C6C6C6', primary: '#31752F', success: '#2E7D32', warning: '#B45F06', danger: '#C00000', tint: '#E3EFE2', ribbon: '#31752F', ribbonText: '#FFFFFF', header: '#F3F3F3', grid: '#D9D9D9', taskBar: '#4F81BD', criticalBar: '#C00000', summaryBar: '#000000', today: '#C00000' },
  dark: { background: '#1B1B1B', surface: '#262626', text: '#F2F2F2', muted: '#A6A6A6', border: '#454545', primary: '#6FBF6B', success: '#6FBF6B', warning: '#F0A04B', danger: '#FF7B7B', tint: '#2F3F2E', ribbon: '#1F4D1E', ribbonText: '#FFFFFF', header: '#303030', grid: '#3A3A3A', taskBar: '#7FA8D9', criticalBar: '#FF6B6B', summaryBar: '#F2F2F2', today: '#FF6B6B' },
};
export const tokens = { space: { xs: 4, sm: 8, md: 12, lg: 20, xl: 28 }, radius: { sm: 2, md: 3, lg: 4 }, icon: { sm: 16, md: 20, lg: 24 }, duration: { fast: 150, normal: 250 }, font: { small: 12, body: 14, title: 20 }, shadow: Platform.select({ web: undefined, default: undefined }) };
