import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  register,
  resendOtp,
  saveAuth,
  verifyOtp
} from '../services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const getErrorMessage = (err, fallback) => {
    const data = err.response?.data;

    if (typeof data === 'string') {
      return data;
    }

    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }

    return fallback;
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    if (!form.name.trim()) {
      return 'Name is required';
    }

    if (!form.email.trim()) {
      return 'Email is required';
    }

    if (!form.password || form.password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    return null;
  };

  const handleRegister = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      await register(form);
      setOtp('');
      setOtpStep(true);
      setResendCooldown(60);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Registration failed. Please try again.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await verifyOtp({
        email: form.email,
        otp
      });

      saveAuth(data);
      navigate('/');
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Invalid or expired OTP. Please try again.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;

    try {
      setResending(true);
      setError('');

      await resendOtp({ email: form.email });
      setOtp('');
      setResendCooldown(60);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Could not resend the OTP. Please try again.'
        )
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">
            Knowly
          </h1>
          <p className="text-gray-500 mt-1">
            {otpStep ? 'Verify your email' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {!otpStep ? (
          <div className="flex flex-col gap-4">

            <div>
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <span
                onClick={() => navigate('/login')}
                className="text-blue-600 font-medium cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>

          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-sm text-gray-600 text-center">
              We sent a 6-digit verification code to
              <div className="font-semibold text-gray-800 mt-1 break-all">
                {form.email}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-center tracking-[0.4em] text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <div className="text-center text-sm text-gray-500">
              Didn’t receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || resending}
                className="text-blue-600 font-medium hover:underline disabled:text-gray-400 disabled:no-underline"
              >
                {resending
                  ? 'Sending...'
                  : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend OTP'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setOtpStep(false);
                setOtp('');
                setError('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}