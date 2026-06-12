'use client'

import { useTransition, useState } from 'react'
import { changeInitialPassword } from '@/app/primeiro-acesso/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyRound } from 'lucide-react'

export function PrimeiroAcessoForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    
    startTransition(async () => {
      const result = await changeInitialPassword(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <Card className="w-full max-w-md border-border/50 shadow-2xl bg-card">
      <CardHeader className="space-y-3 text-center pb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Primeiro Acesso
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Para sua segurança, é necessário cadastrar uma nova senha.
          </CardDescription>
        </div>
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
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              minLength={6}
              className="h-11 border-input focus:border-primary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground font-semibold">Confirmar Senha</Label>
            <Input 
              id="confirmPassword" 
              name="confirmPassword" 
              type="password" 
              required 
              minLength={6}
              className="h-11 border-input focus:border-primary/50"
            />
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            className="w-full h-11 text-base font-semibold transition-all hover:brightness-110 active:scale-95" 
            type="submit" 
            disabled={isPending}
          >
            {isPending ? 'Salvando...' : 'Salvar Senha e Acessar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
