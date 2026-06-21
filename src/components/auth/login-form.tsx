'use client'

import { useTransition, useState, useEffect } from 'react'
import { login, sendResetPasswordEmail } from '@/app/login/actions'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Controlled states for credentials
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [rememberCpf, setRememberCpf] = useState(false)

  // Estados do Reset de Senha
  const [resetOpen, setResetOpen] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [isResetPending, startResetTransition] = useTransition()

  // Pre-populate fields from URL if present (e.g. autofill or fallback redirects)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCpf = localStorage.getItem('saved_cpf')
      if (savedCpf) {
        setCpf(savedCpf)
        setRememberCpf(true)
      }

      const params = new URLSearchParams(window.location.search)
      const cpfParam = params.get('cpf')
      const passwordParam = params.get('password')
      if (cpfParam) {
        let cleanCpf = cpfParam.replace(/\D/g, '')
        if (cleanCpf.length > 11) cleanCpf = cleanCpf.slice(0, 11)
        if (cleanCpf.length === 11) {
          cleanCpf = cleanCpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
        } else {
          // format partial
          if (cleanCpf.length > 9) {
            cleanCpf = cleanCpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, '$1.$2.$3-$4')
          } else if (cleanCpf.length > 6) {
            cleanCpf = cleanCpf.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3')
          } else if (cleanCpf.length > 3) {
            cleanCpf = cleanCpf.replace(/^(\d{3})(\d{1,3})$/, '$1.$2')
          }
        }
        setCpf(cleanCpf)
      }
      if (passwordParam) {
        setPassword(passwordParam)
      }
    }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (rememberCpf) {
      localStorage.setItem('saved_cpf', cpf)
    } else {
      localStorage.removeItem('saved_cpf')
    }

    const formData = new FormData()
    formData.append('cpf', cpf)
    formData.append('password', password)
    
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success && result.redirectTo) {
        if (onSuccess) {
          onSuccess()
          setTimeout(() => {
            router.push(result.redirectTo)
          }, 2000) // 2 segundos para a animação do foguete!
        } else {
          router.push(result.redirectTo)
        }
      }
    })
  }

  async function handleResetSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResetError(null)
    setResetSuccess(null)
    const formData = new FormData(event.currentTarget)
    const resetCpfValue = formData.get('resetCpf') as string
    
    startResetTransition(async () => {
      const origin = window.location.origin
      const result = await sendResetPasswordEmail(resetCpfValue, origin)
      if (result?.error) {
        setResetError(result.error)
      } else if (result?.success) {
        setResetSuccess(`E-mail de redefinição enviado com sucesso para ${result.email}. Verifique sua caixa de entrada e spam.`)
      }
    })
  }

  // Máscara simples de CPF para o input controlado
  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    
    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, '$1.$2.$3-$4')
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3')
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{1,3})$/, '$1.$2')
    }
    
    setCpf(value)
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md p-8 shadow-[0_0_50px_rgba(254,223,0,0.15)] relative overflow-hidden">
      {/* Linha brilhante no topo para efeito premium */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
      
      <div className="space-y-6">
        <div className="space-y-2 text-center pb-2">
          <h2 className="text-2xl font-black tracking-wider text-white uppercase">
            Acesso ao Sistema
          </h2>
          <p className="text-[0.65rem] text-yellow-500 font-extrabold uppercase tracking-[0.25em]">
            Fiscalização de Contratos &bull; 71º BI Mtz
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-red-500/10 p-3.5 text-xs text-red-400 font-bold border border-red-500/20 text-center animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-[0.65rem] font-black text-gray-300 uppercase tracking-widest">CPF</Label>
            <input 
              id="cpf" 
              name="cpf" 
              type="text" 
              value={cpf}
              placeholder="000.000.000-00" 
              onChange={handleCpfChange}
              required 
              className="w-full h-12 px-3.5 bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:border-[#fedf00] focus:outline-none focus:ring-1 focus:ring-[#fedf00]/50 font-bold rounded-xl transition-all shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[0.65rem] font-black text-gray-300 uppercase tracking-widest">Senha</Label>
              <Dialog open={resetOpen} onOpenChange={(open) => {
                setResetOpen(open)
                if (!open) {
                  setResetError(null)
                  setResetSuccess(null)
                }
              }}>
                <DialogTrigger 
                  className="text-[0.65rem] font-bold text-yellow-500/80 hover:text-yellow-400 transition-colors uppercase tracking-wider cursor-pointer bg-transparent border-none p-0 relative z-10"
                >
                  Esqueci minha senha
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#0d1f0f] text-white">
                  <DialogHeader>
                    <DialogTitle className="text-base font-black uppercase text-white tracking-wider">Recuperar Senha</DialogTitle>
                    <DialogDescription className="text-gray-400 text-xs mt-1">
                      Insira o seu CPF cadastrado. Nós identificaremos o seu e-mail e enviaremos um link para redefinição de senha.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleResetSubmit} className="space-y-4 py-2">
                    {resetError && (
                      <div className="rounded-xl bg-red-500/10 p-2.5 text-xs text-red-400 border border-red-500/20 text-center font-bold">
                        {resetError}
                      </div>
                    )}
                    {resetSuccess && (
                      <div className="rounded-xl bg-green-500/10 p-2.5 text-xs text-green-400 border border-green-500/20 text-center font-bold">
                        {resetSuccess}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="resetCpf" className="text-[0.65rem] font-black text-gray-300 uppercase tracking-widest">CPF</Label>
                      <input 
                        id="resetCpf" 
                        name="resetCpf" 
                        type="text" 
                        placeholder="000.000.000-00" 
                        onChange={handleCpfChange}
                        required 
                        className="w-full h-11 px-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:border-[#fedf00] focus:outline-none focus:ring-1 focus:ring-[#fedf00]/50 rounded-xl transition-all shadow-inner"
                      />
                    </div>
                    <DialogFooter className="mt-2">
                      <button 
                        type="submit" 
                        disabled={isResetPending}
                        className="w-full h-11 bg-yellow-600 hover:bg-yellow-700 text-white font-black uppercase tracking-wider rounded-xl transition-all relative z-10 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isResetPending ? 'Enviando...' : 'Enviar link de recuperação'}
                      </button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative">
              <input 
                id="password" 
                name="password" 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full h-12 pl-3.5 pr-12 bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:border-[#fedf00] focus:outline-none focus:ring-1 focus:ring-[#fedf00]/50 font-bold rounded-xl relative z-0 shadow-inner"
              />
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-2 z-20 cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-1 px-1">
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberCpf}
              onChange={(e) => setRememberCpf(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#009b3a] focus:ring-[#fedf00] cursor-pointer"
            />
            <Label htmlFor="remember" className="text-[0.7rem] font-bold text-white/90 cursor-pointer select-none">
              Lembrar meu CPF
            </Label>
          </div>
 
          <button 
            className="w-full h-12 text-[0.8rem] font-black uppercase tracking-widest transition-all bg-gradient-to-r from-[#009b3a] to-[#005f23] hover:from-[#00b043] hover:to-[#00702a] text-[#fedf00] rounded-xl shadow-[0_0_20px_rgba(0,155,58,0.4)] active:scale-[0.98] mt-6 border border-[#fedf00]/30 cursor-pointer relative z-10 disabled:opacity-50 disabled:pointer-events-none" 
            type="submit" 
            disabled={isPending}
          >
            {isPending ? 'Autenticando...' : 'Entrar no Portal'}
          </button>
        </form>
      </div>

      {/* Tela de Carregamento Premium e Moderna Pós-Login */}
      {isPending && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#005f23]/90 to-[#002776]/90 backdrop-blur-md animate-fade-in">
          {/* Luzes de Fogueira e Refletores */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#ff7300]/20 blur-[100px] pointer-events-none animate-flicker" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[200px] rounded-full bg-[#fedf00]/30 blur-[60px] pointer-events-none animate-pulse" />
          
          <div className="relative flex flex-col items-center gap-7 max-w-sm px-6 text-center animate-in zoom-in-95 duration-500">
            {/* Brasão/Logo com a Fogueira Atrás */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              
              {/* Efeito de labaredas em CSS */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 mix-blend-screen animate-flicker">
                <div className="absolute w-20 h-28 bg-[#ff2a00] rounded-[50%_0_50%_50%] transform rotate-45 blur-[15px] -bottom-4" />
                <div className="absolute w-16 h-24 bg-[#ff7300] rounded-[50%_0_50%_50%] transform rotate-45 blur-[10px] -bottom-2" />
                <div className="absolute w-12 h-20 bg-[#fedf00] rounded-[50%_0_50%_50%] transform rotate-45 blur-[5px]" />
              </div>
              
              {/* Círculo do Logo iluminado */}
              <div className="w-24 h-24 flex items-center justify-center relative z-10 animate-bounce">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Logo 71º BI Mtz" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(254,223,0,0.6)]" />
              </div>
            </div>

            {/* Mensagens Temáticas */}
            <div className="space-y-3 mt-4">
              <h3 className="text-xl font-black uppercase text-[#fedf00] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] tracking-widest animate-pulse">
                Aquecendo os motores!
              </h3>
              <p className="text-xs font-extrabold text-white uppercase tracking-[0.2em] leading-relaxed drop-shadow-md">
                Puxando o fole da sanfona e abrindo o portal...
              </p>
            </div>
            
            {/* Barra de Progresso Hexa */}
            <div className="w-56 h-2 bg-white/20 rounded-full overflow-hidden mt-2 border border-white/30 relative shadow-inner">
              <div className="absolute inset-y-0 left-0 w-full h-full bg-gradient-to-r from-[#009b3a] via-[#fedf00] to-[#002776] rounded-full animate-loading-progress" />
            </div>

            <span className="text-[0.6rem] font-extrabold text-white/80 uppercase tracking-[0.3em] mt-2 drop-shadow-sm">
              Rumo ao Hexa!
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
