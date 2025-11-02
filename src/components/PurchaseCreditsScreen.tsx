"use client";

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

export default function PurchaseCreditsScreen({ setScreen, goToOptions, hideUserInfo = false, onClose }: PurchaseCreditsScreenProps) {
  const { user, logout, isLoading } = useAuth();
  const { playButtonPress } = useSounds();

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

    console.log('💳 Pacote selecionado:', {
      credits: pkg.credits,
      totalAmount: pkg.totalAmount,
      creditsToReceive: pkg.creditsToReceive,
      documentValue: userPaymentInfo?.documentValue || 'Não disponível',
      documentType: userPaymentInfo?.documentType || 'Não disponível',
      name: userPaymentInfo?.name || 'Não disponível',
      email: userPaymentInfo?.email || 'Não disponível',
    });
    // TODO: Implementar lógica de pagamento aqui
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
      `}</style>
    </div>
  );
}
