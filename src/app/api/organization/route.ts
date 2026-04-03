import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get organization details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف المؤسسة مطلوب' },
        { status: 400 }
      );
    }

    const organization = await db.organization.findUnique({
      where: { id },
      include: {
        departments: {
          where: { isActive: true },
          include: {
            _count: {
              select: { patients: true, staff: true }
            }
          }
        },
        _count: {
          select: { patients: true, users: true }
        }
      }
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, error: 'المؤسسة غير موجودة' },
        { status: 404 }
      );
    }

    // Get stats
    const stats = {
      totalPatients: await db.patient.count({
        where: { organizationId: id }
      }),
      activePatients: await db.patient.count({
        where: { organizationId: id, status: 'active' }
      }),
      criticalPatients: await db.patient.count({
        where: { organizationId: id, status: 'critical' }
      }),
      todayAppointments: await db.appointment.count({
        where: {
          organizationId: id,
          scheduledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      pendingAlerts: await db.alert.count({
        where: { organizationId: id, isRead: false }
      }),
    };

    return NextResponse.json({
      success: true,
      organization: {
        ...organization,
        stats,
      }
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب بيانات المؤسسة' },
      { status: 500 }
    );
  }
}

// Create organization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      logo,
      address,
      phone,
      email,
      website,
      license,
      plan,
    } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: 'الاسم والنوع مطلوبان' },
        { status: 400 }
      );
    }

    const organization = await db.organization.create({
      data: {
        name,
        type,
        logo,
        address,
        phone,
        email,
        website,
        license,
        plan: plan || 'free',
      }
    });

    // Create default department
    await db.department.create({
      data: {
        organizationId: organization.id,
        name: type === 'hospital' ? 'الطوارئ' : 'العيادة الرئيسية',
        description: 'القسم الافتراضي',
      }
    });

    return NextResponse.json({
      success: true,
      organization,
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إنشاء المؤسسة' },
      { status: 500 }
    );
  }
}

// Update organization
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف المؤسسة مطلوب' },
        { status: 400 }
      );
    }

    const organization = await db.organization.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      organization,
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث المؤسسة' },
      { status: 500 }
    );
  }
}
