'use client'

import { useState, useTransition } from 'react'
import { resetUsuarioPassword } from '@/app/dashboard/usuarios/actions'
import { Button } from '@/components/ui/button'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'

interface ResetarSenhaButtonProps {
  userId: string
  userName: string
}

export function ResetarSenhaButton({ userId, userName }: ResetarSenhaButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleReset() {
    startTransition(async () => {
      const result = await resetUsuarioPassword(userId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Senha de ${userName} resetada com sucesso!`)
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-wider text-yellow-400 border border-yellow-500/30 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all shadow-sm cursor-pointer whitespace-nowrap h-8"
      >
        <KeyRound className="h-3.5 w-3.5" />
        Resetar Senha
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">Confirmar Reset de Senha</DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
            Tem certeza que deseja redefinir a senha do militar <strong className="text-foreground">{userName}</strong>?
            <br />
            A senha dele voltará a ser o **CPF (apenas números)** e ele precisará redefinir a senha no próximo acesso.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="destructive" size="sm" type="button" onClick={() => setOpen(false)} disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-sm transition-all">
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleReset} 
            disabled={isPending}
            className="bg-yellow-600 hover:bg-yellow-700 text-white border-none"
          >
            {isPending ? 'Resetando...' : 'Confirmar Reset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
