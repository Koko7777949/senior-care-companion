'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Activity, Pill, Phone, Users, Settings, Bell, 
  Shield, Hospital, User, Home, BarChart3, AlertTriangle,
  Plus, RefreshCw, Menu, X, Moon, Sun, ChevronDown,
  Building2, Bed, Stethoscope, Calendar, FileText, LogIn,
  LogOut, LayoutDashboard, ClipboardList, UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EmergencyButton } from '@/components/senior/EmergencyButton';
import { MedicationReminder } from '@/components/senior/MedicationReminder';
import { FamilyContact } from '@/components/senior/FamilyContact';
import { ActivityTracker } from '@/components/senior/ActivityTracker';
import { VoiceAssistant } from '@/components/senior/VoiceAssistant';
import { ManagementPanel } from '@/components/management/ManagementPanel';
import { HospitalDashboard } from '@/components/hospital/HospitalDashboard';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

type ViewType = 'senior' | 'hospital' | 'management';
type UserRole = 'senior' | 'caregiver' | 'doctor' | 'nurse' | 'admin';
type AuthState = 'loading' | 'unauthenticated' | 'onboarding' | 'authenticated';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  organization?: { id: string; name: string; type: string } | null;
  department?: { id: string; name: string } | null;
}

interface AppData {
  organization: { id: string; name: string; type: string } | null;
  patient: { id: string; name: string } | null;
  initialized: boolean;
}

