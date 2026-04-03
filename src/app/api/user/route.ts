import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب بيانات المستخدم
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'senior-1';

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        caregiverRelations: {
          include: {
            caregiver: true,
          },
        },
        seniorRelations: {
          include: {
            senior: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب بيانات المستخدم' },
      { status: 500 }
    );
  }
}

// PUT - تحديث بيانات المستخدم
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, phone, dateOfBirth, medicalConditions, emergencyContact, address, latitude, longitude, language, voiceEnabled, seniorMode } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id: id },
      data: {
        name: name,
        phone: phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        medicalConditions: medicalConditions,
        emergencyContact: emergencyContact,
        address: address,
        latitude: latitude,
        longitude: longitude,
        language: language,
        voiceEnabled: voiceEnabled,
        seniorMode: seniorMode,
      },
    });

    return NextResponse.json({
      success: true,
      user: user,
      message: 'تم تحديث البيانات بنجاح',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث البيانات' },
      { status: 500 }
    );
  }
}
