'use client';

import { motion } from 'framer-motion';
import { Bell, Calendar, Settings, Moon, Sun, Database, Plus } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onVoiceAssistant: () => void;
  onViewDashboard: () => void;
  onManageData: () => void;
}

export function QuickActions({ onVoiceAssistant, onViewDashboard, onManageData }: QuickActionsProps) {
  const { theme, setTheme } = useTheme();

  const actions = [
    {
      icon: Plus,
      label: 'إضافة بيانات',
      color: 'bg-purple-500',
      onClick: onManageData,
    },
    {
      icon: Database,
      label: 'لوحة التحكم',
      color: 'bg-blue-500',
      onClick: onViewDashboard,
    },
    {
      icon: theme === 'dark' ? Sun : Moon,
      label: theme === 'dark' ? 'فاتح' : 'داكن',
      color: 'bg-gray-600',
      onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    {
      icon: Settings,
      label: 'الإعدادات',
      color: 'bg-gray-500',
      onClick: onManageData,
    },
  ];

  return (
    <Card className="senior-card">
      <CardContent className="pt-6">
        <div className="flex flex-wrap justify-center gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                onClick={action.onClick}
                className={`${action.color} hover:opacity-90 text-white flex flex-col items-center gap-2 h-auto py-4 px-6 rounded-2xl`}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-sm">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Card component inline to avoid import issues
function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className || ''}`}>
      {children}
    </div>
  );
}

function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`p-4 ${className || ''}`}>{children}</div>;
}
