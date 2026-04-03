import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب سجلات النشاط
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'senior-1';
    const type = searchParams.get('type');
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: { userId: string; type?: string; timestamp?: { gte: Date } } = { userId };
    if (type) where.type = type;
    where.timestamp = { gte: startDate };

    const activities = await db.activityLog.findMany({
      where: where,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    // حساب الإحصائيات
    const stats = {
      totalSteps: activities.filter(a => a.type === 'step').reduce((sum, a) => sum + (a.value || 0), 0),
      totalActiveMinutes: activities.filter(a => a.type === 'movement').reduce((sum, a) => sum + (a.value || 0), 0),
      lastActivity: activities[0]?.timestamp || null,
    };

    return NextResponse.json({
      success: true,
      activities: activities,
      stats: stats,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب سجلات النشاط' },
      { status: 500 }
    );
  }
}

// POST - إضافة سجل نشاط
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, value, unit, latitude, longitude, metadata } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'نوع النشاط مطلوب' },
        { status: 400 }
      );
    }

    const activity = await db.activityLog.create({
      data: {
        userId: userId || 'senior-1',
        type: type,
        value: value || null,
        unit: unit || null,
        latitude: latitude || null,
        longitude: longitude || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // تحديث آخر نشاط للمستخدم
    await db.user.update({
      where: { id: userId || 'senior-1' },
      data: { lastActive: new Date() },
    });

    return NextResponse.json({
      success: true,
      activity: activity,
      message: 'تم تسجيل النشاط بنجاح',
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل النشاط' },
      { status: 500 }
    );
  }
}
