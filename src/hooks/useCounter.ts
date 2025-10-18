import { useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';

export const useCounter = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const incrementCounter = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔢 [useCounter] Iniciando incremento do contador...');
      
      const counterRef = doc(db, 'counters', 'modalidade-access-guest');
      
      await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        
        if (counterDoc.exists()) {
          const currentCount = counterDoc.data()?.count || 0;
          const newCount = currentCount + 1;
          console.log('🔢 [useCounter] Documento existe. Contador atual:', currentCount, 'Novo:', newCount);
          transaction.update(counterRef, { 
            count: newCount,
            lastUpdated: new Date()
          });
        } else {
          console.log('🔢 [useCounter] Documento não existe. Criando novo com count: 1');
          transaction.set(counterRef, { 
            count: 1,
            lastUpdated: new Date(),
            createdAt: new Date(),
            description: 'Contador de acessos à tela de modalidades por usuários deslogados'
          });
        }
      });
      
      console.log('✅ [useCounter] Contador incrementado com sucesso!');
    } catch (error) {
      console.error('❌ [useCounter] Erro ao incrementar contador:', error);
      console.error('❌ [useCounter] Tipo do erro:', typeof error);
      console.error('❌ [useCounter] Mensagem do erro:', error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { incrementCounter, isLoading };
};
