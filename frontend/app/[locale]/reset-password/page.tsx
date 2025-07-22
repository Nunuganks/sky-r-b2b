"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale as string;
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setCheckingToken(false);
      setError("Invalid reset link");
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch('/api/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setValidToken(true);
      } else {
        setError(data.error || 'Invalid or expired reset link');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setCheckingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError(t("passwordsDontMatch"));
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          locale
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-white font-sans">
        <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border border-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-white font-sans">
        <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border border-gray-100">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Invalid Reset Link</h2>
          <p className="text-center text-gray-500 mb-6">{error}</p>
          <div className="text-center">
            <Link 
              href={`/${locale}/login`}
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-white font-sans">
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Reset Password</h2>
        <p className="text-center text-gray-500 mb-6">Enter your new password</p>
        
        {success ? (
          <div className="text-center">
            <div className="text-green-600 text-sm mb-4">{success}</div>
            <Link 
              href={`/${locale}/login`}
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                  New Password <span className="text-primary">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-2 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                  placeholder="Enter new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirm Password <span className="text-primary">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-2 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center font-semibold">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 transition disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 