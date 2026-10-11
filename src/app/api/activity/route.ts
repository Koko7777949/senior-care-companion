import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDefaultPatientId } from '@/lib/patient';

// GET - جلب سجلات النشاط
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const explicitPatientId = searchParams.get('patientId');
    const type = searchParams.get('type');
    const days = parseInt(searchParams.get('days') || '7');

    const patientId = await getDefaultPatientId(explicitPatientId);

    if (!patientId) {
      return NextResponse.json({
        success: true,
        activities: [],
        stats: { totalSteps: 0, totalActiveMinutes: 0, lastActivity: null },
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: { patientId: string; type?: string; timestamp?: { gte: Date } } = { patientId };
    if (type) where.type = type;
    where.timestamp = { gte: startDate };

    const activities = await db.activityLog.findMany({
      where,
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
      activities,
      stats,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب سجلات النشاط' },
      { status: 500 }
    );
  }
}

// POST - إضافة سجل نشاط
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId: explicitPatientId, type, value, unit, latitude, longitude, metadata } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'نوع النشاط مطلوب' },
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

    const activity = await db.activityLog.create({
      data: {
        patientId,
        type,
        value: value || null,
        unit: unit || null,
        latitude: latitude || null,
        longitude: longitude || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({
      success: true,
      activity,
      message: 'تم تسجيل النشاط بنجاح',
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تسجيل النشاط' },
      { status: 500 }
    );
  }
}
