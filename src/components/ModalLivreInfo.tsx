"use client";

import { useSounds } from '@/hooks/useSounds';

interface ModalLivreInfoProps {
  onClose: () => void;
}

export default function ModalLivreInfo({ onClose }: ModalLivreInfoProps) {
  const { playButtonPress } = useSounds();

  const handleClose = () => {
    playButtonPress();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content livre-modal">
        <div className="modal-header">
          <h2>🎯 Modalidade Livre</h2>
        </div>
        
        <div className="modal-body">
          <div className="info-icon">ℹ️</div>
          <p>
            Importante: <strong>Na modalidade &quot;Livre&quot;</strong>, a escolha de créditos 
            <strong> não contabiliza para acúmulo de pontos reais</strong>.
          </p>
          <p>
            Para receber <strong>R$50 em bônus e acumular pontos</strong>, você precisa 
            fazer o <strong>cadastro no app</strong>.
          </p>
          <p>
            Caso contrário, os pontos serão apenas para prática e diversão!
          </p>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-primary"
            onClick={handleClose}
          >
            OK, Entendi
          </button>
        </div>
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
          margin-bottom: 20px;
        }

        .modal-header h2 {
          color: #ffeb3b;
          font-size: 1.8rem;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          margin: 0;
        }

        .modal-body {
          text-align: center;
          margin-bottom: 25px;
        }

        .info-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        .modal-body p {
          color: white;
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 15px 0;
        }

        .modal-body strong {
          color: #ffeb3b;
          font-weight: bold;
        }

        .modal-footer {
          text-align: center;
        }

        .btn {
          background: linear-gradient(135deg, #ffeb3b, #ffc107);
          color: #1a237e;
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(255, 235, 59, 0.3);
        }

        .btn:hover {
          background: linear-gradient(135deg, #ffc107, #ff9800);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 235, 59, 0.4);
        }

        .btn:active {
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
          
          .modal-body p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
