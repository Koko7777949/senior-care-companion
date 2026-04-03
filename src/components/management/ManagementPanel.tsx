'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Pill, User, Calendar, Heart, Settings, ArrowRight, Database, 
  Users, Building2, Activity, Plus, Search, Filter, MoreVertical,
  Bell, Shield, Globe, Moon, Sun, Volume2, Phone, Mail, Lock,
  Trash2, Edit, Eye, EyeOff, Save, RefreshCw, Download, Upload
} from 'lucide-react';
import { MedicationManager } from './MedicationManager';
import { ContactManager } from './ContactManager';
import { ReminderManager } from './ReminderManager';
import { HealthManager } from './HealthManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ManagementPanelProps {
  onBack: () => void;
  userRole?: string;
}

type TabType = 'medications' | 'contacts' | 'reminders' | 'health' | 'patients' | 'settings' | 'notifications';

const tabs: { id: TabType; label: string; icon: typeof Pill; roles: string[] }[] = [
  { id: 'patients', label: 'المرضى', icon: Users, roles: ['senior', 'caregiver', 'doctor', 'nurse', 'admin'] },
  { id: 'medications', label: 'الأدوية', icon: Pill, roles: ['senior', 'caregiver', 'doctor', 'nurse', 'admin'] },
  { id: 'contacts', label: 'جهات الاتصال', icon: User, roles: ['senior', 'caregiver', 'admin'] },
  { id: 'reminders', label: 'التذكيرات', icon: Calendar, roles: ['senior', 'caregiver', 'admin'] },
  { id: 'health', label: 'الصحة', icon: Heart, roles: ['senior', 'caregiver', 'doctor', 'nurse', 'admin'] },
  { id: 'notifications', label: 'التنبيهات', icon: Bell, roles: ['senior', 'caregiver', 'doctor', 'nurse', 'admin'] },
  { id: 'settings', label: 'الإعدادات', icon: Settings, roles: ['senior', 'caregiver', 'admin'] },
];

