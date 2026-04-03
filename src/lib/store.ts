import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// أنواع البيانات
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  color: string;
  nextTime: string;
  taken: boolean;
}

export interface HealthStatus {
  heartRate: number | null;
  bloodPressure: string | null;
  bloodSugar: number | null;
  oxygenLevel: number | null;
  lastUpdated: Date | null;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
}

export interface Alert {
  id: string;
  type: 'medication' | 'emergency' | 'inactivity' | 'health';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ActivityData {
  steps: number;
  activeMinutes: number;
  lastMovement: Date | null;
  calories: number;
}

// حالة التطبيق
interface AppState {
  // المستخدم الحالي
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: 'senior' | 'caregiver';
    phone?: string;
  } | null;
  
  // الأدوية
  medications: Medication[];
  
  // حالة الصحة
  healthStatus: HealthStatus;
  
  // جهات اتصال الطوارئ
  emergencyContacts: EmergencyContact[];
  
  // التنبيهات
  alerts: Alert[];
  
  // بيانات النشاط
  activityData: ActivityData;
  
  // حالة الطوارئ
  isEmergencyActive: boolean;
  
  // الوضع الحالي
  currentView: 'senior' | 'dashboard';
  
  // المساعد الصوتي
  isVoiceAssistantActive: boolean;
  
  // الإجراءات
  setCurrentUser: (user: AppState['currentUser']) => void;
  setMedications: (medications: Medication[]) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  setHealthStatus: (status: Partial<HealthStatus>) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'isRead'>) => void;
  markAlertRead: (id: string) => void;
  setActivityData: (data: Partial<ActivityData>) => void;
  toggleEmergency: () => void;
  setCurrentView: (view: 'senior' | 'dashboard') => void;
  toggleVoiceAssistant: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // القيم الافتراضية
      currentUser: {
        id: 'senior-1',
        name: 'أم محمد',
        email: 'senior@example.com',
        role: 'senior',
        phone: '0501234567',
      },
      
      medications: [
        {
          id: '1',
          name: 'أملوديبين',
          dosage: '5 مجم',
          times: ['08:00', '20:00'],
          color: '#3b82f6',
          nextTime: '20:00',
          taken: false,
        },
        {
          id: '2',
          name: 'ميتفورمين',
          dosage: '500 مجم',
          times: ['07:00', '19:00'],
          color: '#22c55e',
          nextTime: '19:00',
          taken: false,
        },
        {
          id: '3',
          name: 'أسبيرين',
          dosage: '81 مجم',
          times: ['09:00'],
          color: '#ef4444',
          nextTime: '09:00',
          taken: true,
        },
      ],
      
      healthStatus: {
        heartRate: 72,
        bloodPressure: '120/80',
        bloodSugar: 110,
        oxygenLevel: 98,
        lastUpdated: new Date(),
      },
      
      emergencyContacts: [
        {
          id: '1',
          name: 'محمد (الابن)',
          phone: '0509876543',
          relation: 'ابن',
          isPrimary: true,
        },
        {
          id: '2',
          name: 'فاطمة (الابنة)',
          phone: '0508765432',
          relation: 'ابنة',
          isPrimary: false,
        },
        {
          id: '3',
          name: 'الطبيب الدكتور أحمد',
          phone: '0507654321',
          relation: 'طبيب',
          isPrimary: false,
        },
      ],
      
      alerts: [],
      
      activityData: {
        steps: 3245,
        activeMinutes: 45,
        lastMovement: new Date(),
        calories: 180,
      },
      
      isEmergencyActive: false,
      currentView: 'senior',
      isVoiceAssistantActive: false,
      
      // الإجراءات
      setCurrentUser: (user) => set({ currentUser: user }),
      
      setMedications: (medications) => set({ medications }),
      
      updateMedication: (id, updates) =>
        set((state) => ({
          medications: state.medications.map((med) =>
            med.id === id ? { ...med, ...updates } : med
          ),
        })),
      
      setHealthStatus: (status) =>
        set((state) => ({
          healthStatus: { ...state.healthStatus, ...status, lastUpdated: new Date() },
        })),
      
      setEmergencyContacts: (contacts) => set({ emergencyContacts: contacts }),
      
      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            {
              ...alert,
              id: Date.now().toString(),
              timestamp: new Date(),
              isRead: false,
            },
            ...state.alerts,
          ].slice(0, 50), // الاحتفاظ بآخر 50 تنبيه فقط
        })),
      
      markAlertRead: (id) =>
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === id ? { ...alert, isRead: true } : alert
          ),
        })),
      
      setActivityData: (data) =>
        set((state) => ({
          activityData: { ...state.activityData, ...data },
        })),
      
      toggleEmergency: () =>
        set((state) => ({ isEmergencyActive: !state.isEmergencyActive })),
      
      setCurrentView: (view) => set({ currentView: view }),
      
      toggleVoiceAssistant: () =>
        set((state) => ({ isVoiceAssistantActive: !state.isVoiceAssistantActive })),
    }),
    {
      name: 'senior-companion-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        medications: state.medications,
        emergencyContacts: state.emergencyContacts,
        currentView: state.currentView,
      }),
    }
  )
);
