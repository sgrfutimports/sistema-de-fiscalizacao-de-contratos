'use client'

import { useState, useTransition } from 'react'
import { updateUsuario } from '@/app/dashboard/usuarios/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit } from 'lucide-react'
import { toast } from 'sonner'

interface EditarUsuarioDialogProps {
  usuario: {
    id: string
    nome: string
    posto_graduacao: string
    nome_guerra: string
    cpf: string
    email: string
    telefone: string
    perfil: string
    ativo: boolean
  }
}

export function EditarUsuarioDialog({ usuario }: EditarUsuarioDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [ativo, setAtivo] = useState(usuario.ativo)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    formData.append('ativo', String(ativo))
    
    startTransition(async () => {
      const result = await updateUsuario(usuario.id, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        toast.success('Militar atualizado com sucesso!')
        setOpen(false)
      }
    })
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2')
    value = value.replace(/(\d)(\d{4})$/, '$1-$2')
    e.target.value = value
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-bold text-white border border-gray-600 rounded hover:bg-gray-700 transition-colors uppercase tracking-wider cursor-pointer">
        <Edit className="h-3 w-3" />
        Editar
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Militar / Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações de cadastro e perfil de acesso do militar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="rounded-md bg-destructive/15 p-2 text-sm text-destructive border border-destructive/20 text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input id="nome" name="nome" required defaultValue={usuario.nome} placeholder="Ex: João da Silva" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="posto_graduacao">Posto / Graduação</Label>
              <Select name="posto_graduacao" defaultValue={usuario.posto_graduacao}>
                <SelectTrigger id="posto_graduacao">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gen Ex">Gen Ex</SelectItem>
                  <SelectItem value="Gen Div">Gen Div</SelectItem>
                  <SelectItem value="Gen Bda">Gen Bda</SelectItem>
                  <SelectItem value="Cel">Cel</SelectItem>
                  <SelectItem value="Ten Cel">Ten Cel</SelectItem>
                  <SelectItem value="Maj">Maj</SelectItem>
                  <SelectItem value="Cap">Cap</SelectItem>
                  <SelectItem value="1º Ten">1º Ten</SelectItem>
                  <SelectItem value="2º Ten">2º Ten</SelectItem>
                  <SelectItem value="Asp">Asp</SelectItem>
                  <SelectItem value="S Ten">S Ten</SelectItem>
                  <SelectItem value="1º Sgt">1º Sgt</SelectItem>
                  <SelectItem value="2º Sgt">2º Sgt</SelectItem>
                  <SelectItem value="3º Sgt">3º Sgt</SelectItem>
                  <SelectItem value="Cb">Cb</SelectItem>
                  <SelectItem value="Sd">Sd</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome_guerra">Nome de Guerra</Label>
              <Input id="nome_guerra" name="nome_guerra" required defaultValue={usuario.nome_guerra} placeholder="Ex: Silva" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf-display">CPF (Não Alterável)</Label>
              <Input id="cpf-display" disabled value={usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')} className="bg-muted opacity-80" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" required defaultValue={usuario.telefone} placeholder="(87) 90000-0000" onChange={handlePhoneChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail (Institucional ou Pessoal)</Label>
            <Input id="email" name="email" type="email" required defaultValue={usuario.email} placeholder="joao@eb.mil.br" />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label htmlFor="perfil">Perfil de Acesso</Label>
              <Select name="perfil" defaultValue={usuario.perfil}>
                <SelectTrigger id="perfil">
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FISCAL_TITULAR">Fiscal Titular</SelectItem>
                  <SelectItem value="FISCAL_SUBSTITUTO">Fiscal Substituto</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-2 pt-2">
              <Label htmlFor="ativo">Status do Usuário</Label>
              <div className="flex items-center gap-2 h-10">
                <Switch id="ativo" checked={ativo} onCheckedChange={setAtivo} />
                <span className="text-sm font-semibold">{ativo ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
