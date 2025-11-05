"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSounds } from '@/hooks/useSounds';

interface PurchaseCreditsScreenProps {
  setScreen: (screen: any) => void;
  goToOptions: () => void;
  hideUserInfo?: boolean;
  onClose?: () => void;
}

interface CreditPackage {
  credits: number;
  totalAmount: number; // Valor em centavos (ex: 299 = R$ 2,99)
  creditsToReceive: number;
  icon: string;
}

const creditPackages: CreditPackage[] = [
  { credits: 300, totalAmount: 299, creditsToReceive: 300, icon: '💰' },
  { credits: 500, totalAmount: 499, creditsToReceive: 500, icon: '💰' },
  { credits: 700, totalAmount: 699, creditsToReceive: 700, icon: '💰' },
  { credits: 1000, totalAmount: 999, creditsToReceive: 1000, icon: '💎' },
  { credits: 2000, totalAmount: 1999, creditsToReceive: 2000, icon: '💎' },
  { credits: 3000, totalAmount: 2999, creditsToReceive: 3000, icon: '💎' },
  { credits: 5000, totalAmount: 4999, creditsToReceive: 5000, icon: '🏆' },
  { credits: 10000, totalAmount: 9999, creditsToReceive: 10000, icon: '🏆' },
];

interface ConfirmModalData {
  documentValue: string;
  documentType: string;
  name: string;
  email: string;
  creditsToReceive: number;
  totalAmount: number;
}

interface PixModalData {
  qrCodeText: string;
  qrCodeImageUrl: string;
}

