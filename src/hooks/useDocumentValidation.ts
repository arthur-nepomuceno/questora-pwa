'use client';

/**
 * Hook para validação de documentos (CPF e CNPJ)
 * Utiliza as funções utilitárias que podem ser usadas tanto no Frontend quanto em API Routes
 */

import { isValidCPF, isValidCNPJ } from '@/utils/documentValidator';

export const useDocumentValidation = () => {
  return {
    isValidCPF,
    isValidCNPJ,
  };
};

// Re-exportar as funções para permitir uso direto no Frontend
export { isValidCPF, isValidCNPJ };

