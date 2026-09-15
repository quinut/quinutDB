import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthModal } from '../components/AuthModal';

export interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  const fetchProfile = async (currentUser: User) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      const userMeta = currentUser.user_metadata || {};
      const resolvedUsername =
        data?.username ||
        userMeta.user_name ||
        userMeta.preferred_username ||
        userMeta.full_name ||
        currentUser.email?.split('@')[0] ||
        'User';
      const resolvedAvatar =
        data?.avatar_url ||
        userMeta.avatar_url ||
        userMeta.picture ||
        '';
      const isAdmin = Boolean(
        data?.is_admin ||
        currentUser.email === 'quinut@proton.me' ||
        (currentUser.app_metadata?.provider === 'github' &&
          currentUser.user_metadata?.user_name?.toLowerCase() === 'quinut')
      );

      setProfile({
        id: currentUser.id,
        email: currentUser.email,
        username: resolvedUsername,
        avatar_url: resolvedAvatar,
        is_admin: isAdmin,
      });
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
      async (event, newSession) => {
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

  const signInWithGithub = async () => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') };
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
      return { error: new Error('Supabase is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') };
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

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | undefined>(undefined);

  const openAuthModal = (reason?: string) => {
    setAuthModalReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(undefined);
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
        openAuthModal,
        closeAuthModal,
        signInWithGithub,
        signInWithEmail,
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
