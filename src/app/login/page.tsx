import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#009b3a] to-[#005f23] p-4 sm:p-8 py-10 relative overflow-hidden">
      
      {/* Luzes Vibrantes de Fundo - Copa do Mundo */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#fedf00]/20 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#002776]/30 blur-[100px] pointer-events-none z-0" />

      {/* Confetes Flutuantes */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Confetes Amarelos */}
        <div className="absolute left-[10%] bottom-0 w-3 h-6 bg-[#fedf00] opacity-80 animate-float-up" style={{ animationDelay: '0s', animationDuration: '6s' }} />
        <div className="absolute left-[30%] bottom-0 w-4 h-4 rounded-full bg-[#fedf00] opacity-90 animate-float-up" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute left-[50%] bottom-0 w-3 h-8 bg-[#fedf00] opacity-70 animate-float-up" style={{ animationDelay: '1s', animationDuration: '7s' }} />
        <div className="absolute left-[70%] bottom-0 w-5 h-5 rounded-full bg-[#fedf00] opacity-80 animate-float-up" style={{ animationDelay: '4s', animationDuration: '4s' }} />
        <div className="absolute left-[90%] bottom-0 w-2 h-6 bg-[#fedf00] opacity-90 animate-float-up" style={{ animationDelay: '3s', animationDuration: '6s' }} />
        
        {/* Confetes Azuis */}
        <div className="absolute left-[20%] bottom-0 w-4 h-4 bg-[#002776] opacity-80 animate-float-up" style={{ animationDelay: '1.5s', animationDuration: '5.5s' }} />
        <div className="absolute left-[40%] bottom-0 w-3 h-3 rounded-full bg-[#002776] opacity-70 animate-float-up" style={{ animationDelay: '0.5s', animationDuration: '6.5s' }} />
        <div className="absolute left-[60%] bottom-0 w-5 h-2 bg-[#002776] opacity-90 animate-float-up" style={{ animationDelay: '2.5s', animationDuration: '4.5s' }} />
        <div className="absolute left-[80%] bottom-0 w-3 h-3 rounded-full bg-[#002776] opacity-80 animate-float-up" style={{ animationDelay: '3.5s', animationDuration: '5s' }} />
        
        {/* Confetes Brancos */}
        <div className="absolute left-[15%] bottom-0 w-2 h-2 rounded-full bg-white opacity-80 animate-float-up" style={{ animationDelay: '0.2s', animationDuration: '4s' }} />
        <div className="absolute left-[45%] bottom-0 w-3 h-3 bg-white opacity-90 animate-float-up" style={{ animationDelay: '1.8s', animationDuration: '7s' }} />
        <div className="absolute left-[75%] bottom-0 w-4 h-2 bg-white opacity-70 animate-float-up" style={{ animationDelay: '2.2s', animationDuration: '5s' }} />
        <div className="absolute left-[85%] bottom-0 w-2 h-2 rounded-full bg-white opacity-80 animate-float-up" style={{ animationDelay: '4.5s', animationDuration: '6s' }} />
      </div>

      {/* Bandeirinhas de Festa Junina estilizadas (Verde, Amarelo, Azul, Branco) */}
      <div className="absolute top-0 inset-x-0 h-24 overflow-hidden pointer-events-none z-10 flex justify-around opacity-90">
        {/* Fio das bandeirinhas */}
        <div className="absolute top-4 left-[-10%] right-[-10%] h-[1px] bg-white/30 transform rotate-[-2deg] z-0" />
        
        {[
          '#fedf00', '#002776', '#ffffff', '#fedf00', '#009b3a', 
          '#ffffff', '#002776', '#fedf00', '#009b3a', '#ffffff',
          '#fedf00', '#002776', '#ffffff', '#fedf00'
        ].map((color, i) => (
          <div key={i} className={`relative w-12 h-16 origin-top animate-sway`} style={{ animationDelay: `${i * 0.15}s` }}>
            <svg viewBox="0 0 100 120" preserveAspectRatio="none" className="w-full h-full drop-shadow-md">
              <path d="M0,0 L100,0 L100,120 L50,90 L0,120 Z" fill={color} />
            </svg>
          </div>
        ))}
      </div>

      {/* Fogos de Artifício */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Explosões usando radial gradient simulando fogos */}
        <div className="absolute top-[10%] left-[20%] w-40 h-40 rounded-full animate-explode" style={{ background: 'radial-gradient(circle, rgba(254,223,0,1) 0%, rgba(254,223,0,0) 70%)', '--duration': '3s', '--delay': '0s' } as React.CSSProperties} />
        <div className="absolute top-[25%] right-[15%] w-60 h-60 rounded-full animate-explode" style={{ background: 'radial-gradient(circle, rgba(0,155,58,1) 0%, rgba(0,155,58,0) 70%)', '--duration': '4s', '--delay': '1s' } as React.CSSProperties} />
        <div className="absolute top-[40%] left-[10%] w-32 h-32 rounded-full animate-explode" style={{ background: 'radial-gradient(circle, rgba(0,39,118,1) 0%, rgba(0,39,118,0) 70%)', '--duration': '2.5s', '--delay': '2s' } as React.CSSProperties} />
        <div className="absolute top-[15%] right-[30%] w-48 h-48 rounded-full animate-explode" style={{ background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)', '--duration': '3.5s', '--delay': '1.5s' } as React.CSSProperties} />
        <div className="absolute top-[60%] right-[10%] w-56 h-56 rounded-full animate-explode" style={{ background: 'radial-gradient(circle, rgba(254,223,0,1) 0%, rgba(254,223,0,0) 70%)', '--duration': '4s', '--delay': '3s' } as React.CSSProperties} />
      </div>

      {/* Balões Juninos Tradicionais */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* Balão 1 (Esquerda) */}
        <div className="absolute left-[15%] animate-balloon" style={{ '--duration': '15s', '--delay': '0s' } as React.CSSProperties}>
          <svg width="60" height="90" viewBox="0 0 60 90" className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
            <path d="M30 0 L0 30 L30 30 Z" fill="#009b3a" />
            <path d="M30 0 L60 30 L30 30 Z" fill="#fedf00" />
            <path d="M30 30 L60 30 L30 60 Z" fill="#002776" />
            <path d="M30 30 L0 30 L30 60 Z" fill="#ffffff" />
            <path d="M30 0 L30 60 M0 30 L60 30" stroke="#000" strokeWidth="1" opacity="0.3" />
            <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#fff" strokeWidth="1.5" />
            <rect x="25" y="60" width="10" height="8" fill="#8b5a2b" />
            <path d="M25 60 L35 60 M25 64 L35 64 M25 68 L35 68" stroke="#5c3a21" strokeWidth="1" />
            <path d="M30 60 Q 25 55 30 50 Q 35 55 30 60" fill="#ff4500" />
            <path d="M25 68 Q 20 75 25 80" fill="none" stroke="#fedf00" strokeWidth="1.5" />
            <path d="M35 68 Q 40 75 35 80" fill="none" stroke="#009b3a" strokeWidth="1.5" />
          </svg>
        </div>
        {/* Balão 2 (Direita) */}
        <div className="absolute left-[80%] animate-balloon" style={{ '--duration': '18s', '--delay': '4s', transform: 'scale(0.8)' } as React.CSSProperties}>
          <svg width="60" height="90" viewBox="0 0 60 90" className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
            <path d="M30 0 L0 30 L30 30 Z" fill="#ffffff" />
            <path d="M30 0 L60 30 L30 30 Z" fill="#002776" />
            <path d="M30 30 L60 30 L30 60 Z" fill="#fedf00" />
            <path d="M30 30 L0 30 L30 60 Z" fill="#009b3a" />
            <path d="M30 0 L30 60 M0 30 L60 30" stroke="#000" strokeWidth="1" opacity="0.3" />
            <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#fff" strokeWidth="1.5" />
            <rect x="25" y="60" width="10" height="8" fill="#8b5a2b" />
            <path d="M25 60 L35 60 M25 64 L35 64 M25 68 L35 68" stroke="#5c3a21" strokeWidth="1" />
            <path d="M30 60 Q 25 55 30 50 Q 35 55 30 60" fill="#ff4500" />
            <path d="M25 68 Q 20 75 25 80" fill="none" stroke="#002776" strokeWidth="1.5" />
            <path d="M35 68 Q 40 75 35 80" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        </div>
        {/* Balão 3 (Centro) */}
        <div className="absolute left-[45%] animate-balloon" style={{ '--duration': '22s', '--delay': '8s', transform: 'scale(1.2)' } as React.CSSProperties}>
          <svg width="60" height="90" viewBox="0 0 60 90" className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
            <path d="M30 0 L0 30 L30 30 Z" fill="#fedf00" />
            <path d="M30 0 L60 30 L30 30 Z" fill="#009b3a" />
            <path d="M30 30 L60 30 L30 60 Z" fill="#ffffff" />
            <path d="M30 30 L0 30 L30 60 Z" fill="#002776" />
            <path d="M30 0 L30 60 M0 30 L60 30" stroke="#000" strokeWidth="1" opacity="0.3" />
            <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#fff" strokeWidth="1.5" />
            <rect x="25" y="60" width="10" height="8" fill="#8b5a2b" />
            <path d="M25 60 L35 60 M25 64 L35 64 M25 68 L35 68" stroke="#5c3a21" strokeWidth="1" />
            <path d="M30 60 Q 25 55 30 50 Q 35 55 30 60" fill="#ff4500" />
            <path d="M25 68 Q 20 75 25 80" fill="none" stroke="#009b3a" strokeWidth="1.5" />
            <path d="M35 68 Q 40 75 35 80" fill="none" stroke="#fedf00" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      <div className="relative z-50 w-full flex flex-col items-center justify-center gap-6 mt-10">
        <div className="relative" style={{ 
          display: 'inline-block',
          lineHeight: 0,
          filter: 'drop-shadow(0 0 20px rgba(254, 223, 0, 0.4))'
        }}>
          {/* Chapéu de Couro Nordestino (Cangaceiro) sobre a logo (Lado Esquerdo) */}
          <div className="absolute -top-6 -left-12 z-10 transform rotate-[-20deg] animate-bounce" style={{ animationDuration: '3.5s' }}>
            <svg width="85" height="55" viewBox="0 0 100 60" className="drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)]">
              {/* Aba traseira (elipse base) */}
              <ellipse cx="50" cy="45" rx="40" ry="8" fill="#8B4513" stroke="#5C3A21" strokeWidth="2" />
              {/* Copa */}
              <path d="M30 43 C 30 10, 70 10, 70 43" fill="#A0522D" stroke="#5C3A21" strokeWidth="2" />
              {/* Aba frontal dobrada (meia-lua para cima) */}
              <path d="M10 45 C 10 45, 50 15, 90 45 C 70 52, 30 52, 10 45 Z" fill="#8B4513" stroke="#5C3A21" strokeWidth="2" />
              {/* Estrela de 8 pontas (Enfeite clássico de cangaceiro) */}
              <g transform="translate(50, 32) scale(0.6)">
                <path d="M0 -15 L 4 -4 L 15 0 L 4 4 L 0 15 L -4 4 L -15 0 L -4 -4 Z" fill="#DEB887" />
                <circle cx="0" cy="0" r="2" fill="#5C3A21" />
              </g>
              {/* Estrelinhas laterais */}
              <circle cx="30" cy="38" r="2.5" fill="#DEB887" />
              <circle cx="70" cy="38" r="2.5" fill="#DEB887" />
              {/* Cordinha */}
              <path d="M20 45 Q 50 70, 80 45" fill="none" stroke="#DEB887" strokeWidth="1.5" strokeDasharray="3,3" />
            </svg>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo 71º BI Mtz" width={140} height={140} style={{ display: 'block', position: 'relative', zIndex: 0 }} />
        </div>
        <LoginForm />
      </div>

      <div className="z-10 mt-12 text-center text-sm text-green-100/90 drop-shadow-md font-medium">
        <p>Exército Brasileiro - 71º Batalhão de Infantaria Motorizado</p>
        <p className="mt-1 flex items-center justify-center gap-2">
          <span>🔥</span> Feliz São João e Rumo ao Hexa! <span>🇧🇷</span>
        </p>
      </div>
    </div>
  )
}
