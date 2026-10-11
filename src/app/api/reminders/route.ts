import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDefaultPatientId } from '@/lib/patient';

// GET - جلب جميع التذكيرات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const explicitPatientId = searchParams.get('patientId');
    const type = searchParams.get('type');
    const upcoming = searchParams.get('upcoming') === 'true';

    const patientId = await getDefaultPatientId(explicitPatientId);

    if (!patientId) {
      return NextResponse.json({ success: true, reminders: [] });
    }

    const where: { patientId: string; type?: string; scheduledAt?: { gte: Date }; isCompleted?: boolean } = { patientId };
    if (type) where.type = type;
    if (upcoming) {
      where.scheduledAt = { gte: new Date() };
      where.isCompleted = false;
    }

    const reminders = await db.reminder.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      reminders,
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب التذكيرات' },
      { status: 500 }
    );
  }
}

// POST - إضافة تذكير جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId: explicitPatientId, title, description, type, scheduledAt, isRecurring, recurrencePattern, voiceMessage } = body;

    if (!title || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: 'العنوان والوقت مطلوبان' },
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

    const reminder = await db.reminder.create({
      data: {
        patientId,
        title,
        description: description || null,
        type: type || 'custom',
        scheduledAt: new Date(scheduledAt),
        isRecurring: isRecurring || false,
        recurrencePattern: recurrencePattern || null,
        voiceMessage: voiceMessage || null,
        isCompleted: false,
      },
    });

    return NextResponse.json({
      success: true,
      reminder,
      message: 'تم إضافة التذكير بنجاح',
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إضافة التذكير' },
      { status: 500 }
    );
  }
}

// PUT - تحديث تذكير
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, type, scheduledAt, isRecurring, recurrencePattern, voiceMessage, isCompleted } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف التذكير مطلوب' },
        { status: 400 }
      );
    }

    const reminder = await db.reminder.update({
      where: { id },
      data: {
        title,
        description,
        type,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        isRecurring,
        recurrencePattern,
        voiceMessage,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      reminder,
      message: 'تم تحديث التذكير بنجاح',
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث التذكير' },
      { status: 500 }
    );
  }
}

// DELETE - حذف تذكير
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف التذكير مطلوب' },
        { status: 400 }
      );
    }

    await db.reminder.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف التذكير بنجاح',
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في حذف التذكير' },
      { status: 500 }
    );
  }
}
