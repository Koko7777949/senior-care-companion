'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Phone, User, Star, Check, Loader2 } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  priority: number;
  isPrimary: boolean;
  notifyOnEmergency: boolean;
  notifyOnMissedMedication: boolean;
  notifyOnInactivity: boolean;
}

export function ContactManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relation: 'ابن',
    isPrimary: false,
    notifyOnEmergency: true,
    notifyOnMissedMedication: false,
    notifyOnInactivity: true,
  });

  const relationOptions = [
    { value: 'ابن', label: 'ابن' },
    { value: 'ابنة', label: 'ابنة' },
    { value: 'زوج', label: 'زوج' },
    { value: 'زوجة', label: 'زوجة' },
    { value: 'أخ', label: 'أخ' },
    { value: 'أخت', label: 'أخت' },
    { value: 'طبيب', label: 'طبيب' },
    { value: 'ممرض', label: 'ممرض' },
    { value: 'جار', label: 'جار' },
    { value: 'صديق', label: 'صديق' },
    { value: 'أخرى', label: 'أخرى' },
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        phone: contact.phone,
        relation: contact.relation,
        isPrimary: contact.isPrimary,
        notifyOnEmergency: contact.notifyOnEmergency,
        notifyOnMissedMedication: contact.notifyOnMissedMedication,
        notifyOnInactivity: contact.notifyOnInactivity,
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: '',
        phone: '',
        relation: 'ابن',
        isPrimary: contacts.length === 0,
        notifyOnEmergency: true,
        notifyOnMissedMedication: false,
        notifyOnInactivity: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingContact(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      alert('الاسم ورقم الهاتف مطلوبان');
      return;
    }

    setIsSaving(true);
    try {
      const url = '/api/contacts';
      const method = editingContact ? 'PUT' : 'POST';
      const body = editingContact
        ? { id: editingContact.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        await fetchContacts();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف جهة الاتصال هذه؟')) return;

    try {
      const response = await fetch(`/api/contacts?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setContacts(contacts.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  return (
    <Card className="senior-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="w-6 h-6 text-blue-500" />
            جهات الاتصال
          </CardTitle>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-5 h-5 ml-1" />
            إضافة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>لا توجد جهات اتصال مسجلة</p>
            <Button
              onClick={() => handleOpenDialog()}
              variant="outline"
              className="mt-4"
            >
              إضافة جهة اتصال
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {contacts.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gray-50 rounded-2xl p-4 ${contact.isPrimary ? 'ring-2 ring-amber-400' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{contact.name}</h3>
                        {contact.isPrimary && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{contact.relation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleOpenDialog(contact)}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(contact.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-gray-600 text-sm">
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{contact.phone}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {contact.notifyOnEmergency && (
                    <Badge variant="destructive" className="text-xs">طوارئ</Badge>
                  )}
                  {contact.notifyOnInactivity && (
                    <Badge variant="secondary" className="text-xs">خمول</Badge>
                  )}
                  {contact.notifyOnMissedMedication && (
                    <Badge variant="outline" className="text-xs">أدوية</Badge>
                  )}
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
              {editingContact ? 'تعديل جهة الاتصال' : 'إضافة جهة اتصال جديدة'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">الاسم *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="الاسم الكامل"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="05xxxxxxxx"
                className="mt-1"
                dir="ltr"
              />
            </div>

            <div>
              <Label>صلة القرابة</Label>
              <Select
                value={formData.relation}
                onValueChange={(value) => setFormData({ ...formData, relation: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {relationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>جهة اتصال رئيسية</Label>
              <Switch
                checked={formData.isPrimary}
                onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
              />
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm text-gray-600">إرسال تنبيهات عند:</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">الطوارئ</span>
                  <Switch
                    checked={formData.notifyOnEmergency}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, notifyOnEmergency: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">عدم تناول الدواء</span>
                  <Switch
                    checked={formData.notifyOnMissedMedication}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, notifyOnMissedMedication: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">الخمول لفترة طويلة</span>
                  <Switch
                    checked={formData.notifyOnInactivity}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, notifyOnInactivity: checked })
                    }
                  />
                </div>
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
              className="bg-blue-500 hover:bg-blue-600"
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
