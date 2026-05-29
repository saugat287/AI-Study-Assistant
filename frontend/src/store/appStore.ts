import { create } from 'zustand';

export type WidgetType = 'none' | 'timer' | 'music';

interface AppState {
  zenMode: boolean;
  toggleZenMode: () => void;
  activeWidget: WidgetType;
  setActiveWidget: (widget: WidgetType) => void;
}

export const useAppStore = create<AppState>((set) => ({
  zenMode: false,
  toggleZenMode: () => set((state) => ({ zenMode: !state.zenMode })),
  activeWidget: 'none',
  setActiveWidget: (widget) => set({ activeWidget: widget }),
}));
