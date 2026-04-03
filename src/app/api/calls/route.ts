import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, type, userId } = body;

    // إنشاء سجل المكالمة
    const callSession = await db.callSession.create({
      data: {
        userId: userId || 'senior-1',
        type: type || 'voice',
        status: 'initiated',
      },
    });

    // في الإنتاج، هنا يجب:
    // 1. التكامل مع خدمة الاتصال (Twilio, etc.)
    // 2. تسجيل مدة المكالمة
    // 3. تحديث حالة المكالمة

    console.log('Call session created:', callSession.id);
    console.log('Calling:', name, phone);

    return NextResponse.json({
      success: true,
      callId: callSession.id,
      message: `تم بدء ${type === 'video' ? 'مكالمة فيديو' : 'مكالمة'} مع ${name}`,
    });
  } catch (error) {
    console.error('Error initiating call:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في بدء المكالمة' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'senior-1';

    const calls = await db.callSession.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      calls: calls,
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب سجل المكالمات' },
      { status: 500 }
    );
  }
}
