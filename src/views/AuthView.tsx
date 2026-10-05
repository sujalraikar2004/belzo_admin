import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export const AuthView: React.FC = () => {
  const { login, verify2FA, requires2FA } = useAuthStore();
  const { addToast } = useUIStore();

  const [step, setStep] = useState<'LOGIN' | '2FA' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('rahul.sharma@belzo.com');
  const [password, setPassword] = useState('Belzo@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast({
        type: 'ERROR',
        title: 'Credentials Required',
        message: 'Please provide both admin email and password.',
      });
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      if (result.requires2FA) {
        setStep('2FA');
        addToast({
          type: 'INFO',
          title: '2FA Code Sent',
          message: 'Check your Google Authenticator or SMS for your 6-digit passcode.',
        });
      } else {
        addToast({
          type: 'SUCCESS',
          title: 'Welcome to Belzo Operations',
          message: 'Signed in successfully.',
        });
      }
    } else {
      addToast({
        type: 'ERROR',
        title: 'Authentication Failed',
        message: result.message || 'Invalid administrator credentials.',
      });
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length < 6) {
      addToast({
        type: 'ERROR',
        title: 'Invalid Code',
        message: 'Please enter the complete 6-digit authentication token.',
      });
      return;
    }

    setIsLoading(true);
    const success = await verify2FA(twoFactorCode);
    setIsLoading(false);

    if (success) {
      addToast({
        type: 'SUCCESS',
        title: '2FA Verification Passed',
        message: 'Security token verified. Connecting to cluster.',
      });
    } else {
      addToast({
        type: 'ERROR',
        title: 'Verification Failed',
        message: 'Invalid security code. Please check your authenticator.',
      });
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      addToast({
        type: 'ERROR',
        title: 'Email Required',
        message: 'Please enter your administrative work email.',
      });
      return;
    }
    addToast({
      type: 'SUCCESS',
      title: 'Reset Link Dispatched',
      message: `Password reset instructions sent to ${forgotEmail}.`,
    });
    setStep('LOGIN');
  };

  const quickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Belzo@2026');
  };

  return (
    <div className="min-h-screen w-full bg-surface-container-low flex flex-col justify-between p-4 sm:p-8">
      {/* Brand Top Header */}
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl shadow-sm">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface leading-none">
                Belzo
              </span>
              <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-primary text-[10px] font-bold">
                ADMIN
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant block">
              Central Operations Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant bg-surface-container-lowest px-3 py-1.5 rounded-full border border-surface-container-high/60 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>BLR & PUNE CLUSTERS ONLINE</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md mx-auto w-full my-auto">
        <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xl p-space-lg sm:p-8 space-y-space-lg">
          {step === 'LOGIN' && (
            <>
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Admin Sign In
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Access platform telemetry, live delivery fleet, restaurant verification, and financial settlements.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-space-md">
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@belzo.com"
                    required
                    className="w-full px-3 py-2.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary font-body-md"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('FORGOT')}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full px-3 py-2.5 pr-10 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary font-body-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">lock_open</span>
                      Authenticate & Access Console
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Role Fillers for Review & Testing */}
              <div className="pt-space-md border-t border-surface-container-high space-y-2">
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Quick Demo Accounts:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => quickFill('rahul.sharma@belzo.com')}
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-left border border-surface-container-high/60"
                  >
                    <span className="font-bold text-on-surface block">Rahul Sharma</span>
                    <span className="text-[10px] text-primary font-semibold">Super Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFill('priya.nair@belzo.com')}
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-left border border-surface-container-high/60"
                  >
                    <span className="font-bold text-on-surface block">Priya Nair</span>
                    <span className="text-[10px] text-amber-700 font-semibold">Operations Lead</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFill('ananya.deshmukh@belzo.com')}
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-left border border-surface-container-high/60"
                  >
                    <span className="font-bold text-on-surface block">Ananya Deshmukh</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Finance Director</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFill('kavita.krishnan@belzo.com')}
                    className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-left border border-surface-container-high/60"
                  >
                    <span className="font-bold text-on-surface block">Kavita Krishnan</span>
                    <span className="text-[10px] text-purple-700 font-semibold">Support Lead</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {step === '2FA' && (
            <div className="space-y-space-md">
              <div>
                <span className="p-3 rounded-2xl bg-primary-fixed text-primary inline-block mb-3">
                  <span className="material-symbols-outlined text-[28px]">phonelink_lock</span>
                </span>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Two-Factor Authentication
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Enter the 6-digit security code from your Google Authenticator or SMS app to confirm your administrator session.
                </p>
              </div>

              <form onSubmit={handle2FASubmit} className="space-y-space-md">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-3 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface focus:outline-none focus:border-primary"
                  />
                  <span className="text-[11px] text-on-surface-variant text-center block mt-1.5">
                    Demo bypass: Enter any 6-digit code (e.g. 123456)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  ) : (
                    'Verify & Enter Hub'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('LOGIN')}
                  className="w-full text-center text-xs text-on-surface-variant hover:text-on-surface"
                >
                  ← Back to Password Login
                </button>
              </form>
            </div>
          )}

          {step === 'FORGOT' && (
            <div className="space-y-space-md">
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Reset Password
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Enter your official email. We will dispatch an OTP and reset link if your account is active.
                </p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-space-md">
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Official Admin Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@belzo.com"
                    required
                    className="w-full px-3 py-2.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 font-label-md text-label-md font-semibold transition-colors shadow-sm"
                >
                  Send Recovery Link
                </button>

                <button
                  type="button"
                  onClick={() => setStep('LOGIN')}
                  className="w-full text-center text-xs text-on-surface-variant hover:text-on-surface"
                >
                  ← Return to Sign In
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto w-full text-center text-xs text-on-surface-variant py-4">
        © 2026 Belzo Technologies Private Limited. High Security Enterprise Environment.
      </div>
    </div>
  );
};
