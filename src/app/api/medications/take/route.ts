import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { medicationId, userId, notes } = body;

    if (!medicationId) {
      return NextResponse.json(
        { error: 'معرف الدواء مطلوب' },
        { status: 400 }
      );
    }

    // إنشاء سجل تناول الدواء
    const reminder = await db.medicationReminder.create({
      data: {
        medicationId: medicationId,
        scheduledAt: new Date(),
        takenAt: new Date(),
        status: 'taken',
        notes: notes || null,
      },
    });

    // إنشاء تنبيه للتأكيد
    await db.alert.create({
      data: {
        userId: userId || 'senior-1',
        type: 'medication',
        severity: 'low',
        title: 'تم تناول الدواء',
        message: `تم تسجيل تناول الدواء بنجاح`,
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل تناول الدواء بنجاح',
      reminder: reminder,
    });
  } catch (error) {
    console.error('Error recording medication:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل تناول الدواء' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'senior-1';

    // جلب الأدوية مع سجلات التناول
    const medications = await db.medication.findMany({
      where: {
        userId: userId,
        isActive: true,
      },
      include: {
        reminders: {
          where: {
            scheduledAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          orderBy: {
            scheduledAt: 'desc',
          },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      success: true,
      medications: medications,
    });
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الأدوية' },
      { status: 500 }
    );
  }
}
