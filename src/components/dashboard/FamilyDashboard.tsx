'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Activity,
  Pill,
  MapPin,
  Bell,
  AlertTriangle,
  Check,
  X,
  Clock,
  TrendingUp,
  Users,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';

export function FamilyDashboard() {
  const { currentUser, healthStatus, medications, activityData, emergencyContacts, alerts } = useAppStore();
  const [selectedTab, setSelectedTab] = useState('overview');

  const healthItems = [
    {
      icon: Heart,
      label: 'نبض القلب',
      value: healthStatus.heartRate ? `${healthStatus.heartRate} نبضة/دقيقة` : '--',
      status: healthStatus.heartRate && healthStatus.heartRate > 100 ? 'warning' : 'normal',
      trend: '+2%',
    },
    {
      icon: Activity,
      label: 'ضغط الدم',
      value: healthStatus.bloodPressure || '--/--',
      status: 'normal',
      trend: 'مستقر',
    },
    {
      icon: Activity,
      label: 'سكر الدم',
      value: healthStatus.bloodSugar ? `${healthStatus.bloodSugar} مجم` : '--',
      status: healthStatus.bloodSugar && healthStatus.bloodSugar > 140 ? 'warning' : 'normal',
      trend: '-5%',
    },
    {
      icon: Heart,
      label: 'الأكسجين',
      value: healthStatus.oxygenLevel ? `${healthStatus.oxygenLevel}%` : '--',
      status: healthStatus.oxygenLevel && healthStatus.oxygenLevel < 95 ? 'warning' : 'normal',
      trend: 'مستقر',
    },
  ];

  const recentAlerts = [
    {
      id: '1',
      type: 'medication',
      title: 'تذكير بالدواء',
      message: 'حان وقت تناول دواء أملوديبين',
      time: 'منذ 10 دقائق',
      isRead: false,
    },
    {
      id: '2',
      type: 'activity',
      title: 'نشاط منخفض',
      message: 'لم يتم اكتشاف حركة لمدة ساعتين',
      time: 'منذ ساعتين',
      isRead: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* الهيدر */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">لوحة تحكم العائلة</h1>
                <p className="text-gray-500 text-sm">مراقبة {currentUser?.name || 'المستخدم'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4 py-2">
                <span className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse" />
                متصل
              </Badge>
              <Button variant="outline" className="rounded-xl">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-white rounded-xl p-1">
            <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
            <TabsTrigger value="health" className="rounded-lg">الصحة</TabsTrigger>
            <TabsTrigger value="medications" className="rounded-lg">الأدوية</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg">النشاط</TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg">التنبيهات</TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* حالة الصحة السريعة */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      حالة الصحة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {healthItems.map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-xl ${
                            item.status === 'warning' ? 'bg-amber-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <item.icon className={`w-5 h-5 ${item.status === 'warning' ? 'text-amber-500' : 'text-gray-600'}`} />
                            <span className={`text-xs ${item.status === 'warning' ? 'text-amber-600' : 'text-green-600'}`}>
                              {item.trend}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{item.label}</p>
                          <p className="text-lg font-bold mt-1">{item.value}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* الموقع */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    الموقع الحالي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-6 text-center">
                    <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">المنزل</p>
                    <p className="text-gray-500 text-sm mt-1">آخر تحديث: منذ 5 دقائق</p>
                  </div>
                  <Button className="w-full mt-4 rounded-xl" variant="outline">
                    عرض الخريطة
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* الأدوية والنشاط */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* الأدوية */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-amber-500" />
                    الأدوية اليومية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {medications.slice(0, 3).map((med) => (
                      <div
                        key={med.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: med.color + '20' }}
                          >
                            <Pill className="w-5 h-5" style={{ color: med.color }} />
                          </div>
                          <div>
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-gray-500">{med.dosage}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{med.nextTime}</span>
                          {med.taken ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4 rounded-xl" variant="outline">
                    عرض جميع الأدوية
                  </Button>
                </CardContent>
              </Card>

              {/* النشاط */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    النشاط اليومي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">الخطوات</span>
                        <span className="font-bold">{activityData.steps.toLocaleString('ar-SA')} / 5,000</span>
                      </div>
                      <Progress value={(activityData.steps / 5000) * 100} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">دقائق النشاط</span>
                        <span className="font-bold">{activityData.activeMinutes} / 60</span>
                      </div>
                      <Progress value={(activityData.activeMinutes / 60) * 100} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">السعرات الحرارية</span>
                        <span className="font-bold">{activityData.calories} / 300</span>
                      </div>
                      <Progress value={(activityData.calories / 300) * 100} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* آخر التنبيهات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-500" />
                  آخر التنبيهات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        alert.isRead ? 'bg-gray-50' : 'bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          alert.type === 'medication' ? 'bg-amber-100' : 'bg-green-100'
                        }`}>
                          {alert.type === 'medication' ? (
                            <Pill className="w-5 h-5 text-amber-600" />
                          ) : (
                            <Activity className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-gray-500">{alert.message}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">{alert.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* الصحة */}
          <TabsContent value="health">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {healthItems.map((item) => (
                <Card key={item.label}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <item.icon className={`w-12 h-12 mx-auto mb-4 ${
                        item.status === 'warning' ? 'text-amber-500' : 'text-blue-500'
                      }`} />
                      <p className="text-gray-600">{item.label}</p>
                      <p className="text-3xl font-bold mt-2">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* الأدوية */}
          <TabsContent value="medications">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between p-4 border rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: med.color + '20' }}
                        >
                          <Pill className="w-6 h-6" style={{ color: med.color }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{med.name}</h3>
                          <p className="text-gray-500">{med.dosage}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">الأوقات: {med.times.join('، ')}</p>
                        <Badge variant={med.taken ? 'default' : 'secondary'}>
                          {med.taken ? 'تم التناول' : 'في الانتظار'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* النشاط */}
          <TabsContent value="activity">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600">الخطوات</p>
                  <p className="text-4xl font-bold mt-2">{activityData.steps.toLocaleString('ar-SA')}</p>
                  <Progress value={(activityData.steps / 5000) * 100} className="h-2 mt-4" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Activity className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">دقائق النشاط</p>
                  <p className="text-4xl font-bold mt-2">{activityData.activeMinutes}</p>
                  <Progress value={(activityData.activeMinutes / 60) * 100} className="h-2 mt-4" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <p className="text-gray-600">السعرات الحرارية</p>
                  <p className="text-4xl font-bold mt-2">{activityData.calories}</p>
                  <Progress value={(activityData.calories / 300) * 100} className="h-2 mt-4" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* التنبيهات */}
          <TabsContent value="alerts">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-4 border rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          alert.type === 'medication' ? 'bg-amber-100' : 'bg-green-100'
                        }`}>
                          {alert.type === 'medication' ? (
                            <Pill className="w-6 h-6 text-amber-600" />
                          ) : (
                            <Activity className="w-6 h-6 text-green-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold">{alert.title}</h3>
                          <p className="text-gray-500">{alert.message}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-gray-400">{alert.time}</p>
                        <Badge variant={alert.isRead ? 'secondary' : 'default'}>
                          {alert.isRead ? 'مقروء' : 'جديد'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
