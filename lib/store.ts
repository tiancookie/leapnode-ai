/**
 * 全局状态管理（Zustand）
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./types";

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  updateQuota: (quota: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => {
        // 同步 user_id 到 localStorage（供 api.ts 注入 New-Api-User header）
        if (typeof window !== "undefined") {
          localStorage.setItem("leapnode_user_id", String(user.id));
        }
        set({ user, isAuthenticated: true });
      },

      clearUser: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("leapnode_user_id");
        }
        set({ user: null, isAuthenticated: false });
      },

      updateQuota: (quota) =>
        set((state) => ({
          user: state.user ? { ...state.user, quota } : null,
        })),
    }),
    {
      name: "leapnode-user",
    }
  )
);

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
