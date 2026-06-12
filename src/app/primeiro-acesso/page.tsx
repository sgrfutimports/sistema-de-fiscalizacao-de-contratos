import { PrimeiroAcessoForm } from '@/components/auth/primeiro-acesso-form'

export default function PrimeiroAcessoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[url('/bg-pattern.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] h-[400px] w-[400px] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

      <div className="z-10 w-full flex justify-center">
        <PrimeiroAcessoForm />
      </div>

      <div className="z-10 mt-12 text-center text-sm text-muted-foreground/70">
        <p>Sistema de Segurança - Exército Brasileiro</p>
      </div>
    </div>
  )
}
