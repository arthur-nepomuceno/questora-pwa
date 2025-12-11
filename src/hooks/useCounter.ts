import { useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';

interface CounterConfig {
  description?: string;
}

const COUNTER_DESCRIPTIONS: Record<string, string> = {
  'modalidade-access-guest': 'Contador de acessos à tela de modalidades por usuários deslogados',
  'download-button-clicks': 'Contador de cliques no botão Baixar'
};

export const useCounter = (counterName?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const incrementCounter = useCallback(async (customCounterName?: string, config?: CounterConfig) => {
    const finalCounterName = customCounterName || counterName || 'modalidade-access-guest';
    
    try {
      setIsLoading(true);
      console.log(`🔢 [useCounter] Iniciando incremento do contador: ${finalCounterName}...`);
      
      const counterRef = doc(db, 'counters', finalCounterName);
      
      await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        
        const description = config?.description || COUNTER_DESCRIPTIONS[finalCounterName] || `Contador: ${finalCounterName}`;
        
        if (counterDoc.exists()) {
          const currentCount = counterDoc.data()?.count || 0;
          const newCount = currentCount + 1;
          console.log(`🔢 [useCounter] Documento existe. Contador atual: ${currentCount}, Novo: ${newCount}`);
          transaction.update(counterRef, { 
            count: newCount,
            lastUpdated: new Date()
          });
        } else {
          console.log(`🔢 [useCounter] Documento não existe. Criando novo com count: 1`);
          transaction.set(counterRef, { 
            count: 1,
            lastUpdated: new Date(),
            createdAt: new Date(),
            description: description
          });
        }
      });
      
      console.log(`✅ [useCounter] Contador ${finalCounterName} incrementado com sucesso!`);
    } catch (error) {
      console.error(`❌ [useCounter] Erro ao incrementar contador ${finalCounterName}:`, error);
      console.error('❌ [useCounter] Tipo do erro:', typeof error);
      console.error('❌ [useCounter] Mensagem do erro:', error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [counterName]);
  
  return { incrementCounter, isLoading };
};
