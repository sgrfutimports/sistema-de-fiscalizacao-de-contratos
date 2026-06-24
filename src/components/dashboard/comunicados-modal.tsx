'use client'

import { useState, useTransition } from 'react'
import { confirmarLeituraComunicados } from '@/app/dashboard/comunicados/actions'
import { Button } from '@/components/ui/button'
import { AlertCircle, Calendar, User, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Comunicado {
  id: string
  titulo: string
  conteudo: string
  autor: string
  created_at: string
}

interface ComunicadosModalProps {
  comunicados: Comunicado[]
}

export function ComunicadosModal({ comunicados }: ComunicadosModalProps) {
  const [isPending, startTransition] = useTransition()
  const [confirmed, setConfirmed] = useState(false)

  if (comunicados.length === 0) return null

  function handleConfirm() {
    if (!confirmed) {
      toast.error('Por favor, marque a caixa confirmando que leu o comunicado.')
      return
    }

    startTransition(async () => {
      const ids = comunicados.map(c => c.id)
      const result = await confirmarLeituraComunicados(ids)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Comunicado confirmado! Bem-vindo ao sistema.')
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-[#1b2331] border border-[#2a3441] text-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Oficial */}
        <div className="bg-[#131924] border-b border-[#2a3441] p-6 flex items-center gap-3">
          <div className="bg-yellow-500/10 p-2.5 rounded-lg border border-yellow-500/30 text-yellow-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-yellow-500">Leitura Obrigatória</h2>
            <p className="text-xs text-gray-400 font-bold mt-0.5">Há novos comunicados oficiais para você</p>
          </div>
        </div>

        {/* Corpo com a lista de comunicados */}
        <div className="overflow-y-auto p-6 space-y-6 divide-y divide-[#2a3441]/50">
          {comunicados.map((com, idx) => (
            <div key={com.id} className={`space-y-4 ${idx > 0 ? 'pt-6' : ''}`}>
              <div className="flex justify-between items-center gap-2">
                <span className="text-[0.65rem] font-extrabold text-yellow-600 bg-yellow-600/10 border border-yellow-600/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  MENSAGEM OFICIAL
                </span>
                <span className="text-[0.65rem] text-gray-400 font-mono flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(com.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white">{com.titulo}</h3>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-[#131924]/40 p-4 rounded-lg border border-[#2a3441]/60">
                {com.conteudo}
              </p>
              <div className="text-[0.7rem] font-bold text-gray-400 uppercase flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-yellow-500/70" />
                Por: <span className="text-white ml-0.5">{com.autor}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer com leitura obrigatória e confirmação */}
        <div className="bg-[#131924] border-t border-[#2a3441] p-6 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#2a3441] bg-[#1b2331] text-yellow-600 focus:ring-yellow-500 focus:ring-offset-[#131924]"
            />
            <span className="text-xs font-bold text-gray-300 leading-tight">
              Confirmo que realizei a leitura atenta e integral do(s) comunicado(s) oficial(is) acima e estou ciente das instruções.
            </span>
          </label>

          <Button 
            onClick={handleConfirm}
            disabled={isPending || !confirmed}
            className={`w-full font-bold uppercase tracking-wider h-11 text-xs transition-all ${
              confirmed 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-600/20' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isPending ? 'Confirmando...' : 'Confirmar Leitura e Acessar o Painel'}
          </Button>
        </div>

      </div>
    </div>
  )
}
