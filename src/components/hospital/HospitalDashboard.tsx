'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Activity, Pill, Users, Bed, Stethoscope, Calendar,
  FileText, TrendingUp, AlertTriangle, Clock, Check, X,
  Building2, ChevronDown, Plus, Settings, Bell, Search,
  BarChart3, PieChart, ArrowRight, Phone, Video, MessageCircle,
  Shield, Database, User, Home, RefreshCw, LogOut, LayoutDashboard,
  ClipboardList, UserPlus, BadgeAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organization?: { id: string; name: string; type: string } | null;
}

interface HospitalDashboardProps {
  organization: { id: string; name: string; type: string } | null;
  user: User;
  onBack: () => void;
  onManagement: () => void;
}

export function HospitalDashboard({ organization, user, onBack, onManagement }: HospitalDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    criticalPatients: 0,
    dischargedPatients: 0,
    todayAppointments: 0,
    pendingMedications: 0,
    alerts: 0,
    departments: 0,
    staff: 0,
  });
  const [patients, setPatients] = useState<Array<{
    id: string;
    name: string;
    status: string;
    roomNumber?: string;
    bedNumber?: string;
    medicalConditions?: string;
    patientType?: string;
    phone?: string;
  }>>([]);
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    message: string;
    createdAt: string;
    isRead?: boolean;
  }>>([]);
  const [appointments, setAppointments] = useState<Array<{
    id: string;
    title: string;
    scheduledAt: string;
    status: string;
    patient?: { name: string };
    doctor?: { name: string };
  }>>([]);
  const [healthTrends, setHealthTrends] = useState<Array<{
    date: string;
    heartRate: number;
    bloodPressure: number;
    bloodSugar: number;
  }>>([]);

  // New patient form
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '',
    gender: 'male',
    bloodType: '',
    medicalConditions: '',
    patientType: 'inpatient',
    roomNumber: '',
    bedNumber: '',
  });

  // New appointment form
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    title: '',
    type: 'consultation',
    scheduledAt: '',
    notes: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch patients
      const patientsRes = await fetch('/api/patients');
      if (patientsRes.ok) {
        const data = await patientsRes.json();
        if (data.success) {
          setPatients(data.patients || []);
          setStats(prev => ({
            ...prev,
            totalPatients: data.patients?.length || 0,
            activePatients: data.patients?.filter((p: { status: string }) => p.status === 'active').length || 0,
            criticalPatients: data.patients?.filter((p: { status: string }) => p.status === 'critical').length || 0,
            dischargedPatients: data.patients?.filter((p: { status: string }) => p.status === 'discharged').length || 0,
          }));
        }
      }

      // Fetch alerts
      const alertsRes = await fetch('/api/alerts');
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        if (data.success) {
          setAlerts(data.alerts || []);
          setStats(prev => ({
            ...prev,
            alerts: data.alerts?.filter((a: { isRead: boolean }) => !a.isRead).length || 0,
          }));
        }
      }

      // Fetch appointments
      const apptsRes = await fetch('/api/appointments');
      if (apptsRes.ok) {
        const data = await apptsRes.json();
        if (data.success) {
          setAppointments(data.appointments || []);
          const today = new Date().toDateString();
          setStats(prev => ({
            ...prev,
            todayAppointments: data.appointments?.filter((a: { scheduledAt: string }) => 
              new Date(a.scheduledAt).toDateString() === today
            ).length || 0,
          }));
        }
      }

      // Fetch medications
      const medsRes = await fetch('/api/medications');
      if (medsRes.ok) {
        const data = await medsRes.json();
        if (data.success) {
          setStats(prev => ({
            ...prev,
            pendingMedications: data.medications?.filter((m: { taken: boolean }) => !m.taken).length || 0,
          }));
        }
      }

      // Generate mock health trends
      const trends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        trends.push({
          date: date.toLocaleDateString('ar-SA', { weekday: 'short' }),
          heartRate: 70 + Math.floor(Math.random() * 15),
          bloodPressure: 115 + Math.floor(Math.random() * 15),
          bloodSugar: 100 + Math.floor(Math.random() * 40),
        });
      }
      setHealthTrends(trends);

      // Set mock department and staff counts
      setStats(prev => ({
        ...prev,
        departments: 5,
        staff: 24,
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = async () => {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPatient,
          organizationId: organization?.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('تم إضافة المريض بنجاح');
        setShowAddPatient(false);
        setNewPatient({
          name: '',
          phone: '',
          gender: 'male',
          bloodType: '',
          medicalConditions: '',
          patientType: 'inpatient',
          roomNumber: '',
          bedNumber: '',
        });
        fetchDashboardData();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error('حدث خطأ في إضافة المريض');
    }
  };

  const handleAddAppointment = async () => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAppointment,
          organizationId: organization?.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('تم إضافة الموعد بنجاح');
        setShowAddAppointment(false);
        setNewAppointment({
          patientId: '',
          title: '',
          type: 'consultation',
          scheduledAt: '',
          notes: '',
        });
        fetchDashboardData();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast.error('حدث خطأ في إضافة الموعد');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'critical': return 'bg-red-100 text-red-700';
      case 'discharged': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'critical': return 'حرج';
      case 'discharged': return 'خرج';
      default: return status;
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Quick Stats Cards
  const statCards = [
    { icon: Users, label: 'إجمالي المرضى', value: stats.totalPatients, color: 'text-blue-500', bgColor: 'bg-blue-50', change: '+5%' },
    { icon: Heart, label: 'المرضى النشطين', value: stats.activePatients, color: 'text-green-500', bgColor: 'bg-green-50', change: '+2%' },
    { icon: AlertTriangle, label: 'حالات حرجة', value: stats.criticalPatients, color: 'text-red-500', bgColor: 'bg-red-50', change: '-1%' },
    { icon: Calendar, label: 'مواعيد اليوم', value: stats.todayAppointments, color: 'text-purple-500', bgColor: 'bg-purple-50', change: '+3' },
  ];

  const secondaryStats = [
    { icon: Building2, label: 'الأقسام', value: stats.departments },
    { icon: Stethoscope, label: 'الطاقم الطبي', value: stats.staff },
    { icon: Bell, label: 'تنبيهات جديدة', value: stats.alerts },
    { icon: Pill, label: 'أدوية معلقة', value: stats.pendingMedications },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {organization?.name || 'لوحة تحكم المستشفى'}
                </h1>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  {organization?.type === 'hospital' ? 'مستشفى' : organization?.type === 'clinic' ? 'عيادة' : 'رعاية شخصية'}
                  <span className="mx-2">•</span>
                  <span className="text-green-600">{user.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4 py-2">
                <span className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse" />
                متصل
              </Badge>
              <Button onClick={fetchDashboardData} variant="ghost" size="sm" className="rounded-full">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={onManagement} variant="outline" className="rounded-xl">
                <Settings className="w-5 h-5 ml-1" />
                الإعدادات
              </Button>
              <Button onClick={onBack} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                <Home className="w-5 h-5 ml-1" />
                الرئيسية
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${stat.bgColor} border-0 hover:shadow-lg transition-shadow`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <TrendingUp className="w-3 h-3 inline ml-1" />
                        {stat.change} هذا الأسبوع
                      </p>
                    </div>
                    <stat.icon className={`w-10 h-10 ${stat.color} opacity-30`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {secondaryStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Card className="bg-white border border-gray-100 hover:shadow-md transition-shadow">
                <CardContent className="py-4 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <stat.icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{stat.label}</span>
                    </div>
                    <span className="font-bold text-gray-800">{stat.value}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white rounded-xl p-1 shadow-sm flex flex-wrap gap-1">
            <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
            <TabsTrigger value="patients" className="rounded-lg">المرضى</TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-lg">المواعيد</TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg">التنبيهات</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg">التحليلات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Health Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    اتجاهات الصحة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={healthTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey="heartRate" stroke="#ef4444" fill="#fecaca" name="نبض القلب" />
                      <Area type="monotone" dataKey="bloodSugar" stroke="#8b5cf6" fill="#ddd6fe" name="سكر الدم" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-500" />
                    آخر التنبيهات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>لا توجد تنبيهات</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {alerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className={`p-3 rounded-xl border ${getSeverityColor(alert.severity)}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{alert.title}</p>
                              <p className="text-sm opacity-70">{alert.message}</p>
                            </div>
                            <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                              {alert.severity === 'critical' ? 'حرج' : alert.severity === 'high' ? 'عالي' : 'متوسط'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-purple-500" />
                    إجراءات سريعة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => setShowAddPatient(true)} className="h-20 flex flex-col gap-1 bg-blue-500 hover:bg-blue-600">
                      <UserPlus className="w-6 h-6" />
                      إضافة مريض
                    </Button>
                    <Button onClick={() => setShowAddAppointment(true)} variant="outline" className="h-20 flex flex-col gap-1">
                      <Calendar className="w-6 h-6" />
                      موعد جديد
                    </Button>
                    <Button onClick={onManagement} variant="outline" className="h-20 flex flex-col gap-1">
                      <Pill className="w-6 h-6" />
                      إدارة الأدوية
                    </Button>
                    <Button onClick={onManagement} variant="outline" className="h-20 flex flex-col gap-1">
                      <FileText className="w-6 h-6" />
                      التقارير
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    مواعيد اليوم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>لا توجد مواعيد اليوم</p>
                      <Button onClick={() => setShowAddAppointment(true)} variant="outline" className="mt-3">
                        إضافة موعد
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {appointments.slice(0, 5).map((appt) => (
                        <div key={appt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium">{appt.title}</p>
                            <p className="text-sm text-gray-500">
                              {appt.patient?.name} • {new Date(appt.scheduledAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <Badge className={getAppointmentStatusColor(appt.status)}>
                            {appt.status === 'scheduled' ? 'مجدول' : appt.status === 'confirmed' ? 'مؤكد' : appt.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    قائمة المرضى
                  </CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input placeholder="بحث..." className="pr-9 w-48" />
                    </div>
                    <Button onClick={() => setShowAddPatient(true)} className="bg-blue-500 hover:bg-blue-600">
                      <Plus className="w-4 h-4 ml-1" />
                      إضافة مريض
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {patients.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">لا يوجد مرضى مسجلين</p>
                    <p className="text-sm mt-2">قم بإضافة مرضى من خلال لوحة الإدارة</p>
                    <Button onClick={() => setShowAddPatient(true)} className="mt-4 bg-blue-500 hover:bg-blue-600">
                      إضافة مريض
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {patients.map((patient, index) => (
                      <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold">{patient.name}</h3>
                            <p className="text-sm text-gray-500">
                              {patient.roomNumber ? `غرفة ${patient.roomNumber}` : 'غير محدد'}
                              {patient.bedNumber && ` - سرير ${patient.bedNumber}`}
                              {patient.medicalConditions && ` • ${patient.medicalConditions}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(patient.status)}>
                            {getStatusLabel(patient.status)}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Activity className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    المواعيد
                  </CardTitle>
                  <Button onClick={() => setShowAddAppointment(true)} className="bg-green-500 hover:bg-green-600">
                    <Plus className="w-4 h-4 ml-1" />
                    موعد جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">لا توجد مواعيد</p>
                    <Button onClick={() => setShowAddAppointment(true)} className="mt-4 bg-green-500 hover:bg-green-600">
                      إضافة موعد
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {appointments.map((appt) => (
                      <div key={appt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold">{appt.title}</h3>
                            <p className="text-sm text-gray-500">
                              {appt.patient?.name || 'مريض غير محدد'}
                              {' • '}
                              {new Date(appt.scheduledAt).toLocaleString('ar-SA')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getAppointmentStatusColor(appt.status)}>
                            {appt.status === 'scheduled' ? 'مجدول' : appt.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  التنبيهات والإنذارات
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">لا توجد تنبيهات</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold">{alert.title}</h3>
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity === 'critical' ? 'حرج' : alert.severity === 'high' ? 'عالي' : 'متوسط'}
                          </Badge>
                        </div>
                        <p className="text-sm opacity-70">{alert.message}</p>
                        <p className="text-xs mt-2 opacity-50">
                          {new Date(alert.createdAt).toLocaleString('ar-SA')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-500" />
                    توزيع المرضى
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">المرضى النشطين</span>
                        <span className="font-bold">{stats.activePatients}</span>
                      </div>
                      <Progress value={(stats.activePatients / Math.max(stats.totalPatients, 1)) * 100} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">حالات حرجة</span>
                        <span className="font-bold">{stats.criticalPatients}</span>
                      </div>
                      <Progress value={(stats.criticalPatients / Math.max(stats.totalPatients, 1)) * 100} className="h-3 bg-red-100" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">خرجوا من المستشفى</span>
                        <span className="font-bold">{stats.dischargedPatients}</span>
                      </div>
                      <Progress value={(stats.dischargedPatients / Math.max(stats.totalPatients, 1)) * 100} className="h-3 bg-gray-100" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Health Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    اتجاهات الأسبوع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={healthTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="heartRate" fill="#ef4444" name="نبض" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="bloodPressure" fill="#3b82f6" name="ضغط" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Patient Dialog */}
      <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة مريض جديد</DialogTitle>
            <DialogDescription>أدخل بيانات المريض</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الاسم الكامل *</Label>
                <Input
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="اسم المريض"
                />
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <Input
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الجنس</Label>
                <Select value={newPatient.gender} onValueChange={(v) => setNewPatient({ ...newPatient, gender: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>فصيلة الدم</Label>
                <Select value={newPatient.bloodType} onValueChange={(v) => setNewPatient({ ...newPatient, bloodType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>نوع المريض</Label>
              <Select value={newPatient.patientType} onValueChange={(v) => setNewPatient({ ...newPatient, patientType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inpatient">مقيم</SelectItem>
                  <SelectItem value="outpatient">خارجي</SelectItem>
                  <SelectItem value="home_care">رعاية منزلية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>رقم الغرفة</Label>
                <Input
                  value={newPatient.roomNumber}
                  onChange={(e) => setNewPatient({ ...newPatient, roomNumber: e.target.value })}
                  placeholder="مثال: 101"
                />
              </div>
              <div>
                <Label>رقم السرير</Label>
                <Input
                  value={newPatient.bedNumber}
                  onChange={(e) => setNewPatient({ ...newPatient, bedNumber: e.target.value })}
                  placeholder="مثال: A"
                />
              </div>
            </div>
            <div>
              <Label>الحالات المرضية</Label>
              <Input
                value={newPatient.medicalConditions}
                onChange={(e) => setNewPatient({ ...newPatient, medicalConditions: e.target.value })}
                placeholder="مثال: ضغط، سكري"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddPatient(false)}>إلغاء</Button>
            <Button onClick={handleAddPatient} className="bg-blue-500 hover:bg-blue-600">
              إضافة المريض
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Appointment Dialog */}
      <Dialog open={showAddAppointment} onOpenChange={setShowAddAppointment}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة موعد جديد</DialogTitle>
            <DialogDescription>حدد تفاصيل الموعد</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>المريض</Label>
              <Select value={newAppointment.patientId} onValueChange={(v) => setNewAppointment({ ...newAppointment, patientId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المريض" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>عنوان الموعد *</Label>
              <Input
                value={newAppointment.title}
                onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                placeholder="مثال: كشف دوري"
              />
            </div>
            <div>
              <Label>نوع الموعد</Label>
              <Select value={newAppointment.type} onValueChange={(v) => setNewAppointment({ ...newAppointment, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">استشارة</SelectItem>
                  <SelectItem value="followup">متابعة</SelectItem>
                  <SelectItem value="checkup">فحص دوري</SelectItem>
                  <SelectItem value="emergency">طوارئ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>التاريخ والوقت *</Label>
              <Input
                type="datetime-local"
                value={newAppointment.scheduledAt}
                onChange={(e) => setNewAppointment({ ...newAppointment, scheduledAt: e.target.value })}
              />
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Input
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                placeholder="ملاحظات إضافية..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddAppointment(false)}>إلغاء</Button>
            <Button onClick={handleAddAppointment} className="bg-green-500 hover:bg-green-600">
              إضافة الموعد
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
