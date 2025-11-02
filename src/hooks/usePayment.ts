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
  referenceId: string; // ID de rastreio, consistente com o PagBank (reference_id)
  userId: string; // Chave estrangeira - ligação com a tabela de usuários
  totalAmount: number; // Valor total da transação (obrigatório)
  pagbankOrderId: string; // ID retornado pelo PagBank
  pixQrCodeUrl: string; // URL da imagem do QR Code
  pixString: string; // Código "Copia e Cola"
}

export interface UpdatePaymentStatusData {
  paymentStatus: string; // Status atual (atualizado SOMENTE pelo Webhook)
  pagbankOrderId?: string; // ID retornado pelo PagBank (opcional para atualização)
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
        referenceId: paymentData.referenceId,
        userId: paymentData.userId,
        totalAmount: paymentData.totalAmount,
        paymentStatus: 'PENDING', // Status inicial sempre será PENDING
        pagbankOrderId: paymentData.pagbankOrderId,
        pixQrCodeUrl: paymentData.pixQrCodeUrl,
        pixString: paymentData.pixString,
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
        referenceId: data.referenceId,
        userId: data.userId,
        totalAmount: data.totalAmount,
        paymentStatus: data.paymentStatus,
        pagbankOrderId: data.pagbankOrderId,
        pixQrCodeUrl: data.pixQrCodeUrl,
        pixString: data.pixString,
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
   * @param updateData Dados para atualização (paymentStatus é obrigatório)
   * @returns Promise com sucesso ou erro
   */
  const updatePaymentStatus = async (
    orderId: string, 
    updateData: UpdatePaymentStatusData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('🔄 [usePayment] Atualizando status do pagamento:', orderId, 'Novo status:', updateData.paymentStatus);

      const updateFields: any = {
        paymentStatus: updateData.paymentStatus,
        updatedAt: serverTimestamp(),
      };

      // Adicionar pagbankOrderId se fornecido
      if (updateData.pagbankOrderId) {
        updateFields.pagbankOrderId = updateData.pagbankOrderId;
      }

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

