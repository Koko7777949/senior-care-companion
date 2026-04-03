import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // إنشاء مستخدم كبير السن
  const senior = await prisma.user.upsert({
    where: { id: 'senior-1' },
    update: {
      name: 'أم محمد',
      phone: '0501234567',
      dateOfBirth: new Date('1950-05-15'),
      medicalConditions: 'ضغط الدم، السكري من النوع الثاني',
      emergencyContact: '0509876543',
      address: 'الرياض، حي النخيل، شارع الورد',
      language: 'ar',
      voiceEnabled: true,
      seniorMode: true,
      isActive: true,
    },
    create: {
      id: 'senior-1',
      email: 'senior@example.com',
      name: 'أم محمد',
      phone: '0501234567',
      role: 'senior',
      dateOfBirth: new Date('1950-05-15'),
      medicalConditions: 'ضغط الدم، السكري من النوع الثاني',
      emergencyContact: '0509876543',
      address: 'الرياض، حي النخيل، شارع الورد',
      language: 'ar',
      voiceEnabled: true,
      seniorMode: true,
      isActive: true,
    },
  });
  console.log('✅ Created senior user:', senior.name);

  // إنشاء مقدمي الرعاية
  const caregiver1 = await prisma.user.upsert({
    where: { id: 'caregiver-1' },
    update: {
      name: 'محمد أحمد',
      phone: '0509876543',
    },
    create: {
      id: 'caregiver-1',
      email: 'mohammed@example.com',
      name: 'محمد أحمد',
      phone: '0509876543',
      role: 'caregiver',
      language: 'ar',
      isActive: true,
    },
  });

  const caregiver2 = await prisma.user.upsert({
    where: { id: 'caregiver-2' },
    update: {
      name: 'فاطمة أحمد',
      phone: '0508765432',
    },
    create: {
      id: 'caregiver-2',
      email: 'fatima@example.com',
      name: 'فاطمة أحمد',
      phone: '0508765432',
      role: 'caregiver',
      language: 'ar',
      isActive: true,
    },
  });
  console.log('✅ Created caregivers:', caregiver1.name, caregiver2.name);

  // إنشاء العلاقات
  await prisma.caregiverRelation.upsert({
    where: { id: 'relation-1' },
    update: {},
    create: {
      id: 'relation-1',
      caregiverId: 'caregiver-1',
      seniorId: 'senior-1',
      relation: 'ابن',
      permissions: 'full',
      isApproved: true,
    },
  });

  await prisma.caregiverRelation.upsert({
    where: { id: 'relation-2' },
    update: {},
    create: {
      id: 'relation-2',
      caregiverId: 'caregiver-2',
      seniorId: 'senior-1',
      relation: 'ابنة',
      permissions: 'view',
      isApproved: true,
    },
  });
  console.log('✅ Created caregiver relations');

  // حذف جهات الاتصال القديمة وإنشاء جديدة
  await prisma.emergencyContact.deleteMany({ where: { userId: 'senior-1' } });
  
  const contacts = await prisma.emergencyContact.createMany({
    data: [
      {
        userId: 'senior-1',
        name: 'محمد (الابن)',
        phone: '0509876543',
        relation: 'ابن',
        priority: 1,
        isPrimary: true,
        notifyOnEmergency: true,
        notifyOnMissedMedication: true,
        notifyOnInactivity: true,
      },
      {
        userId: 'senior-1',
        name: 'فاطمة (الابنة)',
        phone: '0508765432',
        relation: 'ابنة',
        priority: 2,
        isPrimary: false,
        notifyOnEmergency: true,
        notifyOnMissedMedication: false,
        notifyOnInactivity: true,
      },
      {
        userId: 'senior-1',
        name: 'الدكتور أحمد العتيبي',
        phone: '0112345678',
        relation: 'طبيب',
        priority: 3,
        isPrimary: false,
        notifyOnEmergency: true,
        notifyOnMissedMedication: false,
        notifyOnInactivity: false,
      },
    ],
  });
  console.log('✅ Created', contacts.count, 'emergency contacts');

  // حذف الأدوية القديمة وإنشاء جديدة
  await prisma.medicationReminder.deleteMany({});
  await prisma.medication.deleteMany({ where: { userId: 'senior-1' } });

  const medications = await Promise.all([
    prisma.medication.create({
      data: {
        userId: 'senior-1',
        name: 'أملوديبين',
        dosage: '5 مجم',
        frequency: 'مرتين يومياً',
        times: '["08:00", "20:00"]',
        instructions: 'يؤخذ بعد الأكل بـ 30 دقيقة',
        startDate: new Date('2024-01-01'),
        color: '#3b82f6',
        isActive: true,
      },
    }),
    prisma.medication.create({
      data: {
        userId: 'senior-1',
        name: 'ميتفورمين',
        dosage: '500 مجم',
        frequency: 'مرتين يومياً',
        times: '["07:00", "19:00"]',
        instructions: 'يؤخذ مع الأكل',
        startDate: new Date('2024-01-01'),
        color: '#22c55e',
        isActive: true,
      },
    }),
    prisma.medication.create({
      data: {
        userId: 'senior-1',
        name: 'أسبيرين',
        dosage: '81 مجم',
        frequency: 'مرة يومياً',
        times: '["09:00"]',
        instructions: 'يؤخذ مع كوب ماء كبير',
        startDate: new Date('2024-01-01'),
        color: '#ef4444',
        isActive: true,
      },
    }),
    prisma.medication.create({
      data: {
        userId: 'senior-1',
        name: 'فيتامين د',
        dosage: '1000 وحدة',
        frequency: 'مرة يومياً',
        times: '["12:00"]',
        instructions: 'يؤخذ مع وجبة تحتوي على دهون',
        startDate: new Date('2024-01-01'),
        color: '#f59e0b',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Created', medications.length, 'medications');

  // إنشاء قراءات صحية متنوعة
  await prisma.healthReading.deleteMany({ where: { userId: 'senior-1' } });

  const now = new Date();
  const healthReadings = [];

  // إنشاء قراءات لآخر 7 أيام
  for (let day = 6; day >= 0; day--) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    date.setHours(8, 0, 0, 0);

    // نبض القلب
    healthReadings.push({
      userId: 'senior-1',
      type: 'heart_rate',
      value: String(70 + Math.floor(Math.random() * 15)),
      unit: 'نبضة/دقيقة',
      isAbnormal: false,
      timestamp: date,
    });

    // ضغط الدم
    healthReadings.push({
      userId: 'senior-1',
      type: 'blood_pressure',
      value: String(115 + Math.floor(Math.random() * 15)),
      value2: String(75 + Math.floor(Math.random() * 10)),
      unit: 'مم زئبق',
      isAbnormal: false,
      timestamp: date,
    });

    // سكر الدم
    const sugarValue = 100 + Math.floor(Math.random() * 50);
    healthReadings.push({
      userId: 'senior-1',
      type: 'blood_sugar',
      value: String(sugarValue),
      unit: 'مجم/ديسيلتر',
      isAbnormal: sugarValue > 140 || sugarValue < 70,
      timestamp: date,
    });

    // الأكسجين
    healthReadings.push({
      userId: 'senior-1',
      type: 'oxygen_level',
      value: String(96 + Math.floor(Math.random() * 4)),
      unit: '%',
      isAbnormal: false,
      timestamp: date,
    });
  }

  await prisma.healthReading.createMany({ data: healthReadings });
  console.log('✅ Created', healthReadings.length, 'health readings');

  // إنشاء سجلات نشاط
  await prisma.activityLog.deleteMany({ where: { userId: 'senior-1' } });

  const activityLogs = [];
  for (let day = 6; day >= 0; day--) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    date.setHours(9, 0, 0, 0);

    activityLogs.push({
      userId: 'senior-1',
      type: 'step',
      value: 2000 + Math.floor(Math.random() * 3000),
      unit: 'خطوة',
      timestamp: date,
    });

    activityLogs.push({
      userId: 'senior-1',
      type: 'movement',
      value: 30 + Math.floor(Math.random() * 40),
      unit: 'دقيقة',
      timestamp: date,
    });
  }

  await prisma.activityLog.createMany({ data: activityLogs });
  console.log('✅ Created', activityLogs.length, 'activity logs');

  // إنشاء تذكيرات
  await prisma.reminder.deleteMany({ where: { userId: 'senior-1' } });

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  await prisma.reminder.createMany({
    data: [
      {
        userId: 'senior-1',
        title: 'موعد مع طبيب القلب',
        description: 'كشف دوري - مستشفى الملك فهد',
        type: 'appointment',
        scheduledAt: tomorrow,
        isRecurring: false,
        isCompleted: false,
      },
      {
        userId: 'senior-1',
        title: 'فحص سكر الدم',
        description: 'فحص صباحي للسكر',
        type: 'health_check',
        scheduledAt: new Date(now.setHours(8, 0, 0, 0)),
        isRecurring: true,
        recurrencePattern: 'daily',
        isCompleted: false,
      },
      {
        userId: 'senior-1',
        title: 'موعد مع طبيب العيون',
        description: 'كشف سنوي للعين',
        type: 'appointment',
        scheduledAt: nextWeek,
        isRecurring: false,
        isCompleted: false,
      },
    ],
  });
  console.log('✅ Created reminders');

  // إنشاء بعض التنبيهات
  await prisma.alert.deleteMany({ where: { userId: 'senior-1' } });

  await prisma.alert.createMany({
    data: [
      {
        userId: 'senior-1',
        type: 'medication',
        severity: 'medium',
        title: 'تذكير بالدواء',
        message: 'حان وقت تناول دواء أملوديبين',
        isRead: false,
        isResolved: false,
      },
      {
        userId: 'senior-1',
        type: 'health_abnormal',
        severity: 'high',
        title: 'قراءة غير طبيعية',
        message: 'تم تسجيل قراءة سكر دم مرتفعة: 165 مجم/ديسيلتر',
        isRead: false,
        isResolved: false,
      },
    ],
  });
  console.log('✅ Created alerts');

  console.log('\n✅ Database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log('   - 1 senior user');
  console.log('   - 2 caregivers');
  console.log('   - 3 emergency contacts');
  console.log('   - 4 medications');
  console.log('   - 28 health readings (7 days)');
  console.log('   - 14 activity logs (7 days)');
  console.log('   - 3 reminders');
  console.log('   - 2 alerts');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
