'use client';

import { motion } from 'framer-motion';
import { Mic, LayoutDashboard, User, Clock } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onVoiceAssistant: () => void;
  onToggleView: () => void;
}

export function Header({ onVoiceAssistant, onToggleView }: HeaderProps) {
  const { currentUser, currentView } = useAppStore();

  const currentTime = new Date().toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const currentDate = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-lg border-b border-amber-100 sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* معلومات المستخدم */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {currentUser?.name?.charAt(0) || 'أ'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {getGreeting()}، {currentUser?.name || 'المستخدم'}
              </h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>{currentTime}</span>
                <span className="mx-1">•</span>
                <span>{currentDate}</span>
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-3">
            <Button
              onClick={onVoiceAssistant}
              className="senior-button bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-full px-6"
            >
              <Mic className="w-5 h-5 ml-2" />
              المساعد
            </Button>

            <Button
              onClick={onToggleView}
              variant="outline"
              className="senior-button rounded-full px-6"
            >
              <LayoutDashboard className="w-5 h-5 ml-2" />
              {currentView === 'senior' ? 'لوحة التحكم' : 'الرئيسية'}
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
