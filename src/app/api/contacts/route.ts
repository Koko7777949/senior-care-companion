import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDefaultPatientId } from '@/lib/patient';

// GET - جلب جميع جهات الاتصال
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const explicitPatientId = searchParams.get('patientId');
    const patientId = await getDefaultPatientId(explicitPatientId);

    if (!patientId) {
      return NextResponse.json({
        success: true,
        contacts: [],
      });
    }

    const contacts = await db.emergencyContact.findMany({
      where: { patientId },
      orderBy: { priority: 'asc' },
    });

    return NextResponse.json({
      success: true,
      contacts: contacts,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب جهات الاتصال' },
      { status: 500 }
    );
  }
}

// POST - إضافة جهة اتصال جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId: explicitPatientId, name, phone, relation, priority, isPrimary, notifyOnEmergency, notifyOnMissedMedication, notifyOnInactivity } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'الاسم ورقم الهاتف مطلوبان' },
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

    // إذا كانت جهة الاتصال رئيسية، أزل الرئيسية من الجهات الأخرى
    if (isPrimary) {
      await db.emergencyContact.updateMany({
        where: { patientId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const contact = await db.emergencyContact.create({
      data: {
        patientId,
        name,
        phone,
        relation: relation || 'other',
        priority: priority || 1,
        isPrimary: isPrimary || false,
        notifyOnEmergency: notifyOnEmergency ?? true,
        notifyOnMissedMedication: notifyOnMissedMedication ?? false,
        notifyOnInactivity: notifyOnInactivity ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      contact: contact,
      message: 'تم إضافة جهة الاتصال بنجاح',
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إضافة جهة الاتصال' },
      { status: 500 }
    );
  }
}

// PUT - تحديث جهة اتصال
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, phone, relation, priority, isPrimary, notifyOnEmergency, notifyOnMissedMedication, notifyOnInactivity } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف جهة الاتصال مطلوب' },
        { status: 400 }
      );
    }

    // إذا كانت جهة الاتصال رئيسية، أزل الرئيسية من الجهات الأخرى
    if (isPrimary) {
      const currentContact = await db.emergencyContact.findUnique({ where: { id } });
      if (currentContact) {
        await db.emergencyContact.updateMany({
          where: { patientId: currentContact.patientId, isPrimary: true },
          data: { isPrimary: false },
        });
      }
    }

    const contact = await db.emergencyContact.update({
      where: { id },
      data: {
        name,
        phone,
        relation,
        priority,
        isPrimary,
        notifyOnEmergency,
        notifyOnMissedMedication,
        notifyOnInactivity,
      },
    });

    return NextResponse.json({
      success: true,
      contact: contact,
      message: 'تم تحديث جهة الاتصال بنجاح',
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث جهة الاتصال' },
      { status: 500 }
    );
  }
}

// DELETE - حذف جهة اتصال
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف جهة الاتصال مطلوب' },
        { status: 400 }
      );
    }

    await db.emergencyContact.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف جهة الاتصال بنجاح',
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في حذف جهة الاتصال' },
      { status: 500 }
    );
  }
}
