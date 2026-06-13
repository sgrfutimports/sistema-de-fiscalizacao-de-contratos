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
  const [titularId, setTitularId] = useState<string>('')
  const [substitutoId, setSubstitutoId] = useState<string>('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    
    // Adiciona os valores dos selects controlados no formData antes do envio
    if (titularId) formData.set('fiscal_titular_id', titularId)
    if (substitutoId) formData.set('fiscal_substituto_id', substitutoId)
    
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

  // Filtrar e ordenar alfabeticamente os fiscais titulares (excluindo administradores e garantindo ordem alfabética)
  const titulares = fiscais
    .filter(f => f.perfil === 'FISCAL_TITULAR')
    .sort((a, b) => {
      const nomeA = `${a.posto_graduacao || ''} ${a.nome_guerra || ''}`.trim().toUpperCase()
      const nomeB = `${b.posto_graduacao || ''} ${b.nome_guerra || ''}`.trim().toUpperCase()
      return nomeA.localeCompare(nomeB, 'pt-BR')
    })

  // Filtrar e ordenar alfabeticamente os fiscais substitutos (excluindo administradores e garantindo ordem alfabética)
  const substitutos = fiscais
    .filter(f => f.perfil === 'FISCAL_SUBSTITUTO')
    .sort((a, b) => {
      const nomeA = `${a.posto_graduacao || ''} ${a.nome_guerra || ''}`.trim().toUpperCase()
      const nomeB = `${b.posto_graduacao || ''} ${b.nome_guerra || ''}`.trim().toUpperCase()
      return nomeA.localeCompare(nomeB, 'pt-BR')
    })

  return (
    <Card className="border-border/50 shadow-sm">
      <form onSubmit={handleSubmit}>
        {/* Inputs Ocultos para garantir o envio no FormData nativo */}
        <input type="hidden" name="fiscal_titular_id" value={titularId} />
        <input type="hidden" name="fiscal_substituto_id" value={substitutoId} />

        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20 text-center">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="numero_contrato">Número do Contrato</Label>
              <Input id="numero_contrato" name="numero_contrato" required placeholder="Ex: 005/2026" />
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
              <Input 
                id="valor" 
                name="valor" 
                type="text" 
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]{0,2}"
                required 
                placeholder="10000.00" 
              />
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
              <select
                id="fiscal_titular_id"
                value={titularId}
                onChange={(e) => setTitularId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              >
                <option value="" disabled>Selecione o Titular</option>
                {titulares.map(f => (
                  <option key={f.id} value={f.id} className="text-foreground">
                    {f.posto_graduacao} {f.nome_guerra}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscal_substituto_id" className="text-primary">Fiscal Substituto</Label>
              <select
                id="fiscal_substituto_id"
                value={substitutoId}
                onChange={(e) => setSubstitutoId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              >
                <option value="" disabled>Selecione o Substituto</option>
                {substitutos.map(f => (
                  <option key={f.id} value={f.id} className="text-foreground">
                    {f.posto_graduacao} {f.nome_guerra}
                  </option>
                ))}
              </select>
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
