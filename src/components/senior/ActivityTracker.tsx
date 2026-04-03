'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Footprints, Timer, Flame, MapPin, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityStats {
  totalSteps: number;
  totalActiveMinutes: number;
  lastActivity: string | null;
}

interface ActivityTrackerProps {
  patientId?: string;
}

export function ActivityTracker({ patientId }: ActivityTrackerProps) {
  const [stats, setStats] = useState<ActivityStats>({
    totalSteps: 0,
    totalActiveMinutes: 0,
    lastActivity: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
    const interval = setInterval(fetchActivityData, 300000);
    return () => clearInterval(interval);
  }, [patientId]);

  const fetchActivityData = async () => {
    try {
      const response = await fetch('/api/activity?days=1');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats || { totalSteps: 0, totalActiveMinutes: 0, lastActivity: null });
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dailyStepGoal = 5000;
  const stepProgress = Math.min((stats.totalSteps / dailyStepGoal) * 100, 100);
  const calories = Math.round(stats.totalSteps * 0.04);

  const activityItems = [
    {
      icon: Footprints,
      label: 'الخطوات',
      value: stats.totalSteps.toLocaleString('ar-SA'),
      goal: dailyStepGoal.toLocaleString('ar-SA'),
      progress: stepProgress,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      barColor: 'bg-blue-500',
    },
    {
      icon: Timer,
      label: 'دقائق نشاط',
      value: stats.totalActiveMinutes.toString(),
      goal: '60',
      progress: Math.min((stats.totalActiveMinutes / 60) * 100, 100),
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      barColor: 'bg-green-500',
    },
    {
      icon: Flame,
      label: 'سعرات حرارية',
      value: calories.toString(),
      goal: '300',
      progress: Math.min((calories / 300) * 100, 100),
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      barColor: 'bg-orange-500',
    },
  ];

  return (
    <Card className="bg-white/90 backdrop-blur shadow-sm border border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          النشاط اليومي
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {activityItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${item.bgColor} rounded-xl p-3`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">{item.label}</span>
                  </div>
                  <div className="text-left">
                    <span className={`text-xl font-bold ${item.color}`}>{item.value}</span>
                    <span className="text-gray-500 text-xs"> / {item.goal}</span>
                  </div>
                </div>
                <div className="relative h-2 bg-white/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    className={`absolute inset-y-0 left-0 ${item.barColor} rounded-full`}
                  />
                </div>
              </motion.div>
            ))}

            {stats.lastActivity && (
              <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mt-3 bg-gray-50 rounded-xl p-2">
                <MapPin className="w-3 h-3" />
                <span>آخر نشاط: {new Date(stats.lastActivity).toLocaleTimeString('ar-SA')}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
