import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sakalakaryalu_secret_dev_key';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Hash the password with SHA-256
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Strict authorization guard: Only owner and specified admin emails allowed
    const allowedEmails = [
      'admin@sakalakaryalu.com',
      'owner@sakalakaryalu.com',
      'content@sakalakaryalu.com',
      'delivery@sakalakaryalu.com',
      'admin@sakalakaryalu.in',
      'panduhrushi22@gmail.com'
    ];
    if (!allowedEmails.includes(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access is strictly restricted' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
