'use client'

import { useState, useTransition } from 'react'
import { deleteRelatorio } from '@/app/dashboard/relatorios/actions'
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

interface ExcluirRelatorioButtonProps {
  relatorioId: string
  label: string
}

export function ExcluirRelatorioButton({ relatorioId, label }: ExcluirRelatorioButtonProps) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!password) {
      toast.error('Por favor, insira sua senha de confirmação.')
      return
    }
    startTransition(async () => {
      const result = await deleteRelatorio(relatorioId, password)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Relatório excluído com sucesso!')
        setPassword('')
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setPassword(''); }}>
      <DialogTrigger 
        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-wider text-red-400 border border-red-500/30 rounded-xl bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50 transition-all shadow-sm cursor-pointer whitespace-nowrap h-8"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Excluir
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-red-500/20 bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs leading-relaxed mt-2">
            Tem certeza que deseja excluir permanentemente o relatório do <strong className="text-foreground">{label}</strong>?
            <br /><br />
            Esta ação é **irreversível** e removerá todos os dados do relatório e documentos anexados do banco de dados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-3 border-t border-[#2a3441]/50 mt-4">
          <label className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider block">
            Sua Senha de Administrador para Confirmação *
          </label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            className="w-full bg-[#131924] text-gray-300 text-xs px-3 py-2 rounded-lg border border-[#2a3441] focus:border-red-500/50 outline-none transition-all shadow-inner"
          />
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="destructive" size="sm" type="button" onClick={() => setOpen(false)} disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-sm transition-all">
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete} 
            disabled={isPending || !password}
            className="bg-red-600 hover:bg-red-700 text-white border-none disabled:opacity-50"
          >
            {isPending ? 'Excluindo...' : 'Confirmar Exclusão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
