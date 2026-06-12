'use client'

import { useState, useTransition } from 'react'
import { submitRelatorio } from '@/app/dashboard/relatorios/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { FileText, CheckCircle2, AlertTriangle } from 'lucide-react'

export function NovoRelatorioForm({ contratoId, papel }: { contratoId: string, papel: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    
    // Add hidden fields
    formData.append('contrato_id', contratoId)
    formData.append('tipo_fiscal', papel)
    
    // Checkbox switches (React hook form would be better but doing native FormData here)
    const checkboxes = ['fiscalizacao_realizada', 'servico_conforme', 'documentacao_apresentada']
    checkboxes.forEach(c => {
      const el = document.getElementById(c) as HTMLButtonElement
      if (el && el.getAttribute('data-state') === 'checked') {
        formData.append(c, 'on')
      }
    })

    startTransition(async () => {
      const result = await submitRelatorio(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        toast.success('Relatório enviado com sucesso para análise!')
        router.push('/dashboard/meus-contratos')
      }
    })
  }

  const currentDate = new Date()
  const defaultMes = (currentDate.getMonth() + 1).toString()
  const defaultAno = currentDate.getFullYear().toString()

  return (
    <Card className="w-full shadow-sm border-t-4 border-t-primary">
      <form onSubmit={handleSubmit}>
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Preencher Relatório Mensal
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Competência (Mês/Ano)</Label>
              <div className="flex gap-4">
                <Select name="competencia_mes" defaultValue={defaultMes}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <SelectItem key={i+1} value={`${i+1}`}>{`${i+1}`.padStart(2, '0')} - Mês</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input name="competencia_ano" defaultValue={defaultAno} type="number" min="2020" max="2050" className="w-32" />
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-muted/20 p-6 rounded-xl border">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Itens de Verificação
            </h3>
            
            <div className="flex items-center justify-between gap-4 py-2 border-b">
              <div className="space-y-0.5">
                <Label htmlFor="fiscalizacao_realizada" className="text-base">Fiscalização Realizada?</Label>
                <p className="text-sm text-muted-foreground">Ocorreu vistoria in loco ou acompanhamento remoto na competência atual.</p>
              </div>
              <Switch id="fiscalizacao_realizada" defaultChecked />
            </div>

            <div className="flex items-center justify-between gap-4 py-2 border-b">
              <div className="space-y-0.5">
                <Label htmlFor="servico_conforme" className="text-base">Serviços e/ou Materiais Conformes?</Label>
                <p className="text-sm text-muted-foreground">A empresa cumpriu as obrigações estipuladas no contrato sem falhas graves.</p>
              </div>
              <Switch id="servico_conforme" defaultChecked />
            </div>

            <div className="flex items-center justify-between gap-4 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="documentacao_apresentada" className="text-base">Documentação Trabalhista/Fiscal Apresentada?</Label>
                <p className="text-sm text-muted-foreground">Todas as guias e certidões negativas foram verificadas e estão regulares.</p>
              </div>
              <Switch id="documentacao_apresentada" defaultChecked />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ocorrencias">Ocorrências / Faltas Anotadas</Label>
              <Textarea 
                id="ocorrencias" 
                name="ocorrencias" 
                placeholder="Descreva detalhadamente quaisquer ocorrências negativas, faltas de serviço ou material. Deixe em branco se não houver."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pendencias">Pendências da Empresa</Label>
              <Textarea 
                id="pendencias" 
                name="pendencias" 
                placeholder="Ex: Faltou entregar o termo de garantia."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações Adicionais (Recomendações ao Ordenador de Despesas)</Label>
              <Textarea 
                id="observacoes" 
                name="observacoes" 
                placeholder="Ex: Recomendo o pagamento integral da fatura referida."
                className="min-h-[80px]"
              />
            </div>
          </div>

        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Assinar e Enviar Relatório'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
