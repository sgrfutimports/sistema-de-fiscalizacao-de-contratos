'use client'

import { Bell, AlertTriangle, Send, X, CheckCircle2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { notificarAtrasados, listarAtrasados } from './actions'

export function NotificarButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPendingList, startTransitionList] = useTransition()
  const [isPendingNotify, startTransitionNotify] = useTransition()
  const [lista, setLista] = useState<any[]>([])

  function handleOpenModal() {
    setIsOpen(true)
    startTransitionList(async () => {
      try {
        const data = await listarAtrasados()
        setLista(data)
      } catch (e) {
        toast.error('Erro ao buscar lista de atrasados.')
      }
    })
  }

  function handleNotify() {
    startTransitionNotify(async () => {
      try {
        const result = await notificarAtrasados(lista)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success(result.message || 'Notificações enviadas com sucesso!')
          setIsOpen(false)
        }
      } catch (e) {
        toast.error('Erro ao notificar atrasados.')
      }
    })
  }

  return (
    <>
      <button 
        onClick={handleOpenModal}
        className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md uppercase tracking-wider shrink-0 whitespace-nowrap cursor-pointer disabled:opacity-50"
      >
        <Bell className="h-4 w-4" />
        Notificar Atrasados (E-mail)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="bg-orange-500 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold uppercase tracking-wider">Confirmar Disparo de E-mails</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {isPendingList ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="font-bold">Buscando pendências...</p>
                </div>
              ) : lista.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                  <p className="font-bold text-lg text-gray-800">Tudo em dia!</p>
                  <p className="text-sm">Não há nenhum relatório pendente com e-mail cadastrado no momento.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Os seguintes fiscais receberão um e-mail de cobrança devido a pendências ativas nos contratos:
                  </p>
                  <div className="bg-gray-50 border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {lista.map((item, i) => (
                      <div key={i} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-bold text-[#133215] text-sm">{item.nome_fiscal}</p>
                          <p className="text-xs text-gray-500">{item.contrato_desc}</p>
                        </div>
                        <span className="text-xs font-mono bg-white px-2 py-1 rounded border text-orange-600 shrink-0">
                          {item.email}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-orange-600 font-bold mt-4 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> 
                    Aviso: {lista.length} e-mail(s) será(ão) disparado(s). Esta ação ficará registrada no log de auditoria.
                  </p>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 border-t flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleNotify}
                disabled={isPendingNotify || lista.length === 0}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
              >
                <Send className={`h-4 w-4 ${isPendingNotify ? 'animate-pulse' : ''}`} />
                {isPendingNotify ? 'Enviando...' : 'Confirmar e Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
