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
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, AuthState, LoginCredentials, SignupCredentials } from '@/types/auth';

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
          totalPoints: 0,
          totalCorrect: 0,
          totalWrong: 0,
          moedas: 0,
          totalGames: 0,
          creditGames100: 0,
          creditGames500: 0,
          creditGames700: 0,
          creditGames1000: 0,
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
              credits: userData.credits || 0,
              totalPoints: userData.totalPoints || 0,
              totalCorrect: userData.totalCorrect || 0,
              totalWrong: userData.totalWrong || 0,
              moedas: userData.moedas || 0,
              totalGames: userData.totalGames || 0,
              creditGames100: userData.creditGames100 || 0,
              creditGames500: userData.creditGames500 || 0,
              creditGames700: userData.creditGames700 || 0,
              creditGames1000: userData.creditGames1000 || 0,
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
        email: credentials.email,
        credits: 7000,
        totalPoints: 0,
        totalCorrect: 0,
        totalWrong: 0,
        moedas: 0,
        totalGames: 0,
        creditGames100: 0,
        creditGames500: 0,
        creditGames700: 0,
        creditGames1000: 0,
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
      console.error('❌ Erro ao atualizar créditos:', error);
    }
  };

  const updateTotalPoints = async (pointsToAdd: number) => {
    if (!authState.user) return;
    
    try {
      const newTotalPoints = authState.user.totalPoints + pointsToAdd;
      
      await updateDoc(doc(db, 'users', authState.user.id), {
        totalPoints: newTotalPoints,
        updatedAt: serverTimestamp(),
      });
      
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, totalPoints: newTotalPoints } : null,
      }));
      
    } catch (error) {
      console.error('❌ Erro ao atualizar pontos:', error);
    }
  };

  const updateGameStats = async (correctAnswers: number, wrongAnswers: number) => {
    if (!authState.user) return;
    
    try {
      const newTotalCorrect = authState.user.totalCorrect + correctAnswers;
      const newTotalWrong = authState.user.totalWrong + wrongAnswers;
      
      await updateDoc(doc(db, 'users', authState.user.id), {
        totalCorrect: newTotalCorrect,
        totalWrong: newTotalWrong,
        updatedAt: serverTimestamp(),
      });
      
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { 
          ...prev.user, 
          totalCorrect: newTotalCorrect,
          totalWrong: newTotalWrong
        } : null,
      }));
      
    } catch (error) {
      console.error('❌ Erro ao atualizar estatísticas:', error);
    }
  };

  const updateTotalGames = async () => {
    if (!authState.user) return;
    
    try {
      const newTotalGames = authState.user.totalGames + 1;
      
      await updateDoc(doc(db, 'users', authState.user.id), {
        totalGames: newTotalGames,
        updatedAt: serverTimestamp(),
      });
      
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { 
          ...prev.user, 
          totalGames: newTotalGames
        } : null,
      }));
      
    } catch (error) {
      console.error('❌ Erro ao atualizar total de partidas:', error);
    }
  };

  const updateCreditGames = async (credits: number) => {
    if (!authState.user) return;
    
    try {
      let updateField: string;
      let newValue: number;
      
      switch (credits) {
        case 100:
          updateField = 'creditGames100';
          newValue = authState.user.creditGames100 + 1;
          break;
        case 500:
          updateField = 'creditGames500';
          newValue = authState.user.creditGames500 + 1;
          break;
        case 700:
          updateField = 'creditGames700';
          newValue = authState.user.creditGames700 + 1;
          break;
        case 1000:
          updateField = 'creditGames1000';
          newValue = authState.user.creditGames1000 + 1;
          break;
        default:
          console.error('❌ Valor de créditos inválido:', credits);
          return;
      }
      
      await updateDoc(doc(db, 'users', authState.user.id), {
        [updateField]: newValue,
        updatedAt: serverTimestamp(),
      });
      
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { 
          ...prev.user, 
          [updateField]: newValue
        } : null,
      }));
      
    } catch (error) {
      console.error('❌ Erro ao atualizar partidas por créditos:', error);
    }
  };

  return {
    ...authState,
    login,
    signup,
    logout,
    resendEmailVerification,
    updateCredits,
    updateTotalPoints,
    updateGameStats,
    updateTotalGames,
    updateCreditGames,
  };
};
