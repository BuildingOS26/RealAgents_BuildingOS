import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { signInWithCustomToken, updatePassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { inviteApi } from '../../lib/api';
import { CheckCircle, XCircle, Loader2, Lock, Eye, EyeOff } from 'lucide-react';

interface InviteUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
}

export function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'verified' | 'success' | 'error'>('loading');
  const [user, setUser] = useState<InviteUser | null>(null);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Invalid invite link');
      return;
    }

    verifyInvite();
  }, [token]);

  const verifyInvite = async () => {
    try {
      const result = await inviteApi.verify(token!);
      
      // Sign in to Firebase with the custom token
      await signInWithCustomToken(auth, result.customToken);
      
      setUser(result.user);
      setStatus('verified'); // Show password setup form
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Failed to verify invite');
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSettingPassword(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      // Set password for the user
      await updatePassword(currentUser, password);

      setStatus('success');

      // Redirect to app after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      console.error('Password set error:', err);
      // If updatePassword fails (e.g., user signed in with custom token), 
      // still redirect - they can set password later via forgot password
      if (err.code === 'auth/requires-recent-login') {
        setStatus('success');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(err.message || 'Failed to set password');
      }
    } finally {
      setSettingPassword(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900">Verifying your invite...</h1>
          <p className="text-gray-600 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900">Invite Error</h1>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (status === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="text-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900">Welcome, {user?.name}!</h1>
            <p className="text-gray-600 mt-2">
              You've been added as a <strong>{user?.role}</strong> at <strong>{user?.company}</strong>
            </p>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Create Your Password
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Set a password to log in to your account in the future.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={settingPassword}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {settingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting Password...
                  </>
                ) : (
                  'Set Password & Continue'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900">You're all set!</h1>
        <p className="text-gray-600 mt-2">
          Welcome to BuildingOS, {user?.name}
        </p>
        <p className="text-gray-500 mt-4 text-sm">Redirecting you to the app...</p>
        <div className="mt-4">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
        </div>
      </div>
    </div>
  );
}
