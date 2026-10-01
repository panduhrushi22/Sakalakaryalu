import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, purpose } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'sakalakaryalu@gmail.com').toLowerCase();
    const isAdminEmail = trimmedEmail === adminEmail;

    // Check if account exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    // 1. If trying to LOG IN or FORGOT PASSWORD:
    if (purpose === 'login') {
      if (!existingUser && !isAdminEmail) {
        return NextResponse.json(
          { 
            error: 'There is no account with this email. You need to create an account first.',
            notFound: true,
          },
          { status: 404 }
        );
      }
    }

    // 2. If trying to SIGN UP (Create Account):
    if (purpose === 'signup') {
      if (existingUser) {
        return NextResponse.json(
          { 
            error: 'An account already exists with this email. Please log in instead.',
            alreadyExists: true,
          },
          { status: 409 }
        );
      }
    }

    // Generate random 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Remove old OTP records for this email
    try {
      await prisma.otp.deleteMany({
        where: { email: trimmedEmail },
      });
    } catch (e) {
      // Ignore if table or record not found
    }

    // Create new OTP record
    await prisma.otp.create({
      data: {
        email: trimmedEmail,
        code: otpCode,
        expiresAt,
      },
    });

    // Send email using Nodemailer from sakalakaryalu@gmail.com
    const emailResult = await sendOtpEmail(trimmedEmail, otpCode);

    if (!emailResult.sent) {
      return NextResponse.json(
        {
          error: emailResult.message || 'Unable to send OTP to your Gmail. Please ensure GMAIL_APP_PASSWORD is set in .env.',
          emailDelivered: false,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to your Gmail inbox: ${trimmedEmail}`,
      senderEmail: adminEmail,
      emailDelivered: true,
      isAdminEmail,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
