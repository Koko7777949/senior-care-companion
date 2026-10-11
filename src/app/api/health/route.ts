import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDefaultPatientId } from '@/lib/patient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId: explicitPatientId, type, value, value2, unit, deviceId, deviceType, notes } = body;

    if (!type || !value) {
      return NextResponse.json(
        { success: false, error: 'نوع القراءة والقيمة مطلوبان' },
        { status: 400 }
      );
    }

    const patientId = await getDefaultPatientId(explicitPatientId);

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'لا يوجد مريض مسجل' },
        { status: 400 }
      );
    }

    // تحديد إذا كانت القراءة غير طبيعية
    let isAbnormal = false;
    const numericValue = parseFloat(value);

    switch (type) {
      case 'heart_rate':
        isAbnormal = numericValue < 60 || numericValue > 100;
        break;
      case 'blood_sugar':
        isAbnormal = numericValue < 70 || numericValue > 140;
        break;
      case 'oxygen_level':
        isAbnormal = numericValue < 95;
        break;
      case 'blood_pressure':
        if (value2) {
          const systolic = numericValue;
          const diastolic = parseFloat(value2);
          isAbnormal = systolic > 140 || diastolic > 90;
        }
        break;
    }

    // إنشاء سجل القراءة الصحية
    const reading = await db.healthReading.create({
      data: {
        patientId,
        type,
        value,
        value2: value2 || null,
        unit: unit || null,
        deviceId: deviceId || null,
        deviceType: deviceType || null,
        notes: notes || null,
        isAbnormal,
      },
    });

    // إذا كانت القراءة غير طبيعية، إنشاء تنبيه
    if (isAbnormal) {
      await db.alert.create({
        data: {
          patientId,
          type: 'health_abnormal',
          severity: 'high',
          title: 'قراءة صحية غير طبيعية',
          message: `تم تسجيل قراءة ${type} غير طبيعية: ${value}`,
          data: JSON.stringify({ readingId: reading.id }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      reading: reading,
      isAbnormal: isAbnormal,
      message: isAbnormal
        ? 'تم تسجيل القراءة وهي غير طبيعية. تم إرسال تنبيه.'
        : 'تم تسجيل القراءة بنجاح',
    });
  } catch (error) {
    console.error('Error recording health reading:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تسجيل القراءة الصحية' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const explicitPatientId = searchParams.get('patientId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const patientId = await getDefaultPatientId(explicitPatientId);

    if (!patientId) {
      return NextResponse.json({
        success: true,
        readings: [],
        stats: {},
      });
    }

    const where: { patientId: string; type?: string } = { patientId };
    if (type) {
      where.type = type;
    }

    const readings = await db.healthReading.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    // حساب الإحصائيات
    const stats: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    readings.forEach((reading) => {
      if (!stats[reading.type]) {
        stats[reading.type] = { avg: 0, min: Infinity, max: -Infinity, count: 0 };
      }
      const value = parseFloat(reading.value);
      stats[reading.type].avg += value;
      stats[reading.type].min = Math.min(stats[reading.type].min, value);
      stats[reading.type].max = Math.max(stats[reading.type].max, value);
      stats[reading.type].count++;
    });

    Object.keys(stats).forEach((key) => {
      stats[key].avg = stats[key].avg / stats[key].count;
    });

    return NextResponse.json({
      success: true,
      readings: readings,
      stats: stats,
    });
  } catch (error) {
    console.error('Error fetching health readings:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب القراءات الصحية' },
      { status: 500 }
    );
  }
}
