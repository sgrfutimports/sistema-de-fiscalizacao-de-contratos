import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#133215] p-4 sm:p-8 py-10 relative overflow-hidden">

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

      <footer className="relative z-10 mt-auto pb-6 pt-12 text-center flex flex-col items-center justify-center">
        <div className="w-full max-w-[200px] h-px bg-white/10 mb-4" />
        <p className="text-green-100/60 text-[0.65rem] uppercase tracking-widest font-bold mb-1">
          &copy; {new Date().getFullYear()} 71º Batalhão de Infantaria Motorizado
        </p>
        <p className="text-green-100/40 text-[0.6rem] font-medium">
          Todos os direitos reservados. Desenvolvido por <strong>1º Sgt Gaudencio</strong>.
        </p>
      </footer>
    </div>
  )
}