export default function PurchaseCreditsScreen({ setScreen, goToOptions, hideUserInfo = false, onClose }: PurchaseCreditsScreenProps) {
  const { user, logout, isLoading } = useAuth();
  const { playButtonPress } = useSounds();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState<ConfirmModalData | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixModalData, setPixModalData] = useState<PixModalData | null>(null);

  const handleLogout = async () => {
    await logout();
    setScreen("modalidade");
  };

  const handlePackageClick = (pkg: CreditPackage) => {
    playButtonPress();
    
    // Buscar informações do usuário do localStorage
    const userPaymentInfoStr = localStorage.getItem('userPaymentInfo');
    let userPaymentInfo = null;
    
    if (userPaymentInfoStr) {
      try {
        userPaymentInfo = JSON.parse(userPaymentInfoStr);
      } catch (error) {
        console.error('Erro ao parsear dados do localStorage:', error);
      }
    }

    // Preparar dados para o modal de confirmação
    const modalData: ConfirmModalData = {
      documentValue: userPaymentInfo?.documentValue || user?.phone || 'Não disponível',
      documentType: userPaymentInfo?.documentType || 'CPF',
      name: userPaymentInfo?.name || user?.name || 'Não disponível',
      email: userPaymentInfo?.email || user?.email || 'Não disponível',
      creditsToReceive: pkg.creditsToReceive,
      totalAmount: pkg.totalAmount
    };

    setConfirmData(modalData);
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!confirmData || !user?.id) {
      alert('Erro: Dados incompletos ou usuário não autenticado');
      return;
    }

    playButtonPress();
    setIsCreatingPayment(true);

    try {
      console.log('💳 [PurchaseCreditsScreen] Criando pagamento no Firestore...');
      
      const response = await fetch('/api/payments/create-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          totalAmount: confirmData.totalAmount,
          creditsToReceive: confirmData.creditsToReceive,
          documentValue: confirmData.documentValue,
          documentType: confirmData.documentType,
          name: confirmData.name,
          email: confirmData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Exibir informações de debug do token
        if (data.debug) {
          console.log('🔑 [PurchaseCreditsScreen] DEBUG - Informações do Token:');
          console.log('   - Token existe?', data.debug.tokenExists);
          console.log('   - Comprimento do token:', data.debug.tokenLength);
          console.log('   - Preview do token:', data.debug.tokenPreview);
          console.log('   - Token completo:', data.debug.tokenFull);
        }
        
        // Exibir detalhes do erro do PagSeguro se disponível
        let errorMessage = data.error || 'Erro ao criar pagamento';
        
                if (data.pagbankError) {
          console.error('❌ [PurchaseCreditsScreen] Erro detalhado do PagSeguro:', data.pagbankError);
          console.error('📥 [PurchaseCreditsScreen] Resposta completa do PagSeguro (ERRO):', JSON.stringify(data.pagbankError, null, 2));

          // Extrair mensagem de erro mais específica
          if (data.pagbankError.message) {
            errorMessage += `: ${data.pagbankError.message}`;
          } else if (data.pagbankError.error_messages) {
            // PagSeguro pode retornar array de erros
            const errors = Array.isArray(data.pagbankError.error_messages)
              ? data.pagbankError.error_messages.join(', ')
              : data.pagbankError.error_messages;
            errorMessage += `: ${errors}`;
          } else if (typeof data.pagbankError === 'string') {
            errorMessage += `: ${data.pagbankError}`;
          }
        }
        
        throw new Error(errorMessage);
      }

            if (data.success) {
        console.log('✅ [PurchaseCreditsScreen] Pagamento criado com sucesso:', {
          orderId: data.orderId,
          referenceId: data.referenceId,
        });

        if (data.pagbankResponse) {
          console.log('📥 [PurchaseCreditsScreen] ID:', data.pagbankResponse.id);
          console.log('📥 [PurchaseCreditsScreen] QR Code Text:', data.pagbankResponse.qr_codes?.[0]?.text);
          console.log('📥 [PurchaseCreditsScreen] QR Code Image URL:', data.pagbankResponse.qr_codes[0].links.find((link: any) => link.rel === 'QRCODE.PNG').href);
          console.log('📥 [PurchaseCreditsScreen] Resposta completa do PagSeguro:', JSON.stringify(data.pagbankResponse, null, 2));

          // Extrair dados do PIX para exibir no modal
          const qrCodeText = data.pagbankResponse.qr_codes?.[0]?.text || '';
          const qrCodeImageUrl = data.pagbankResponse.qr_codes[0].links.find((link: any) => link.rel === 'QRCODE.PNG')?.href || '';

          if (qrCodeText && qrCodeImageUrl) {
            setPixModalData({
              qrCodeText,
              qrCodeImageUrl,
            });
            setShowConfirmModal(false);
            setConfirmData(null);
            setShowPixModal(true);
          } else {
            alert(`Pagamento criado com sucesso!\nRegistro: ${data.orderId}`);
            setShowConfirmModal(false);
            setConfirmData(null);
          }
        } else {
          alert(`Pagamento criado com sucesso!\nRegistro: ${data.orderId}`);
          setShowConfirmModal(false);
          setConfirmData(null);
        }
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }

    } catch (error: any) {
      console.error('❌ [PurchaseCreditsScreen] Erro ao criar pagamento:', error);
      console.error('❌ [PurchaseCreditsScreen] Stack trace:', error.stack);
      alert(`Erro ao criar pagamento: ${error.message}`);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleCancelPurchase = () => {
    if (isCreatingPayment) {
      return; // Não permite fechar durante o processamento
    }
    playButtonPress();
    setShowConfirmModal(false);
  };

  const handleClosePixModal = () => {
    playButtonPress();
    setShowPixModal(false);
    setPixModalData(null);
  };

  const handleCopyPixCode = async () => {
    if (!pixModalData?.qrCodeText) return;
    
    try {
      await navigator.clipboard.writeText(pixModalData.qrCodeText);
      playButtonPress();
      alert('Código PIX copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar código PIX:', error);
      alert('Erro ao copiar código PIX');
    }
  };

  return (
    <div className="blue-theme">
      {/* Logo Show do Milênio no estilo Show do Milhão */}
      <div className="show-milenio-logo">
	    <h1>🎯 <span style={{ fontSize: '1.25em', lineHeight: 1, display: 'inline-block' }}>S</span>HOW DO MILÊNIO</h1>
        <div className="coin-icon">
          🏆
        </div>
      </div>

      {/* Main Card */}
      <div className="credits-card">
        <h2>Inserir créditos</h2>
        <p>Escolha um pacote de créditos para adicionar à sua conta:</p>
        
        {/* Credit Packages */}
        <div className="credits-options">
          {creditPackages.map((pkg) => {
            const priceInReais = (pkg.totalAmount / 100).toFixed(2).replace('.', ',');
            return (
              <div
                key={pkg.credits}
                className="credit-card"
                onClick={() => handlePackageClick(pkg)}
              >
                <div className="credit-icon">{pkg.icon}</div>
                <h3>{pkg.credits} Créditos</h3>
                <p className="price">R$ {priceInReais}</p>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {hideUserInfo ? (
            // Se está no modal, OK leva para a tela de purchase-credits
            <button
              className="btn btn-primary"
              onClick={() => {
                playButtonPress();
                setScreen("purchase-credits");
              }}
            >
              OK
            </button>
          ) : (
            // Se é a tela completa, Voltar vai para start (escolha de categoria)
            <button
              className="btn btn-secondary"
              onClick={() => {
                playButtonPress();
                setScreen("start");
              }}
            >
              Voltar
            </button>
          )}
        </div>
      </div>

      {/* User Info */}
      {!hideUserInfo && user && !isLoading ? (
        <div className="user-info">
          <div className="user-email">
            <span className="user-icon">👤</span>
            <span>{user.email.split('@')[0]}</span>
          </div>
          <button
            className="credits-btn"
            title="Ver créditos e pontuação"
            onClick={goToOptions}
          >
            Dados da Conta
          </button>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Sair da conta"
          >
            🚪 Sair
          </button>
        </div>
      ) : !hideUserInfo && !isLoading ? (
        <div className="user-info">
          <div className="user-email">
            <span className="user-icon">👤</span>
            <span>Sessão não iniciada.</span>
          </div>
          <button
            className="login-btn"
            onClick={() => setScreen("auth")}
            title="Voltar para escolha de modalidade"
          >
            Iniciar sessão
          </button>
        </div>
      ) : null}
      
      {/* Loading placeholder */}
      {!hideUserInfo && isLoading && (
        <div className="user-info loading">
          <div className="user-email">
            <span className="user-icon">👤</span>
            <span>Carregando...</span>
          </div>
          <div className="logout-btn loading-btn">
            🚪 Sair
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmModal && confirmData && (
        <div className="modal-overlay" onClick={isCreatingPayment ? undefined : handleCancelPurchase}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Compra</h2>
            </div>
            <div className="confirm-details">
              <div className="confirm-row">
                <span className="confirm-label">Nome:</span>
                <span className="confirm-value">{confirmData.name}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Email:</span>
                <span className="confirm-value">{confirmData.email}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Documento ({confirmData.documentType}):</span>
                <span className="confirm-value">{confirmData.documentValue}</span>
              </div>
              <div className="confirm-row highlight">
                <span className="confirm-label">Créditos:</span>
                <span className="confirm-value">{confirmData.creditsToReceive.toLocaleString()}</span>
              </div>
              <div className="confirm-row highlight">
                <span className="confirm-label">Valor Total:</span>
                <span className="confirm-value">R$ {(confirmData.totalAmount / 100).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={handleCancelPurchase}
                disabled={isCreatingPayment}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleConfirmPurchase}
                disabled={isCreatingPayment}
              >
                {isCreatingPayment ? 'Criando Pagamento...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal do PIX */}
      {showPixModal && pixModalData && (
        <div className="modal-overlay" onClick={handleClosePixModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pagamento PIX</h2>
            </div>
            <div className="pix-details">
              <div className="pix-qr-code">
                <img src={pixModalData.qrCodeImageUrl} alt="QR Code PIX" />
              </div>
              <div className="pix-code-section">
                <label className="pix-code-label">Código PIX (Copia e Cola):</label>
                <div className="pix-code-input-wrapper">
                  <input
                    type="text"
                    readOnly
                    value={pixModalData.qrCodeText}
                    className="pix-code-input"
                  />
                  <button
                    className="btn btn-copy"
                    onClick={handleCopyPixCode}
                  >
                    Copiar
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleClosePixModal}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 15px 20px;
          border-radius: 12px;
          margin: 20px auto;
          max-width: 500px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .user-email {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-weight: 500;
        }

        .user-icon {
          font-size: 1.2rem;
        }

        .logout-btn {
          background: #1976d2;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
          font-size: 0.9rem;
        }

        .logout-btn:hover {
          background: #1565c0;
        }

        .login-btn {
          background: #1976d2;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
          font-size: 0.9rem;
        }

        .login-btn:hover {
          background: #1565c0;
        }

        .user-info.loading {
          opacity: 0.7;
        }

        .loading-btn {
          background: #666 !important;
          cursor: not-allowed;
        }

        .loading-btn:hover {
          background: #666 !important;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
        }

        .price {
          color: #ffffff;
          font-weight: bold;
          font-size: 1.1rem;
          margin-top: 8px;
        }

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

        .confirm-details {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .confirm-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .confirm-row:last-child {
          border-bottom: none;
        }

        .confirm-row.highlight {
          background: rgba(255, 235, 59, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-top: 5px;
          border: 2px solid rgba(255, 235, 59, 0.3);
        }

        .confirm-label {
          color: #ffeb3b;
          font-weight: 600;
          font-size: 0.95rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .confirm-value {
          color: white;
          font-weight: bold;
          font-size: 1rem;
          text-align: right;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }

        .confirm-row.highlight .confirm-value {
          font-size: 1.2rem;
          color: #ffeb3b;
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

        .modal-content .btn-primary {
          background: linear-gradient(135deg, #ffeb3b, #ffc107);
          color: #1a237e;
          border: none;
          box-shadow: 0 4px 15px rgba(255, 235, 59, 0.3);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .modal-content .btn-primary:hover {
          background: linear-gradient(135deg, #ffc107, #ff9800);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 235, 59, 0.4);
        }

        .modal-content .btn-primary:active {
          transform: translateY(0);
        }

        .modal-content .btn-secondary {
          background: transparent;
          color: #ffeb3b;
          border: 2px solid #ffeb3b;
        }

        .modal-content .btn-secondary:hover {
          background: rgba(255, 235, 59, 0.1);
          border-color: #ffc107;
        }

        .modal-actions .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .modal-content .btn-primary:disabled {
          background: linear-gradient(135deg, #9e9e9e, #757575);
          color: #ffffff;
          box-shadow: none;
        }

        .modal-content .btn-secondary:disabled {
          opacity: 0.5;
          border-color: rgba(255, 235, 59, 0.5);
        }

        .pix-details {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .pix-qr-code {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 25px;
          padding: 15px;
          background: white;
          border-radius: 12px;
        }

        .pix-qr-code img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }

        .pix-code-section {
          margin-top: 20px;
        }

        .pix-code-label {
          display: block;
          color: #ffeb3b;
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 10px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .pix-code-input-wrapper {
          display: flex;
          gap: 10px;
          align-items: stretch;
        }

        .pix-code-input {
          flex: 1;
          padding: 12px;
          border: 2px solid #ffeb3b;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.95);
          color: #1a237e;
          font-size: 0.9rem;
          font-family: monospace;
          word-break: break-all;
        }

        .pix-code-input:focus {
          outline: none;
          border-color: #ffc107;
          box-shadow: 0 0 0 3px rgba(255, 235, 59, 0.2);
        }

        .btn-copy {
          background: linear-gradient(135deg, #ffeb3b, #ffc107);
          color: #1a237e;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-copy:hover {
          background: linear-gradient(135deg, #ffc107, #ff9800);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 235, 59, 0.3);
        }

        .btn-copy:active {
          transform: translateY(0);
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

          .pix-code-input-wrapper {
            flex-direction: column;
          }

          .btn-copy {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
