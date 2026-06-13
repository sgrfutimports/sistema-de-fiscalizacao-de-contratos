'use client'

import { useState, useTransition } from 'react'
import { createComunicado, deleteComunicado } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { AlertCircle, Trash2, Megaphone } from 'lucide-react'

interface Comunicado {
  id: string
  titulo: string
  conteudo: string
  autor: string
  created_at: string
}

export function GerenciarComunicados({ comunicados }: { comunicados: Comunicado[] }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    
    startTransition(async () => {
      const result = await createComunicado(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        toast.success('Comunicado publicado com sucesso!')
        event.currentTarget.reset()
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Deseja realmente remover este comunicado?')) return

    startTransition(async () => {
      const result = await deleteComunicado(id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Comunicado removido com sucesso!')
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Formulário de Envio */}
      <Card className="lg:col-span-1 border-border/50 shadow-sm bg-[#1b2331] text-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-yellow-500" />
            Novo Comunicado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive border border-destructive/20 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Comunicado</Label>
              <Input 
                id="titulo" 
                name="titulo" 
                required 
                placeholder="Ex: Reunião Geral de Instrução" 
                className="bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500 placeholder-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conteudo">Mensagem / Conteúdo</Label>
              <textarea 
                id="conteudo" 
                name="conteudo" 
                required 
                rows={5}
                placeholder="Digite a mensagem oficial para os fiscais..."
                className="flex w-full rounded-md border border-[#2a3441] bg-[#131924] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 placeholder-gray-500"
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold">
              {isPending ? 'Publicando...' : 'Publicar Comunicado'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Comunicados Recentes */}
      <Card className="lg:col-span-2 border-border/50 shadow-sm bg-[#1b2331] text-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Comunicados Ativos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {comunicados.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-medium">
              Nenhum comunicado cadastrado no momento.
            </div>
          ) : (
            comunicados.map((com) => (
              <div key={com.id} className="p-4 rounded-lg bg-[#131924] border border-[#2a3441] flex justify-between items-start gap-4 hover:bg-[#18202e] transition-colors">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-yellow-500 uppercase tracking-wider">COMUNICADO OFICIAL</span>
                    <span className="text-[0.65rem] text-gray-500">
                      {new Date(com.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{com.titulo}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{com.conteudo}</p>
                  <div className="text-[0.65rem] font-bold text-gray-500 uppercase">
                    Publicado por: <span className="text-gray-400">{com.autor}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(com.id)}
                  className="p-1.5 rounded-lg border border-[#2a3441] text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors shrink-0"
                  title="Excluir comunicado"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

    </div>
  )
}
