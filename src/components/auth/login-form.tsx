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

export function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Controlled states for credentials
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')

  // Estados do Reset de Senha
  const [resetOpen, setResetOpen] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [isResetPending, startResetTransition] = useTransition()

  // Pre-populate fields from URL if present (e.g. autofill or fallback redirects)
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    const formData = new FormData()
    formData.append('cpf', cpf)
    formData.append('password', password)
    
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
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
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#09170a]/75 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
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
              className="w-full h-12 px-3.5 bg-[#050c05]/60 border border-white/10 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 font-bold rounded-xl transition-all"
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
                        className="w-full h-11 px-3 bg-[#050c05]/60 border border-white/10 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none rounded-xl transition-all"
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
                className="w-full h-12 pl-3.5 pr-12 bg-[#050c05]/60 border border-white/10 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 font-bold rounded-xl relative z-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1.5 z-20 cursor-pointer"
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
 
          <button 
            className="w-full h-12 text-[0.7rem] font-black uppercase tracking-widest transition-all bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 hover:from-yellow-600 hover:to-yellow-700 text-[#070f08] rounded-xl shadow-lg shadow-yellow-500/10 active:scale-[0.98] mt-6 border-none cursor-pointer relative z-10 disabled:opacity-50 disabled:pointer-events-none" 
            type="submit" 
            disabled={isPending}
          >
            {isPending ? 'Autenticando...' : 'Entrar no Portal'}
          </button>
        </form>
      </div>

      {/* Tela de Carregamento Premium e Moderna Pós-Login */}
      {isPending && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070f08]/95 backdrop-blur-lg animate-fade-in">
          {/* Efeitos de iluminação militar de fundo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-green-500/10 blur-[90px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[200px] rounded-full bg-yellow-500/5 blur-[60px] pointer-events-none" />
          
          {/* Linha de Varredura estilo Radar Militar */}
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/40 to-transparent pointer-events-none animate-radar-scan" />

          <div className="relative flex flex-col items-center gap-7 max-w-sm px-6 text-center animate-in zoom-in-95 duration-300">
            {/* Brasão/Logo pulsante centralizado com anéis orbitais */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Anel orbital externo brilhando */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-yellow-500 border-r-yellow-500/30 animate-spin" style={{ animationDuration: '1.2s' }} />
              {/* Anel orbital interno contra-rotativo */}
              <div className="absolute inset-2 rounded-full border border-transparent border-b-green-500 border-l-green-500/30 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
              
              {/* Círculo do Logo com pulsação suave */}
              <div className="w-16 h-16 rounded-full bg-[#133215]/50 border border-yellow-500/30 flex items-center justify-center p-2.5 overflow-hidden animate-pulse-ring">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Logo 71º BI Mtz" className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
              </div>
            </div>

            {/* Mensagens táticas de carregamento */}
            <div className="space-y-2 mt-1">
              <h3 className="text-sm font-black uppercase text-yellow-500 tracking-[0.25em] animate-pulse">
                Autenticando...
              </h3>
              <p className="text-[0.62rem] font-extrabold text-gray-400 uppercase tracking-widest leading-relaxed flex items-center justify-center gap-0.5">
                Preparando ambiente militar seguro
              </p>
            </div>
            
            {/* Barra de Progresso com degradê premium */}
            <div className="w-48 h-1 bg-[#133215] rounded-full overflow-hidden mt-1 border border-white/5 relative">
              <div className="absolute inset-y-0 left-0 w-full h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full animate-loading-progress" />
            </div>

            <span className="text-[0.55rem] font-extrabold text-gray-500 uppercase tracking-widest mt-1">
              71º Batalhão de Infantaria Motorizado
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
