import { useState, useEffect } from 'react';
import { signInWithCustomToken, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { API_URL } from '../../lib/api';
import { Mail, CheckCircle, Loader2, ArrowRight, LogIn, Eye, EyeOff, KeyRound } from 'lucide-react';

export function LoginPage() {
  const [step, setStep] = useState<'info' | 'access-code' | 'details' | 'login' | 'forgot-password'>('info');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');

  // Check if returning from email link sign-in
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Get email from localStorage (saved when link was sent)
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');
      if (!emailForSignIn) {
        // If not in localStorage, prompt user
        emailForSignIn = window.prompt('Please provide your email for confirmation');
      }
      if (emailForSignIn) {
        setLoading(true);
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            // Auth state change will handle redirect
          })
          .catch((err) => {
            setError(err.message || 'Failed to sign in');
            setLoading(false);
          });
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // First check if this email exists in our system
      const checkResponse = await fetch(`${API_URL}/api/auth/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail })
      });

      const checkResult = await checkResponse.json();

      if (!checkResponse.ok || !checkResult.exists) {
        throw new Error('No account found with this email. Please contact your admin for an invitation.');
      }

      // Try to sign in with email/password
      await signInWithEmailAndPassword(auth, loginEmail, password);
      // Auth state change will handle redirect
    } catch (err: any) {
      // If password auth fails, show appropriate error
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect password. Please try again or reset your password.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later or reset your password.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Check if user exists first
      const checkResponse = await fetch(`${API_URL}/api/auth/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail })
      });

      const checkResult = await checkResponse.json();

      if (!checkResponse.ok || !checkResult.exists) {
        throw new Error('No account found with this email.');
      }

      await sendPasswordResetEmail(auth, loginEmail);
      setSuccess(`Password reset email sent to ${loginEmail}. Check your inbox and follow the link to reset your password.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/invites/verify-access-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Invalid access code');
      }

      // Access code verified, proceed to details form
      setStep('details');
    } catch (err: any) {
      setError(err.message || 'Invalid access code');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInviteUrl('');
    setLoading(true);

    // Validate full name
    if (name.trim().length < 3) {
      setError('Please enter a full name (at least 3 characters)');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/invites/register-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), role: role, company: company.trim(), accessCode })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Always show the invite URL since Gmail might block the email
      if (result.inviteUrl) {
        setInviteUrl(result.inviteUrl);
      }

      if (result.emailSent) {
        setSuccess(`Success! A login link has been sent to ${email}. If the email doesn't arrive (it may be blocked by spam filters), you can copy the link below.`);
      } else {
        setSuccess('Admin created! Email failed to send. Share the link below manually.');
      }

      // Clear form
      setName('');
      setEmail('');
      setRole('');
      setCompany('');
      setAccessCode('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Access Code verification
  if (step === 'access-code') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-2">Access Code</h1>
          <p className="text-gray-600 text-center text-sm mb-6">
            Enter the controlling company access code to continue
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyAccessCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Code
              </label>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter access code"
                required
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            <button
              onClick={() => { setStep('info'); setError(''); setAccessCode(''); }}
              className="text-blue-600 hover:underline"
            >
              ← Back
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Login step (for existing users)
  if (step === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-2">Login</h1>
          <p className="text-gray-600 text-center text-sm mb-6">
            Sign in with your email and password
          </p>

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => { setStep('forgot-password'); setError(''); setSuccess(''); }}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            <button
              onClick={() => { setStep('info'); setError(''); setSuccess(''); setLoginEmail(''); setPassword(''); }}
              className="text-blue-600 hover:underline"
            >
              ← Back
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Forgot password step
  if (step === 'forgot-password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
          <p className="text-gray-600 text-center text-sm mb-6">
            Enter your email to receive a password reset link
          </p>

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            <button
              onClick={() => { setStep('login'); setError(''); setSuccess(''); }}
              className="text-blue-600 hover:underline"
            >
              ← Back to Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Admin details form (after access code verified)
  if (step === 'details') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-gray-600 text-center text-sm mb-6">
            Enter the user's details to send them a login link
          </p>

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-green-700 text-sm">{success}</p>
                  {inviteUrl && (
                    <div className="mt-2">
                      <p className="text-xs text-green-600 mb-1">Share this link manually:</p>
                      <code className="text-xs bg-green-100 px-2 py-1 rounded block break-all">{inviteUrl}</code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a role</option>
                <option value="Admin">Admin</option>
                <option value="Facilities Manager">Facilities Manager</option>
                <option value="Building Owner">Building Owner</option>
                <option value="Technician">Technician</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Login Link
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            <button
              onClick={() => { setStep('access-code'); setError(''); setSuccess(''); }}
              className="text-blue-600 hover:underline"
            >
              ← Back
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Landing/info page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">BuildingOS</h1>
        <p className="text-gray-600 mb-6">
          Building management powered by AI
        </p>
        
        {/* Login for existing users */}
        <button
          onClick={() => setStep('login')}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          Login
        </button>
        
        <div className="mt-6 border-t pt-6">
          <p className="text-sm text-gray-500 mb-3">Controlling company?</p>
          <button
            onClick={() => setStep('access-code')}
            className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Create Admin Account
          </button>
        </div>
      </div>
    </div>
  );
}
