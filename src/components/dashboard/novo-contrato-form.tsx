'use client'

import { useState, useTransition } from 'react'
import { createContrato } from '@/app/dashboard/contratos/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Fiscal {
  id: string
  nome: string
  perfil: string
  posto_graduacao?: string
  nome_guerra?: string
}

const formatPerfil = (perfil: string) => {
  if (perfil === 'ADMIN') return 'Administrador'
  if (perfil === 'FISCAL_TITULAR') return 'Fiscal Titular'
  if (perfil === 'FISCAL_SUBSTITUTO') return 'Fiscal Substituto'
  return perfil
}

export function NovoContratoForm({ fiscais }: { fiscais: Fiscal[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    
    startTransition(async () => {
      const result = await createContrato(formData)
      if (result?.error) {
        setError(result.error)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        toast.success('Contrato cadastrado com sucesso!')
        router.push('/dashboard/contratos')
      }
    })
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20 text-center">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="numero_contrato">Número do Contrato</Label>
              <Input id="numero_contrato" name="numero_contrato" required placeholder="Ex: 005/2026" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="processo_administrativo">Processo Administrativo</Label>
              <Input id="processo_administrativo" name="processo_administrativo" placeholder="NUP: 64XXX..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="empresa">Nome da Empresa</Label>
              <Input id="empresa" name="empresa" required placeholder="Razão Social" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" name="cnpj" required placeholder="00.000.000/0000-00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objeto">Objeto do Contrato</Label>
            <Input id="objeto" name="objeto" required placeholder="Aquisição de..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor Total (R$)</Label>
              <Input id="valor" name="valor" type="number" step="0.01" required placeholder="10000.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input id="data_inicio" name="data_inicio" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_termino">Data de Término</Label>
              <Input id="data_termino" name="data_termino" type="date" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="space-y-2">
              <Label htmlFor="fiscal_titular_id" className="text-primary">Fiscal Titular</Label>
              <Select name="fiscal_titular_id" required>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione o Titular" />
                </SelectTrigger>
                <SelectContent>
                  {fiscais.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.posto_graduacao} {f.nome_guerra} ({formatPerfil(f.perfil)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscal_substituto_id" className="text-primary">Fiscal Substituto</Label>
              <Select name="fiscal_substituto_id" required>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione o Substituto" />
                </SelectTrigger>
                <SelectContent>
                  {fiscais.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.posto_graduacao} {f.nome_guerra} ({formatPerfil(f.perfil)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-between bg-muted/20 pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Contrato'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
