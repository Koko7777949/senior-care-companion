import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب التنبيهات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const patientId = searchParams.get('patientId');
    const organizationId = searchParams.get('organizationId');
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (patientId) where.patientId = patientId;
    if (organizationId) where.organizationId = organizationId;
    if (type) where.type = type;
    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const alerts = await db.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب التنبيهات' },
      { status: 500 }
    );
  }
}

// POST - إنشاء تنبيه جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, patientId, organizationId, type, severity, title, message, data } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'العنوان والرسالة مطلوبان' },
        { status: 400 }
      );
    }

    const alert = await db.alert.create({
      data: {
        userId,
        patientId,
        organizationId,
        type: type || 'custom',
        severity: severity || 'medium',
        title,
        message,
        data: data ? JSON.stringify(data) : null,
      },
    });

    return NextResponse.json({
      success: true,
      alert,
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إنشاء التنبيه' },
      { status: 500 }
    );
  }
}

// PUT - تحديث تنبيه (قراءة/حل)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isRead, isResolved, resolvedBy } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف التنبيه مطلوب' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (isRead !== undefined) updateData.isRead = isRead;
    if (isResolved !== undefined) {
      updateData.isResolved = isResolved;
      if (isResolved) {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = resolvedBy;
      }
    }

    const alert = await db.alert.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      alert,
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث التنبيه' },
      { status: 500 }
    );
  }
}
