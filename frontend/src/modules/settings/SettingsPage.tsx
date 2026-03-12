import { useState, useEffect } from 'react';
import { UserPlus, Users, Trash2, X, RefreshCw, Mail, Link, Copy, Check, Edit2 } from 'lucide-react';
import { inviteApi, userApi } from '../../lib/api';
import { useAuth } from '../auth/AuthContext';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  created_at: string;
}

interface Invite {
  id: string;
  token: string;
  name: string;
  email: string;
  role: string;
  company: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}

export function SettingsPage() {
  const { user, profile, isAdmin } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  // Get current user's company from Supabase profile (authoritative source)
  const currentUserCompany = profile?.company || '';
  
  // Get current user's email for self-edit check
  const currentUserEmail = profile?.email || user?.email || '';

  // Fetch users and invites from API on mount
  const fetchData = async () => {
    if (!currentUserCompany) {
      console.log('No company found for current user, profile:', profile);
      setFetching(false);
      return;
    }
    
    console.log('Fetching users for company:', currentUserCompany);
    setFetching(true);
    try {
      const [usersData, invitesData] = await Promise.all([
        userApi.getAll(currentUserCompany),
        isAdmin ? inviteApi.getAll() : Promise.resolve({ invites: [] })
      ]);
      console.log('Users fetched:', usersData.users);
      setUsers(usersData.users || []);
      // Filter invites by company
      const companyInvites = (invitesData.invites || []).filter(
        (inv: Invite) => inv.company === currentUserCompany
      );
      setInvites(companyInvites);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setFetching(false);
    }
  };

  // Wait for profile to load, then fetch data
  useEffect(() => {
    if (profile) {
      setProfileLoading(false);
      fetchData();
    } else if (user && !profile) {
      // Profile not loaded yet, keep waiting
      setProfileLoading(true);
    }
  }, [profile, user]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInviteUrl('');
    setLoading(true);

    // Validate inputs
    if (name.trim().length < 3) {
      setError('Please enter the full name (at least 3 characters)');
      setLoading(false);
      return;
    }

    try {
      const result = await inviteApi.create({
        name: name.trim(),
        email: email.trim(),
        role,
        company: currentUserCompany  // Auto-attach company from current user
      });

      if (result.emailSent) {
        setSuccess(`Invite sent to ${email}!`);
      } else {
        setSuccess(`Invite created! Email failed to send.`);
        setInviteUrl(result.inviteUrl);
      }
      
      setName('');
      setEmail('');
      setRole('');
      setShowAddUser(false);
      
      // Refresh the data
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteUser = async (id: string, userEmail: string) => {
    // Only admin can delete, and can't delete themselves
    if (!isAdmin) {
      setError('Only admins can delete users');
      return;
    }
    if (userEmail === currentUserEmail) {
      setError('You cannot delete yourself');
      return;
    }
    try {
      await userApi.delete(id);
      setUsers(users.filter(u => u.id !== id));
      setSuccess('User deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleStartEdit = (userId: string, userName: string) => {
    setEditingUserId(userId);
    setEditName(userName);
  };

  const handleSaveEdit = async (userId: string) => {
    try {
      await userApi.update(userId, { name: editName });
      setUsers(users.map(u => u.id === userId ? { ...u, name: editName } : u));
      setEditingUserId(null);
      setEditName('');
      setSuccess('Name updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update name');
    }
  };

  const handleResendInvite = async (id: string) => {
    try {
      await inviteApi.resend(id);
      setSuccess('Invite resent successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to resend invite');
    }
  };

  // Show loading while profile is being fetched
  if (profileLoading && !profile) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading your profile...</span>
        </div>
      </div>
    );
  }

  // Show message if no profile found
  if (!profile) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Unable to load your profile. Please try logging out and back in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            {currentUserCompany ? `${currentUserCompany} - Team Members` : 'Manage your team'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            disabled={fetching}
            className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${fetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Invite User
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
          {inviteUrl && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm">Share this link:</span>
              <code className="bg-green-100 px-2 py-1 rounded text-xs flex-1 truncate">{inviteUrl}</code>
              <button
                onClick={() => handleCopyLink(inviteUrl)}
                className="p-1 hover:bg-green-200 rounded"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invite User Form Panel */}
        {showAddUser && (
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Invite New User</h2>
              <button
                onClick={() => setShowAddUser(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSendInvite} className="space-y-4">
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
                  <option value="Facilities Manager">Facilities Manager</option>
                  <option value="Building Owner">Building Owner</option>
                  <option value="Technician">Technician</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Content */}
        <div className={`${showAddUser ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
          {/* Pending Invites - Only visible to admins */}
          {isAdmin && invites.filter(i => !i.used).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange-500" />
                <h2 className="font-semibold text-gray-900">Pending Invites</h2>
                <span className="text-sm text-gray-500">({invites.filter(i => !i.used).length})</span>
              </div>
              <div className="divide-y divide-gray-200">
                {invites.filter(i => !i.used).map((invite) => (
                  <div key={invite.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{invite.name}</p>
                        <p className="text-sm text-gray-500">{invite.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{invite.role}</span>
                      <button
                        onClick={() => handleCopyLink(`${window.location.origin}/invite/${invite.token}`)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        title="Copy invite link"
                      >
                        <Link className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResendInvite(invite.id)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                        title="Resend invite"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Users */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold text-gray-900">Team Members</h2>
              <span className="text-sm text-gray-500">({users.length})</span>
            </div>

            {fetching ? (
              <div className="p-8 text-center text-gray-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-3 text-gray-300 animate-spin" />
                <p>Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No team members yet</p>
                {isAdmin && <p className="text-sm">Send an invite to add team members</p>}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {users.map((u) => {
                  const isCurrentUser = u.email === currentUserEmail;
                  const isEditing = editingUserId === u.id;
                  
                  return (
                    <div key={u.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${isCurrentUser ? 'bg-blue-100' : 'bg-green-100'} rounded-full flex items-center justify-center`}>
                          <span className={`${isCurrentUser ? 'text-blue-600' : 'text-green-600'} font-semibold`}>
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveEdit(u.id)}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <p className="font-medium text-gray-900">
                              {u.name}
                              {isCurrentUser && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{u.role}</span>
                        {/* Self-edit button - only for current user */}
                        {isCurrentUser && !isEditing && (
                          <button
                            onClick={() => handleStartEdit(u.id, u.name)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                            title="Edit your name"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {/* Delete button - only for admin, not for self */}
                        {isAdmin && !isCurrentUser && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Remove user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
