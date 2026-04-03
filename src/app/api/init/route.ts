import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// تهيئة البيانات التجريبية
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, organizationName } = body;

    // إنشاء منظمة افتراضية
    let organization = await db.organization.findFirst();
    
    if (!organization) {
      organization = await db.organization.create({
        data: {
          name: organizationName || 'مركز الرعاية الصحية',
          type: type || 'personal',
          email: 'info@care-center.com',
          phone: '920000000',
          address: 'الرياض، المملكة العربية السعودية',
          isActive: true,
          plan: 'premium',
          maxPatients: 100,
        },
      });
    }

    // إنشاء مستخدم افتراضي
    let user = await db.user.findUnique({ where: { email: 'demo@care.com' } });
    
    if (!user) {
      user = await db.user.create({
        data: {
          email: 'demo@care.com',
          phone: '0500000000',
          name: 'أحمد محمد',
          role: 'admin',
          organizationId: organization.id,
          language: 'ar',
          voiceEnabled: true,
          seniorMode: true,
          isActive: true,
        },
      });
    }

    // إنشاء مريض افتراضي
    let patient = await db.patient.findFirst({ where: { organizationId: organization.id } });
    
    if (!patient) {
      patient = await db.patient.create({
        data: {
          organizationId: organization.id,
          name: 'أم أحمد',
          gender: 'female',
          medicalConditions: 'ضغط الدم، السكري',
          status: 'active',
          admissionDate: new Date(),
        },
      });

      // إضافة قراءات صحية تجريبية
      const now = new Date();
      const readings = [];
      for (let day = 6; day >= 0; day--) {
        const date = new Date(now);
        date.setDate(date.getDate() - day);
        date.setHours(8, 0, 0, 0);
        
        readings.push({ patientId: patient.id, type: 'heart_rate', value: String(70 + Math.floor(Math.random() * 15)), unit: 'نبضة/دقيقة', isAbnormal: false, timestamp: new Date(date) });
        readings.push({ patientId: patient.id, type: 'blood_pressure', value: String(115 + Math.floor(Math.random() * 15)), value2: String(75 + Math.floor(Math.random() * 10)), unit: 'مم زئبق', isAbnormal: false, timestamp: new Date(date) });
        const sugar = 100 + Math.floor(Math.random() * 50);
        readings.push({ patientId: patient.id, type: 'blood_sugar', value: String(sugar), unit: 'مجم/ديسيلتر', isAbnormal: sugar > 140, timestamp: new Date(date) });
        readings.push({ patientId: patient.id, type: 'oxygen_level', value: String(96 + Math.floor(Math.random() * 4)), unit: '%', isAbnormal: false, timestamp: new Date(date) });
      }
      await db.healthReading.createMany({ data: readings });

      // إضافة سجلات نشاط تجريبية
      const activityLogs = [];
      for (let day = 6; day >= 0; day--) {
        const date = new Date(now);
        date.setDate(date.getDate() - day);
        date.setHours(9, 0, 0, 0);
        activityLogs.push({ patientId: patient.id, type: 'step', value: 2000 + Math.floor(Math.random() * 3000), unit: 'خطوة', timestamp: new Date(date) });
        activityLogs.push({ patientId: patient.id, type: 'movement', value: 30 + Math.floor(Math.random() * 40), unit: 'دقيقة', timestamp: new Date(date) });
      }
      await db.activityLog.createMany({ data: activityLogs });

      // إضافة جهات اتصال طوارئ
      await db.emergencyContact.createMany({
        data: [
          { patientId: patient.id, name: 'محمد (الابن)', phone: '0509876543', relation: 'ابن', priority: 1, isPrimary: true, notifyOnEmergency: true, notifyOnInactivity: true },
          { patientId: patient.id, name: 'فاطمة (الابنة)', phone: '0508765432', relation: 'ابنة', priority: 2, isPrimary: false, notifyOnEmergency: true, notifyOnInactivity: true },
          { patientId: patient.id, name: 'الدكتور أحمد', phone: '0112345678', relation: 'طبيب', priority: 3, isPrimary: false, notifyOnEmergency: true },
        ],
      });
    }

    // إنشاء أدوية تجريبية
    const medsCount = await db.medication.count();
    if (medsCount === 0) {
      await db.medication.createMany({
        data: [
          { name: 'أملوديبين', genericName: 'Amlodipine', category: 'ضغط الدم', dosage: '5 مجم', frequency: 'مرتين يومياً', times: '["08:00", "20:00"]', instructions: 'بعد الأكل', color: '#3b82f6', isActive: true },
          { name: 'ميتفورمين', genericName: 'Metformin', category: 'السكري', dosage: '500 مجم', frequency: 'مرتين يومياً', times: '["07:00", "19:00"]', instructions: 'مع الأكل', color: '#22c55e', isActive: true },
          { name: 'أسبيرين', genericName: 'Aspirin', category: 'القلب', dosage: '81 مجم', frequency: 'مرة يومياً', times: '["09:00"]', instructions: 'مع ماء', color: '#ef4444', isActive: true },
          { name: 'فيتامين د', genericName: 'Vitamin D', category: 'فيتامينات', dosage: '1000 وحدة', frequency: 'مرة يومياً', times: '["12:00"]', instructions: 'مع وجبة دهنية', color: '#f59e0b', isActive: true },
        ],
      });

      // إضافة تذكيرات أدوية للمريض
      const medications = await db.medication.findMany();
      for (const med of medications) {
        await db.medicationReminderEntry.create({
          data: {
            patientId: patient.id,
            medicationId: med.id,
            scheduledAt: new Date(),
            status: 'pending',
          },
        });
      }
    }

    // إنشاء تذكيرات تجريبية
    const remindersCount = await db.reminder.count();
    if (remindersCount === 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      await db.reminder.createMany({
        data: [
          { patientId: patient.id, title: 'موعد طبيب القلب', description: 'كشف دوري', type: 'appointment', scheduledAt: tomorrow, isRecurring: false, isCompleted: false },
          { patientId: patient.id, title: 'فحص سكر الدم', description: 'فحص صباحي', type: 'health_check', scheduledAt: new Date(new Date().setHours(8, 0, 0, 0)), isRecurring: true, recurrencePattern: 'daily', isCompleted: false },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تهيئة البيانات بنجاح',
      data: {
        organization: { id: organization.id, name: organization.name, type: organization.type },
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        patient: { id: patient.id, name: patient.name },
      },
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const organization = await db.organization.findFirst();
    const user = await db.user.findFirst({ where: { role: 'admin' } });
    const patient = await db.patient.findFirst();
    const medicationsCount = await db.medication.count();
    const healthReadingsCount = await db.healthReading.count();
    const contactsCount = await db.emergencyContact.count();

    return NextResponse.json({
      success: true,
      initialized: !!organization && !!user && !!patient,
      stats: {
        medications: medicationsCount,
        healthReadings: healthReadingsCount,
        contacts: contactsCount,
      },
      organization: organization ? { id: organization.id, name: organization.name, type: organization.type } : null,
      patient: patient ? { id: patient.id, name: patient.name } : null,
    });
  } catch (error) {
    console.error('Init status error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
