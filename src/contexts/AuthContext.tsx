import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthModal } from '../components/AuthModal';
import { OnboardingModal } from '../components/OnboardingModal';

export interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  nickname?: string;
  avatar_url?: string;
  is_admin?: boolean;
  needs_onboarding?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  isAuthModalOpen: boolean;
  isOnboardingOpen: boolean;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  updateNickname: (newNickname: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | undefined>(undefined);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const fetchProfile = async (currentUser: User) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      const provider = currentUser.app_metadata?.provider || '';
      const userMeta = currentUser.user_metadata || {};

      // PRIVACY SAFEGUARD:
      // Absolutely never read Google full_name, name, or picture.
      let fallbackUsername = 'User_' + currentUser.id.slice(0, 6);
      if (provider === 'github' && userMeta.user_name) {
        fallbackUsername = userMeta.user_name;
      }

      const resolvedNickname = data?.nickname || data?.username || fallbackUsername;
      const resolvedUsername = data?.username || resolvedNickname;
      const needsOnboarding = Boolean(
        data?.needs_onboarding ?? (provider === 'google' && !data?.nickname)
      );

      const isAdmin = Boolean(
        data?.is_admin ||
        currentUser.email === 'quinut@proton.me' ||
        (provider === 'github' &&
          userMeta?.user_name?.toLowerCase() === 'quinut')
      );

      const loadedProfile: UserProfile = {
        id: currentUser.id,
        email: currentUser.email,
        username: resolvedUsername,
        nickname: resolvedNickname,
        avatar_url: data?.avatar_url || (provider === 'github' ? userMeta.avatar_url : '') || '',
        is_admin: isAdmin,
        needs_onboarding: needsOnboarding,
      };

      setProfile(loadedProfile);

      if (needsOnboarding) {
        setIsOnboardingOpen(true);
      }
    } catch (err) {
      console.error('[Auth] Failed to fetch profile:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check for OAuth error in URL hash or query params
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const errorDesc = urlParams.get('error_description') || hashParams.get('error_description');
      if (errorDesc) {
        console.warn('[Auth] OAuth error returned in URL:', errorDesc);
      }
    }

    // Initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user);
      }
      setLoading(false);
    });

    // Listen to changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user);
          // Clean up URL if returning from OAuth redirect
          if (
            typeof window !== 'undefined' &&
            (window.location.search.includes('code=') || window.location.hash.includes('access_token='))
          ) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured yet.') };
    }
    try {
      // MINIMAL SCOPE: strictly 'openid email' ONLY, completely excluding 'profile'
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'openid email',
          redirectTo: window.location.origin,
        },
      });
      return { error: error as Error | null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithGithub = async () => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured yet.') };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin,
        },
      });
      return { error: error as Error | null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithEmail = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured yet.') };
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      return { error: error as Error | null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updateNickname = async (newNickname: string) => {
    if (!user || !isSupabaseConfigured) {
      return { error: new Error('User is not authenticated.') };
    }
    const trimmed = newNickname.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      return { error: new Error('Nickname must be between 2 and 20 characters.') };
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nickname: trimmed,
          username: trimmed,
          needs_onboarding: false,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              nickname: trimmed,
              username: trimmed,
              needs_onboarding: false,
            }
          : null
      );
      setIsOnboardingOpen(false);
      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsOnboardingOpen(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const openAuthModal = (reason?: string) => {
    setAuthModalReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(undefined);
  };

  const openOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        isAuthModalOpen,
        isOnboardingOpen,
        openAuthModal,
        closeAuthModal,
        openOnboarding,
        closeOnboarding,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        updateNickname,
        signOut,
        refreshProfile,
      }}
    >
      {children}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        reasonMessage={authModalReason}
      />
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
      />
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
