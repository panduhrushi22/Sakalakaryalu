'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, Mail, ShieldCheck, UserPlus, LogIn } from 'lucide-react';

export default function LoginPage() {
  // Views:
  // - 'login': Default Welcome Back (Email + Password, Forgot Password?, Login with OTP, Sign Up link)
  // - 'signup_email': Create Account -> Enter Email to get started -> "Verify Email"
  // - 'signup_otp': Enter 6-digit code sent from sakalakaryalu@gmail.com -> "Accept & Continue"
  // - 'signup_details': Enter Name & Password -> "Create Account"
  // - 'forgot_email': Forgot Password / OTP Login -> Send OTP
  // - 'forgot_otp': Verify OTP -> Log in
  const [view, setView] = useState<'login' | 'signup_email' | 'signup_otp' | 'signup_details' | 'forgot_email' | 'forgot_otp'>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Status & Feedback
  const [error, setError] = useState('');
  const [notFoundError, setNotFoundError] = useState(false);
  const [alreadyExistsError, setAlreadyExistsError] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Reset errors/messages when navigating views
  const switchView = (newView: typeof view) => {
    setError('');
    setNotFoundError(false);
    setAlreadyExistsError(false);
    setSuccessMsg('');
    setView(newView);
  };

  // ========================================================
  // 1. Existing User Password Login
  // ========================================================
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedInput = email.trim();
    if (!trimmedInput) {
      setError('Please enter your Gmail address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError('');
    setNotFoundError(false);
    setAlreadyExistsError(false);
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedInput, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 || data.notFound) {
          setNotFoundError(true);
          throw new Error('There is no account with this email. You need to create an account.');
        }
        throw new Error(data.error || 'Invalid credentials. Please check your email and password.');
      }

      if (data.user?.role === 'admin') {
        setSuccessMsg('Welcome, Admin! Opening Admin Dashboard...');
      } else {
        setSuccessMsg('Logged in successfully! Opening your account...');
      }

      window.dispatchEvent(new Event('authChange'));

      setTimeout(() => {
        router.push(data.redirectTo || '/user');
      }, 800);

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================
  // 2. Sign Up Step 1: Send OTP to User Email from sakalakaryalu@gmail.com
  // ========================================================
  const handleSignUpSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');
    setNotFoundError(false);
    setAlreadyExistsError(false);
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, purpose: 'signup' }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 || data.alreadyExists) {
          setAlreadyExistsError(true);
          throw new Error('An account already exists with this email. Please log in instead.');
        }
        throw new Error(data.error || 'Failed to send OTP code.');
      }

      setSuccessMsg(`A 6-digit OTP passcode has been sent to your Gmail inbox: ${trimmedEmail}`);
      setView('signup_otp');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to send verification code.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================
  // 3. Sign Up Step 2: Verify & Accept OTP
  // ========================================================
  const handleSignUpVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please check your email inbox and enter the 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: cleanOtp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP code. Please check your inbox.');
      }

      setSuccessMsg('Email verified successfully! Complete your account below.');
      setView('signup_details');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Verification failed.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================
  // 4. Sign Up Step 3: Complete Account Creation
  // ========================================================
  const handleSignUpComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim().toLowerCase(), 
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      setSuccessMsg('Account created successfully! Welcome to Sakalakaryalu.');
      window.dispatchEvent(new Event('authChange'));

      setTimeout(() => {
        router.push(data.redirectTo || '/user');
      }, 900);

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to create account.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================
  // 5. Forgot Password / OTP Direct Login
  // ========================================================
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');
    setNotFoundError(false);
    setAlreadyExistsError(false);
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, purpose: 'login' }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 || data.notFound) {
          setNotFoundError(true);
          throw new Error('There is no account with this email. You need to create an account.');
        }
        throw new Error(data.error || 'Failed to send OTP.');
      }

      setSuccessMsg(`A 6-digit OTP passcode has been sent to your Gmail inbox: ${trimmedEmail}`);
      setView('forgot_otp');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to send OTP.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please check your email inbox and enter the 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: cleanOtp }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 || data.notFound) {
          setNotFoundError(true);
          throw new Error('There is no account with this email. You need to create an account.');
        }
        throw new Error(data.error || 'Invalid OTP code. Please check your inbox.');
      }

      if (data.user?.role === 'admin') {
        setSuccessMsg('Admin verified! Opening Admin Dashboard...');
      } else {
        setSuccessMsg('OTP verified! Opening your account...');
      }

      window.dispatchEvent(new Event('authChange'));

      setTimeout(() => {
        router.push(data.redirectTo || '/user');
      }, 900);

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Verification failed.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-stone-50/80 via-amber-50/20 to-stone-100/40">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-stone-150 max-w-[480px] w-full p-8 sm:p-11 transition-all">
        
        {/* Top Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="font-outfit text-3xl font-extrabold text-stone-900 tracking-tight">
            {view === 'login' && 'Welcome Back'}
            {view === 'signup_email' && 'Create Account'}
            {view === 'signup_otp' && 'Verify OTP'}
            {view === 'signup_details' && 'Complete Account'}
            {view === 'forgot_email' && 'Login with Gmail OTP'}
            {view === 'forgot_otp' && 'Verify OTP'}
          </h1>
          <p className="font-outfit text-sm text-stone-500">
            {view === 'login' && 'Log in to your Sakalakaryalu account'}
            {view === 'signup_email' && 'Enter your Gmail address to get started'}
            {view === 'signup_otp' && `Enter the 6-digit OTP code sent to your Gmail (${email})`}
            {view === 'signup_details' && 'Gmail verified! Set your name and password to finish'}
            {view === 'forgot_email' && 'Enter your Gmail to receive a login OTP code'}
            {view === 'forgot_otp' && `Enter the 6-digit OTP code sent to your Gmail (${email})`}
          </p>
        </div>

        {/* Error Alert with Smart Action Buttons */}
        {error && (
          <div className="mb-6 bg-red-50/90 border border-red-200 p-4 rounded-xl space-y-2.5 font-outfit">
            <div className="flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>

            {/* Smart Action: If account does not exist, provide 1-click Create Account */}
            {notFoundError && (
              <button
                type="button"
                onClick={() => switchView('signup_email')}
                className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Create an Account Now</span>
              </button>
            )}

            {/* Smart Action: If account already exists, provide 1-click Log In */}
            {alreadyExistsError && (
              <button
                type="button"
                onClick={() => switchView('login')}
                className="w-full mt-2 bg-[#5956e9] hover:bg-[#4a47d6] text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In to Your Account</span>
              </button>
            )}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 font-outfit font-medium">
            <CheckCircle2 className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. LOGIN VIEW (Email + Password)                         */}
        {/* ======================================================== */}
        {view === 'login' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            
            {/* Gmail Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-800 font-outfit">
                Gmail Address
              </label>
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Gmail address"
                className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-sm font-outfit text-stone-900 transition-all placeholder:text-stone-400"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-800 font-outfit">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => switchView('forgot_email')}
                  className="text-xs text-[#5956e9] hover:underline font-outfit font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-sm font-outfit text-stone-900 transition-all placeholder:text-stone-400 pr-11"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Primary Button: Log In */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5956e9] hover:bg-[#4a47d6] active:scale-[0.99] text-white font-outfit font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-[#5956e9]/25 hover:shadow-[#5956e9]/35 transition-all duration-200 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>

            {/* Secondary Button: Login with OTP */}
            <button
              type="button"
              onClick={() => switchView('forgot_email')}
              className="w-full bg-white hover:bg-stone-50 active:scale-[0.99] text-stone-800 font-outfit font-semibold text-xs py-3 rounded-xl border border-stone-200 transition-colors mt-2"
            >
              Login with Gmail OTP
            </button>

            {/* Bottom Link: Don't have an account? Sign Up */}
            <div className="text-center pt-5">
              <p className="font-outfit text-xs text-stone-500">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchView('signup_email')}
                  className="text-[#5956e9] font-bold hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* 2. SIGN UP STEP 1: Enter Email                           */}
        {/* ======================================================== */}
        {view === 'signup_email' && (
          <form onSubmit={handleSignUpSendOtp} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-800 font-outfit">
                Gmail Address
              </label>
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-sm font-outfit text-stone-900 transition-all placeholder:text-stone-400"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 font-outfit">
              <Mail className="h-4 w-4 text-amber-700 flex-shrink-0" />
              <span>We&apos;ll send a 6-digit OTP to your Gmail inbox from <strong>sakalakaryalu@gmail.com</strong>.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5956e9] hover:bg-[#4a47d6] active:scale-[0.99] text-white font-outfit font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-[#5956e9]/25 hover:shadow-[#5956e9]/35 transition-all duration-200 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending OTP to inbox...</span>
                </>
              ) : (
                <span>Verify Gmail</span>
              )}
            </button>

            <div className="text-center pt-5">
              <p className="font-outfit text-xs text-stone-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-[#5956e9] font-bold hover:underline"
                >
                  Log In
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* 3. SIGN UP STEP 2: Enter & Accept OTP                    */}
        {/* ======================================================== */}
        {view === 'signup_otp' && (
          <form onSubmit={handleSignUpVerifyOtp} className="space-y-4">
            
            <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl text-xs font-outfit text-amber-900 space-y-1">
              <p>
                Please check your Gmail inbox at <strong>{email}</strong> for the 6-digit OTP code sent from <strong>sakalakaryalu@gmail.com</strong>.
              </p>
            </div>


            {/* OTP Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-800 font-outfit">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                disabled={isLoading}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••••"
                className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-center font-mono text-xl font-bold tracking-[0.3em] text-stone-900 transition-all placeholder:text-stone-300"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5956e9] hover:bg-[#4a47d6] active:scale-[0.99] text-white font-outfit font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-[#5956e9]/25 hover:shadow-[#5956e9]/35 transition-all duration-200 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <span>Accept OTP & Continue</span>
              )}
            </button>

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => switchView('signup_email')}
                className="text-stone-500 hover:text-stone-800 text-xs font-outfit flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to change email
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* 4. SIGN UP STEP 3: Complete Account Setup                */}
        {/* ======================================================== */}
        {view === 'signup_details' && (
          <form onSubmit={handleSignUpComplete} className="space-y-4">
            
            {/* Verified Badge */}
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-outfit text-emerald-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Gmail Verified: <strong>{email}</strong></span>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-800 font-outfit">
                Full Name
              </label>
              <input
                type="text"
                required
                disabled={isLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-sm font-outfit text-stone-900 transition-all placeholder:text-stone-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-800 font-outfit">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-sm font-outfit text-stone-900 transition-all placeholder:text-stone-400 pr-11"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5956e9] hover:bg-[#4a47d6] active:scale-[0.99] text-white font-outfit font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-[#5956e9]/25 hover:shadow-[#5956e9]/35 transition-all duration-200 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* 5. FORGOT PASSWORD / OTP FLOW                            */}
        {/* ======================================================== */}
        {view === 'forgot_email' && (
          <form onSubmit={handleForgotSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-800 font-outfit">
                Gmail Address
              </label>
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-sm font-outfit text-stone-900 transition-all placeholder:text-stone-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5956e9] hover:bg-[#4a47d6] active:scale-[0.99] text-white font-outfit font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-[#5956e9]/25 hover:shadow-[#5956e9]/35 transition-all duration-200 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending OTP to inbox...</span>
                </>
              ) : (
                <span>Send OTP to Gmail</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchView('login')}
              className="w-full bg-white hover:bg-stone-50 text-stone-700 font-outfit font-semibold text-xs py-3 rounded-xl border border-stone-200 transition-colors mt-2"
            >
              Back to Password Login
            </button>
          </form>
        )}

        {view === 'forgot_otp' && (
          <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
            <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl text-xs font-outfit text-amber-900 space-y-1">
              <p>
                Please check your Gmail inbox at <strong>{email}</strong> for the 6-digit OTP code sent from <strong>sakalakaryalu@gmail.com</strong>.
              </p>
            </div>


            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-800 font-outfit">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                disabled={isLoading}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••••"
                className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-center font-mono text-xl font-bold tracking-[0.3em] text-stone-900 transition-all placeholder:text-stone-300"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5956e9] hover:bg-[#4a47d6] active:scale-[0.99] text-white font-outfit font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-[#5956e9]/25 hover:shadow-[#5956e9]/35 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => switchView('forgot_email')}
                className="text-stone-500 hover:text-stone-800 text-xs font-outfit flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to change Gmail
              </button>
            </div>
          </form>
        )}

        {/* Footer Note */}
        <div className="text-center pt-8 border-t border-stone-100 mt-8">
          <p className="font-outfit text-xs text-stone-500">
            Official communications are sent from{' '}
            <strong className="text-stone-800 font-semibold">sakalakaryalu@gmail.com</strong>.
          </p>
        </div>

      </div>
    </div>
  );
}
