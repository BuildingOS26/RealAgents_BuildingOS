/// <reference types="vite/client" />
import { auth } from './firebase';

export const API_URL = import.meta.env.VITE_API_URL || '';

// Helper to get Firebase auth token
async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// User API functions
export const userApi = {
  // Get current user's profile (from Supabase, synced with Firebase)
  async getMe() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/users/me`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch profile');
    }
    return response.json();
  },

  // Get all users by company
  async getAll(company: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/users?company=${encodeURIComponent(company)}`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch users');
    }
    return response.json();
  },

  // Get user by ID
  async getById(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/users/${id}`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user');
    }
    return response.json();
  },

  // Get user by email
  async getByEmail(email: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/users/email/${encodeURIComponent(email)}`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user');
    }
    return response.json();
  },

  // Create a new user
  async create(userData: { name: string; email: string; role: string; company?: string; firebase_uid?: string }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }
    return response.json();
  },

  // Update a user
  async update(id: string, userData: { name?: string; role?: string; company?: string }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }
    return response.json();
  },

  // Delete a user
  async delete(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
    return response.json();
  }
};

// Invite API functions
export const inviteApi = {
  // Create and send an invite (requires auth)
  async create(inviteData: { name: string; email: string; role: string; company: string }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/invites`, {
      method: 'POST',
      headers,
      body: JSON.stringify(inviteData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create invite');
    }
    return response.json();
  },

  // Verify an invite token (public - no auth needed)
  async verify(token: string) {
    const response = await fetch(`${API_URL}/api/invites/verify/${token}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Invalid invite link');
    }
    return response.json();
  },

  // Verify session token (public - no auth needed)
  async verifySession(token: string) {
    const response = await fetch(`${API_URL}/api/invites/session/${token}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Invalid session');
    }
    return response.json();
  },

  // Get all invites (requires auth)
  async getAll() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/invites`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch invites');
    }
    return response.json();
  },

  // Resend invite (requires auth)
  async resend(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/invites/${id}/resend`, {
      method: 'POST',
      headers
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to resend invite');
    }
    return response.json();
  }
};