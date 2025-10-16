'use client';

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
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
    console.log('🔵 [useAuth] useEffect MONTADO - Listener instalado');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('🔔 [useAuth] onAuthStateChanged DISPARADO - User:', firebaseUser?.uid);
      if (firebaseUser) {
        // Primeiro, mostrar o usuário básico imediatamente (só com email)
        const basicUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
          phone: '', // valor padrão
          totalCredits: 5000, // valor padrão
          totalPoints: 0,
          totalCorrect: 0,
          totalWrong: 0,
          moedas: 0,
          totalGames: 0,
          creditPackage100: 0,
          creditPackage500: 0,
          creditPackage700: 0,
          creditPackage1000: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        
        // Mostrar usuário imediatamente
        console.log('⚠️ [useAuth] SETANDO BASIC USER - credits:', basicUser.totalCredits, 'points:', basicUser.totalPoints);
        setAuthState({
          user: basicUser,
          isLoading: false,
          isAuthenticated: true,
        });

        // Depois, buscar dados completos do Firestore em background
        try {
          console.log('🔷 [useAuth] Iniciando busca no Firestore para:', firebaseUser.uid);
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          console.log('🔷 [useAuth] Resposta do Firestore. Existe?', userDoc.exists());
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            const completeUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name,
              phone: userData.phone || '',
              totalCredits: userData.totalCredits || userData.credits || 0,
              totalPoints: userData.totalPoints || 0,
              totalCorrect: userData.totalCorrect || 0,
              totalWrong: userData.totalWrong || 0,
              moedas: userData.moedas || 0,
              totalGames: userData.totalGames || 0,
              creditPackage100: userData.creditPackage100 || userData.creditGames100 || 0,
              creditPackage500: userData.creditPackage500 || userData.creditGames500 || 0,
              creditPackage700: userData.creditPackage700 || userData.creditGames700 || 0,
              creditPackage1000: userData.creditPackage1000 || userData.creditGames1000 || 0,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            };
            
            console.log('✅ [useAuth] SETANDO COMPLETE USER - credits:', completeUser.totalCredits, 'points:', completeUser.totalPoints);
            // Atualizar com dados completos
            setAuthState({
              user: completeUser,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            console.log('🔶 [useAuth] Documento não existe. Criando novo...');
            // Criar documento do usuário se não existir
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...basicUser,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (error) {
          console.error('🔴 [useAuth] Erro ao buscar dados do usuário:', error);
          console.error('🔴 [useAuth] Tipo de erro:', error instanceof Error ? error.message : error);
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
      
      // Combinar firstName e lastName em um único campo name
      const fullName = `${credentials.firstName} ${credentials.lastName}`.trim();
      
      // Enviar cópia do link de verificação para admin
      try {
        await fetch('/api/send-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userCredential.user.uid,
            email: credentials.email,
            name: fullName,
            phone: credentials.phone
          })
        });
      } catch (error) {
        console.error('Erro ao enviar notificação para admin:', error);
        // Não interrompe o fluxo se falhar
      }
      
      // Criar documento do usuário no Firestore
      const userData = {
        name: fullName,
        email: credentials.email,
        phone: credentials.phone,
        totalCredits: 5000,
        totalPoints: 0,
        totalCorrect: 0,
        totalWrong: 0,
        moedas: 0,
        totalGames: 0,
        creditPackage100: 0,
        creditPackage500: 0,
        creditPackage700: 0,
        creditPackage1000: 0,
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
      
      // Enviar email de verificação via API customizada
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          email: auth.currentUser.email,
          name: auth.currentUser.displayName || 'Usuário',
          phone: 'N/A'
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar email de verificação');
      }
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
        totalCredits: newCredits,
        updatedAt: serverTimestamp(),
      });
      
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, totalCredits: newCredits } : null,
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
          updateField = 'creditPackage100';
          newValue = authState.user.creditPackage100 + 1;
          break;
        case 500:
          updateField = 'creditPackage500';
          newValue = authState.user.creditPackage500 + 1;
          break;
        case 700:
          updateField = 'creditPackage700';
          newValue = authState.user.creditPackage700 + 1;
          break;
        case 1000:
          updateField = 'creditPackage1000';
          newValue = authState.user.creditPackage1000 + 1;
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
