import { create } from 'zustand';
import type { Profile, Device } from '@/types/database';

interface UserState {
  profile: Profile | null;
  devices: Device[];
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  setDevices: (devices: Device[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  devices: [],
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setDevices: (devices) => set({ devices }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ profile: null, devices: [], isLoading: false }),
}));
