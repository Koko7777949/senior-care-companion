'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, Clock, Check, Bell, Volume2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string;
  color: string;
  instructions: string | null;
  nextTime?: string;
  taken?: boolean;
}

interface MedicationReminderProps {
  patientId?: string;
}

export function MedicationReminder({ patientId }: MedicationReminderProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMed, setExpandedMed] = useState<string | null>(null);

  useEffect(() => {
    fetchMedications();
    const interval = setInterval(fetchMedications, 60000);
    return () => clearInterval(interval);
  }, [patientId]);

  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/medications');
      const data = await response.json();
      if (data.success) {
        setMedications(data.medications || []);
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeMedication = async (medicationId: string) => {
    try {
      await fetch('/api/medications/take', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicationId, patientId }),
      });
      setMedications(meds => meds.map(m => {
        if (m.id === medicationId) return { ...m, taken: true };
        return m;
      }));
    } catch (error) {
      console.error('Error recording medication:', error);
    }
  };

  const handleSpeak = (name: string, dosage: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`حان وقت تناول دواء ${name}، الجرعة ${dosage}`);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const upcomingMedications = medications.filter((m) => !m.taken);
  const takenMedications = medications.filter((m) => m.taken);

  return (
    <Card className="bg-white/90 backdrop-blur shadow-sm border border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Pill className="w-5 h-5 text-amber-500" />
          الأدوية اليومية
          {upcomingMedications.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-sm px-2 py-1 rounded-full">
              {upcomingMedications.length} متبقي
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Pill className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-base">لا توجد أدوية مسجلة</p>
            <p className="text-sm mt-1">يمكنك إضافة أدوية من قسم الإدارة</p>
          </div>
        ) : upcomingMedications.length === 0 ? (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-green-500" />
            </motion.div>
            <p className="text-lg text-gray-600 font-medium">تم تناول جميع الأدوية!</p>
            <p className="text-gray-500">أحسنت! 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingMedications.map((medication, index) => (
              <motion.div
                key={medication.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-xl overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setExpandedMed(expandedMed === medication.id ? null : medication.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: (medication.color || '#3b82f6') + '20' }}
                    >
                      <Pill className="w-6 h-6" style={{ color: medication.color || '#3b82f6' }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{medication.name}</h3>
                      <p className="text-gray-500 text-sm">{medication.dosage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-white px-3 py-2 rounded-xl">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{medication.nextTime || '--:--'}</span>
                  </div>
                </div>

                {expandedMed === medication.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-gray-200 bg-white p-3"
                  >
                    {medication.instructions && (
                      <p className="text-gray-600 text-sm mb-3 bg-amber-50 p-2 rounded-lg">
                        📝 {medication.instructions}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleTakeMedication(medication.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                      >
                        <Check className="w-4 h-4 ml-1" />
                        تم التناول
                      </Button>
                      <Button
                        onClick={() => handleSpeak(medication.name, medication.dosage)}
                        variant="outline"
                        className="rounded-lg"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {takenMedications.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">✅ الأدوية المتناولة:</p>
            <div className="flex flex-wrap gap-1">
              {takenMedications.map((med) => (
                <span key={med.id} className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                  <Check className="w-3 h-3" />
                  {med.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
