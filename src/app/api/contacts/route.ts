import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب جميع جهات الاتصال
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'senior-1';

    const contacts = await db.emergencyContact.findMany({
      where: { userId: userId },
      orderBy: { priority: 'asc' },
    });

    return NextResponse.json({
      success: true,
      contacts: contacts,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب جهات الاتصال' },
      { status: 500 }
    );
  }
}

// POST - إضافة جهة اتصال جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, phone, relation, priority, isPrimary, notifyOnEmergency, notifyOnMissedMedication, notifyOnInactivity } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'الاسم ورقم الهاتف مطلوبان' },
        { status: 400 }
      );
    }

    // إذا كانت جهة الاتصال رئيسية، أزل الرئيسية من الجهات الأخرى
    if (isPrimary) {
      await db.emergencyContact.updateMany({
        where: { userId: userId || 'senior-1', isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const contact = await db.emergencyContact.create({
      data: {
        userId: userId || 'senior-1',
        name: name,
        phone: phone,
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
      { error: 'حدث خطأ في إضافة جهة الاتصال' },
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
        { error: 'معرف جهة الاتصال مطلوب' },
        { status: 400 }
      );
    }

    // إذا كانت جهة الاتصال رئيسية، أزل الرئيسية من الجهات الأخرى
    if (isPrimary) {
      const currentContact = await db.emergencyContact.findUnique({ where: { id: id } });
      if (currentContact) {
        await db.emergencyContact.updateMany({
          where: { userId: currentContact.userId, isPrimary: true },
          data: { isPrimary: false },
        });
      }
    }

    const contact = await db.emergencyContact.update({
      where: { id: id },
      data: {
        name: name,
        phone: phone,
        relation: relation,
        priority: priority,
        isPrimary: isPrimary,
        notifyOnEmergency: notifyOnEmergency,
        notifyOnMissedMedication: notifyOnMissedMedication,
        notifyOnInactivity: notifyOnInactivity,
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
      { error: 'حدث خطأ في تحديث جهة الاتصال' },
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
        { error: 'معرف جهة الاتصال مطلوب' },
        { status: 400 }
      );
    }

    await db.emergencyContact.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف جهة الاتصال بنجاح',
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف جهة الاتصال' },
      { status: 500 }
    );
  }
}
