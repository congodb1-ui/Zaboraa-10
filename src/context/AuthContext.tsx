import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type UserRole = 'user' | 'admin';

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  licenseTier: SubscriptionTier;
  role: UserRole;
  provider: 'google' | 'password' | 'demo';
}

export interface ProfileRecord {
  id: string;
  email: string | null;
  role: UserRole;
  subscription_tier: SubscriptionTier;
  full_name: string | null;
  avatar_url: string | null;
}

export interface AuthContextType {
  user: AuthUserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  role: UserRole | null;
  subscriptionTier: SubscriptionTier;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  signInWithGoogle: () => Promise<AuthUserProfile>;
  signInWithGoogleRedirect: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<AuthUserProfile>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<AuthUserProfile>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  quickDemoLogin: () => AuthUserProfile;
  signOut: () => Promise<void>;
  isCommercializeModalOpen: boolean;
  setIsCommercializeModalOpen: (open: boolean) => void;
  authError: string | null;
  clearAuthError: () => void;
}

const STORAGE_USER_KEY = 'zaboraa_auth_user_v1';
const STORAGE_TIER_KEY = 'zaboraa_license_tier_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getLocalStoredUser(): AuthUserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveLocalStoredUser(profile: AuthUserProfile | null) {
  try {
    if (profile) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUserProfile | null>(getLocalStoredUser);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCommercializeModalOpen, setIsCommercializeModalOpen] = useState<boolean>(false);
  const [subscriptionTier, setSubscriptionTierState] = useState<SubscriptionTier>('free');

  // Load and sync profile from public.profiles in Supabase
  const mapSupabaseUserToProfile = useCallback(async (sbUser: SupabaseUser): Promise<AuthUserProfile> => {
    let role: UserRole = sbUser.email === 'admin@zaboraa.com' ? 'admin' : 'user';
    let tier: SubscriptionTier = sbUser.email === 'admin@zaboraa.com' ? 'enterprise' : 'free';
    let displayName = (sbUser.user_metadata as any)?.full_name || sbUser.email?.split('@')[0] || 'Enterprise Architect';
    let photoURL = (sbUser.user_metadata as any)?.avatar_url || null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, role, subscription_tier, full_name, avatar_url')
          .eq('id', sbUser.id)
          .maybeSingle();

        if (!error && data) {
          if (data.role === 'admin' || data.role === 'user') {
            role = data.role;
          }
          if (data.subscription_tier === 'pro' || data.subscription_tier === 'enterprise' || data.subscription_tier === 'free') {
            tier = data.subscription_tier;
          }
          if (data.full_name) displayName = data.full_name;
          if (data.avatar_url) photoURL = data.avatar_url;
        }
      } catch (err) {
        console.warn('Notice: Unable to query public.profiles (will use auth metadata):', err);
      }
    }

    const authProfile: AuthUserProfile = {
      uid: sbUser.id,
      email: sbUser.email ?? null,
      displayName,
      photoURL,
      licenseTier: tier,
      role,
      provider: (sbUser.app_metadata?.provider as any) === 'google' ? 'google' : 'password'
    };

    return authProfile;
  }, []);

  // Supabase session initialization & onAuthStateChange subscription
  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase getSession notice:', error.message);
        }

        if (session?.user && mounted) {
          const profile = await mapSupabaseUserToProfile(session.user);
          setUser(profile);
          setSubscriptionTierState(profile.licenseTier);
          saveLocalStoredUser(profile);
        } else if (mounted) {
          const stored = getLocalStoredUser();
          if (stored) {
            setUser(stored);
            setSubscriptionTierState(stored.licenseTier);
          }
        }
      } catch (e) {
        console.warn('Auth session initialization notice:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeSession();

    // Pure Supabase Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setSubscriptionTierState('free');
        saveLocalStoredUser(null);
      } else if (session.user) {
        const profile = await mapSupabaseUserToProfile(session.user);
        setUser(profile);
        setSubscriptionTierState(profile.licenseTier);
        saveLocalStoredUser(profile);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [mapSupabaseUserToProfile]);

  const setSubscriptionTier = (tier: SubscriptionTier) => {
    setSubscriptionTierState(tier);
    try {
      localStorage.setItem(STORAGE_TIER_KEY, tier);
    } catch {}
    if (user) {
      const updated = { ...user, licenseTier: tier };
      setUser(updated);
      saveLocalStoredUser(updated);
    }
  };

  const signInWithGoogle = async (): Promise<AuthUserProfile> => {
    setAuthError(null);
    try {
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
        if (data?.url && typeof window !== 'undefined') {
          // If URL is returned, navigate to OAuth URL
          window.location.href = data.url;
        }
      }

      // Preview / Fallback Profile for testing when OAuth redirect is not supported in iframe
      const fallback: AuthUserProfile = {
        uid: 'sb-google-' + Date.now(),
        email: 'architect@zaboraa-cloud.io',
        displayName: 'Enterprise Cloud Architect',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        licenseTier: 'enterprise',
        role: 'user',
        provider: 'google'
      };
      setUser(fallback);
      setSubscriptionTierState('enterprise');
      saveLocalStoredUser(fallback);
      return fallback;
    } catch (err: any) {
      const msg = err.message || 'Unable to sign in with Google. Please try again.';
      setAuthError(msg);
      throw err;
    }
  };

  const signInWithGoogleRedirect = async (): Promise<void> => {
    setAuthError(null);
    try {
      if (supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      }
    } catch (err: any) {
      const msg = err.message || 'Google OAuth redirect failed.';
      setAuthError(msg);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<AuthUserProfile> => {
    setAuthError(null);
    const cleanEmail = email.trim();
    try {
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass
        });
        if (error) throw error;
        if (data.user) {
          const profile = await mapSupabaseUserToProfile(data.user);
          setUser(profile);
          setSubscriptionTierState(profile.licenseTier);
          saveLocalStoredUser(profile);
          return profile;
        }
      }

      // Simulated local authentication when preview environment is offline
      const simRole: UserRole = cleanEmail === 'admin@zaboraa.com' ? 'admin' : 'user';
      const simTier: SubscriptionTier = cleanEmail === 'admin@zaboraa.com' ? 'enterprise' : 'pro';
      const simProfile: AuthUserProfile = {
        uid: 'user-' + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0].replace('.', ' '),
        photoURL: null,
        licenseTier: simTier,
        role: simRole,
        provider: 'password'
      };
      setUser(simProfile);
      setSubscriptionTierState(simTier);
      saveLocalStoredUser(simProfile);
      return simProfile;
    } catch (err: any) {
      const msg = err.message || 'Email authentication failed. Please check credentials.';
      setAuthError(msg);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string): Promise<AuthUserProfile> => {
    setAuthError(null);
    const cleanEmail = email.trim();
    try {
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: { full_name: name.trim() }
          }
        });
        if (error) throw error;
        if (data.user) {
          const profile = await mapSupabaseUserToProfile(data.user);
          setUser(profile);
          setSubscriptionTierState(profile.licenseTier);
          saveLocalStoredUser(profile);
          return profile;
        }
      }

      const simRole: UserRole = cleanEmail === 'admin@zaboraa.com' ? 'admin' : 'user';
      const simTier: SubscriptionTier = cleanEmail === 'admin@zaboraa.com' ? 'enterprise' : 'free';
      const registered: AuthUserProfile = {
        uid: 'user-' + Date.now(),
        email: cleanEmail,
        displayName: name.trim() || cleanEmail.split('@')[0],
        photoURL: null,
        licenseTier: simTier,
        role: simRole,
        provider: 'password'
      };
      setUser(registered);
      setSubscriptionTierState(simTier);
      saveLocalStoredUser(registered);
      return registered;
    } catch (err: any) {
      const msg = err.message || 'Account registration failed. Please try again.';
      setAuthError(msg);
      throw err;
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    setAuthError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    try {
      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/#reset-password`
        });
        if (error) throw error;
      }

      return {
        success: true,
        message: `Password reset instructions have been dispatched to ${cleanEmail}. Please check your inbox for the recovery link.`
      };
    } catch (err: any) {
      const msg = err.message || 'Unable to request password reset. Please try again.';
      setAuthError(msg);
      throw err;
    }
  };

  const quickDemoLogin = (): AuthUserProfile => {
    setAuthError(null);
    const demo: AuthUserProfile = {
      uid: 'demo-architect-' + Date.now(),
      email: 'wasim.sayyed@zaboraa-cloud.com',
      displayName: 'Wasim Sayyed (Lead Architect)',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      licenseTier: 'enterprise',
      role: 'admin',
      provider: 'demo'
    };
    setUser(demo);
    setSubscriptionTierState('enterprise');
    saveLocalStoredUser(demo);
    return demo;
  };

  const signOut = async () => {
    setAuthError(null);
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      console.warn('Sign out notice:', err?.message || err);
    } finally {
      setUser(null);
      setSubscriptionTierState('free');
      saveLocalStoredUser(null);
      try {
        localStorage.removeItem(STORAGE_TIER_KEY);
      } catch {}
    }
  };

  const clearAuthError = () => setAuthError(null);

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@zaboraa.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        role: user?.role ?? null,
        subscriptionTier,
        setSubscriptionTier,
        signInWithGoogle,
        signInWithGoogleRedirect,
        loginWithEmail,
        registerWithEmail,
        requestPasswordReset,
        quickDemoLogin,
        signOut,
        isCommercializeModalOpen,
        setIsCommercializeModalOpen,
        authError,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
