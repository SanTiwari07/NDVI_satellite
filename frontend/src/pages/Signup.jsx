/**
 * Signup.jsx — New farmer registration: mobile + password → OTP verify → account created.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { signup, sendOtp, verifyOtp } from '../api/auth';
import PrimaryButton from '../components/PrimaryButton';

export default function Signup() {
  const navigate = useNavigate();
  const { setAuth } = useOnboarding();

  // step: 'form' | 'otp'
  const [step, setStep] = useState('form');

  const [form, setForm] = useState({ mobile: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const otpRefs = useRef([]);

  // Countdown timer when on OTP step
  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return;
    const t = setInterval(() => setCountdown((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [step, countdown]);

  // Auto-focus first OTP box
  useEffect(() => {
    if (step === 'otp') setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }, [step]);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === 'mobile' ? value.replace(/\D/g, '').slice(0, 10) : value }));
    setErrors((p) => ({ ...p, [name]: '', api: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!/^\d{10}$/.test(form.mobile)) errs.mobile = 'Enter a valid 10-digit mobile number.';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  // Step 1 — validate form, send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      await sendOtp(form.mobile);
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      setOtpError('');
      setStep('otp');
    } catch (err) {
      setErrors({ api: err.message || 'Could not send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify OTP, then create account
  const handleVerifyAndSignup = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;
    setLoading(true);
    setOtpError('');
    try {
      await verifyOtp(form.mobile, code);
      // OTP verified — now create the account
      const data = await signup(form.mobile, form.password);
      setAuth(data.farmer_id, data.token, data.is_new_user);
      navigate('/onboarding/step1', { replace: true });
    } catch (err) {
      setOtpError(err.message || 'Incorrect or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e, i) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...otp]; next[i] = v; setOtp(next);
    setOtpError('');
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (e, i) => {
    if (e.key === 'Backspace') {
      const next = [...otp];
      if (!next[i] && i > 0) { next[i - 1] = ''; setOtp(next); otpRefs.current[i - 1]?.focus(); }
      else { next[i] = ''; setOtp(next); }
    } else if (e.key === 'ArrowLeft' && i > 0) otpRefs.current[i - 1]?.focus();
    else if (e.key === 'ArrowRight' && i < 5) otpRefs.current[i + 1]?.focus();
    else if (e.key === 'Enter' && otp.join('').length === 6) handleVerifyAndSignup();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const d = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    [...d].forEach((c, i) => { next[i] = c; });
    setOtp(next);
    otpRefs.current[Math.min(d.length, 5)]?.focus();
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      await sendOtp(form.mobile);
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      setOtpError('');
      otpRefs.current[0]?.focus();
    } catch (err) {
      setOtpError(err.message || 'Could not resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Screen ────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-[#0a0f14] flex flex-col">
        <div className="p-4">
          <button onClick={() => setStep('form')} className="flex items-center gap-1.5 text-[#4a5568] hover:text-[#7a90a8] text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-10">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#1A6B3C] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-white">Verify Mobile</h1>
              <p className="text-[#7a90a8] text-sm mt-1">
                Enter the 6-digit code sent to <span className="text-white font-semibold">+91 {form.mobile}</span>
              </p>
            </div>

            <div className="bg-[#111820] rounded-3xl shadow-xl border border-[#ffffff1a] p-6">
              {/* OTP boxes */}
              <div className="flex justify-center gap-2 mb-4">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(e, i)}
                    onKeyDown={(e) => handleOtpKey(e, i)}
                    onPaste={handleOtpPaste}
                    className={`w-11 h-12 text-center text-xl font-bold border rounded-lg bg-[#1a2432] text-white outline-none transition-colors
                      ${otpError ? 'border-red-400' : 'border-[#ffffff1a] focus:border-[#1A6B3C] focus:ring-2 focus:ring-[#1A6B3C]'}`}
                  />
                ))}
              </div>

              {otpError && <p className="text-xs text-red-500 text-center mb-3">{otpError}</p>}

              <PrimaryButton
                label="Verify & Create Account →"
                loading={loading}
                disabled={otp.join('').length !== 6}
                onClick={handleVerifyAndSignup}
              />

              <div className="text-center mt-4 text-sm text-[#7a90a8]">
                {countdown > 0 ? (
                  <span>Resend code in {String(countdown).padStart(2, '0')}s</span>
                ) : (
                  <button onClick={resendOtp} className="text-[#1A6B3C] font-semibold hover:underline" disabled={loading}>
                    Resend code
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Signup Form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0f14] flex flex-col">
      <div className="p-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-[#4a5568] hover:text-[#7a90a8] text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1A6B3C] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Create Account</h1>
            <p className="text-[#7a90a8] text-sm mt-1">Join KrishiSat to monitor your farm</p>
          </div>

          <div className="bg-[#111820] rounded-3xl shadow-xl border border-[#ffffff1a] p-6 space-y-4">
            <form onSubmit={handleSendOtp} className="space-y-4">

              <div className="space-y-1">
                <label htmlFor="mobile" className="text-sm font-semibold text-[#e2e8f0]">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="flex items-center px-3 bg-[#1a2432] border border-r-0 border-[#ffffff1a] rounded-l-lg text-[#7a90a8] text-sm font-medium whitespace-nowrap">+91</span>
                  <input
                    id="mobile" name="mobile" type="tel" inputMode="numeric"
                    value={form.mobile} onChange={change} placeholder="10-digit mobile"
                    className={`flex-1 min-h-[48px] px-4 text-base border bg-[#1a2432] text-white placeholder-[#7a90a8] rounded-r-lg outline-none transition-colors
                      ${errors.mobile ? 'border-red-400' : 'border-[#ffffff1a] focus:ring-2 focus:ring-[#1A6B3C] focus:border-[#1A6B3C]'}`}
                  />
                </div>
                {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-semibold text-[#e2e8f0]">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password" name="password" type={showPw ? 'text' : 'password'}
                    value={form.password} onChange={change} placeholder="Min. 6 characters"
                    className={`w-full min-h-[48px] px-4 pr-11 text-base border bg-[#1a2432] text-white placeholder-[#7a90a8] rounded-lg outline-none transition-colors
                      ${errors.password ? 'border-red-400' : 'border-[#ffffff1a] focus:ring-2 focus:ring-[#1A6B3C] focus:border-[#1A6B3C]'}`}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 inset-y-0 flex items-center text-[#4a5568] hover:text-[#7a90a8]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPw ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-[#e2e8f0]">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword" name="confirmPassword" type={showPw ? 'text' : 'password'}
                  value={form.confirmPassword} onChange={change} placeholder="Repeat password"
                  className={`w-full min-h-[48px] px-4 text-base border bg-[#1a2432] text-white placeholder-[#7a90a8] rounded-lg outline-none transition-colors
                    ${errors.confirmPassword ? 'border-red-400' : 'border-[#ffffff1a] focus:ring-2 focus:ring-[#1A6B3C] focus:border-[#1A6B3C]'}`}
                />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>

              {errors.api && (
                <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl px-4 py-3 text-sm text-red-600">
                  {errors.api}
                </div>
              )}

              <div className="pt-1">
                <PrimaryButton
                  type="submit"
                  label="Send OTP →"
                  loading={loading}
                  disabled={form.mobile.length !== 10 || form.password.length < 6 || form.password !== form.confirmPassword}
                />
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-[#7a90a8] mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1A6B3C] font-semibold hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
