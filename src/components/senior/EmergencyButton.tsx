'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergencyButtonProps {
  patientId?: string;
}

export function EmergencyButton({ patientId }: EmergencyButtonProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  const [contacts, setContacts] = useState<Array<{ name: string; phone: string; isPrimary: boolean }>>([]);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasActivated = useRef(false);

  const fetchContacts = useCallback(async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([{ name: 'الطوارئ', phone: '911', isPrimary: true }]);
    }
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    hasActivated.current = false;
  }, []);

  const handleEmergencyActivation = useCallback(async () => {
    if (hasActivated.current) return;
    hasActivated.current = true;
    setIsActivated(true);

    try {
      await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'emergency',
          patientId,
          contacts: contacts.filter((c) => c.isPrimary),
        }),
      });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
    }
  }, [contacts, patientId]);

  const handleEmergencyPress = useCallback(async () => {
    await fetchContacts();
    let count = 5;
    setCountdown(count);
    hasActivated.current = false;

    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearCountdown();
        handleEmergencyActivation();
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, [clearCountdown, handleEmergencyActivation, fetchContacts]);

  const handleCancel = useCallback(() => {
    clearCountdown();
    setIsActivated(false);
  }, [clearCountdown]);

  const primaryContacts = contacts.filter((c) => c.isPrimary);

  return (
    <>
      <AnimatePresence>
        {isActivated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-500/10 z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="relative">
        {countdown !== null ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 text-center text-white shadow-2xl"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-6xl font-bold mb-4"
            >
              {countdown}
            </motion.div>
            <p className="text-lg mb-4">سيتم إرسال تنبيه الطوارئ...</p>
            <Button
              onClick={handleCancel}
              variant="secondary"
              size="lg"
              className="bg-white text-red-600 hover:bg-gray-100 text-lg px-6 py-5 rounded-2xl"
            >
              <X className="w-5 h-5 ml-2" />
              إلغاء
            </Button>
          </motion.div>
        ) : isActivated ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 text-center text-white shadow-2xl"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
            </motion.div>
            <p className="text-xl font-bold mb-2">تم إرسال تنبيه الطوارئ!</p>
            <p className="text-base mb-4 opacity-90">جاري الاتصال بجهات الاتصال...</p>
            
            {primaryContacts.length > 0 && (
              <div className="space-y-2 mb-4">
                {primaryContacts.map((contact, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-center gap-2 bg-white/20 rounded-xl p-3"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    >
                      <Phone className="w-5 h-5" />
                    </motion.div>
                    <span className="text-base">{contact.name}</span>
                  </motion.div>
                ))}
              </div>
            )}

            <Button
              onClick={handleCancel}
              variant="secondary"
              size="lg"
              className="bg-white text-red-600 hover:bg-gray-100 text-lg px-6 py-5 rounded-2xl"
            >
              <X className="w-5 h-5 ml-2" />
              إنهاء الطوارئ
            </Button>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEmergencyPress}
            className="w-full emergency-button senior-button-large text-white rounded-3xl flex flex-col items-center justify-center gap-2 shadow-2xl relative overflow-hidden"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <AlertTriangle className="w-14 h-14" />
            </motion.div>
            <span className="text-xl font-bold">🚨 طوارئ</span>
            <span className="text-base opacity-90">اضغط للاتصال الفوري</span>
          </motion.button>
        )}
      </div>
    </>
  );
}
