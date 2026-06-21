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

      <div className="relative z-50 w-full flex flex-col items-center justify-center gap-6 mt-10">
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          display: 'inline-block',
          lineHeight: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          padding: '8px',
          border: '2px solid rgba(254, 223, 0, 0.4)',
          boxShadow: '0 0 30px rgba(254, 223, 0, 0.3)'
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo 71º BI Mtz" width={140} height={140} style={{ display: 'block', borderRadius: '50%' }} />
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
