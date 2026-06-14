'use client'

import { useState, useTransition } from 'react'
import { createUsuario } from '@/app/dashboard/usuarios/actions'
import { Button, buttonVariants } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

export function NovoUsuarioDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    
    startTransition(async () => {
      const result = await createUsuario(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        toast.success('Usuário criado com sucesso!')
        setOpen(false)
      }
    })
  }

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    e.target.value = value
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
      <DialogTrigger className={buttonVariants({ className: "gap-2" })}>
        <PlusCircle className="h-4 w-4" />
        Novo Usuário
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          <DialogDescription>
            A senha inicial será o CPF (apenas números). O usuário deverá alterá-la no primeiro acesso.
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
            <Input id="nome" name="nome" required placeholder="Ex: João da Silva" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="posto_graduacao">Posto / Graduação</Label>
              <Select name="posto_graduacao" defaultValue="3º Sgt">
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
              <Input id="nome_guerra" name="nome_guerra" required placeholder="Ex: Silva" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" name="cpf" required placeholder="000.000.000-00" onChange={handleCpfChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" required placeholder="(87) 90000-0000" onChange={handlePhoneChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail (Institucional ou Pessoal)</Label>
            <Input id="email" name="email" type="email" required placeholder="joao@eb.mil.br" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="perfil">Perfil de Acesso</Label>
            <Select name="perfil" defaultValue="FISCAL_TITULAR">
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

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="destructive" onClick={() => setOpen(false)} className="bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-sm transition-all">Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
