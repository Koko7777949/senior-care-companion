'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Pill, Clock, X, Check, Loader2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string;
  instructions: string | null;
  color: string;
  isActive: boolean;
}

export function MedicationManager() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'مرة يومياً',
    times: ['08:00'],
    instructions: '',
    color: '#3b82f6',
  });

  const colorOptions = [
    { value: '#3b82f6', label: 'أزرق' },
    { value: '#22c55e', label: 'أخضر' },
    { value: '#ef4444', label: 'أحمر' },
    { value: '#f59e0b', label: 'برتقالي' },
    { value: '#8b5cf6', label: 'بنفسجي' },
    { value: '#ec4899', label: 'وردي' },
  ];

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/medications');
      const data = await response.json();
      if (data.success) {
        setMedications(data.medications);
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (medication?: Medication) => {
    if (medication) {
      setEditingMedication(medication);
      setFormData({
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        times: JSON.parse(medication.times),
        instructions: medication.instructions || '',
        color: medication.color,
      });
    } else {
      setEditingMedication(null);
      setFormData({
        name: '',
        dosage: '',
        frequency: 'مرة يومياً',
        times: ['08:00'],
        instructions: '',
        color: '#3b82f6',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMedication(null);
  };

  const handleAddTime = () => {
    setFormData({ ...formData, times: [...formData.times, '12:00'] });
  };

  const handleRemoveTime = (index: number) => {
    setFormData({
      ...formData,
      times: formData.times.filter((_, i) => i !== index),
    });
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.dosage) {
      alert('الاسم والجرعة مطلوبان');
      return;
    }

    setIsSaving(true);
    try {
      const url = '/api/medications';
      const method = editingMedication ? 'PUT' : 'POST';
      const body = editingMedication
        ? { id: editingMedication.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        await fetchMedications();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving medication:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدواء؟')) return;

    try {
      const response = await fetch(`/api/medications?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setMedications(medications.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  return (
    <Card className="senior-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Pill className="w-6 h-6 text-amber-500" />
            إدارة الأدوية
          </CardTitle>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="w-5 h-5 ml-1" />
            إضافة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Pill className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>لا توجد أدوية مسجلة</p>
            <Button
              onClick={() => handleOpenDialog()}
              variant="outline"
              className="mt-4"
            >
              إضافة دواء جديد
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {medications.map((medication) => (
              <motion.div
                key={medication.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: medication.color + '20' }}
                    >
                      <Pill className="w-6 h-6" style={{ color: medication.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold">{medication.name}</h3>
                      <p className="text-sm text-gray-500">{medication.dosage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleOpenDialog(medication)}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(medication.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {JSON.parse(medication.times).map((time: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 ml-1" />
                      {time}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="text-xs">
                    {medication.frequency}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMedication ? 'تعديل الدواء' : 'إضافة دواء جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">اسم الدواء *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: أملوديبين"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dosage">الجرعة *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="مثال: 5 مجم"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="frequency">التكرار</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="مثال: مرتين يومياً"
                className="mt-1"
              />
            </div>

            <div>
              <Label>أوقات التناول</Label>
              <div className="space-y-2 mt-2">
                {formData.times.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {formData.times.length > 1 && (
                      <Button
                        onClick={() => handleRemoveTime(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  onClick={handleAddTime}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة وقت
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">تعليمات خاصة</Label>
              <Input
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="مثال: يؤخذ بعد الأكل"
                className="mt-1"
              />
            </div>

            <div>
              <Label>اللون</Label>
              <div className="flex gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color.value
                        ? 'border-gray-800 scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin ml-1" />
              ) : (
                <Check className="w-4 h-4 ml-1" />
              )}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
