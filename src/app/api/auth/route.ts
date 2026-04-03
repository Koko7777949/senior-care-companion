import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to hash password
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name, phone, role, organizationId } = body;

    if (action === 'login') {
      // Find user
      const user = await db.user.findUnique({
        where: { email },
        include: {
          organization: true,
          department: true,
        }
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني غير مسجل' },
          { status: 401 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { success: false, error: 'الحساب غير مفعل' },
          { status: 401 }
        );
      }

      // Verify password
      if (user.password) {
        const hashedPassword = await hashPassword(password);
        if (user.password !== hashedPassword) {
          return NextResponse.json(
            { success: false, error: 'كلمة المرور غير صحيحة' },
            { status: 401 }
          );
        }
      }

      // Update last active
      await db.user.update({
        where: { id: user.id },
        data: { lastActive: new Date() }
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
          organization: user.organization,
          department: user.department,
        }
      });
    }

    if (action === 'signup') {
      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني مسجل مسبقاً' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await db.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          phone,
          role: role || 'senior',
          organizationId,
        },
        include: {
          organization: true,
        }
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          organization: user.organization,
        }
      });
    }

    if (action === 'logout') {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'إجراء غير معروف' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// Get current user
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        department: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        organization: user.organization,
        department: user.department,
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
