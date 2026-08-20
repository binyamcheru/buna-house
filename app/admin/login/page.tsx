"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./login.css";
import { CoffeeIcon } from "../components/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchCSRFToken = async () => {
    try {
      const response = await fetch(`/api/auth/login?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
        return data.csrfToken;
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
    return "";
  };

  // Fetch CSRF token on page load
  useEffect(() => {
    fetchCSRFToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      let activeToken = csrfToken;
      if (!activeToken) {
        activeToken = await fetchCSRFToken();
      }

      // Call login API with CSRF token
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send/receive secure cookies
        body: JSON.stringify({ email: email.trim(), password, csrfToken: activeToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        setIsLoading(false);

        // Redirect to admin dashboard after brief success state
        setTimeout(() => {
          router.push("/admin");
        }, 500);
      } else {
        setIsLoading(false);
        setErrorMessage(data.error || "Incorrect email or password. Please try again.");
        // Fetch a fresh CSRF token for the next attempt
        fetchCSRFToken();
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      setErrorMessage("Network error. Please try again.");
      fetchCSRFToken();
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-badge">
            <CoffeeIcon size={24} strokeWidth={2} />
          </div>
          <span className="login-logo-text">Buna House</span>
        </div>

        {/* Admin Badge */}
        <div className="login-badge">
          <span className="login-badge-dot" />
          Admin Access Only
        </div>

        {/* Heading */}
        <h1 className="login-heading">Welcome back.</h1>
        <p className="login-subtext">
          Sign in to manage orders, products, and your store.
        </p>

        {/* Portfolio Demo Access */}
        <div className="login-demo-banner">
          <div>
            <strong>Portfolio demo:</strong> browse every admin view read-only.
            <br />
            <code>demo@bunahouse.et</code> / <code>BunaDemo2026!</code>
          </div>
          <button
            type="button"
            className="login-demo-fill"
            onClick={() => {
              setEmail("demo@bunahouse.et");
              setPassword("BunaDemo2026!");
            }}
          >
            Use Demo Login
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="login-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Field */}
          <div className="login-field">
            <label className="login-label">Email</label>
            <div className="login-input-wrapper">
              <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bunahouse.et"
                required
                className="login-input"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-wrapper">
              <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="login-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="login-row">
            <span className="login-checkbox-label" style={{ opacity: 0.6 }}>
              Session auto-managed by secure cookies
            </span>
            <a href="#" className="login-forgot">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="login-submit"
          >
            {isSuccess ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Signed In
              </>
            ) : isLoading ? (
              <>
                <span className="login-spinner" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Security Note */}
        <div className="login-security">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>This is a restricted admin area. All sign-in attempts are logged.</span>
        </div>

        {/* Return Link */}
        <div className="login-return">
          Not an admin?{" "}
          <a href="/">Return to Buna House website →</a>
        </div>
      </div>
    </div>
  );
}
