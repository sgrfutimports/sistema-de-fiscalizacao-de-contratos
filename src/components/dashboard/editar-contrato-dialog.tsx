'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Edit, AlertCircle } from 'lucide-react'
import { updateContrato } from '@/app/dashboard/contratos/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Fiscal {
  id: string
  nome: string
  perfil: string
  posto_graduacao?: string
  nome_guerra?: string
}

interface Contrato {
  id: string
  numero_contrato: string
  processo_administrativo?: string
  empresa: string
  cnpj: string
  objeto: string
  valor: number
  data_inicio: string
  data_termino: string
  fiscal_titular_id: string
  fiscal_substituto_id: string
  status: string
}

export function EditarContratoDialog({ contrato, fiscais }: { contrato: Contrato; fiscais: Fiscal[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [titularId, setTitularId] = useState<string>(contrato.fiscal_titular_id || '')
  const [substitutoId, setSubstitutoId] = useState<string>(contrato.fiscal_substituto_id || '')
  const [status, setStatus] = useState<string>(contrato.status || 'ATIVO')

  // Filtra e ordena fiscais titulares
  const titulares = fiscais
    .filter(f => f.perfil === 'FISCAL_TITULAR')
    .sort((a, b) => {
      const nomeA = `${a.posto_graduacao || ''} ${a.nome_guerra || ''}`.trim().toUpperCase()
      const nomeB = `${b.posto_graduacao || ''} ${b.nome_guerra || ''}`.trim().toUpperCase()
      return nomeA.localeCompare(nomeB, 'pt-BR')
    })

  // Filtra e ordena fiscais substitutos
  const substitutos = fiscais
    .filter(f => f.perfil === 'FISCAL_SUBSTITUTO')
    .sort((a, b) => {
      const nomeA = `${a.posto_graduacao || ''} ${a.nome_guerra || ''}`.trim().toUpperCase()
      const nomeB = `${b.posto_graduacao || ''} ${b.nome_guerra || ''}`.trim().toUpperCase()
      return nomeA.localeCompare(nomeB, 'pt-BR')
    })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    
    formData.set('id', contrato.id)
    formData.set('fiscal_titular_id', titularId)
    formData.set('fiscal_substituto_id', substitutoId)
    formData.set('status', status)

    startTransition(async () => {
      const result = await updateContrato(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        toast.success('Contrato atualizado com sucesso!')
        setOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="ghost" className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-wider text-blue-400 border border-blue-500/30 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all shadow-sm cursor-pointer whitespace-nowrap h-8">
            <Edit className="h-3.5 w-3.5" />
            Editar
          </Button>
        }
      />
      <DialogContent className="max-w-2xl bg-[#131924] border-[#2a3441] text-white overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Edit className="h-5 w-5 text-yellow-500" />
            Editar Contrato Nº {contrato.numero_contrato}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Atualize as informações do contrato administrativo e altere seus fiscais vinculados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_numero_contrato">Número do Contrato</Label>
              <Input 
                id="edit_numero_contrato" 
                name="numero_contrato" 
                required 
                defaultValue={contrato.numero_contrato} 
                className="bg-[#1b2331] border-[#2a3441] text-white focus:ring-yellow-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_status">Status do Contrato</Label>
              <select
                id="edit_status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-[#2a3441] bg-[#1b2331] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              >
                <option value="ATIVO">ATIVO</option>
                <option value="SUSPENSO">SUSPENSO</option>
                <option value="ENCERRADO">ENCERRADO</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_empresa">Nome da Empresa</Label>
              <Input 
                id="edit_empresa" 
                name="empresa" 
                required 
                defaultValue={contrato.empresa} 
                className="bg-[#1b2331] border-[#2a3441] text-white focus:ring-yellow-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_cnpj">CNPJ</Label>
              <Input 
                id="edit_cnpj" 
                name="cnpj" 
                required 
                defaultValue={contrato.cnpj} 
                className="bg-[#1b2331] border-[#2a3441] text-white focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_objeto">Objeto do Contrato</Label>
            <Input 
              id="edit_objeto" 
              name="objeto" 
              required 
              defaultValue={contrato.objeto} 
              className="bg-[#1b2331] border-[#2a3441] text-white focus:ring-yellow-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_valor">Valor Total (R$)</Label>
              <Input 
                id="edit_valor" 
                name="valor" 
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]{0,2}"
                required 
                defaultValue={contrato.valor} 
                className="bg-[#1b2331] border-[#2a3441] text-white focus:ring-yellow-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_data_inicio">Data de Início</Label>
              <Input 
                id="edit_data_inicio" 
                name="data_inicio" 
                type="date" 
                required 
                defaultValue={contrato.data_inicio} 
                className="bg-[#1b2331] border-[#2a3441] text-white focus:ring-yellow-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_data_termino">Data de Término</Label>
              <Input 
                id="edit_data_termino" 
                name="data_termino" 
                type="date" 
                required 
                defaultValue={contrato.data_termino} 
                className="bg-[#1b2331] border-[#2a3441] text-white focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-[#1b2331] border border-[#2a3441]">
            <div className="space-y-2">
              <Label htmlFor="edit_fiscal_titular_id" className="text-yellow-500 font-bold">Fiscal Titular</Label>
              <select
                id="edit_fiscal_titular_id"
                value={titularId}
                onChange={(e) => setTitularId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-[#2a3441] bg-[#131924] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              >
                <option value="" disabled>Selecione o Titular</option>
                {titulares.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.posto_graduacao} {f.nome_guerra}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_fiscal_substituto_id" className="text-yellow-500 font-bold">Fiscal Substituto</Label>
              <select
                id="edit_fiscal_substituto_id"
                value={substitutoId}
                onChange={(e) => setSubstitutoId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-[#2a3441] bg-[#131924] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              >
                <option value="" disabled>Selecione o Substituto</option>
                {substitutos.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.posto_graduacao} {f.nome_guerra}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-[#2a3441] gap-2">
            <Button type="button" variant="destructive" onClick={() => setOpen(false)} className="bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-sm transition-all">
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold">
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
