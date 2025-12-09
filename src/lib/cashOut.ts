import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CashOut } from '@/types/payment';

/**
 * Converte valor formatado brasileiro (9.999,99) para centavos (inteiro)
 * @param valorFormatado - Valor no formato "9.999,99"
 * @returns Valor em centavos (número inteiro)
 */
export function converterValorParaCentavos(valorFormatado: string): number {
  // Remove pontos e vírgula, mantém apenas dígitos
  const valorLimpo = valorFormatado.replace(/[^\d]/g, '');
  
  // Converte para número inteiro (já está em centavos)
  return parseInt(valorLimpo, 10);
}

/**
 * Registra uma solicitação de saque na coleção cashOut do Firestore
 * @param userId - ID do usuário que está fazendo o saque
 * @param valorFormatado - Valor do saque no formato brasileiro "9.999,99"
 * @param chavePix - Chave PIX para recebimento
 * @returns ID do documento criado
 */
export async function createCashOutRequest(
  userId: string,
  valorFormatado: string,
  chavePix: string
): Promise<string> {
  try {
    // Converter valor formatado para centavos
    const value = converterValorParaCentavos(valorFormatado);
    
    // Validar se o valor é maior que zero
    if (value <= 0) {
      throw new Error('O valor do saque deve ser maior que zero');
    }
    
    // Validar se a chave PIX foi preenchida
    if (!chavePix || chavePix.trim() === '') {
      throw new Error('A chave PIX é obrigatória');
    }
    
    // Criar documento na coleção cashOut
    const cashOutData: Omit<CashOut, 'id'> = {
      userId,
      value,
      chavePix: chavePix.trim(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await addDoc(collection(db, 'cashOut'), {
      ...cashOutData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    console.log('✅ [cashOut] Solicitação de saque criada com sucesso. ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ [cashOut] Erro ao criar solicitação de saque:', error);
    throw error;
  }
}

