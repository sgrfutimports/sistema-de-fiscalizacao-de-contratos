'use client'

import { useState, useTransition } from 'react'
import { submitRelatorio } from '@/app/dashboard/relatorios/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { FileText, CheckCircle2, AlertTriangle } from 'lucide-react'

// Native, ultra-reliable styled switch component with clear visual status
function StyledSwitch({ 
  id, 
  checked, 
  onChange 
}: { 
  id: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void 
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-black uppercase tracking-wider transition-colors duration-200 ${checked ? 'text-green-400' : 'text-red-400'}`}>
        {checked ? 'Sim' : 'Não'}
      </span>
      <label className="relative inline-flex items-center cursor-pointer select-none">
        <input 
          type="checkbox" 
          id={id} 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-600/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 border border-[#3f526b]"></div>
      </label>
    </div>
  )
}

interface NovoRelatorioFormProps {
  contratoId: string
  papel: string
  relatorioInicial?: any
}

export function NovoRelatorioForm({ contratoId, papel, relatorioInicial }: NovoRelatorioFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [fiscalizacaoRealizada, setFiscalizacaoRealizada] = useState(
    relatorioInicial ? !!relatorioInicial.fiscalizacao_realizada : true
  )
  const [servicoConforme, setServicoConforme] = useState(
    relatorioInicial ? !!relatorioInicial.servico_conforme : true
  )
  const [documentacaoApresentada, setDocumentacaoApresentada] = useState(
    relatorioInicial ? !!relatorioInicial.documentacao_apresentada : true
  )

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    
    // Add hidden fields
    formData.append('contrato_id', contratoId)
    formData.append('tipo_fiscal', papel)
    
    if (relatorioInicial) {
      formData.append('relatorio_id', relatorioInicial.id)
    }
    
    // Appending checkboxes using state-driven values
    formData.append('fiscalizacao_realizada', fiscalizacaoRealizada ? 'on' : 'off')
    formData.append('servico_conforme', servicoConforme ? 'on' : 'off')
    formData.append('documentacao_apresentada', documentacaoApresentada ? 'on' : 'off')

    startTransition(async () => {
      const result = await submitRelatorio(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        toast.success(relatorioInicial ? 'Relatório corrigido com sucesso!' : 'Relatório enviado com sucesso para análise!')
        router.push('/dashboard/meus-relatorios')
      }
    })
  }

  const currentDate = new Date()
  const defaultMes = relatorioInicial ? relatorioInicial.competencia_mes.toString() : (currentDate.getMonth() + 1).toString()
  const defaultAno = relatorioInicial ? relatorioInicial.competencia_ano.toString() : currentDate.getFullYear().toString()

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
            {relatorioInicial ? 'Corrigir Relatório Devolvido' : 'Preencher Relatório Mensal'} ({papel})
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
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-3 border-b border-[#2a3441]">
              <div className="space-y-0.5">
                <Label htmlFor="fiscalizacao_realizada" className="text-sm font-bold text-white cursor-pointer">Fiscalização Realizada?</Label>
                <p className="text-xs text-gray-400">Ocorreu vistoria in loco ou acompanhamento remoto na competência atual.</p>
              </div>
              <div className="flex sm:justify-end">
                <StyledSwitch 
                  id="fiscalizacao_realizada" 
                  checked={fiscalizacaoRealizada} 
                  onChange={setFiscalizacaoRealizada} 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-3 border-b border-[#2a3441]">
              <div className="space-y-0.5">
                <Label htmlFor="servico_conforme" className="text-sm font-bold text-white cursor-pointer">Serviços e/ou Materiais Conformes?</Label>
                <p className="text-xs text-gray-400">A empresa cumpriu as obrigações estipuladas no contrato sem falhas graves.</p>
              </div>
              <div className="flex sm:justify-end">
                <StyledSwitch 
                  id="servico_conforme" 
                  checked={servicoConforme} 
                  onChange={setServicoConforme} 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-3">
              <div className="space-y-0.5">
                <Label htmlFor="documentacao_apresentada" className="text-sm font-bold text-white cursor-pointer">Documentação Trabalhista/Fiscal Apresentada?</Label>
                <p className="text-xs text-gray-400">Todas as guias e certidões negativas foram verificadas e estão regulares.</p>
              </div>
              <div className="flex sm:justify-end">
                <StyledSwitch 
                  id="documentacao_apresentada" 
                  checked={documentacaoApresentada} 
                  onChange={setDocumentacaoApresentada} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ocorrencias" className="text-sm font-bold text-gray-300">Ocorrências / Faltas Anotadas</Label>
              <Textarea 
                id="ocorrencias" 
                name="ocorrencias" 
                defaultValue={relatorioInicial?.ocorrencias || ''}
                placeholder="Descreva detalhadamente quaisquer ocorrências negativas, faltas de serviço ou material. Deixe em branco se não houver."
                className="min-h-[100px] bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pendencias" className="text-sm font-bold text-gray-300">Pendências da Empresa</Label>
              <Textarea 
                id="pendencias" 
                name="pendencias" 
                defaultValue={relatorioInicial?.pendencias || ''}
                placeholder="Ex: Faltou entregar o termo de garantia."
                className="min-h-[80px] bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-sm font-bold text-gray-300">Observações Adicionais (Recomendações ao Ordenador de Despesas)</Label>
              <Textarea 
                id="observacoes" 
                name="observacoes" 
                defaultValue={relatorioInicial?.observacoes || ''}
                placeholder="Ex: Recomendo o pagamento integral da fatura referida."
                className="min-h-[80px] bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500"
              />
            </div>
          </div>

        </CardContent>
        <CardFooter className="bg-[#131924] border-t border-[#2a3441] py-4 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="border-[#2a3441] text-gray-300 hover:bg-[#1b2331] hover:text-white">Cancelar</Button>
          <Button type="submit" disabled={isPending} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold animate-pulse hover:animate-none">
            {isPending ? 'Enviando...' : 'Salvar e Resubmeter Relatório'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
