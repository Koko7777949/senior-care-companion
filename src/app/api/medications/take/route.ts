import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDefaultPatientId } from '@/lib/patient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { medicationId, patientId: explicitPatientId, notes } = body;

    if (!medicationId) {
      return NextResponse.json(
        { success: false, error: 'معرف الدواء مطلوب' },
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

    // Find today's pending reminder entry for this medication and patient
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    let reminder = await db.medicationReminderEntry.findFirst({
      where: {
        medicationId,
        patientId,
        scheduledAt: { gte: today, lte: endOfToday },
      },
    });

    if (reminder) {
      // Update existing reminder
      reminder = await db.medicationReminderEntry.update({
        where: { id: reminder.id },
        data: {
          takenAt: new Date(),
          status: 'taken',
          notes: notes || reminder.notes,
        },
      });
    } else {
      // Create a new taken entry
      reminder = await db.medicationReminderEntry.create({
        data: {
          medicationId,
          patientId,
          scheduledAt: new Date(),
          takenAt: new Date(),
          status: 'taken',
          notes: notes || null,
        },
      });
    }

    // إنشاء تنبيه للتأكيد
    await db.alert.create({
      data: {
        patientId,
        type: 'medication',
        severity: 'low',
        title: 'تم تناول الدواء',
        message: 'تم تسجيل تناول الدواء بنجاح',
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل تناول الدواء بنجاح',
      reminder,
    });
  } catch (error) {
    console.error('Error recording medication:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تسجيل تناول الدواء' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const explicitPatientId = searchParams.get('patientId');
    const patientId = await getDefaultPatientId(explicitPatientId);

    if (!patientId) {
      return NextResponse.json({ success: true, medications: [] });
    }

    // جلب الأدوية مع سجلات التناول
    const medications = await db.medication.findMany({
      where: { isActive: true },
      include: {
        reminders: {
          where: {
            patientId,
            scheduledAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          orderBy: { scheduledAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      success: true,
      medications,
    });
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب الأدوية' },
      { status: 500 }
    );
  }
}
