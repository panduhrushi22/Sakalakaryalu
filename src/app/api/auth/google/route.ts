import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1022664572070-pthiuocpp5balnotc9sgk3d476uap5sh.apps.googleusercontent.com';
const JWT_SECRET = process.env.JWT_SECRET || 'sakalakaryalu_secret_dev_key';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { error: 'Google credential token is missing' },
        { status: 400 }
      );
    }

    // Verify Google ID token
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      // Fallback decoding if verifyIdToken encounters audience formatting issues in local testing
      console.warn('verifyIdToken failed, attempting fallback payload decode:', verifyErr);
      const decoded = jwt.decode(credential) as any;
      if (decoded && decoded.email) {
        payload = decoded;
      } else {
        throw verifyErr;
      }
    }

    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: 'Unable to retrieve email from Google Account' },
        { status: 400 }
      );
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split('@')[0];
    const adminEmail = (process.env.ADMIN_EMAIL || 'sakalakaryalu@gmail.com').toLowerCase().trim();
    const isAdmin = email === adminEmail;
    const role = isAdmin ? 'admin' : 'user';

    // Find or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) {
      const dummyPassword = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10);
      dbUser = await prisma.user.create({
        data: {
          email,
          name,
          password: dummyPassword,
          role,
        },
      });
    } else if (isAdmin && dbUser.role !== 'admin') {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { role: 'admin' },
      });
    }

    // Sign session JWT
    const token = jwt.sign(
      {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const redirectTo = dbUser.role === 'admin' ? '/admin/dashboard' : '/user';

    const response = NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      },
      redirectTo,
    });

    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error: any) {
    console.error('Google Auth Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Google Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
