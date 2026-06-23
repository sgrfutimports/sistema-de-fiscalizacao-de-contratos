import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#1a381c] to-[#0a180b] p-4 sm:p-8 py-10 relative overflow-hidden">

      <div className="relative z-50 w-full flex flex-col items-center justify-center gap-6 mt-10">
        <div style={{ 
          display: 'inline-block',
          lineHeight: 0,
          filter: 'drop-shadow(0 0 20px rgba(254, 223, 0, 0.4))'
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo 71º BI Mtz" width={140} height={140} style={{ display: 'block' }} />
        </div>
        <LoginForm />
      </div>

      <div className="z-10 mt-12 text-center text-sm text-green-100/90 drop-shadow-md font-medium">
        <p>Exército Brasileiro - 71º Batalhão de Infantaria Motorizado</p>
      </div>
    </div>
  )
}
