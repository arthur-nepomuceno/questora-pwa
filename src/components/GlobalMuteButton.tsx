'use client';

import { useSoundContext } from '@/contexts/SoundContext';

export default function GlobalMuteButton() {
  const { isMuted, toggleMute } = useSoundContext();

  return (
    <div 
      className="global-mute-button" 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.7)',
        border: '2px solid #fff',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '20px',
        color: '#fff',
        transition: 'all 0.3s ease'
      }}
      onClick={toggleMute}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isMuted ? '🔇' : '🔊'}
    </div>
  );
}
