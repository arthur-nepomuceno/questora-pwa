"use client";

import { useState } from 'react';
import { useSounds } from '@/hooks/useSounds';
import { useAuth } from '@/hooks/useAuth';
import { createSuporteRequest } from '@/lib/suporte';

interface SuporteModalProps {
  onConfirm: (purchaseToken?: string) => void;
  onCancel: () => void;
}

export default function SuporteModal({ onConfirm, onCancel }: SuporteModalProps) {
  const { playButtonPress } = useSounds();
  const { user } = useAuth();
  const [supportMessage, setSupportMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playButtonPress();
    
    if (!supportMessage.trim()) {
      setSubmitMessage({ type: 'error', text: 'Por favor, digite uma mensagem' });
      return;
    }

    if (!user?.id) {
      setSubmitMessage({ type: 'error', text: 'Usuário não autenticado. Faça login novamente.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Criar registro na coleção suporte
      const suporteId = await createSuporteRequest(user.id, user.email, supportMessage);
      
      // Exibir mensagem de sucesso com o ID do chamado
      setSubmitMessage({ 
        type: 'success', 
        text: `Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve. Anote seu número de protocolo: ${suporteId}` 
      });
      
      // Limpar campo de mensagem
      setSupportMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem de suporte:', error);
      setSubmitMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erro ao enviar mensagem. Tente novamente.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Suporte</h2>
        </div>

        <form onSubmit={handleSubmit} className="consent-form">
          <div className="form-group">
            <label>Suporte:</label>
            <input
              type="text"
              value="showdomileniooficial@gmail.com"
              readOnly
              className="support-email-display"
            />
          </div>

          <div className="form-group">
            <label htmlFor="supportMessage">Mensagem:</label>
            <textarea
              id="supportMessage"
              value={supportMessage}
              onChange={(e) => {
                setSupportMessage(e.target.value);
                setSubmitMessage(null);
              }}
              placeholder="Digite sua mensagem aqui..."
              rows={6}
            />
          </div>

          {/* Mensagem de feedback */}
          {submitMessage && (
            <div 
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                backgroundColor: submitMessage.type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                border: `2px solid ${submitMessage.type === 'success' ? '#4caf50' : '#f44336'}`,
                color: submitMessage.type === 'success' ? '#4caf50' : '#f44336',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}
            >
              {submitMessage.text}
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
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
          font-size: 1.5rem;
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

        .form-group input[type="text"],
        .form-group textarea {
          padding: 12px 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.95);
          color: #000000;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-group input[type="text"]:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #ffd700;
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .support-email-display {
          cursor: not-allowed;
        }

        .error-message {
          color: #ffeb3b;
          font-size: 0.85rem;
          font-weight: 500;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .modal-actions .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

