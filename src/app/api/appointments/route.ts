import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get appointments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    const where: Record<string, unknown> = {};

    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.scheduledAt = {
        gte: startDate,
        lte: endDate
      };
    }

    const appointments = await db.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: { scheduledAt: 'asc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب المواعيد' },
      { status: 500 }
    );
  }
}

// Create appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      doctorId,
      organizationId,
      type,
      title,
      description,
      scheduledAt,
      duration,
      notes,
    } = body;

    if (!patientId || !title || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: 'البيانات غير مكتملة' },
        { status: 400 }
      );
    }

    const appointment = await db.appointment.create({
      data: {
        patientId,
        doctorId,
        organizationId,
        type: type || 'consultation',
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 30,
        notes,
      },
      include: {
        patient: true,
        doctor: true,
      }
    });

    // Create alert for appointment
    await db.alert.create({
      data: {
        patientId,
        type: 'appointment',
        severity: 'low',
        title: 'موعد جديد',
        message: `موعد: ${title} - ${new Date(scheduledAt).toLocaleString('ar-SA')}`,
      }
    });

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إنشاء الموعد' },
      { status: 500 }
    );
  }
}

// Update appointment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الموعد مطلوب' },
        { status: 400 }
      );
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: {
        status,
        notes,
      },
      include: {
        patient: true,
        doctor: true,
      }
    });

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث الموعد' },
      { status: 500 }
    );
  }
}

// Delete appointment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الموعد مطلوب' },
        { status: 400 }
      );
    }

    await db.appointment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في حذف الموعد' },
      { status: 500 }
    );
  }
}
