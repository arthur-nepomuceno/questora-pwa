'use client';

import { useState } from 'react';
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Payment } from '@/types/payment';

export interface CreatePaymentData {
  orderId: string; // ID primário do pedido (interno, único)
  userId: string; // Chave estrangeira - ligação com a tabela de usuários
  userName: string; // Nome do comprador
  userEmail: string; // Email do comprador
  userCreditsBeforePurchase: number; // Créditos do usuário antes da compra
  chatId?: number; // ID do chat do Telegram
  pspId: string; // ID retornado pelo PSP (PushinPay)
  pixCode: string; // Código do QR Code do PIX
  status: string; // Status atual
  totalAmount: number; // Valor total da transação (obrigatório)
  creditsToReceive: number; // Quantidade de créditos a receber
}

export interface UpdatePaymentStatusData {
  status: string; // Status atual (atualizado SOMENTE pelo Webhook)
}

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Cria um novo documento de pagamento na collection 'payments'
   * @param paymentData Dados do pagamento para criação
   * @returns Promise com o documento criado ou erro
   */
  const createPayment = async (paymentData: CreatePaymentData): Promise<{ success: boolean; error?: string; payment?: Payment }> => {
    try {
      setIsLoading(true);
      console.log('💳 [usePayment] Criando pagamento com orderId:', paymentData.orderId);

      const now = new Date();
      
            const paymentDoc: Omit<Payment, 'createdAt' | 'updatedAt'> & { createdAt: any; updatedAt: any } = {                                                       
        orderId: paymentData.orderId,
        userId: paymentData.userId,
        userName: paymentData.userName,
        userEmail: paymentData.userEmail,
        userCreditsBeforePurchase: paymentData.userCreditsBeforePurchase,
        chatId: paymentData.chatId,
        pspId: paymentData.pspId,
        pixCode: paymentData.pixCode,
        status: paymentData.status || 'pending',
        totalAmount: paymentData.totalAmount,
        creditsToReceive: paymentData.creditsToReceive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Usar orderId como ID do documento (já que é o ID primário interno único)
      await setDoc(doc(db, 'payments', paymentData.orderId), paymentDoc);

      const payment: Payment = {
        ...paymentDoc,
        createdAt: now,
        updatedAt: now,
      };

      console.log('✅ [usePayment] Pagamento criado com sucesso:', paymentData.orderId);
      return { success: true, payment };
    } catch (error: any) {
      console.error('❌ [usePayment] Erro ao criar pagamento:', error);
      const errorMessage = error.message || 'Erro ao criar pagamento';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca um pagamento pelo orderId
   * @param orderId ID do pedido
   * @returns Promise com o pagamento encontrado ou erro
   */
  const getPayment = async (orderId: string): Promise<{ success: boolean; error?: string; payment?: Payment }> => {
    try {
      setIsLoading(true);
      console.log('🔍 [usePayment] Buscando pagamento com orderId:', orderId);

      const paymentDoc = await getDoc(doc(db, 'payments', orderId));

      if (!paymentDoc.exists()) {
        console.log('⚠️ [usePayment] Pagamento não encontrado:', orderId);
        return { success: false, error: 'Pagamento não encontrado' };
      }

      const data = paymentDoc.data();
      const payment: Payment = {
        orderId: data.orderId,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        userCreditsBeforePurchase: data.userCreditsBeforePurchase,
        chatId: data.chatId,
        pspId: data.pspId,
        pixCode: data.pixCode,
        status: data.status,
        totalAmount: data.totalAmount,
        creditsToReceive: data.creditsToReceive,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };

      console.log('✅ [usePayment] Pagamento encontrado:', orderId);
      return { success: true, payment };
    } catch (error: any) {
      console.error('❌ [usePayment] Erro ao buscar pagamento:', error);
      const errorMessage = error.message || 'Erro ao buscar pagamento';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza o status do pagamento (para ser usado pelo Webhook)
   * IMPORTANTE: Esta função deve ser preferencialmente chamada por um webhook/backend
   * @param orderId ID do pedido
   * @param updateData Dados para atualização (status é obrigatório)
   * @returns Promise com sucesso ou erro
   */
  const updatePaymentStatus = async (
    orderId: string, 
    updateData: UpdatePaymentStatusData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('🔄 [usePayment] Atualizando status do pagamento:', orderId, 'Novo status:', updateData.status);

      const updateFields: any = {
        status: updateData.status,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'payments', orderId), updateFields);

      console.log('✅ [usePayment] Status do pagamento atualizado com sucesso:', orderId);
      return { success: true };
    } catch (error: any) {
      console.error('❌ [usePayment] Erro ao atualizar status do pagamento:', error);
      const errorMessage = error.message || 'Erro ao atualizar status do pagamento';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPayment,
    getPayment,
    updatePaymentStatus,
    isLoading,
  };
};