export function ManagementPanel({ onBack, userRole = 'senior' }: ManagementPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('patients');

  const filteredTabs = tabs.filter(tab => tab.roles.includes(userRole));

  const renderContent = () => {
    switch (activeTab) {
      case 'medications':
        return <MedicationManager />;
      case 'contacts':
        return <ContactManager />;
      case 'reminders':
        return <ReminderManager />;
      case 'health':
        return <HealthManager />;
      case 'patients':
        return <PatientManager />;
      case 'notifications':
        return <NotificationCenter />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <PatientManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" dir="rtl">
      <header className="bg-white/80 backdrop-blur-lg border-b border-amber-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-purple-800">إدارة البيانات</h1>
                <p className="text-sm text-gray-500">تنظيم وإدارة جميع المعلومات</p>
              </div>
            </div>
            <Button onClick={onBack} variant="outline" className="rounded-full px-6">
              <ArrowRight className="w-5 h-5 ml-2" />
              العودة
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {filteredTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-purple-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
}

// Patient Manager Component
function PatientManager() {
  const [patients, setPatients] = useState<Array<{
    id: string;
    name: string;
    status: string;
    roomNumber?: string;
    bedNumber?: string;
    medicalConditions?: string;
    phone?: string;
    gender?: string;
    bloodType?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
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

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/patients');
      const data = await response.json();
      if (data.success) {
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = async () => {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('تم إضافة المريض بنجاح');
        setShowAddDialog(false);
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
        fetchPatients();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error('حدث خطأ في إضافة المريض');
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المريض؟')) return;
    
    try {
      const response = await fetch(`/api/patients?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('تم حذف المريض');
        fetchPatients();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('حدث خطأ في حذف المريض');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.medicalConditions?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-500" />
          إدارة المرضى
        </h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث..."
              className="pr-9 w-48"
            />
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-purple-500 hover:bg-purple-600 text-white">
            <Plus className="w-4 h-4 ml-1" />
            إضافة مريض
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
          <p className="text-sm text-gray-600">إجمالي المرضى</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{patients.filter(p => p.status === 'active').length}</p>
          <p className="text-sm text-gray-600">نشطين</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{patients.filter(p => p.status === 'critical').length}</p>
          <p className="text-sm text-gray-600">حالات حرجة</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{patients.filter(p => p.status === 'discharged').length}</p>
          <p className="text-sm text-gray-600">خرجوا</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Activity className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>لا يوجد مرضى مسجلين</p>
          <p className="text-sm mt-2">أضف مرضى جدد للبدء</p>
          <Button onClick={() => setShowAddDialog(true)} className="mt-4 bg-purple-500 hover:bg-purple-600">
            إضافة مريض
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredPatients.map((patient) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold">{patient.name}</h3>
                    <p className="text-sm text-gray-500">
                      {patient.roomNumber ? `غرفة ${patient.roomNumber}` : ''}
                      {patient.bedNumber && ` - سرير ${patient.bedNumber}`}
                      {patient.medicalConditions && ` • ${patient.medicalConditions}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    patient.status === 'active' ? 'bg-green-100 text-green-700' :
                    patient.status === 'critical' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {patient.status === 'active' ? 'نشط' : patient.status === 'critical' ? 'حرج' : patient.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePatient(patient.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Patient Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleAddPatient} className="bg-purple-500 hover:bg-purple-600">
              إضافة المريض
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Notification Center Component
function NotificationCenter() {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    message: string;
    createdAt: string;
    isRead?: boolean;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      });
      setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      for (const alert of alerts.filter(a => !a.isRead)) {
        await markAsRead(alert.id);
      }
      toast.success('تم تحديد جميع التنبيهات كمقروءة');
    } catch (error) {
      console.error('Error marking all as read:', error);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return '🚨';
      case 'medication': return '💊';
      case 'appointment': return '📅';
      case 'health': return '❤️';
      default: return '🔔';
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unread') return !a.isRead;
    if (filter === 'critical') return a.severity === 'critical';
    return true;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-500" />
          مركز التنبيهات
        </h2>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="unread">غير مقروءة</SelectItem>
              <SelectItem value="critical">حرجة</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            تحديد الكل كمقروء
          </Button>
          <Button onClick={fetchAlerts} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{alerts.length}</p>
          <p className="text-sm text-gray-600">إجمالي التنبيهات</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{alerts.filter(a => !a.isRead).length}</p>
          <p className="text-sm text-gray-600">غير مقروءة</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{alerts.filter(a => a.severity === 'critical').length}</p>
          <p className="text-sm text-gray-600">حرجة</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Activity className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>لا توجد تنبيهات</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)} ${alert.isRead ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                  <div>
                    <h3 className="font-bold">{alert.title}</h3>
                    <p className="text-sm opacity-70">{alert.message}</p>
                    <p className="text-xs mt-2 opacity-50">
                      {new Date(alert.createdAt).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!alert.isRead && (
                    <Button onClick={() => markAsRead(alert.id)} variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                    {alert.severity === 'critical' ? 'حرج' : alert.severity === 'high' ? 'عالي' : 'متوسط'}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Settings Panel Component
function SettingsPanel() {
  const [settings, setSettings] = useState({
    language: 'ar',
    theme: 'light',
    voiceEnabled: true,
    notificationsEnabled: true,
    emergencySms: true,
    emailAlerts: true,
    autoBackup: true,
    dataRetention: '90',
  });

  const handleSave = () => {
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            المظهر واللغة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>اللغة</Label>
              <p className="text-sm text-gray-500">اختر لغة الواجهة</p>
            </div>
            <Select value={settings.language} onValueChange={(v) => setSettings({ ...settings, language: v })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>المظهر</Label>
              <p className="text-sm text-gray-500">اختر مظهر التطبيق</p>
            </div>
            <Select value={settings.theme} onValueChange={(v) => setSettings({ ...settings, theme: v })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">فاتح</SelectItem>
                <SelectItem value="dark">داكن</SelectItem>
                <SelectItem value="system">تلقائي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>الإشعارات</Label>
              <p className="text-sm text-gray-500">تفعيل الإشعارات العامة</p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(v) => setSettings({ ...settings, notificationsEnabled: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>رسائل الطوارئ SMS</Label>
              <p className="text-sm text-gray-500">إرسال رسائل نصية في حالات الطوارئ</p>
            </div>
            <Switch
              checked={settings.emergencySms}
              onCheckedChange={(v) => setSettings({ ...settings, emergencySms: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>تنبيهات البريد الإلكتروني</Label>
              <p className="text-sm text-gray-500">استلام التنبيهات عبر البريد</p>
            </div>
            <Switch
              checked={settings.emailAlerts}
              onCheckedChange={(v) => setSettings({ ...settings, emailAlerts: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Voice & Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-green-500" />
            الصوت وإمكانية الوصول
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>المساعد الصوتي</Label>
              <p className="text-sm text-gray-500">تفعيل الأوامر والردود الصوتية</p>
            </div>
            <Switch
              checked={settings.voiceEnabled}
              onCheckedChange={(v) => setSettings({ ...settings, voiceEnabled: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            البيانات والخصوصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>النسخ الاحتياطي التلقائي</Label>
              <p className="text-sm text-gray-500">نسخ احتياطي يومي للبيانات</p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(v) => setSettings({ ...settings, autoBackup: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>فترة الاحتفاظ بالبيانات</Label>
              <p className="text-sm text-gray-500">مدة الاحتفاظ بالسجلات</p>
            </div>
            <Select value={settings.dataRetention} onValueChange={(v) => setSettings({ ...settings, dataRetention: v })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 يوم</SelectItem>
                <SelectItem value="60">60 يوم</SelectItem>
                <SelectItem value="90">90 يوم</SelectItem>
                <SelectItem value="180">180 يوم</SelectItem>
                <SelectItem value="365">سنة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          تصدير البيانات
        </Button>
        <Button onClick={handleSave} className="bg-purple-500 hover:bg-purple-600 gap-2">
          <Save className="w-4 h-4" />
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
}
