import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Global auth state without React hooks
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

let globalAuthState: AuthState = {
  user: null,
  session: null,
  loading: true,
};

let listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (error) {
      console.error('Error in auth listener:', error);
    }
  });
};

// Initialize auth without hooks
const initializeAuth = () => {
  console.log('Initializing auth store...');
  
  // Set up auth state listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('Auth state changed:', { event, userId: session?.user?.id });
      
      globalAuthState.session = session;
      globalAuthState.user = session?.user ?? null;
      globalAuthState.loading = false;
      
      notifyListeners();
    }
  );

  // Get initial session
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      console.error('Error getting initial session:', error);
    }
    
    console.log('Initial session loaded:', { userId: session?.user?.id });
    
    globalAuthState.session = session;
    globalAuthState.user = session?.user ?? null;
    globalAuthState.loading = false;
    
    notifyListeners();
  });

  return () => subscription.unsubscribe();
};

// Initialize immediately
const cleanup = initializeAuth();

// Export functions for components to use
export const getAuthState = () => globalAuthState;

export const subscribeToAuth = (callback: () => void) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

export const signOut = async () => {
  try {
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });

    await supabase.auth.signOut({ scope: 'global' });
    
    // Reset global state
    globalAuthState = {
      user: null,
      session: null,
      loading: false,
    };
    
    notifyListeners();
    
    // Redirect to home
    window.location.href = '/';
  } catch (error) {
    console.error('Error signing out:', error);
    // Force redirect anyway
    window.location.href = '/';
  }
};