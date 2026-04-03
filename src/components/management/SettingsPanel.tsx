'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Volume2, Moon, Sun, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';

interface UserData {
  id: string;
  name: string;
  phone: string;
  dateOfBirth: string | null;
  medicalConditions: string | null;
  address: string | null;
  voiceEnabled: boolean;
  seniorMode: boolean;
}

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    medicalConditions: '',
    address: '',
    voiceEnabled: true,
    seniorMode: true,
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          dateOfBirth: data.user.dateOfBirth ? data.user.dateOfBirth.split('T')[0] : '',
          medicalConditions: data.user.medicalConditions || '',
          address: data.user.address || '',
          voiceEnabled: data.user.voiceEnabled ?? true,
          seniorMode: data.user.seniorMode ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id || 'senior-1',
          ...formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        alert('تم حفظ الإعدادات بنجاح');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="senior-card">
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="senior-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-600" />
          الإعدادات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* معلومات المستخدم */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              معلومات المستخدم
            </h4>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">الاسم</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                  dir="ltr"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">تاريخ الميلاد</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="medicalConditions">الحالات الصحية</Label>
                <Input
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  placeholder="مثال: ضغط الدم، السكري"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="المدينة، الحي"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* الإعدادات العامة */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              الإعدادات العامة
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>الوضع الداكن</Label>
                  <p className="text-sm text-gray-500">تفعيل الوضع الداكن للتطبيق</p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <div>
                    <Label>الصوت</Label>
                    <p className="text-sm text-gray-500">تفعيل التعليقات الصوتية</p>
                  </div>
                </div>
                <Switch
                  checked={formData.voiceEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, voiceEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-gray-600" />
                  )}
                  <div>
                    <Label>وضع كبار السن</Label>
                    <p className="text-sm text-gray-500">أزرار كبيرة ونصوص واضحة</p>
                  </div>
                </div>
                <Switch
                  checked={formData.seniorMode}
                  onCheckedChange={(checked) => setFormData({ ...formData, seniorMode: checked })}
                />
              </div>
            </div>
          </div>

          {/* زر الحفظ */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full senior-button bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin ml-2" />
            ) : (
              <Save className="w-5 h-5 ml-2" />
            )}
            حفظ الإعدادات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
