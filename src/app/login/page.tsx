import { LoginForm } from '@/components/auth/login-form'

import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b1d0c] p-4 sm:p-8 relative overflow-hidden">
      {/* Decoração de fundo com padrão geométrico sutil militar */}
      <div className="absolute inset-0 z-0 bg-[url('/bg-pattern.svg')] opacity-[0.02] pointer-events-none" />
      
      {/* Círculos decorativos - visual SaaS moderno */}
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-white/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none" />

      <div className="z-10 w-full flex flex-col items-center justify-center gap-6">
        <div style={{ 
          background: 'hsl(120, 30%, 10%)',
          display: 'inline-block',
          lineHeight: 0,
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo 71º BI Mtz" width={140} height={140} style={{ display: 'block' }} />
        </div>
        <LoginForm />
      </div>

      <div className="z-10 mt-12 text-center text-sm text-gray-300/80">
        <p>Exército Brasileiro - 71º Batalhão de Infantaria Motorizado</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Todos os direitos reservados.</p>
      </div>
    </div>
  )
}
