'use client'

import { useTransition, useState } from 'react'
import { login, sendResetPasswordEmail } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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

  // Estados do Reset de Senha
  const [resetOpen, setResetOpen] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [isResetPending, startResetTransition] = useTransition()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    
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
    const cpf = formData.get('resetCpf') as string
    
    startResetTransition(async () => {
      const origin = window.location.origin
      const result = await sendResetPasswordEmail(cpf, origin)
      if (result?.error) {
        setResetError(result.error)
      } else if (result?.success) {
        setResetSuccess(`E-mail de redefinição enviado com sucesso para ${result.email}. Verifique sua caixa de entrada e spam.`)
      }
    })
  }

  // Máscara simples de CPF
  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    e.target.value = value
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
            <Input 
              id="cpf" 
              name="cpf" 
              type="text" 
              placeholder="000.000.000-00" 
              onChange={handleCpfChange}
              required 
              className="h-12 bg-[#050c05]/60 border-white/10 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 font-bold rounded-xl"
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
                  className="text-[0.65rem] font-bold text-yellow-500/80 hover:text-yellow-400 transition-colors uppercase tracking-wider cursor-pointer bg-transparent border-none p-0"
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
                      <Input 
                        id="resetCpf" 
                        name="resetCpf" 
                        type="text" 
                        placeholder="000.000.000-00" 
                        onChange={handleCpfChange}
                        required 
                        className="h-11 bg-[#050c05]/60 border-white/10 text-white placeholder-gray-500 focus:border-yellow-500/50 rounded-xl"
                      />
                    </div>
                    <DialogFooter className="mt-2">
                      <Button 
                        type="submit" 
                        disabled={isResetPending}
                        className="w-full h-11 bg-yellow-600 hover:bg-yellow-700 text-white font-black uppercase tracking-wider rounded-xl transition-all"
                      >
                        {isResetPending ? 'Enviando...' : 'Enviar link de recuperação'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative">
              <Input 
                id="password" 
                name="password" 
                type={showPassword ? 'text' : 'password'}
                required 
                className="h-12 bg-[#050c05]/60 border-white/10 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 font-bold rounded-xl pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
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

          <Button 
            className="w-full h-12 text-[0.7rem] font-black uppercase tracking-widest transition-all bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 hover:from-yellow-600 hover:to-yellow-700 text-[#070f08] rounded-xl shadow-lg shadow-yellow-500/10 active:scale-[0.98] mt-6 border-none cursor-pointer" 
            type="submit" 
            disabled={isPending}
          >
            {isPending ? 'Autenticando...' : 'Entrar no Portal'}
          </Button>
        </form>
      </div>
    </div>
  )
}

