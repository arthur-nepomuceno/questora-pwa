'use client';

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  sendEmailVerification
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  addDoc
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, AuthState, LoginCredentials, SignupCredentials, Match } from '@/types/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Escutar mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Primeiro, mostrar o usuário básico imediatamente (só com email)
        const basicUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
          credits: 7000, // valor padrão
          totalMatches: 0,
          totalScore: 0,
          bestScore: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Mostrar usuário imediatamente
        setAuthState({
          user: basicUser,
          isLoading: false,
          isAuthenticated: true,
        });

        // Depois, buscar dados completos do Firestore em background
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const completeUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name,
              credits: userData.credits || 7000,
              totalMatches: userData.totalMatches || 0,
              totalScore: userData.totalScore || 0,
              bestScore: userData.bestScore || 0,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            };
            
            // Atualizar com dados completos
            setAuthState({
              user: completeUser,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            // Criar documento do usuário se não existir
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...basicUser,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          // Manter o usuário básico em caso de erro
        }
      } else {
        // Usuário não logado
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      
      // Verificar se email foi confirmado
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        return { 
          success: false, 
          error: 'Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.' 
        };
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      let errorMessage = 'Erro ao fazer login';
      
      // Tratamento específico de erros do Firebase
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não cadastrado. Clique em "Cadastrar" para fazer seu cadastro.';
          break;
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
          // Para estes erros, precisamos verificar se o usuário existe
          // Tentamos criar uma conta temporária para verificar se o email já existe
          try {
            await createUserWithEmailAndPassword(auth, credentials.email, 'temp_password_check_123456');
            // Se chegou aqui, o email não estava cadastrado
            errorMessage = 'Usuário não cadastrado. Clique em "Cadastrar" para fazer seu cadastro.';
            // Deletar a conta temporária
            if (auth.currentUser) {
              await auth.currentUser.delete();
            }
          } catch (createError: any) {
            if (createError.code === 'auth/email-already-in-use') {
              // Email já existe, então é senha incorreta
              errorMessage = 'Email ou Senha incorreto.';
            } else {
              // Outro erro, assumir que é senha incorreta
              errorMessage = 'Email ou Senha incorreto.';
            }
          }
          break;
        case 'auth/wrong-password':
          errorMessage = 'Email ou Senha incorreto.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Conta desabilitada';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet';
          break;
        default:
          // Se não reconhecer o erro, mostra o erro original
          errorMessage = error.message || 'Erro ao fazer login';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
      
      // Enviar email de verificação
      await sendEmailVerification(userCredential.user);
      
      // Criar documento do usuário no Firestore
      const userData = {
        name: credentials.name,
        credits: 7000,
        totalMatches: 0,
        totalScore: 0,
        bestScore: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      // Fazer logout para forçar verificação de email
      await signOut(auth);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: true, 
        error: 'Conta criada! Verifique seu email e clique no link de confirmação para ativar sua conta.' 
      };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      let errorMessage = 'Erro ao criar conta';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const resendEmailVerification = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'Usuário não logado' };
      }
      
      await sendEmailVerification(auth.currentUser);
      return { 
        success: true, 
        error: 'Email de verificação reenviado! Verifique sua caixa de entrada e spam.' 
      };
    } catch (error: any) {
      let errorMessage = 'Erro ao reenviar email';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
      }
      return { success: false, error: errorMessage };
    }
  };

  const updateCredits = async (newCredits: number) => {
    if (!authState.user) return;
    
    try {
      await updateDoc(doc(db, 'users', authState.user.id), {
        credits: newCredits,
        updatedAt: serverTimestamp(),
      });
      
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, credits: newCredits } : null,
      }));
    } catch (error) {
      console.error('Erro ao atualizar créditos:', error);
    }
  };

  const saveMatch = async (matchData: Omit<Match, 'id' | 'createdAt'>) => {
    if (!authState.user) return null;
    
    try {
      const matchRef = await addDoc(collection(db, 'matches'), {
        ...matchData,
        createdAt: serverTimestamp(),
      });
      
      // Atualizar estatísticas do usuário
      const newTotalMatches = authState.user.totalMatches + 1;
      const newTotalScore = authState.user.totalScore + matchData.score;
      const newBestScore = Math.max(authState.user.bestScore, matchData.score);
      const newCredits = authState.user.credits - matchData.creditsUsed;
      
      await updateDoc(doc(db, 'users', authState.user.id), {
        totalMatches: newTotalMatches,
        totalScore: newTotalScore,
        bestScore: newBestScore,
        credits: newCredits,
        updatedAt: serverTimestamp(),
      });
      
      // Atualizar estado local
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? {
          ...prev.user,
          totalMatches: newTotalMatches,
          totalScore: newTotalScore,
          bestScore: newBestScore,
          credits: newCredits,
        } : null,
      }));
      
      return matchRef.id;
    } catch (error) {
      console.error('Erro ao salvar partida:', error);
      return null;
    }
  };

  return {
    ...authState,
    login,
    signup,
    logout,
    resendEmailVerification,
    updateCredits,
    saveMatch,
  };
};
