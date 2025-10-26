"use client";

import { useState } from 'react';
import { useSounds } from '@/hooks/useSounds';
import { ConsentData } from '@/types/quiz';

interface ConsentModalProps {
  onConfirm: (data: ConsentData) => void;
  onCancel: () => void;
}

export default function ConsentModal({ onConfirm, onCancel }: ConsentModalProps) {
  const { playButtonPress } = useSounds();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isAdult, setIsAdult] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!/^\d{10,11}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Telefone inválido';
    }

    if (!isAdult) {
      newErrors.isAdult = 'Você precisa ser maior de 18 anos para continuar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonPress();
    
    if (validateForm()) {
      onConfirm({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        isAdult
      });
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Você tem mais de 18 anos?</h2>
        </div>

        <form onSubmit={handleSubmit} className="consent-form">
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isAdult}
                onChange={(e) => setIsAdult(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-text">Confirmo que sou maior de 18 anos *</span>
            </label>
            {errors.isAdult && <span className="error-message">{errors.isAdult}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="firstName">Nome *</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Seu nome"
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Sobrenome *</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Seu sobrenome"
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefone *</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(11) 98765-4321"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
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

        .form-group input[type="text"],
        .form-group input[type="tel"] {
          padding: 12px 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.95);
          color: #000000;
          transition: all 0.3s ease;
        }

        .form-group input[type="text"]:focus,
        .form-group input[type="tel"]:focus {
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

        .checkbox-group {
          margin-top: 10px;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
        }

        .checkbox-input {
          width: 20px;
          height: 20px;
          cursor: pointer;
          margin-top: 2px;
          accent-color: #ffd700;
        }

        .checkbox-text {
          color: #ffeb3b;
          font-weight: 600;
          font-size: 0.95rem;
          line-height: 1.5;
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
