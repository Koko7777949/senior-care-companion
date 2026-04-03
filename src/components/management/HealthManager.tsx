'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart, Activity, Droplets, Thermometer, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HealthReading {
  id: string;
  type: string;
  value: string;
  value2: string | null;
  unit: string | null;
  isAbnormal: boolean;
  timestamp: Date;
}

export function HealthManager() {
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: 'heart_rate',
    value: '',
    value2: '',
  });

  const typeOptions = [
    { value: 'heart_rate', label: 'نبض القلب', icon: Heart, unit: 'نبضة/دقيقة', color: 'text-red-500', bg: 'bg-red-50', normalRange: '60-100' },
    { value: 'blood_pressure', label: 'ضغط الدم', icon: Activity, unit: 'مم زئبق', color: 'text-blue-500', bg: 'bg-blue-50', normalRange: '120/80' },
    { value: 'blood_sugar', label: 'سكر الدم', icon: Droplets, unit: 'مجم/ديسيلتر', color: 'text-purple-500', bg: 'bg-purple-50', normalRange: '70-140' },
    { value: 'oxygen_level', label: 'الأكسجين', icon: Thermometer, unit: '%', color: 'text-teal-500', bg: 'bg-teal-50', normalRange: '95-100' },
  ];

  useEffect(() => {
    fetchReadings();
  }, []);

  const fetchReadings = async () => {
    try {
      const response = await fetch('/api/health?limit=10');
      const data = await response.json();
      if (data.success) {
        setReadings(data.readings);
      }
    } catch (error) {
      console.error('Error fetching readings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      type: 'heart_rate',
      value: '',
      value2: '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSave = async () => {
    if (!formData.value) {
      alert('القيمة مطلوبة');
      return;
    }

    if (formData.type === 'blood_pressure' && !formData.value2) {
      alert('قيمة الضغط الانبساطي مطلوبة');
      return;
    }

    setIsSaving(true);
    try {
      const typeInfo = typeOptions.find((t) => t.value === formData.type);
      const response = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          value: formData.value,
          value2: formData.type === 'blood_pressure' ? formData.value2 : null,
          unit: typeInfo?.unit,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchReadings();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving reading:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getTypeInfo = (type: string) => {
    return typeOptions.find((t) => t.value === type) || typeOptions[0];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group readings by type and get latest of each
  const latestReadings = typeOptions.map((type) => {
    const latest = readings.find((r) => r.type === type.value);
    return { ...type, reading: latest };
  });

  return (
    <Card className="senior-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            القراءات الصحية
          </CardTitle>
          <Button
            onClick={handleOpenDialog}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Plus className="w-5 h-5 ml-1" />
            إضافة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : (
          <>
            {/* Latest Readings Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {latestReadings.map((item) => (
                <motion.div
                  key={item.value}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`${item.bg} rounded-xl p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                    {item.reading && (
                      item.reading.isAbnormal ? (
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      )
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className={`text-xl font-bold ${item.color}`}>
                    {item.reading ? (
                      item.reading.value2 ? (
                        `${item.reading.value}/${item.reading.value2}`
                      ) : (
                        item.reading.value
                      )
                    ) : (
                      '--'
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    الطبيعي: {item.normalRange} {item.unit}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Recent Readings List */}
            {readings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">آخر القراءات</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {readings.slice(0, 5).map((reading) => {
                    const typeInfo = getTypeInfo(reading.type);
                    return (
                      <div
                        key={reading.id}
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          reading.isAbnormal ? 'bg-amber-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <typeInfo.icon className={`w-5 h-5 ${typeInfo.color}`} />
                          <div>
                            <p className="font-medium">
                              {reading.value2 ? `${reading.value}/${reading.value2}` : reading.value}
                              {' '}{reading.unit}
                            </p>
                            <p className="text-xs text-gray-500">{typeInfo.label}</p>
                          </div>
                        </div>
                        <div className="text-left text-sm text-gray-500">
                          <p>{formatDate(reading.timestamp)}</p>
                          <p>{formatTime(reading.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة قراءة صحية جديدة</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>نوع القراءة</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value, value: '', value2: '' })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'blood_pressure' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">الانقباضي (العالي)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="120"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="value2">الانبساطي (المنخفض)</Label>
                  <Input
                    id="value2"
                    type="number"
                    value={formData.value2}
                    onChange={(e) => setFormData({ ...formData, value2: e.target.value })}
                    placeholder="80"
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="value">
                  القيمة ({typeOptions.find(t => t.value === formData.type)?.unit})
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={
                    formData.type === 'heart_rate' ? '72' :
                    formData.type === 'blood_sugar' ? '110' :
                    '98'
                  }
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  المعدل الطبيعي: {typeOptions.find(t => t.value === formData.type)?.normalRange}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin ml-1" />
              ) : (
                'حفظ'
              )}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
