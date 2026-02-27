import { create } from 'zustand';
import { OSWindow } from '../types';

interface OSState {
  isLoggedIn: boolean;
  username: string;
  windows: OSWindow[];
  nextZIndex: number;
  login: (username: string) => void;
  logout: () => void;
  openWindow: (title: string, component: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
}

export const useOSStore = create<OSState>((set) => ({
  isLoggedIn: false,
  username: '',
  windows: [],
  nextZIndex: 100,

  login: (username: string) => set({ isLoggedIn: true, username }),
  
  logout: () => set({ isLoggedIn: false, username: '', windows: [] }),

  openWindow: (title: string, component: string) => set((state) => {
    const existingWindow = state.windows.find(w => w.component === component);
    if (existingWindow) {
      return {
        windows: state.windows.map(w => 
          w.id === existingWindow.id 
            ? { ...w, isMinimized: false, zIndex: state.nextZIndex }
            : w
        ),
        nextZIndex: state.nextZIndex + 1,
      };
    }
    
    const newWindow: OSWindow = {
      id: `window-${Date.now()}`,
      title,
      component,
      isMinimized: false,
      zIndex: state.nextZIndex,
    };
    
    return {
      windows: [...state.windows, newWindow],
      nextZIndex: state.nextZIndex + 1,
    };
  }),

  closeWindow: (id: string) => set((state) => ({
    windows: state.windows.filter(w => w.id !== id),
  })),

  minimizeWindow: (id: string) => set((state) => ({
    windows: state.windows.map(w => 
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ),
  })),

  focusWindow: (id: string) => set((state) => ({
    windows: state.windows.map(w => 
      w.id === id ? { ...w, zIndex: state.nextZIndex } : w
    ),
    nextZIndex: state.nextZIndex + 1,
  })),
}));
