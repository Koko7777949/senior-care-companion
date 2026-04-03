'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Calendar, Clock, Check, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  type: string;
  scheduledAt: Date;
  isRecurring: boolean;
  recurrencePattern: string | null;
  isCompleted: boolean;
}

export function ReminderManager() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'custom',
    scheduledDate: '',
    scheduledTime: '',
    isRecurring: false,
    recurrencePattern: 'daily',
  });

  const typeOptions = [
    { value: 'appointment', label: 'موعد طبي', icon: '🏥' },
    { value: 'task', label: 'مهمة', icon: '✅' },
    { value: 'health_check', label: 'فحص صحي', icon: '💊' },
    { value: 'custom', label: 'مخصص', icon: '📝' },
  ];

  const recurrenceOptions = [
    { value: 'daily', label: 'يومياً' },
    { value: 'weekly', label: 'أسبوعياً' },
    { value: 'monthly', label: 'شهرياً' },
  ];

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders?upcoming=true');
      const data = await response.json();
      if (data.success) {
        setReminders(data.reminders);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (reminder?: Reminder) => {
    if (reminder) {
      const date = new Date(reminder.scheduledAt);
      setEditingReminder(reminder);
      setFormData({
        title: reminder.title,
        description: reminder.description || '',
        type: reminder.type,
        scheduledDate: date.toISOString().split('T')[0],
        scheduledTime: date.toTimeString().slice(0, 5),
        isRecurring: reminder.isRecurring,
        recurrencePattern: reminder.recurrencePattern || 'daily',
      });
    } else {
      setEditingReminder(null);
      const now = new Date();
      setFormData({
        title: '',
        description: '',
        type: 'custom',
        scheduledDate: now.toISOString().split('T')[0],
        scheduledTime: now.toTimeString().slice(0, 5),
        isRecurring: false,
        recurrencePattern: 'daily',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReminder(null);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.scheduledDate || !formData.scheduledTime) {
      alert('العنوان والوقت مطلوبان');
      return;
    }

    setIsSaving(true);
    try {
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      const url = '/api/reminders';
      const method = editingReminder ? 'PUT' : 'POST';
      const body = editingReminder
        ? { id: editingReminder.id, ...formData, scheduledAt }
        : { ...formData, scheduledAt };

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        await fetchReminders();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isCompleted: true }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchReminders();
      }
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التذكير؟')) return;

    try {
      const response = await fetch(`/api/reminders?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setReminders(reminders.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const getTypeInfo = (type: string) => {
    return typeOptions.find((t) => t.value === type) || typeOptions[3];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="senior-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-500" />
            التذكيرات
          </CardTitle>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Plus className="w-5 h-5 ml-1" />
            إضافة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>لا توجد تذكيرات قادمة</p>
            <Button
              onClick={() => handleOpenDialog()}
              variant="outline"
              className="mt-4"
            >
              إضافة تذكير جديد
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {reminders.map((reminder) => {
              const typeInfo = getTypeInfo(reminder.type);
              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gray-50 rounded-2xl p-4 ${reminder.isCompleted ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{typeInfo.icon}</div>
                      <div>
                        <h3 className={`font-bold ${reminder.isCompleted ? 'line-through' : ''}`}>
                          {reminder.title}
                        </h3>
                        {reminder.description && (
                          <p className="text-sm text-gray-500">{reminder.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!reminder.isCompleted && (
                        <Button
                          onClick={() => handleComplete(reminder.id)}
                          variant="ghost"
                          size="sm"
                          className="text-green-500 hover:text-green-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleOpenDialog(reminder)}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(reminder.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="w-3 h-3 ml-1" />
                      {formatDate(reminder.scheduledAt)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 ml-1" />
                      {formatTime(reminder.scheduledAt)}
                    </Badge>
                    {reminder.isRecurring && (
                      <Badge variant="secondary" className="text-xs">
                        يتكرر {recurrenceOptions.find(r => r.value === reminder.recurrencePattern)?.label}
                      </Badge>
                    )}
                    {reminder.isCompleted && (
                      <Badge className="text-xs bg-green-500">مكتمل</Badge>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingReminder ? 'تعديل التذكير' : 'إضافة تذكير جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">العنوان *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="عنوان التذكير"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف التذكير (اختياري)"
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label>النوع</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledDate">التاريخ *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="scheduledTime">الوقت *</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>تذكير متكرر</Label>
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="w-5 h-5"
              />
            </div>

            {formData.isRecurring && (
              <div>
                <Label>التكرار</Label>
                <Select
                  value={formData.recurrencePattern}
                  onValueChange={(value) => setFormData({ ...formData, recurrencePattern: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recurrenceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              className="bg-purple-500 hover:bg-purple-600"
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