export default function SeniorCareApp() {
  const { theme, setTheme } = useTheme();
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [currentView, setCurrentView] = useState<ViewType>('senior');
  const [user, setUser] = useState<User | null>(null);
  const [showManagement, setShowManagement] = useState(false);
  const [isVoiceAssistantActive, setIsVoiceAssistantActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  const [appData, setAppData] = useState<AppData>({
    organization: null,
    patient: null,
    initialized: false,
  });

  const [healthData, setHealthData] = useState({
    heartRate: null as number | null,
    bloodPressure: null as string | null,
    bloodSugar: null as number | null,
    oxygenLevel: null as number | null,
    lastUpdated: null as Date | null,
  });

  // Auth form state
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'senior' as UserRole,
  });

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if initialized
      const statusRes = await fetch('/api/init');
      const statusData = await statusRes.json();
      
      if (!statusData.initialized) {
        setAuthState('onboarding');
        setIsLoading(false);
        return;
      }

      setAppData({
        organization: statusData.organization,
        patient: statusData.patient,
        initialized: true,
      });

      // For demo, auto-authenticate
      const demoUser: User = {
        id: 'demo',
        email: 'demo@care.com',
        name: 'أحمد محمد',
        role: 'admin',
        organization: statusData.organization,
      };
      setUser(demoUser);
      setAuthState('authenticated');

      // Fetch health data
      await fetchHealthData();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health?limit=10');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.readings) {
          const readings = data.readings;
          const heartRate = readings.find((r: { type: string; value: string }) => r.type === 'heart_rate');
          const bloodPressure = readings.find((r: { type: string; value: string; value2: string | null }) => r.type === 'blood_pressure');
          const bloodSugar = readings.find((r: { type: string; value: string }) => r.type === 'blood_sugar');
          const oxygenLevel = readings.find((r: { type: string; value: string }) => r.type === 'oxygen_level');
          
          setHealthData({
            heartRate: heartRate ? parseInt(heartRate.value) : null,
            bloodPressure: bloodPressure ? `${bloodPressure.value}/${bloodPressure.value2}` : null,
            bloodSugar: bloodSugar ? parseInt(bloodSugar.value) : null,
            oxygenLevel: oxygenLevel ? parseInt(oxygenLevel.value) : null,
            lastUpdated: readings[0]?.timestamp ? new Date(readings[0].timestamp) : null,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
    }
  };

  const handleAuth = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authMode,
          ...authForm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setShowAuthModal(false);
        setAuthState('authenticated');
        toast.success(authMode === 'login' ? 'تم تسجيل الدخول بنجاح' : 'تم إنشاء الحساب بنجاح');
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('حدث خطأ في الاتصال');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthState('unauthenticated');
    setShowMenu(false);
    toast.success('تم تسجيل الخروج');
  };

  const handleOnboardingComplete = async (data: { type: string; organizationName: string }) => {
    try {
      const response = await fetch('/api/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        setAppData({
          organization: result.data.organization,
          patient: result.data.patient,
          initialized: true,
        });
        const demoUser: User = {
          id: result.data.user.id,
          email: result.data.user.email,
          name: result.data.user.name,
          role: result.data.user.role,
          organization: result.data.organization,
        };
        setUser(demoUser);
        setAuthState('authenticated');
        toast.success('تم إعداد النظام بنجاح!');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('حدث خطأ في الإعداد');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const roleLabels: Record<UserRole, string> = {
    senior: 'كبير السن',
    caregiver: 'مقدم الرعاية',
    doctor: 'طبيب',
    nurse: 'ممرض',
    admin: 'مدير النظام',
  };

  const healthItems = [
    { icon: Heart, label: 'نبض القلب', value: healthData.heartRate ? `${healthData.heartRate} نبضة` : '--', color: 'text-red-500', bgColor: 'bg-red-50' },
    { icon: Activity, label: 'ضغط الدم', value: healthData.bloodPressure || '--/--', color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { icon: Pill, label: 'سكر الدم', value: healthData.bloodSugar ? `${healthData.bloodSugar} مجم` : '--', color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { icon: Activity, label: 'الأكسجين', value: healthData.oxygenLevel ? `${healthData.oxygenLevel}%` : '--', color: 'text-teal-500', bgColor: 'bg-teal-50' },
  ];

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center" dir="rtl">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl"
          >
            <Heart className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-amber-800 mb-2">رفيق الصحة</h2>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </motion.div>
      </div>
    );
  }

  // Onboarding
  if (authState === 'onboarding') {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // Management panel
  if (showManagement && user) {
    return (
      <>
        <ManagementPanel onBack={() => setShowManagement(false)} userRole={user.role} />
        <VoiceAssistant isActive={isVoiceAssistantActive} onClose={() => setIsVoiceAssistantActive(false)} />
      </>
    );
  }

  // Hospital dashboard
  if (currentView === 'hospital' && user) {
    return (
      <>
        <HospitalDashboard 
          organization={appData.organization}
          user={user}
          onBack={() => setCurrentView('senior')}
          onManagement={() => setShowManagement(true)}
        />
        <VoiceAssistant isActive={isVoiceAssistantActive} onClose={() => setIsVoiceAssistantActive(false)} />
      </>
    );
  }

  // Main senior interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" dir="rtl">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-lg border-b border-amber-100 sticky top-0 z-30 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMenu(!showMenu)}
                className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
              >
                {user?.name?.charAt(0) || appData.patient?.name?.charAt(0) || 'أ'}
              </motion.button>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  {getGreeting()}، {user?.name || appData.patient?.name || 'المستخدم'}
                </h1>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <span>{getCurrentTime()}</span>
                  <span className="mx-1">•</span>
                  <span className="hidden sm:inline">{getCurrentDate()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} variant="ghost" size="sm" className="rounded-full">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              {/* Role Selector */}
              {user && (
                <div className="relative">
                  <Button
                    onClick={() => setShowRoleSelector(!showRoleSelector)}
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-1"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{roleLabels[user.role]}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  
                  {showRoleSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-40 z-50"
                    >
                      {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            setUser(prev => prev ? { ...prev, role } : null);
                            setShowRoleSelector(false);
                            if (role === 'admin' || role === 'doctor' || role === 'nurse') {
                              setCurrentView('hospital');
                            }
                          }}
                          className={`w-full text-right px-4 py-2 text-sm hover:bg-amber-50 ${
                            user.role === role ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {roleLabels[role]}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              <Button
                onClick={() => setIsVoiceAssistantActive(true)}
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-full px-4 py-2 text-sm"
              >
                🎤 المساعد
              </Button>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 bg-white/95"
            >
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button onClick={() => { setCurrentView('hospital'); setShowMenu(false); }} variant="ghost" className="justify-start gap-2">
                    <Hospital className="w-5 h-5 text-blue-500" />
                    لوحة المستشفى
                  </Button>
                  <Button onClick={() => { setShowManagement(true); setShowMenu(false); }} variant="ghost" className="justify-start gap-2">
                    <Settings className="w-5 h-5 text-gray-500" />
                    الإدارة
                  </Button>
                  <Button onClick={() => { setIsVoiceAssistantActive(true); setShowMenu(false); }} variant="ghost" className="justify-start gap-2">
                    <Bell className="w-5 h-5 text-amber-500" />
                    التنبيهات
                  </Button>
                  <Button onClick={handleLogout} variant="ghost" className="justify-start gap-2 text-red-500">
                    <LogOut className="w-5 h-5" />
                    خروج
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-4 pb-28">
        {/* Organization Badge */}
        {appData.organization && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Badge variant="outline" className="bg-white/80 text-gray-600 border-gray-200 px-4 py-2">
              <Building2 className="w-4 h-4 ml-1" />
              {appData.organization.name}
              <span className="mx-2">•</span>
              <span className="text-xs">
                {appData.organization.type === 'hospital' ? 'مستشفى' : 
                 appData.organization.type === 'clinic' ? 'عيادة' : 
                 appData.organization.type === 'care_center' ? 'مركز رعاية' : 'استخدام شخصي'}
              </span>
            </Badge>
          </motion.div>
        )}

        {/* Quick Stats Bar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-wrap justify-center gap-2"
        >
          <Button onClick={() => setCurrentView('hospital')} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2 text-sm">
            <LayoutDashboard className="w-4 h-4 ml-1" />
            لوحة التحكم
          </Button>
          <Button onClick={() => setShowManagement(true)} className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-4 py-2 text-sm">
            <Plus className="w-4 h-4 ml-1" />
            إدارة البيانات
          </Button>
          <Button onClick={() => setIsVoiceAssistantActive(true)} variant="outline" className="rounded-full px-4 py-2 text-sm">
            🎤 المساعد الصوتي
          </Button>
        </motion.section>

        {/* Emergency Button */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <EmergencyButton patientId={appData.patient?.id} />
        </motion.section>

        {/* Health Summary */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
          <Card className="bg-white/80 backdrop-blur shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  حالة الصحة
                </CardTitle>
                <Button onClick={fetchHealthData} variant="ghost" size="sm" className="rounded-full">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {healthItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${item.bgColor} rounded-xl p-3 text-center`}
                  >
                    <item.icon className={`w-6 h-6 mx-auto mb-1 ${item.color}`} />
                    <p className="text-xs text-gray-600">{item.label}</p>
                    <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Medications and Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <MedicationReminder patientId={appData.patient?.id} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <FamilyContact patientId={appData.patient?.id} />
          </motion.div>
        </div>

        {/* Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <ActivityTracker patientId={appData.patient?.id} />
        </motion.div>
      </main>

      {/* Voice Assistant */}
      <VoiceAssistant isActive={isVoiceAssistantActive} onClose={() => setIsVoiceAssistantActive(false)} />

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 py-2 px-4 md:hidden shadow-lg z-30">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center gap-0.5 text-amber-600 p-2">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">الرئيسية</span>
          </button>
          <button onClick={() => setShowManagement(true)} className="flex flex-col items-center gap-0.5 text-gray-500 p-2">
            <Plus className="w-5 h-5" />
            <span className="text-[10px]">إضافة</span>
          </button>
          <button onClick={() => setIsVoiceAssistantActive(true)} className="flex flex-col items-center gap-0.5 text-gray-500 p-2">
            <span className="text-xl">🎤</span>
            <span className="text-[10px]">مساعد</span>
          </button>
          <button onClick={() => setCurrentView('hospital')} className="flex flex-col items-center gap-0.5 text-gray-500 p-2">
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px]">تحكم</span>
          </button>
        </div>
      </nav>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</DialogTitle>
            <DialogDescription>
              {authMode === 'login' ? 'أدخل بياناتك للوصول إلى حسابك' : 'أنشئ حساباً جديداً للبدء'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {authMode === 'signup' && (
              <>
                <Input
                  placeholder="الاسم الكامل"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                />
                <Input
                  placeholder="رقم الهاتف"
                  value={authForm.phone}
                  onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                />
              </>
            )}
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            />
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            />
            <Button onClick={handleAuth} className="w-full bg-amber-500 hover:bg-amber-600">
              {authMode === 'login' ? 'دخول' : 'إنشاء الحساب'}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            >
              {authMode === 'login' ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخولك'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
