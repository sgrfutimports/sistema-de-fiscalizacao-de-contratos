'use client'

import { useState, useTransition } from 'react'
import { deleteUsuario } from '@/app/dashboard/usuarios/actions'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ExcluirUsuarioButtonProps {
  userId: string
  userName: string
}

export function ExcluirUsuarioButton({ userId, userName }: ExcluirUsuarioButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUsuario(userId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Militar ${userName} excluído com sucesso!`)
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        className="flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-bold text-red-500 border border-red-500/50 rounded hover:bg-red-500/10 transition-colors uppercase tracking-wider cursor-pointer bg-transparent"
      >
        <Trash2 className="h-3 w-3" />
        Excluir
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-red-500/20 bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs leading-relaxed mt-2">
            Tem certeza que deseja excluir permanentemente o cadastro do militar <strong className="text-foreground">{userName}</strong>?
            <br /><br />
            Esta ação é **irreversível** e removerá a conta e as credenciais de acesso dele do sistema.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="destructive" size="sm" type="button" onClick={() => setOpen(false)} disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-sm transition-all">
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete} 
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white border-none"
          >
            {isPending ? 'Excluindo...' : 'Confirmar Exclusão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
