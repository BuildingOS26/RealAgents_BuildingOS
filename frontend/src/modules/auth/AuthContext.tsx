import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { userApi } from '../../lib/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  firebase_uid: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user profile from Supabase (via backend)
  const fetchProfile = async (retryCount = 0): Promise<UserProfile | null> => {
    try {
      console.log('Fetching profile, attempt:', retryCount + 1);
      const result = await userApi.getMe();
      console.log('Profile result:', result);
      if (result.user) {
        setProfile(result.user);
        setIsAdmin(result.user.role === 'Admin');
        return result.user;
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      // Retry up to 3 times with delay (profile might be syncing)
      if (retryCount < 3 && err.message?.includes('not found')) {
        console.log('Profile not found, retrying in 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchProfile(retryCount + 1);
      }
    }
    return null;
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch profile from Supabase (the authoritative source)
        const userProfile = await fetchProfile();
        
        if (!userProfile) {
          // Profile not found in Supabase — user was deleted
          // Force sign out so they can't stay logged in
          console.warn('User authenticated but profile deleted from database. Signing out.');
          await signOut(auth);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        setLoading(false);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, isAdmin, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
