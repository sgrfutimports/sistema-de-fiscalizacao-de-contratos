'use client'

import { Bell } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { notificarAtrasados } from './actions'

export function NotificarButton() {
  const [isPending, startTransition] = useTransition()

  function handleNotify() {
    startTransition(async () => {
      try {
        const result = await notificarAtrasados()
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success(result.success || 'Notificações enviadas com sucesso!')
        }
      } catch (e) {
        toast.error('Erro ao notificar atrasados.')
      }
    })
  }

  return (
    <button 
      onClick={handleNotify}
      disabled={isPending}
      className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md uppercase tracking-wider shrink-0 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
    >
      <Bell className={`h-4 w-4 ${isPending ? 'animate-pulse' : ''}`} />
      {isPending ? 'Notificando...' : 'Notificar Atrasados (E-mail)'}
    </button>
  )
}
