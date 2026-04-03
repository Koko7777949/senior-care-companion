import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب جميع الأدوية
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'senior-1';

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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // تحويل البيانات لإضافة حقل nextTime
    const medicationsWithNextTime = medications.map(med => {
      const times = JSON.parse(med.times);
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      let nextTime = times[0];
      
      for (const time of times) {
        const [hours, mins] = time.split(':').map(Number);
        const timeMinutes = hours * 60 + mins;
        if (timeMinutes > currentMinutes) {
          nextTime = time;
          break;
        }
      }

      const hasTakenToday = med.reminders.some(r => r.status === 'taken');

      return {
        ...med,
        nextTime,
        taken: hasTakenToday,
      };
    });

    return NextResponse.json({
      success: true,
      medications: medicationsWithNextTime,
    });
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب الأدوية' },
      { status: 500 }
    );
  }
}

// POST - إضافة دواء جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, dosage, frequency, times, instructions, startDate, endDate, color, image } = body;

    if (!name || !dosage) {
      return NextResponse.json(
        { success: false, error: 'اسم الدواء والجرعة مطلوبان' },
        { status: 400 }
      );
    }

    const medication = await db.medication.create({
      data: {
        userId: userId || 'senior-1',
        name: name,
        dosage: dosage,
        frequency: frequency || 'مرة يومياً',
        times: JSON.stringify(times || ['08:00']),
        instructions: instructions || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        color: color || '#3b82f6',
        image: image || null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      medication: medication,
      message: 'تم إضافة الدواء بنجاح',
    });
  } catch (error) {
    console.error('Error creating medication:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إضافة الدواء' },
      { status: 500 }
    );
  }
}

// PUT - تحديث دواء
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, dosage, frequency, times, instructions, startDate, endDate, color, image, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الدواء مطلوب' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (dosage !== undefined) updateData.dosage = dosage;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (times !== undefined) updateData.times = JSON.stringify(times);
    if (instructions !== undefined) updateData.instructions = instructions;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (color !== undefined) updateData.color = color;
    if (image !== undefined) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = isActive;

    const medication = await db.medication.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      medication: medication,
      message: 'تم تحديث الدواء بنجاح',
    });
  } catch (error) {
    console.error('Error updating medication:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث الدواء' },
      { status: 500 }
    );
  }
}

// DELETE - حذف دواء
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الدواء مطلوب' },
        { status: 400 }
      );
    }

    // حذف التذكيرات المرتبطة أولاً
    await db.medicationReminder.deleteMany({
      where: { medicationId: id },
    });

    // حذف الدواء
    await db.medication.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف الدواء بنجاح',
    });
  } catch (error) {
    console.error('Error deleting medication:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في حذف الدواء' },
      { status: 500 }
    );
  }
}
