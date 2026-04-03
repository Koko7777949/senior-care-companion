import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب جميع التذكيرات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'senior-1';
    const type = searchParams.get('type');
    const upcoming = searchParams.get('upcoming') === 'true';

    const where: { userId: string; type?: string; scheduledAt?: { gte: Date }; isCompleted?: boolean } = { userId };
    if (type) where.type = type;
    if (upcoming) {
      where.scheduledAt = { gte: new Date() };
      where.isCompleted = false;
    }

    const reminders = await db.reminder.findMany({
      where: where,
      orderBy: { scheduledAt: 'asc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      reminders: reminders,
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب التذكيرات' },
      { status: 500 }
    );
  }
}

// POST - إضافة تذكير جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, type, scheduledAt, isRecurring, recurrencePattern, voiceMessage } = body;

    if (!title || !scheduledAt) {
      return NextResponse.json(
        { error: 'العنوان والوقت مطلوبان' },
        { status: 400 }
      );
    }

    const reminder = await db.reminder.create({
      data: {
        userId: userId || 'senior-1',
        title: title,
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
      reminder: reminder,
      message: 'تم إضافة التذكير بنجاح',
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إضافة التذكير' },
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
        { error: 'معرف التذكير مطلوب' },
        { status: 400 }
      );
    }

    const reminder = await db.reminder.update({
      where: { id: id },
      data: {
        title: title,
        description: description,
        type: type,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        isRecurring: isRecurring,
        recurrencePattern: recurrencePattern,
        voiceMessage: voiceMessage,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      reminder: reminder,
      message: 'تم تحديث التذكير بنجاح',
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث التذكير' },
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
        { error: 'معرف التذكير مطلوب' },
        { status: 400 }
      );
    }

    await db.reminder.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف التذكير بنجاح',
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف التذكير' },
      { status: 500 }
    );
  }
}
