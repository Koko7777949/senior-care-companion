'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceAssistantProps {
  isActive: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export function VoiceAssistant({ isActive, onClose }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }, []);

  const processCommand = useCallback(async (command: string) => {
    setIsProcessing(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: command,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      let response = '';
      const lowerCommand = command.toLowerCase();
      
      if (lowerCommand.includes('وقت') || lowerCommand.includes('الساعة')) {
        response = `الوقت الآن ${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (lowerCommand.includes('تاريخ') || lowerCommand.includes('اليوم')) {
        response = `اليوم ${new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
      } else if (lowerCommand.includes('أدوية') || lowerCommand.includes('الدواء') || lowerCommand.includes('ادويه')) {
        try {
          const res = await fetch('/api/medications');
          const data = await res.json();
          if (data.success && data.medications?.length > 0) {
            const medList = data.medications.slice(0, 3).map((m: { name: string }) => m.name).join('، ');
            response = `أدويتك اليوم هي: ${medList}`;
          } else {
            response = 'لا توجد أدوية مسجلة حالياً';
          }
        } catch {
          response = 'عذراً، لم أتمكن من جلب قائمة الأدوية';
        }
      } else if (lowerCommand.includes('صحة') || lowerCommand.includes('حال')) {
        try {
          const res = await fetch('/api/health?limit=4');
          const data = await res.json();
          if (data.success && data.readings?.length > 0) {
            response = 'آخر قراءاتك الصحية مسجلة. يمكنك الاطلاع عليها في قسم الصحة';
          } else {
            response = 'لا توجد قراءات صحية مسجلة. يمكنك إضافتها من قسم إدارة البيانات';
          }
        } catch {
          response = 'حالتك الصحية مستقرة بإذن الله';
        }
      } else if (lowerCommand.includes('اتصل') || lowerCommand.includes('هاتف')) {
        response = 'يمكنك الاتصال بجهات الاتصال من القائمة الرئيسية. اضغط على زر الاتصال بجانب اسم الشخص';
      } else if (lowerCommand.includes('طوارئ') || lowerCommand.includes('مساعدة')) {
        response = 'في حالة الطوارئ، اضغط على زر الطوارئ الأحمر الكبير في الصفحة الرئيسية للاتصال الفوري بجهات الاتصال';
      } else if (lowerCommand.includes('شكر')) {
        response = 'عفواً، سعيد بخدمتك! هل هناك شيء آخر يمكنني مساعدتك به؟';
      } else if (lowerCommand.includes('مرحب') || lowerCommand.includes('أهلا') || lowerCommand.includes('اهلا')) {
        response = 'أهلاً وسهلاً! كيف يمكنني مساعدتك اليوم؟';
      } else if (lowerCommand.includes('كيف حالك') || lowerCommand.includes('كيفك')) {
        response = 'أنا بخير، شكراً لسؤالك! أنا هنا لمساعدتك. ماذا تحتاج؟';
      } else if (lowerCommand.includes('صلاة') || lowerCommand.includes('الصلاة')) {
        response = 'يمكنك معرفة أوقات الصلاة من تطبيقات الأذان أو المسجد القريب منك';
      } else if (lowerCommand.includes('طعام') || lowerCommand.includes('أكل') || lowerCommand.includes('جوعان')) {
        response = 'هل تحتاج مساعدة في طلب الطعام؟ يمكنك الاتصال بأحد أفراد عائلتك للمساعدة';
      } else if (lowerCommand.includes('مستشفى') || lowerCommand.includes('طبيب')) {
        response = 'يمكنك عرض لوحة تحكم المستشفى من القائمة الجانبية. هل تحتاج مساعدة؟';
      } else {
        try {
          const res = await fetch('/api/assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: command }),
          });
          const data = await res.json();
          response = data.response || 'عذراً، لم أفهم طلبك. هل يمكنك إعادة صياغته؟';
        } catch {
          response = 'عذراً، لم أفهم طلبك. هل يمكنك إعادة صياغته؟';
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      speak(response);
    } catch (error) {
      console.error('Error processing command:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsProcessing(false);
  }, [speak]);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      const input = prompt('أدخل رسالتك:');
      if (input) {
        processCommand(input);
      }
      return;
    }

    const SpeechRecognition = (window as Window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition || 
                              (window as Window & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const input = prompt('أدخل رسالتك:');
      if (input) {
        processCommand(input);
      }
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'ar-SA';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const text = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setTranscript(text);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (transcript.trim()) {
        processCommand(transcript);
      }
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  }, [processCommand, transcript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const handleQuickCommand = useCallback((command: string) => {
    processCommand(command);
  }, [processCommand]);

  const handleClose = useCallback(() => {
    stopListening();
    speechSynthesis.cancel();
    onClose();
  }, [stopListening, onClose]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed inset-0 bg-gradient-to-br from-amber-50 to-orange-100 z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-amber-200 bg-white/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-amber-800">المساعد الذكي</h2>
            </div>
            <Button onClick={handleClose} variant="ghost" size="lg" className="rounded-full">
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
                >
                  <Mic className="w-12 h-12 text-white" />
                </motion.div>
                <p className="text-xl text-gray-700 font-medium">كيف يمكنني مساعدتك؟</p>
                <p className="text-gray-500 mt-2">اضغط على الميكروفون وتحدث</p>
              </div>
            )}

            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-amber-500 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none shadow-lg'
                  }`}
                >
                  <p className="text-lg leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {isProcessing && (
              <div className="flex justify-end">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-lg">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-amber-200 bg-white/80 backdrop-blur">
            <p className="text-sm text-gray-600 mb-3">أوامر سريعة:</p>
            <div className="flex flex-wrap gap-2">
              {['ما الوقت؟', 'ما هي أدويتي؟', 'كيف حالي الصحية؟', 'مساعدة'].map((cmd) => (
                <Button
                  key={cmd}
                  onClick={() => handleQuickCommand(cmd)}
                  variant="outline"
                  className="rounded-full text-sm bg-white hover:bg-amber-50"
                  disabled={isProcessing}
                >
                  {cmd}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-6 flex flex-col items-center gap-4 bg-white/50">
            {transcript && isListening && (
              <p className="text-lg text-gray-600 text-center">{transcript}</p>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                isListening ? 'bg-red-500 text-white' : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
              }`}
            >
              {isListening ? (
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                  <MicOff className="w-10 h-10" />
                </motion.div>
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </motion.button>
            
            <p className="text-sm text-gray-500">
              {isListening ? 'جاري الاستماع...' : 'اضغط للتحدث'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
