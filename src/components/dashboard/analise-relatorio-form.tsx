'use client'

import { useState, useTransition } from 'react'
import { analisarRelatorio } from '@/app/dashboard/relatorios/actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, FileSignature } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function AnaliseRelatorioForm({ relatorioId, statusAtual, parecerAtual }: { relatorioId: string, statusAtual: string, parecerAtual: string | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [acao, setAcao] = useState<'APROVAR' | 'DEVOLVER' | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!acao) return
    setError(null)
    const formData = new FormData(event.currentTarget)
    const parecer = formData.get('parecer') as string
    
    if (acao === 'DEVOLVER' && !parecer.trim()) {
      setError('Para devolver um relatório, é obrigatório preencher o parecer justificando a devolução.')
      return
    }

    startTransition(async () => {
      const result = await analisarRelatorio(relatorioId, acao, parecer)
      if (result?.error) {
        setError(result.error)
      } else {
        toast.success(acao === 'APROVAR' ? 'Relatório aprovado com sucesso!' : 'Relatório devolvido ao fiscal!')
        router.push('/dashboard/relatorios')
      }
    })
  }

  const isFinalizado = statusAtual === 'APROVADO' || statusAtual === 'ARQUIVADO'

  return (
    <Card className={`border-t-4 ${isFinalizado ? 'border-t-gray-500' : 'border-t-primary'}`}>
      <form onSubmit={handleSubmit}>
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Parecer do Ordenador / Gestor
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="parecer">Considerações Finais</Label>
            <Textarea 
              id="parecer" 
              name="parecer" 
              defaultValue={parecerAtual || ''}
              disabled={isFinalizado || isPending}
              placeholder="Digite o parecer, ressalvas ou instruções para pagamento. (Obrigatório em caso de devolução)"
              className="min-h-[120px]"
            />
          </div>
        </CardContent>

        {!isFinalizado && (
          <CardFooter className="bg-muted/30 border-t py-4 flex flex-col sm:flex-row justify-end gap-4">
            <Button 
              type="submit" 
              variant="destructive" 
              className="w-full sm:w-auto"
              disabled={isPending}
              onClick={() => setAcao('DEVOLVER')}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Devolver para Correção
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              disabled={isPending}
              onClick={() => setAcao('APROVAR')}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Aprovar Relatório
            </Button>
          </CardFooter>
        )}
        {isFinalizado && (
          <CardFooter className="bg-muted/30 border-t py-4">
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Este relatório já foi finalizado e não pode ser alterado.
            </p>
          </CardFooter>
        )}
      </form>
    </Card>
  )
}
