import { db } from './firebase';
import { collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

/**
 * Registra uma solicitação de suporte na coleção suporte do Firestore
 * @param userId - ID do usuário que está enviando a mensagem
 * @param userEmail - Email do usuário que está enviando a mensagem
 * @param message - Conteúdo da mensagem de suporte
 * @returns ID do documento criado (identificador único gerado pelo Firestore)
 */
export async function createSuporteRequest(
  userId: string,
  userEmail: string,
  message: string
): Promise<string> {
  try {
    // Validar se a mensagem não está vazia
    if (!message || message.trim() === '') {
      throw new Error('A mensagem não pode estar vazia');
    }
    
    // Validar se o email foi fornecido
    if (!userEmail || userEmail.trim() === '') {
      throw new Error('Email do usuário é obrigatório');
    }
    
    // Criar documento na coleção suporte
    // O Firestore gera automaticamente um identificador único (ID) para cada documento
    const suporteRef = await addDoc(collection(db, 'suporte'), {
      id: '', // Será atualizado após a criação
      userId,
      userEmail: userEmail.trim(),
      message: message.trim(),
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Atualizar o documento com o ID gerado como campo
    await updateDoc(suporteRef, {
      id: suporteRef.id
    });
    
    return suporteRef.id;
  } catch (error) {
    console.error('❌ [suporte] Erro ao criar solicitação de suporte:', error);
    throw error;
  }
}

