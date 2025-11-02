"use client";

import { useState } from 'react';
import { useSounds } from '@/hooks/useSounds';
import { useDocumentValidation } from '@/hooks/useDocumentValidation';
import { useAuth } from '@/hooks/useAuth';

interface PurchaseCreditModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PurchaseCreditModal({ onConfirm, onCancel }: PurchaseCreditModalProps) {
  const { playButtonPress } = useSounds();
  const { isValidCPF, isValidCNPJ } = useDocumentValidation();
  const { updateDocumentInfo } = useAuth();
  const [documentType, setDocumentType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Funções auxiliares para obter e atualizar o documento atual
  const getCurrentDocument = () => documentType === 'CPF' ? cpf : cnpj;
  const setCurrentDocument = (value: string) => {
    if (documentType === 'CPF') {
      setCpf(value);
    } else {
      setCnpj(value);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const currentDocument = getCurrentDocument();

    if (!currentDocument.trim()) {
      newErrors.cpfCnpj = `${documentType} é obrigatório`;
    } else {
      // Valida CPF ou CNPJ usando o checksum
      const isValid = documentType === 'CPF' ? isValidCPF(currentDocument) : isValidCNPJ(currentDocument);
      if (!isValid) {
        newErrors.cpfCnpj = `${documentType} inválido`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playButtonPress();
    
    if (validateForm()) {
      try {
        // Atualizar documentos no Firestore
        await updateDocumentInfo(cpf, cnpj);
        onConfirm();
      } catch (error) {
        console.error('Erro ao atualizar documentos:', error);
        setErrors({ cpfCnpj: 'Erro ao salvar documentos. Tente novamente.' });
      }
    }
  };

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (documentType === 'CPF') {
      // CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4').trim();
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5').trim();
    }
  };

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    // Remove caracteres não numéricos para contar apenas dígitos
    const numbers = input.replace(/\D/g, '');
    
    // Limita o número de dígitos baseado no tipo de documento
    const maxDigits = documentType === 'CPF' ? 11 : 14;
    const limitedNumbers = numbers.slice(0, maxDigits);
    
    // Formata o valor limitado
    const formatted = formatCpfCnpj(limitedNumbers);
    setCurrentDocument(formatted);
  };

  const handleDocumentTypeChange = (type: 'CPF' | 'CNPJ') => {
    setDocumentType(type);
    setCpf('');
    setCnpj('');
    setErrors({});
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Insira seus dados</h2>
        </div>

        <form onSubmit={handleSubmit} className="consent-form">
          <div className="form-group">
            <label>Tipo de Documento *</label>
            <div className="document-type-selector">
              <button
                type="button"
                className={`type-option ${documentType === 'CPF' ? 'active' : ''}`}
                onClick={() => handleDocumentTypeChange('CPF')}
              >
                CPF
              </button>
              <button
                type="button"
                className={`type-option ${documentType === 'CNPJ' ? 'active' : ''}`}
                onClick={() => handleDocumentTypeChange('CNPJ')}
              >
                CNPJ
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cpfCnpj">{documentType} *</label>
            <input
              id="cpfCnpj"
              type="text"
              value={getCurrentDocument()}
              onChange={handleCpfCnpjChange}
              placeholder={documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
              className={errors.cpfCnpj ? 'error' : ''}
            />
            {errors.cpfCnpj && <span className="error-message">{errors.cpfCnpj}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Confirmar
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .modal-content {
          background: linear-gradient(135deg, #1a237e, #283593);
          border: 3px solid #ffeb3b;
          border-radius: 20px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-50px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .modal-header h2 {
          color: #ffeb3b;
          font-size: 1.8rem;
          font-weight: bold;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .consent-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: #ffeb3b;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .document-type-selector {
          display: flex;
          gap: 10px;
        }

        .type-option {
          flex: 1;
          padding: 12px 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .type-option:hover {
          border-color: #ffeb3b;
          background: rgba(255, 235, 59, 0.1);
        }

        .type-option.active {
          background: linear-gradient(135deg, #ffeb3b, #ffc107);
          color: #1a237e;
          border-color: #ffeb3b;
          box-shadow: 0 4px 15px rgba(255, 235, 59, 0.3);
        }

        .form-group input[type="text"] {
          padding: 12px 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.95);
          color: #000000;
          transition: all 0.3s ease;
        }

        .form-group input[type="text"]:focus {
          outline: none;
          border-color: #ffd700;
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
        }

        .form-group input.error {
          border-color: #ff4444;
          background: #ffe6e6;
        }

        .error-message {
          color: #ffeb3b;
          font-size: 0.85rem;
          font-weight: 500;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          margin-top: 15px;
        }

        .modal-actions .btn {
          flex: 1;
          padding: 14px 24px;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ffeb3b, #ffc107);
          color: #1a237e;
          border: none;
          box-shadow: 0 4px 15px rgba(255, 235, 59, 0.3);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #ffc107, #ff9800);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 235, 59, 0.4);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          background: transparent;
          color: #ffeb3b;
          border: 2px solid #ffeb3b;
        }

        .btn-secondary:hover {
          background: rgba(255, 235, 59, 0.1);
          border-color: #ffc107;
        }

        @media (max-width: 600px) {
          .modal-content {
            padding: 20px;
            margin: 20px;
          }

          .modal-header h2 {
            font-size: 1.5rem;
          }

          .document-type-selector {
            flex-direction: column;
          }

          .type-option {
            width: 100%;
          }

          .modal-actions {
            flex-direction: column;
          }

          .modal-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

