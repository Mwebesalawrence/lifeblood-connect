import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  bloodType?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  country: string;
  avatar?: string;
  points: number;
  totalDonations: number;
  isEligible: boolean;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  token?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  operatingHours?: string;
  type: string;
  isActive: boolean;
  inventory?: BloodInventoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  centerId: string;
  date: string;
  timeSlot: string;
  status: string;
  notes?: string;
  center: DonationCenter;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  donorId: string;
  centerId: string;
  date: string;
  bloodType: string;
  volumeMl: number;
  status: string;
  notes?: string;
  center: DonationCenter;
  donor?: { id: string; name: string; bloodType?: string };
  createdAt: string;
  updatedAt: string;
}

export interface BloodInventoryItem {
  id: string;
  centerId: string;
  bloodType: string;
  units: number;
  center?: DonationCenter;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon?: string;
  pointsRequired: number;
  type: string;
  createdAt: string;
}

export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  earnedAt: string;
  reward: Reward;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  bloodType?: string;
  points: number;
  totalDonations: number;
  city?: string;
}

export interface SystemStats {
  totalDonors: number;
  totalDonations: number;
  activeCenters: number;
  livesSaved: number;
  scheduledAppointments: number;
  totalUnits: number;
  bloodTypeDistribution: Record<string, number>;
  monthlyData: Record<string, number>;
  inventoryByType: Record<string, number>;
}

export type ViewType =
  | 'landing'
  | 'dashboard'
  | 'centers'
  | 'center-detail'
  | 'appointments'
  | 'rewards'
  | 'education'
  | 'admin'
  | 'profile';

interface AppState {
  // Auth state
  currentUser: User | null;
  token: string | null;

  // Navigation state
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  // Selected items
  selectedCenter: DonationCenter | null;
  setSelectedCenter: (center: DonationCenter | null) => void;

  // Notifications
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  unreadCount: number;

  // Auth dialog state
  authDialogOpen: boolean;
  authDialogMode: 'login' | 'register';
  setAuthDialogOpen: (open: boolean) => void;
  setAuthDialogMode: (mode: 'login' | 'register') => void;

  // Auth actions
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;

  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      currentUser: null,
      token: null,

      // Navigation state
      currentView: 'landing',
      setCurrentView: (view) => {
        set({ currentView: view, sidebarOpen: false });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },

      // Selected items
      selectedCenter: null,
      setSelectedCenter: (center) => set({ selectedCenter: center }),

      // Notifications
      notifications: [],
      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        }),
      unreadCount: 0,

      // Auth dialog state
      authDialogOpen: false,
      authDialogMode: 'login',
      setAuthDialogOpen: (open) => set({ authDialogOpen: open }),
      setAuthDialogMode: (mode) => set({ authDialogMode: mode }),

      // Auth actions
      login: (user, token) =>
        set({
          currentUser: user,
          token,
          currentView: user.role === 'ADMIN' ? 'admin' : 'dashboard',
          sidebarOpen: false,
        }),
      logout: () =>
        set({
          currentUser: null,
          token: null,
          currentView: 'landing',
          sidebarOpen: false,
          notifications: [],
          unreadCount: 0,
          selectedCenter: null,
        }),
      updateUser: (partial) => {
        const current = get().currentUser;
        if (current) {
          set({ currentUser: { ...current, ...partial } });
        }
      },

      // UI state
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'lifeblood-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
      }),
    }
  )
);
