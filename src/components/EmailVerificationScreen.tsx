'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface EmailVerificationScreenProps {
  userEmail: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function EmailVerificationScreen({ 
  userEmail, 
  onVerified, 
  onBack 
}: EmailVerificationScreenProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const { resendEmailVerification } = useAuth();

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage('');
    
    const result = await resendEmailVerification();
    
    if (result.success) {
      setResendMessage('✅ Email reenviado com sucesso!');
    } else {
      setResendMessage(`❌ ${result.error}`);
    }
    
    setIsResending(false);
  };

  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        <div className="verification-header">
          <div className="verification-icon">
            📧
          </div>
          <h1>Verifique seu Email</h1>
          <p className="verification-subtitle">
            Enviamos um link de verificação para:
          </p>
          <div className="user-email">
            <span className="email-icon">📬</span>
            <strong>{userEmail}</strong>
          </div>
        </div>

        <div className="verification-instructions">
          <h3>🔍 Como verificar seu email:</h3>
          
          <div className="instruction-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <strong>Verifique sua caixa de entrada</strong>
                <p>Procure por um email do "Show do Milênio" ou "Firebase"</p>
              </div>
            </div>

            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <strong>🔒 Verifique também a caixa de SPAM</strong>
                <p className="spam-warning">
                  ⚠️ Muitas vezes o email de verificação vai para a pasta de spam/lixo eletrônico
                </p>
                <div className="spam-tips">
                  <p><strong>Dicas para encontrar o email:</strong></p>
                  <ul>
                    <li>📁 Procure na pasta "Spam" ou "Lixo Eletrônico"</li>
                    <li>🔍 Use a busca por "Firebase", "verificação" ou "Show do Milênio"</li>
                    <li>📱 Se usar Gmail, verifique também a aba "Promoções"</li>
                    <li>⏰ O email pode demorar alguns minutos para chegar</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <strong>Clique no link de verificação</strong>
                <p>Abra o email e clique no botão "Confirmar Email" ou no link fornecido</p>
              </div>
            </div>

            <div className="step">
              <span className="step-number">4</span>
              <div className="step-content">
                <strong>Volte ao app</strong>
                <p>Após clicar no link, volte aqui e faça login normalmente</p>
              </div>
            </div>
          </div>

          <div className="verification-actions">
            <button 
              onClick={handleResendEmail}
              disabled={isResending}
              className="resend-btn"
            >
              {isResending ? '⏳ Reenviando...' : '🔄 Reenviar Email'}
            </button>
            
            <button 
              onClick={onBack}
              className="back-btn"
            >
              ← Fazer Login
            </button>
          </div>

          {resendMessage && (
            <div className={`resend-message ${resendMessage.includes('✅') ? 'success' : 'error'}`}>
              {resendMessage}
            </div>
          )}

          <div className="help-section">
            <h4>🆘 Precisa de ajuda?</h4>
            <p>
              Se você não recebeu o email após alguns minutos:
            </p>
            <ul>
              <li>✅ Clique em "Reenviar Email" acima</li>
              <li>🔍 Verifique novamente todas as pastas do seu email</li>
              <li>📧 Confirme se o endereço <strong>{userEmail}</strong> está correto</li>
              <li>⏰ Aguarde até 10 minutos - emails podem demorar para chegar</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .email-verification-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
          padding: 20px;
        }

        .email-verification-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .verification-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .verification-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .verification-header h1 {
          color: #1a237e;
          font-size: 2rem;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .verification-subtitle {
          color: #666;
          font-size: 1.1rem;
          margin-bottom: 15px;
        }

        .user-email {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 2px solid #e0e0e0;
        }

        .email-icon {
          font-size: 1.2rem;
        }

        .verification-instructions h3 {
          color: #1a237e;
          margin-bottom: 20px;
          font-size: 1.3rem;
        }

        .instruction-steps {
          margin-bottom: 30px;
        }

        .step {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          align-items: flex-start;
        }

        .step-number {
          background: #d32f2f;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }

        .step-content strong {
          color: #1a237e;
          display: block;
          margin-bottom: 5px;
        }

        .step-content p {
          color: #666;
          margin: 0;
          line-height: 1.5;
        }

        .spam-warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          padding: 10px;
          margin: 10px 0;
          color: #856404;
        }

        .spam-tips {
          background: #e3f2fd;
          border-radius: 8px;
          padding: 15px;
          margin-top: 10px;
        }

        .spam-tips p {
          margin-bottom: 10px;
          font-weight: bold;
          color: #1565c0;
        }

        .spam-tips ul {
          margin: 0;
          padding-left: 20px;
        }

        .spam-tips li {
          margin-bottom: 5px;
          color: #666;
        }

        .verification-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .resend-btn {
          background: #d32f2f;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }

        .resend-btn:hover:not(:disabled) {
          background: #b71c1c;
        }

        .resend-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .back-btn {
          background: #666;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }

        .back-btn:hover {
          background: #555;
        }

        .resend-message {
          text-align: center;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: bold;
        }

        .resend-message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .resend-message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .help-section {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          border-left: 4px solid #d32f2f;
        }

        .help-section h4 {
          color: #d32f2f;
          margin-bottom: 15px;
        }

        .help-section p {
          color: #666;
          margin-bottom: 10px;
        }

        .help-section ul {
          margin: 0;
          padding-left: 20px;
        }

        .help-section li {
          margin-bottom: 5px;
          color: #666;
        }

        @media (max-width: 768px) {
          .email-verification-card {
            padding: 20px;
            margin: 10px;
          }
          
          .verification-actions {
            flex-direction: column;
          }
          
          .step {
            flex-direction: column;
            text-align: center;
          }
          
          .step-number {
            align-self: center;
          }
        }
      `}</style>
    </div>
  );
}
