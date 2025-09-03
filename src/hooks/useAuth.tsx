import { ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getAuthState, subscribeToAuth, signOut } from '@/lib/auth-store';
import * as React from 'react';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Hook-free AuthProvider - just passes children through
export const AuthProvider = ({ children }: AuthProviderProps) => {
  return children;
};

// Safe hook that uses global state instead of Context
export const useAuth = (): AuthContextType => {
  try {
    const [authState, setAuthState] = React.useState(getAuthState());

    React.useEffect(() => {
      // Subscribe to auth changes
      const unsubscribe = subscribeToAuth(() => {
        setAuthState(getAuthState());
      });

      // Set initial state
      setAuthState(getAuthState());

      return unsubscribe;
    }, []);

    return {
      ...authState,
      signOut,
    };
  } catch (error) {
    console.error('Error in useAuth:', error);
    // Return safe fallback
    const fallbackState = getAuthState();
    return {
      ...fallbackState,
      signOut,
    };
  }
};