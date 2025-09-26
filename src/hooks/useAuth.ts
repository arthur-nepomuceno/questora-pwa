'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User, AuthState, LoginCredentials, SignupCredentials } from '@/types/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Função para buscar dados do usuário no banco
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('google_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  }, []);

  // Função para criar ou atualizar usuário
  const createOrUpdateUser = useCallback(async (authUser: any) => {
    try {
      const existingUser = await fetchUserData(authUser.id);
      
      if (existingUser) {
        // Atualizar último login
        const { data, error } = await supabase
          .from('usuarios')
          .update({ ultimo_login: new Date().toISOString() })
          .eq('google_id', authUser.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Criar novo usuário com 100 créditos
        const { data, error } = await supabase
          .from('usuarios')
          .insert({
            google_id: authUser.id,
            email: authUser.email,
            nome: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
            foto_perfil: authUser.user_metadata?.avatar_url,
            provider: 'google',
            creditos: 100,
            ultimo_login: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Erro ao criar/atualizar usuário:', error);
      throw error;
    }
  }, [fetchUserData]);

  // Login com Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Erro ao fazer login com Google' 
      }));
    }
  }, []);

  // Login com email e senha
  const signInWithEmail = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      // Buscar dados do usuário no banco
      const userData = await fetchUserData(data.user.id);
      setAuthState({
        user: userData,
        loading: false,
        error: null,
      });

      return data;
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Erro ao fazer login' 
      }));
      throw error;
    }
  }, [fetchUserData]);

  // Cadastro com email e senha
  const signUpWithEmail = useCallback(async (credentials: SignupCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.nome,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Criar usuário no banco com 100 créditos
        const userData = await createOrUpdateUser(data.user);
        setAuthState({
          user: userData,
          loading: false,
          error: null,
        });
      }

      return data;
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Erro ao criar conta' 
      }));
      throw error;
    }
  }, [createOrUpdateUser]);

  // Logout
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        error: error.message || 'Erro ao fazer logout' 
      }));
    }
  }, []);

  // Atualizar créditos do usuário
  const updateUserCredits = useCallback(async (newCredits: number) => {
    if (!authState.user) return;

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({ creditos: newCredits })
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        user: data,
      }));

      return data;
    } catch (error) {
      console.error('Erro ao atualizar créditos:', error);
      throw error;
    }
  }, [authState.user]);

  // Verificar sessão atual
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.user) {
          const userData = await fetchUserData(session.user.id);
          setAuthState({
            user: userData,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error: any) {
        setAuthState({
          user: null,
          loading: false,
          error: error.message,
        });
      }
    };

    getSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = await createOrUpdateUser(session.user);
          setAuthState({
            user: userData,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserData, createOrUpdateUser]);

  return {
    ...authState,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateUserCredits,
  };
};