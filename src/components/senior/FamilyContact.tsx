'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Video, MessageCircle, User, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
}

interface FamilyContactProps {
  patientId?: string;
}

export function FamilyContact({ patientId }: FamilyContactProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, [patientId]);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phone: string, name: string) => {
    fetch('/api/calls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name, type: 'voice', patientId }),
    }).catch(() => {});
    window.open(`tel:${phone}`, '_self');
  };

  const handleVideoCall = (phone: string, name: string) => {
    fetch('/api/calls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name, type: 'video', patientId }),
    }).catch(() => {});
    const whatsappUrl = `https://wa.me/${phone.replace(/^0/, '966')}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleMessage = (phone: string) => {
    window.open(`sms:${phone}`, '_self');
  };

  return (
    <Card className="bg-white/90 backdrop-blur shadow-sm border border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          الاتصال بالعائلة
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-base">لا توجد جهات اتصال</p>
            <p className="text-sm mt-1">أضف جهات اتصال من قسم الإدارة</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gray-50 rounded-xl p-3 ${contact.isPrimary ? 'ring-2 ring-amber-400 bg-amber-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-bold text-sm">{contact.name}</h3>
                        {contact.isPrimary && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                      </div>
                      <p className="text-gray-500 text-xs">{contact.relation}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <Button
                    onClick={() => handleCall(contact.phone, contact.name)}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs py-2"
                  >
                    <Phone className="w-4 h-4 ml-1" />
                    اتصال
                  </Button>
                  <Button
                    onClick={() => handleVideoCall(contact.phone, contact.name)}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs py-2"
                  >
                    <Video className="w-4 h-4 ml-1" />
                    فيديو
                  </Button>
                  <Button
                    onClick={() => handleMessage(contact.phone)}
                    variant="outline"
                    className="rounded-lg text-xs py-2"
                  >
                    <MessageCircle className="w-4 h-4 ml-1" />
                    رسالة
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
