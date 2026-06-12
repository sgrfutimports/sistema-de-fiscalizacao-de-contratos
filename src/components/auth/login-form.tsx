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
    <Card className="w-full max-w-md border-border/50 shadow-2xl bg-card">
      <CardHeader className="space-y-2 text-center pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Acesso ao Sistema
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Sistema de Fiscalização de Contratos - 71º BI Mtz
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium border border-destructive/20 text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-foreground font-semibold">CPF</Label>
            <Input 
              id="cpf" 
              name="cpf" 
              type="text" 
              placeholder="000.000.000-00" 
              onChange={handleCpfChange}
              required 
              className="h-11 border-input focus:border-primary/50"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-foreground font-semibold">Senha</Label>
              <Dialog open={resetOpen} onOpenChange={(open) => {
                setResetOpen(open)
                if (!open) {
                  setResetError(null)
                  setResetSuccess(null)
                }
              }}>
                <DialogTrigger 
                  className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline animate-fade-in cursor-pointer bg-transparent border-none p-0"
                >
                  Esqueci minha senha
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] border-border bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-foreground">Recuperar Senha</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                      Insira o seu CPF cadastrado. Nós identificaremos o seu e-mail e enviaremos um link para redefinição de senha.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleResetSubmit} className="space-y-4 py-2">
                    {resetError && (
                      <div className="rounded-md bg-destructive/15 p-2.5 text-xs text-destructive border border-destructive/20 text-center font-medium">
                        {resetError}
                      </div>
                    )}
                    {resetSuccess && (
                      <div className="rounded-md bg-green-500/10 p-2.5 text-xs text-green-600 dark:text-green-500 border border-green-500/20 text-center font-medium">
                        {resetSuccess}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="resetCpf" className="text-foreground font-semibold">CPF</Label>
                      <Input 
                        id="resetCpf" 
                        name="resetCpf" 
                        type="text" 
                        placeholder="000.000.000-00" 
                        onChange={handleCpfChange}
                        required 
                        className="h-10 border-input focus:border-primary/50"
                      />
                    </div>
                    <DialogFooter className="mt-2">
                      <Button 
                        type="submit" 
                        disabled={isResetPending}
                        className="w-full h-10 font-semibold"
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
                className="h-11 border-input focus:border-primary/50 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
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
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            className="w-full h-11 text-base font-semibold transition-all hover:brightness-110 active:scale-95" 
            type="submit" 
            disabled={isPending}
          >
            {isPending ? 'Autenticando...' : 'Entrar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

