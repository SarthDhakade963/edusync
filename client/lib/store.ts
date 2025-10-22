// lib/store.ts
import { create } from "zustand";

type User = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
};

type AuthState = {
  user: User | null;
  setUser: (u: User | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}));
