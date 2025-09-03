import { ReactNode } from 'react';
import { React, createContext, useContext } from '@/lib/react-safe';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

// Implementação temporária sem hooks React
let globalAuthState = {
  user: null as User | null,
  session: null as Session | null,
  loading: true,
};

let listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

// Inicializar auth sem hooks
const initializeAuth = () => {
  // Configurar listener de mudanças de auth
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      globalAuthState.session = session;
      globalAuthState.user = session?.user ?? null;
      globalAuthState.loading = false;
      
      console.log('Auth state changed:', { event, user: session?.user?.id });
      notifyListeners();
    }
  );

  // Verificar sessão existente
  supabase.auth.getSession().then(({ data: { session } }) => {
    globalAuthState.session = session;
    globalAuthState.user = session?.user ?? null;
    globalAuthState.loading = false;
    
    console.log('Initial session:', { user: session?.user?.id });
    notifyListeners();
  });

  return () => subscription.unsubscribe();
};

// Inicializar imediatamente
const cleanup = initializeAuth();

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const signOut = async () => {
    try {
      // Limpar estado de auth
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.warn('Error during signOut:', err);
      }

      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      ...globalAuthState,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  try {
    const context = useContext(AuthContext);
    
    if (!context) {
      // Fallback se o contexto não estiver disponível
      return {
        ...globalAuthState,
        signOut: async () => {
          try {
            await supabase.auth.signOut({ scope: 'global' });
            window.location.href = '/';
          } catch (error) {
            console.error('Erro ao fazer logout:', error);
          }
        }
      };
    }
    
    return context;
  } catch (error) {
    console.error('Error in useAuth:', error);
    // Return safe fallback
    return {
      ...globalAuthState,
      signOut: async () => {
        try {
          await supabase.auth.signOut({ scope: 'global' });
          window.location.href = '/';
        } catch (error) {
          console.error('Erro ao fazer logout:', error);
        }
      }
    };
  }
};