'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Droplets, Thermometer, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HealthReading {
  type: string;
  value: string;
  value2: string | null;
  isAbnormal: boolean;
  timestamp: Date;
}

export function HealthStatusCard() {
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
    // تحديث كل دقيقة
    const interval = setInterval(fetchHealthData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health?limit=10');
      const data = await response.json();
      if (data.success) {
        setReadings(data.readings);
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestReading = (type: string) => {
    return readings.find(r => r.type === type);
  };

  const healthItems = [
    {
      icon: Heart,
      label: 'نبض القلب',
      getValue: () => {
        const r = getLatestReading('heart_rate');
        return r ? `${r.value} نبضة` : '--';
      },
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      status: () => {
        const r = getLatestReading('heart_rate');
        return r?.isAbnormal ? 'warning' : 'good';
      },
    },
    {
      icon: Activity,
      label: 'ضغط الدم',
      getValue: () => {
        const r = getLatestReading('blood_pressure');
        return r ? `${r.value}/${r.value2 || '--'}` : '--/--';
      },
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      status: () => 'good',
    },
    {
      icon: Droplets,
      label: 'سكر الدم',
      getValue: () => {
        const r = getLatestReading('blood_sugar');
        return r ? `${r.value} مجم` : '--';
      },
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      status: () => {
        const r = getLatestReading('blood_sugar');
        return r?.isAbnormal ? 'warning' : 'good';
      },
    },
    {
      icon: Thermometer,
      label: 'الأكسجين',
      getValue: () => {
        const r = getLatestReading('oxygen_level');
        return r ? `${r.value}%` : '--';
      },
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
      status: () => {
        const r = getLatestReading('oxygen_level');
        return r?.isAbnormal ? 'warning' : 'good';
      },
    },
  ];

  const lastReading = readings[0];

  return (
    <Card className="senior-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500" />
          حالة الصحة
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : readings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p>لا توجد قراءات صحية مسجلة</p>
            <p className="text-sm mt-2">يمكنك إضافة قراءات من قسم الإدارة</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {healthItems.map((item, index) => {
                const status = item.status();
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${item.bgColor} rounded-2xl p-4 relative overflow-hidden`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <item.icon className={`w-8 h-8 ${item.color}`} />
                      {status === 'warning' ? (
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                    <p className={`text-xl font-bold ${item.color}`}>{item.getValue()}</p>
                    {status === 'warning' && (
                      <p className="text-xs text-amber-600 mt-1">⚠️ غير طبيعي</p>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {lastReading && (
              <p className="text-sm text-gray-500 mt-4 text-center bg-gray-50 rounded-xl p-2">
                آخر تحديث: {new Date(lastReading.timestamp).toLocaleTimeString('ar-SA')}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
