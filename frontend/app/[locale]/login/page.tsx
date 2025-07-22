"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function LoginPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = params?.locale as string;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          locale
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // Redirect to products page
        window.location.href = `/${locale}`;
      } else {
        setError(data.error || t("invalidCredentials"));
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setError("Please enter your email address");
      return;
    }
    
    setForgotPasswordLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          locale
        }),
      });

      const data = await response.json();

      if (data.success) {
        setForgotPasswordSuccess(data.message);
        setForgotPasswordEmail("");
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-white font-sans">
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{t("loginTitle")}</h2>
        <p className="text-center text-gray-500 mb-6">{t("loginSubtitle")}</p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                {t("email")} <span className="text-primary">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-2 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                placeholder={t("email")}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  {t("password")} <span className="text-primary">*</span>
                </label>
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-gray-400 hover:text-primary transition"
                >
                  {t("forgotPassword")}
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-2 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                placeholder={t("password")}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center font-semibold">{error}</div>}
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center text-sm text-gray-700">
              <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="ml-2">{t("rememberMe")}</span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="ml-2 px-8 py-2 rounded-lg bg-primary text-white font-bold shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            >
              {loading ? t("signingIn") : t("signIn")}
            </button>
          </div>
        </form>
        <div className="text-center text-md text-gray-500 mt-8">
          {t("noAccount")} {' '}
          <Link href={`/${locale}/register`} className="text-primary font-semibold hover:underline">
            {t("toRegister")}
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{t("forgotPassword")}</h3>
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("email")}
                </label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-blue-50 px-4 py-2 text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                  placeholder={t("email")}
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
              {forgotPasswordSuccess && <div className="text-green-600 text-sm mb-4">{forgotPasswordSuccess}</div>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                    setError("");
                    setForgotPasswordSuccess("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {forgotPasswordLoading ? t("sending") : t("sendResetEmail")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 