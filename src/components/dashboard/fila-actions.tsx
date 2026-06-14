'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { analisarRelatorio } from '@/app/dashboard/relatorios/actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2, XCircle, Eye } from 'lucide-react'
import Link from 'next/link'

interface FilaItem {
  id: string
  competencia_mes: number
  competencia_ano: number
  status: string
  tipo_fiscal: string
  created_at: string
  contrato: { numero_contrato: string; empresa: string } | null
  fiscal: { nome: string; cpf: string } | null
}

interface FilaActionsProps {
  item: FilaItem
}

export function FilaActions({ item }: FilaActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialog, setDialog] = useState<'APROVAR' | 'DEVOLVER' | null>(null)
  const [parecer, setParecer] = useState('')
  const [parecerError, setParecerError] = useState('')

  function handleSubmit() {
    if (!dialog) return
    if (dialog === 'DEVOLVER' && !parecer.trim()) {
      setParecerError('Informe o motivo da devolução.')
      return
    }
    setParecerError('')

    startTransition(async () => {
      const result = await analisarRelatorio(item.id, dialog, parecer.trim())
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(
          dialog === 'APROVAR'
            ? 'Relatório aprovado com sucesso!'
            : 'Relatório devolvido para correção.'
        )
        setDialog(null)
        setParecer('')
        router.refresh()
      }
    })
  }

  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  return (
    <>
      {/* Linha da fila */}
      <tr className="border-b border-[#2a3441]/60 hover:bg-[#131924]/40 transition-colors group">
        <td className="px-4 py-3">
          <div className="font-bold text-sm text-white">{item.contrato?.numero_contrato ?? '—'}</div>
          <div className="text-[0.68rem] text-gray-400 truncate max-w-[180px]">{item.contrato?.empresa ?? '—'}</div>
        </td>
        <td className="px-4 py-3">
          <div className="text-sm text-gray-300 font-medium">{item.fiscal?.nome ?? '—'}</div>
          <div className="text-[0.68rem] text-gray-500">{item.tipo_fiscal}</div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-300 font-bold">
          {String(item.competencia_mes).padStart(2,'0')}/{item.competencia_ano}
        </td>
        <td className="px-4 py-3">
          <span className={`text-[0.65rem] font-black px-2 py-0.5 rounded border uppercase tracking-wider
            ${item.status === 'ENVIADO' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-yellow-500 text-yellow-400 bg-yellow-500/10'}`}>
            {item.status === 'ENVIADO' ? 'Aguardando' : 'Em Análise'}
          </span>
        </td>
        <td className="px-4 py-3 text-[0.68rem] text-gray-500">
          {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 justify-end">
            <Link href={`/dashboard/relatorios/${item.id}`}
              className="p-1.5 rounded-lg border border-[#2a3441] text-gray-400 hover:text-white hover:border-gray-400 transition-colors"
              title="Visualizar relatório">
              <Eye className="h-4 w-4" />
            </Link>
            <Button size="sm"
              onClick={() => { setParecer(''); setParecerError(''); setDialog('APROVAR') }}
              className="bg-green-700 hover:bg-green-600 text-white font-bold text-xs h-7 px-3 gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Aprovar
            </Button>
            <Button size="sm" variant="destructive"
              onClick={() => { setParecer(''); setParecerError(''); setDialog('DEVOLVER') }}
              className="font-bold text-xs h-7 px-3 gap-1.5">
              <XCircle className="h-3.5 w-3.5" /> Devolver
            </Button>
          </div>
        </td>
      </tr>

      {/* Dialog de confirmação */}
      <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) { setDialog(null); setParecer('') } }}>
        <DialogContent className="bg-[#1b2331] border-[#2a3441] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 font-black text-lg ${dialog === 'APROVAR' ? 'text-green-400' : 'text-red-400'}`}>
              {dialog === 'APROVAR'
                ? <><CheckCircle2 className="h-5 w-5" /> Aprovar Relatório</>
                : <><XCircle className="h-5 w-5" /> Devolver para Correção</>
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="bg-[#131924] border border-[#2a3441] rounded-lg p-3 space-y-1 text-sm">
              <p className="text-gray-300"><span className="text-gray-500 font-bold">Contrato:</span> {item.contrato?.numero_contrato} — {item.contrato?.empresa}</p>
              <p className="text-gray-300"><span className="text-gray-500 font-bold">Fiscal:</span> {item.fiscal?.nome} ({item.tipo_fiscal})</p>
              <p className="text-gray-300"><span className="text-gray-500 font-bold">Competência:</span> {String(item.competencia_mes).padStart(2,'0')}/{item.competencia_ano}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-300">
                {dialog === 'APROVAR' ? 'Parecer / Observação (opcional)' : 'Motivo da Devolução *'}
              </Label>
              <Textarea value={parecer} onChange={e => { setParecer(e.target.value); setParecerError('') }}
                placeholder={dialog === 'APROVAR'
                  ? 'Ex: Relatório aprovado conforme verificação documental.'
                  : 'Descreva o motivo da devolução para o fiscal corrigir...'}
                className="min-h-[90px] bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500 text-sm" />
              {parecerError && <p className="text-red-400 text-xs font-bold">{parecerError}</p>}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="destructive" type="button" onClick={() => setDialog(null)} disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-sm transition-all">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}
              className={dialog === 'APROVAR'
                ? 'bg-green-700 hover:bg-green-600 text-white font-black'
                : 'bg-red-700 hover:bg-red-600 text-white font-black'}>
              {isPending ? 'Processando...' : dialog === 'APROVAR' ? 'Confirmar Aprovação' : 'Confirmar Devolução'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
