'use client'

import { useState, useTransition } from 'react'
import { submitRelatorio } from '@/app/dashboard/relatorios/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <Card className="shadow-lg border-[#2a3441] bg-[#1b2331] overflow-hidden text-white rounded-xl">
      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-4 border-b border-[#2a3441] bg-[#131924]">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-yellow-500" />
            Preencher Relatório Mensal ({papel})
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-gray-300">Competência (Mês/Ano)</Label>
              <div className="flex gap-4">
                <select 
                  name="competencia_mes" 
                  defaultValue={defaultMes}
                  className="flex h-10 w-full rounded-md border border-[#2a3441] bg-[#131924] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                >
                  {meses.map((mes, i) => (
                    <option key={i+1} value={`${i+1}`} className="bg-[#131924]">
                      {`${i+1}`.padStart(2, '0')} - {mes}
                    </option>
                  ))}
                </select>
                <Input 
                  name="competencia_ano" 
                  defaultValue={defaultAno} 
                  type="number" 
                  min="2020" 
                  max="2050" 
                  className="w-32 bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500 font-bold" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-[#131924] p-6 rounded-xl border border-[#2a3441]">
            <h3 className="font-bold text-sm text-yellow-500 flex items-center gap-2 uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" />
              Itens de Verificação
            </h3>
            
            <div className="flex items-center justify-between gap-4 py-3 border-b border-[#2a3441]">
              <div className="space-y-0.5">
                <Label htmlFor="fiscalizacao_realizada" className="text-sm font-bold text-white">Fiscalização Realizada?</Label>
                <p className="text-xs text-gray-400">Ocorreu vistoria in loco ou acompanhamento remoto na competência atual.</p>
              </div>
              <Switch id="fiscalizacao_realizada" defaultChecked className="data-[state=checked]:bg-yellow-600" />
            </div>

            <div className="flex items-center justify-between gap-4 py-3 border-b border-[#2a3441]">
              <div className="space-y-0.5">
                <Label htmlFor="servico_conforme" className="text-sm font-bold text-white">Serviços e/ou Materiais Conformes?</Label>
                <p className="text-xs text-gray-400">A empresa cumpriu as obrigações estipuladas no contrato sem falhas graves.</p>
              </div>
              <Switch id="servico_conforme" defaultChecked className="data-[state=checked]:bg-yellow-600" />
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <div className="space-y-0.5">
                <Label htmlFor="documentacao_apresentada" className="text-sm font-bold text-white">Documentação Trabalhista/Fiscal Apresentada?</Label>
                <p className="text-xs text-gray-400">Todas as guias e certidões negativas foram verificadas e estão regulares.</p>
              </div>
              <Switch id="documentacao_apresentada" defaultChecked className="data-[state=checked]:bg-yellow-600" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ocorrencias" className="text-sm font-bold text-gray-300">Ocorrências / Faltas Anotadas</Label>
              <Textarea 
                id="ocorrencias" 
                name="ocorrencias" 
                placeholder="Descreva detalhadamente quaisquer ocorrências negativas, faltas de serviço ou material. Deixe em branco se não houver."
                className="min-h-[100px] bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pendencias" className="text-sm font-bold text-gray-300">Pendências da Empresa</Label>
              <Textarea 
                id="pendencias" 
                name="pendencias" 
                placeholder="Ex: Faltou entregar o termo de garantia."
                className="min-h-[80px] bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-sm font-bold text-gray-300">Observações Adicionais (Recomendações ao Ordenador de Despesas)</Label>
              <Textarea 
                id="observacoes" 
                name="observacoes" 
                placeholder="Ex: Recomendo o pagamento integral da fatura referida."
                className="min-h-[80px] bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500"
              />
            </div>
          </div>

        </CardContent>
        <CardFooter className="bg-[#131924] border-t border-[#2a3441] py-4 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="border-[#2a3441] text-gray-300 hover:bg-[#1b2331] hover:text-white">Cancelar</Button>
          <Button type="submit" disabled={isPending} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold">
            {isPending ? 'Enviando...' : 'Assinar e Enviar Relatório'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
