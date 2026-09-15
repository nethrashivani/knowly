import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  register,
  verifyOtp,
  resendOtp,
  saveAuth
} from '../services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
      setMessage('');

      await register(form);

      setOtpSent(true);
      setMessage('OTP sent successfully. Check your email.');
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

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be a 6-digit number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const data = await verifyOtp({
        email: form.email,
        otp: otp
      });

      saveAuth(data);
      navigate('/');
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Invalid or expired OTP.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      await resendOtp({
        email: form.email
      });

      setOtp('');

      setMessage(
        'A new OTP has been sent to your email.'
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Failed to resend OTP. Please try again.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegistration = () => {
    setOtpSent(false);
    setOtp('');
    setError('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">
            Knowly
          </h1>

          <p className="text-gray-500 mt-1">
            {otpSent
              ? 'Verify your email'
              : 'Create your account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">
            {message}
          </div>
        )}

        {!otpSent ? (
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

            <div className="text-center">
              <p className="text-sm text-gray-600">
                We sent a 6-digit verification code to
              </p>

              <p className="font-semibold text-gray-900 mt-1 break-all">
                {form.email}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Verification Code
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6);

                  setOtp(value);
                  setError('');
                }}
                placeholder="Enter 6-digit OTP"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <p className="text-xs text-gray-500 text-center">
              The OTP will expire in 5 minutes.
            </p>

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="w-full border border-blue-600 text-blue-600 font-semibold py-2.5 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Resend OTP'}
            </button>

            <button
              onClick={handleBackToRegistration}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-blue-600 transition"
            >
              ← Back to registration
            </button>

          </div>
        )}

      </div>
    </div>
  );
}