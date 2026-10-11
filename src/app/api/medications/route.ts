import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDefaultPatientId } from '@/lib/patient';

// GET - جلب جميع الأدوية
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const explicitPatientId = searchParams.get('patientId');
    const patientId = await getDefaultPatientId(explicitPatientId);

    const medications = await db.medication.findMany({
      where: { isActive: true },
      include: {
        reminders: patientId
          ? {
              where: {
                patientId,
                scheduledAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
              orderBy: { scheduledAt: 'desc' },
              take: 5,
            }
          : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    // تحويل البيانات لإضافة حقل nextTime و taken
    const medicationsWithNextTime = medications.map(med => {
      let times: string[] = [];
      try {
        times = JSON.parse(med.times);
      } catch {
        times = ['08:00'];
      }
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

      const hasTakenToday = (med.reminders || []).some(r => r.status === 'taken');

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
    const { name, genericName, category, dosage, frequency, times, instructions, sideEffects, color, image } = body;

    if (!name || !dosage) {
      return NextResponse.json(
        { success: false, error: 'اسم الدواء والجرعة مطلوبان' },
        { status: 400 }
      );
    }

    const medication = await db.medication.create({
      data: {
        name,
        genericName: genericName || null,
        category: category || null,
        dosage,
        frequency: frequency || 'مرة يومياً',
        times: JSON.stringify(times || ['08:00']),
        instructions: instructions || null,
        sideEffects: sideEffects || null,
        color: color || '#3b82f6',
        image: image || null,
        isActive: true,
      },
    });

    // Create reminder entries for today for the default patient
    const patientId = await getDefaultPatientId(body.patientId);
    if (patientId) {
      const timesArr: string[] = JSON.parse(medication.times);
      const today = new Date();
      for (const t of timesArr) {
        const [hours, mins] = t.split(':').map(Number);
        const scheduledAt = new Date(today);
        scheduledAt.setHours(hours, mins, 0, 0);
        await db.medicationReminderEntry.create({
          data: {
            patientId,
            medicationId: medication.id,
            scheduledAt,
            status: 'pending',
          },
        });
      }
    }

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
    const { id, name, genericName, category, dosage, frequency, times, instructions, sideEffects, color, image, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الدواء مطلوب' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (genericName !== undefined) updateData.genericName = genericName;
    if (category !== undefined) updateData.category = category;
    if (dosage !== undefined) updateData.dosage = dosage;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (times !== undefined) updateData.times = JSON.stringify(times);
    if (instructions !== undefined) updateData.instructions = instructions;
    if (sideEffects !== undefined) updateData.sideEffects = sideEffects;
    if (color !== undefined) updateData.color = color;
    if (image !== undefined) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = isActive;

    const medication = await db.medication.update({
      where: { id },
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
    await db.medicationReminderEntry.deleteMany({
      where: { medicationId: id },
    });

    // حذف الدواء
    await db.medication.delete({
      where: { id },
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
