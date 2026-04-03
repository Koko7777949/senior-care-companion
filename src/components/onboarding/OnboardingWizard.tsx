'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Building2, User, Users, Stethoscope, Home,
  ArrowRight, ArrowLeft, Check, Sparkles, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface OnboardingWizardProps {
  onComplete: (data: { type: string; organizationName: string }) => void;
}

const orgTypes = [
  {
    id: 'hospital',
    label: 'مستشفى',
    description: 'مستشفى كبير مع أقسام متعددة',
    icon: Building2,
    color: 'from-blue-400 to-blue-600',
    features: ['إدارة الأقسام', 'أطباء وممرضين', 'مرضى داخليين'],
  },
  {
    id: 'clinic',
    label: 'عيادة',
    description: 'عيادة طبية متخصصة',
    icon: Stethoscope,
    color: 'from-green-400 to-green-600',
    features: ['مواعيد المرضى', 'سجلات طبية', 'وصفات الأدوية'],
  },
  {
    id: 'care_center',
    label: 'مركز رعاية',
    description: 'مركز رعاية لكبار السن',
    icon: Users,
    color: 'from-purple-400 to-purple-600',
    features: ['رعاية مستمرة', 'تذكيرات الأدوية', 'مراقبة الصحة'],
  },
  {
    id: 'personal',
    label: 'استخدام شخصي',
    description: 'للعائلة أو الشخصي',
    icon: Home,
    color: 'from-amber-400 to-orange-500',
    features: ['متابعة شخصية', 'جهات اتصال الطوارئ', 'تذكيرات يومية'],
  },
];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    type: '',
    organizationName: '',
  });

  const handleNext = () => {
    if (step === 0 && formData.type) {
      setStep(1);
    } else if (step === 1 && formData.organizationName) {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const selectedOrg = orgTypes.find(o => o.id === formData.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-amber-800">رفيق الصحة</h1>
          <p className="text-gray-600 mt-2">نظام متكامل لإدارة الرعاية الصحية</p>
        </motion.div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i <= step ? 'bg-amber-500' : 'bg-gray-200'
              }`}
              style={{ width: i <= step ? '60px' : '40px' }}
            />
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="bg-white/90 backdrop-blur shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">اختر نوع الاستخدام</h2>
                    <p className="text-gray-500 mt-2">حدد نوع المؤسسة أو الاستخدام المناسب لك</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {orgTypes.map((org) => (
                      <motion.button
                        key={org.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, type: org.id })}
                        className={`relative p-4 rounded-2xl border-2 transition-all text-right ${
                          formData.type === org.id
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {formData.type === org.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 left-2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${org.color} flex items-center justify-center mb-3`}>
                          <org.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg">{org.label}</h3>
                        <p className="text-sm text-gray-500 mt-1">{org.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {org.features.map((f, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      بياناتك آمنة ومحمية
                    </div>
                    <Button
                      onClick={handleNext}
                      disabled={!formData.type}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-8"
                    >
                      التالي
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="bg-white/90 backdrop-blur shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${selectedOrg?.color || 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                      {selectedOrg && <selectedOrg.icon className="w-8 h-8 text-white" />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {formData.type === 'personal' ? 'معلوماتك' : 'معلومات المؤسسة'}
                    </h2>
                    <p className="text-gray-500 mt-2">
                      {formData.type === 'personal'
                        ? 'أدخل اسمك أو اسم العائلة'
                        : 'أدخل اسم المؤسسة لإتمام الإعداد'}
                    </p>
                  </div>

                  <div className="space-y-4 max-w-md mx-auto">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.type === 'personal' ? 'الاسم' : 'اسم المؤسسة'}
                      </label>
                      <Input
                        placeholder={formData.type === 'personal' ? 'مثال: عائلة أحمد' : 'مثال: مستشفى الشفاء'}
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        className="text-lg py-6"
                      />
                    </div>

                    {formData.type !== 'personal' && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-2">المميزات المتاحة:</h4>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-sm text-blue-700">
                            <Check className="w-4 h-4" />
                            إدارة غير محدودة للمرضى
                          </li>
                          <li className="flex items-center gap-2 text-sm text-blue-700">
                            <Check className="w-4 h-4" />
                            نظام مواعيد متكامل
                          </li>
                          <li className="flex items-center gap-2 text-sm text-blue-700">
                            <Check className="w-4 h-4" />
                            تقارير وإحصائيات
                          </li>
                          <li className="flex items-center gap-2 text-sm text-blue-700">
                            <Check className="w-4 h-4" />
                            تنبيهات فورية
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="px-6"
                    >
                      <ArrowRight className="w-4 h-4 ml-2" />
                      السابق
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!formData.organizationName}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-8"
                    >
                      <Sparkles className="w-4 h-4 ml-2" />
                      بدء الاستخدام
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          <p>بالاستمرار، أنت توافق على الشروط والأحكام وسياسة الخصوصية</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
