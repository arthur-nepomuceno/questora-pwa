"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSounds } from '@/hooks/useSounds';

interface PremiosScreenProps {
  setScreen: (screen: any) => void;
  selectedModalidade?: string | null;
}

export default function PremiosScreen({ setScreen, selectedModalidade }: PremiosScreenProps) {
  const { user, isLoading } = useAuth();
  const { playButtonPress, playMainTheme } = useSounds();
  const [valorSaque, setValorSaque] = useState<string>('');
  const [chavePix, setChavePix] = useState<string>('');

  // Tocar música tema quando a tela monta
  useEffect(() => {
    playMainTheme();
  }, [playMainTheme]);

  const handleBack = () => {
    setScreen("options");
  };

  const handleCurrencyMask = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove todos os caracteres que não sejam dígitos
    value = value.replace(/[^\d]/g, '');
    
    // Se estiver vazio, limpa o campo
    if (value === '') {
      setValorSaque('');
      return;
    }
    
    // Converte para centavos (trabalha como inteiro)
    const centavos = parseInt(value, 10);
    
    // Separa os dois últimos dígitos (centavos) do restante (reais)
    const centavosStr = String(centavos % 100).padStart(2, '0');
    const reais = Math.floor(centavos / 100);
    
    // Formata os reais com pontos para milhares
    const reaisFormatados = reais.toLocaleString('pt-BR');
    
    // Formata no padrão brasileiro: 9.999,99
    const valorFormatado = `${reaisFormatados},${centavosStr}`;
    
    setValorSaque(valorFormatado);
  };

  if (isLoading) {
    return (
      <div className="blue-theme">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blue-theme">
      {/* Logo Show do Milênio */}
      <div className="show-milenio-logo">
	    <h1>🎯 <span style={{ fontSize: '1.25em', lineHeight: 1, display: 'inline-block' }}>S</span>HOW DO MILÊNIO</h1>
        <div className="coin-icon">
          🏆
        </div>
      </div>

      {/* Botão Voltar */}
      <div className="back-button-container">
        <button
          className="btn btn-secondary"
          onClick={handleBack}
        >
          ← Voltar
        </button>
      </div>

      {/* Main Card */}
      <div className="options-card">
        <h2>Insira valor e chave PIX para saque:</h2>
        
        <div className="user-details">
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="valor-saque" className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Valor do Saque (R$)
            </label>
            <input
              id="valor-saque"
              type="text"
              value={valorSaque}
              onChange={handleCurrencyMask}
              placeholder="0,00"
              pattern="^\d+,\d{2}$"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #4a90e2',
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: '#333'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="chave-pix" className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Chave PIX
            </label>
            <input
              id="chave-pix"
              type="text"
              value={chavePix}
              onChange={(e) => setChavePix(e.target.value)}
              placeholder="Digite sua chave PIX (CPF, e-mail, telefone ou chave aleatória)"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #4a90e2',
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: '#333'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

