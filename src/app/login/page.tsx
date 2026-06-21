'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  const [isSuccess, setIsSuccess] = useState(false)
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

      {/* Fogos de Artifício Premium */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[
          { top: '15%', left: '25%', color: '#fedf00', duration: '3s', delay: '0s', scale: 1 },
          { top: '25%', left: '80%', color: '#009b3a', duration: '4s', delay: '1s', scale: 1.5 },
          { top: '45%', left: '15%', color: '#002776', duration: '2.5s', delay: '2s', scale: 1.2 },
          { top: '20%', left: '60%', color: '#ffffff', duration: '3.5s', delay: '1.5s', scale: 0.8 },
          { top: '65%', left: '85%', color: '#fedf00', duration: '4s', delay: '3s', scale: 1.3 },
          { top: '75%', left: '20%', color: '#009b3a', duration: '3.2s', delay: '0.5s', scale: 1.1 }
        ].map((fw, idx) => (
          <div key={idx} className="absolute animate-firework-premium" style={{ top: fw.top, left: fw.left, '--duration': fw.duration, '--delay': fw.delay, transform: `scale(${fw.scale})` } as React.CSSProperties}>
            <svg width="100" height="100" viewBox="0 0 100 100" className="overflow-visible">
              <g stroke={fw.color} strokeWidth="3" strokeLinecap="round">
                {Array.from({ length: 12 }).map((_, i) => (
                  <line 
                    key={i} 
                    x1="50" y1="50" 
                    x2={50 + 40 * Math.cos(i * 30 * Math.PI / 180)} 
                    y2={50 + 40 * Math.sin(i * 30 * Math.PI / 180)} 
                  />
                ))}
              </g>
            </svg>
          </div>
        ))}
      </div>

      {/* Balões Juninos Premium (Baseados na Referência) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* Balão 1 (Esquerda) */}
        <div className="absolute left-[15%] animate-balloon" style={{ '--duration': '15s', '--delay': '0s' } as React.CSSProperties}>
          <svg width="60" height="120" viewBox="0 0 100 160" className="drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]">
            {/* Alça superior */}
            <path d="M40 15 C 40 0, 60 0, 60 15" fill="none" stroke="#FFD700" strokeWidth="4" />
            {/* Topo e Fundo */}
            <ellipse cx="50" cy="15" rx="15" ry="3" fill="#cc0000" />
            <ellipse cx="50" cy="95" rx="15" ry="3" fill="#006600" />
            {/* Corpo 3D (Gomos Verticais) */}
            <path d="M35 15 L15 55 L35 95 Z" fill="#E60000" /> {/* Esquerda */}
            <path d="M35 15 L65 15 L65 95 L35 95 Z" fill="#FFD700" /> {/* Centro */}
            <path d="M65 15 L85 55 L65 95 Z" fill="#007BFF" /> {/* Direita */}
            {/* Sombreamento/Linhas */}
            <path d="M35 15 L35 95 M65 15 L65 95" stroke="#000" strokeWidth="1" opacity="0.1" />
            <path d="M35 15 L15 55 L35 95 L65 95 L85 55 L65 15 Z" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5" />
            {/* Fitas onduladas */}
            <path d="M35 95 Q 20 115, 30 135 T 20 160" fill="none" stroke="#007BFF" strokeWidth="4" />
            <path d="M42 95 Q 35 115, 45 135 T 35 160" fill="none" stroke="#FFD700" strokeWidth="4" />
            <path d="M50 95 Q 40 120, 55 140 T 45 160" fill="none" stroke="#009b3a" strokeWidth="4" />
            <path d="M58 95 Q 65 115, 55 135 T 65 160" fill="none" stroke="#007BFF" strokeWidth="4" />
            <path d="M65 95 Q 75 115, 65 135 T 75 160" fill="none" stroke="#E60000" strokeWidth="4" />
          </svg>
        </div>
        {/* Balão 2 (Direita) */}
        <div className="absolute left-[80%] animate-balloon" style={{ '--duration': '18s', '--delay': '4s', transform: 'scale(0.8)' } as React.CSSProperties}>
          <svg width="60" height="120" viewBox="0 0 100 160" className="drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]">
            <path d="M40 15 C 40 0, 60 0, 60 15" fill="none" stroke="#FFFFFF" strokeWidth="4" />
            <ellipse cx="50" cy="15" rx="15" ry="3" fill="#001F5C" />
            <ellipse cx="50" cy="95" rx="15" ry="3" fill="#005C00" />
            <path d="M35 15 L15 55 L35 95 Z" fill="#009b3a" />
            <path d="M35 15 L65 15 L65 95 L35 95 Z" fill="#FFFFFF" />
            <path d="M65 15 L85 55 L65 95 Z" fill="#002776" />
            <path d="M35 15 L35 95 M65 15 L65 95" stroke="#000" strokeWidth="1" opacity="0.1" />
            <path d="M35 15 L15 55 L35 95 L65 95 L85 55 L65 15 Z" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5" />
            <path d="M35 95 Q 20 115, 30 135 T 20 160" fill="none" stroke="#009b3a" strokeWidth="4" />
            <path d="M42 95 Q 35 115, 45 135 T 35 160" fill="none" stroke="#FFD700" strokeWidth="4" />
            <path d="M50 95 Q 40 120, 55 140 T 45 160" fill="none" stroke="#002776" strokeWidth="4" />
            <path d="M58 95 Q 65 115, 55 135 T 65 160" fill="none" stroke="#FFFFFF" strokeWidth="4" />
            <path d="M65 95 Q 75 115, 65 135 T 75 160" fill="none" stroke="#009b3a" strokeWidth="4" />
          </svg>
        </div>
        {/* Balão 3 (Centro) */}
        <div className="absolute left-[45%] animate-balloon" style={{ '--duration': '22s', '--delay': '8s', transform: 'scale(1.2)' } as React.CSSProperties}>
          <svg width="60" height="120" viewBox="0 0 100 160" className="drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]">
            <path d="M40 15 C 40 0, 60 0, 60 15" fill="none" stroke="#E60000" strokeWidth="4" />
            <ellipse cx="50" cy="15" rx="15" ry="3" fill="#B3A000" />
            <ellipse cx="50" cy="95" rx="15" ry="3" fill="#001F5C" />
            <path d="M35 15 L15 55 L35 95 Z" fill="#FFD700" />
            <path d="M35 15 L65 15 L65 95 L35 95 Z" fill="#009b3a" />
            <path d="M65 15 L85 55 L65 95 Z" fill="#FFFFFF" />
            <path d="M35 15 L35 95 M65 15 L65 95" stroke="#000" strokeWidth="1" opacity="0.1" />
            <path d="M35 15 L15 55 L35 95 L65 95 L85 55 L65 15 Z" fill="none" stroke="#000" strokeWidth="1.5" opacity="0.2" />
            <path d="M35 95 Q 20 115, 30 135 T 20 160" fill="none" stroke="#E60000" strokeWidth="4" />
            <path d="M42 95 Q 35 115, 45 135 T 35 160" fill="none" stroke="#002776" strokeWidth="4" />
            <path d="M50 95 Q 40 120, 55 140 T 45 160" fill="none" stroke="#FFD700" strokeWidth="4" />
            <path d="M58 95 Q 65 115, 55 135 T 65 160" fill="none" stroke="#009b3a" strokeWidth="4" />
            <path d="M65 95 Q 75 115, 65 135 T 75 160" fill="none" stroke="#FFFFFF" strokeWidth="4" />
          </svg>
        </div>
      </div>

      <div className="relative z-50 w-full flex flex-col items-center justify-center gap-6 mt-10">
        <div className={`relative transition-all duration-500 ${isSuccess ? 'animate-rocket-launch z-[100]' : ''}`} style={{ 
          display: 'inline-block',
          lineHeight: 0,
          filter: 'drop-shadow(0 0 20px rgba(254, 223, 0, 0.4))'
        }}>
          {/* Chapéu de Couro Nordestino (Cangaceiro) sobre a logo - Maior e Centralizado */}
          <div className="absolute -top-[35px] left-1/2 -translate-x-1/2 z-10 transform" style={{ width: '130px' }}>
            <svg viewBox="0 0 100 60" className="w-full h-auto drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)]">
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
            </svg>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo 71º BI Mtz" width={140} height={140} style={{ display: 'block', position: 'relative', zIndex: 0 }} />
          
          {/* Fogo do Foguete (Aparece apenas no sucesso) */}
          {isSuccess && (
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-16 h-24 z-[-1] animate-exhaust-fire flex justify-center">
              <svg viewBox="0 0 50 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(255,69,0,0.8)]">
                <path d="M25 0 Q 50 50, 25 100 Q 0 50, 25 0 Z" fill="#FF4500" />
                <path d="M25 10 Q 40 50, 25 80 Q 10 50, 25 10 Z" fill="#FFD700" />
                <path d="M25 20 Q 30 45, 25 60 Q 20 45, 25 20 Z" fill="#FFFFFF" />
              </svg>
            </div>
          )}
        </div>
        <LoginForm onSuccess={() => setIsSuccess(true)} />
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
