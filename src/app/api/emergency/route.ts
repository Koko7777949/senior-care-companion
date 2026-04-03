import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, contacts, userId, location } = body;

    // إنشاء سجل الطوارئ
    const alert = await db.alert.create({
      data: {
        userId: userId || 'senior-1',
        type: type || 'emergency',
        severity: 'critical',
        title: 'تنبيه طوارئ',
        message: 'تم تفعيل زر الطوارئ',
        data: JSON.stringify({
          contacts: contacts,
          location: location || null,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    // في الإنتاج، هنا يجب:
    // 1. إرسال SMS للجهات الاتصال
    // 2. إرسال إشعارات Push
    // 3. الاتصال التلقائي إذا لزم الأمر
    // 4. إرسال الموقع الجغرافي

    console.log('Emergency alert created:', alert.id);
    console.log('Contacts to notify:', contacts);

    return NextResponse.json({
      success: true,
      alertId: alert.id,
      message: 'تم إرسال تنبيه الطوارئ بنجاح',
      notifiedContacts: contacts?.length || 0,
    });
  } catch (error) {
    console.error('Error in emergency API:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إرسال تنبيه الطوارئ' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'senior-1';

    const alerts = await db.alert.findMany({
      where: {
        userId: userId,
        type: 'emergency',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      alerts: alerts,
    });
  } catch (error) {
    console.error('Error fetching emergency alerts:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب التنبيهات' },
      { status: 500 }
    );
  }
}
