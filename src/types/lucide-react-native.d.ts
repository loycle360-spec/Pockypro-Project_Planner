declare module 'lucide-react-native' {
  import type { ComponentType } from 'react';
  import type { SvgProps } from 'react-native-svg';
  type IconProps = SvgProps & { size?: number | string; absoluteStrokeWidth?: boolean };
  export const House: ComponentType<IconProps>;
  export const FolderKanban: ComponentType<IconProps>;
  export const CheckSquare: ComponentType<IconProps>;
  export const CalendarDays: ComponentType<IconProps>;
  export const MoreHorizontal: ComponentType<IconProps>;
  export const Plus: ComponentType<IconProps>;
  export const Search: ComponentType<IconProps>;
  export const AlertTriangle: ComponentType<IconProps>;
  export const FolderPlus: ComponentType<IconProps>;
  export const ListPlus: ComponentType<IconProps>;
  export const ShieldAlert: ComponentType<IconProps>;
}
