import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب جميع المرضى
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status;
    if (search) {
      where.name = { contains: search };
    }

    const patients = await db.patient.findMany({
      where,
      include: {
        organization: true,
        department: true,
        healthReadings: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
        emergencyContacts: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      patients,
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب المرضى' },
      { status: 500 }
    );
  }
}

// POST - إضافة مريض جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      organizationId, departmentId, name, nationalId, 
      dateOfBirth, gender, bloodType, address, 
      emergencyContact, medicalConditions, allergies, 
      medications, notes, roomNumber, bedNumber, status 
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'اسم المريض مطلوب' },
        { status: 400 }
      );
    }

    const patientCount = await db.patient.count();
    const medicalRecordNumber = `MRN-${String(patientCount + 1).padStart(6, '0')}`;

    const patient = await db.patient.create({
      data: {
        organizationId,
        departmentId,
        name,
        nationalId,
        medicalRecordNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        bloodType,
        address,
        emergencyContact,
        medicalConditions,
        allergies,
        medications,
        notes,
        roomNumber,
        bedNumber,
        status: status || 'active',
        admissionDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      patient,
      message: 'تم إضافة المريض بنجاح',
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إضافة المريض' },
      { status: 500 }
    );
  }
}

// PUT - تحديث بيانات مريض
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف المريض مطلوب' },
        { status: 400 }
      );
    }

    const patient = await db.patient.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث المريض' },
      { status: 500 }
    );
  }
}

// DELETE - حذف مريض
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف المريض مطلوب' },
        { status: 400 }
      );
    }

    await db.patient.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف المريض',
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في حذف المريض' },
      { status: 500 }
    );
  }
}
