'use client'

import { useTransition, useState } from 'react'
import { redefinirSenha } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Lock } from 'lucide-react'

export default function RedefinirSenhaPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    startTransition(async () => {
      const result = await redefinirSenha(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8 relative overflow-hidden">
      {/* Decoração de fundo com padrão geométrico sutil militar */}
      <div className="absolute inset-0 z-0 bg-[url('/bg-pattern.svg')] opacity-[0.03] pointer-events-none" />
      
      {/* Círculos decorativos */}
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

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

        <Card className="w-full max-w-md border-border/50 shadow-2xl bg-card">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Defina a sua nova senha de acesso ao sistema de contratos.
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
                <Label htmlFor="password" className="text-foreground font-semibold">Nova Senha</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'}
                    required 
                    className="h-11 border-input focus:border-primary/50 pr-12"
                    placeholder="Mínimo 6 caracteres"
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-semibold">Confirmar Senha</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type={showConfirmPassword ? 'text' : 'password'}
                    required 
                    className="h-11 border-input focus:border-primary/50 pr-12"
                    placeholder="Repita a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showConfirmPassword ? (
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
                {isPending ? 'Redefinindo...' : 'Salvar Senha e Acessar'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <div className="z-10 mt-12 text-center text-sm text-muted-foreground/70">
        <p>Exército Brasileiro - 71º Batalhão de Infantaria Motorizado</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Todos os direitos reservados.</p>
      </div>
    </div>
  )
}
