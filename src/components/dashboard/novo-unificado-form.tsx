'use client'

import { useState, useTransition } from 'react'
import { submitRelatoriosUnificados } from '@/app/dashboard/relatorios/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { FileText, CheckCircle2, AlertTriangle, Building, Briefcase } from 'lucide-react'

// Styled switch
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

interface ContratoItem {
  id: string
  numero_contrato: string
  empresa: string
  objeto: string
  fiscal_titular_id: string
}

interface NovoUnificadoFormProps {
  contratos: ContratoItem[]
  userId: string
}

export function NovoUnificadoForm({ contratos, userId }: NovoUnificadoFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const currentDate = new Date()
  const [mes, setMes] = useState((currentDate.getMonth() + 1).toString())
  const [ano, setAno] = useState(currentDate.getFullYear().toString())

  // Dynamic states for each contract in the form
  const [formStates, setFormStates] = useState<Record<string, {
    fiscalizacao_realizada: boolean
    servico_conforme: boolean
    documentacao_apresentada: boolean
    ocorrencias: string
    pendencias: string
    observacoes: string
  }>>(() => {
    const initial: Record<string, any> = {}
    contratos.forEach((c) => {
      initial[c.id] = {
        fiscalizacao_realizada: true,
        servico_conforme: true,
        documentacao_apresentada: true,
        ocorrencias: '',
        pendencias: '',
        observacoes: ''
      }
    })
    return initial
  })

  const handleStateChange = (contratoId: string, field: string, value: any) => {
    setFormStates(prev => ({
      ...prev,
      [contratoId]: {
        ...prev[contratoId],
        [field]: value
      }
    }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const payload = contratos.map((c) => {
      const state = formStates[c.id]
      const papel = c.fiscal_titular_id === userId ? 'Titular' : 'Substituto'
      return {
        contrato_id: c.id,
        tipo_fiscal: papel,
        fiscalizacao_realizada: state.fiscalizacao_realizada,
        servico_conforme: state.servico_conforme,
        documentacao_apresentada: state.documentacao_apresentada,
        ocorrencias: state.ocorrencias,
        pendencias: state.pendencias,
        observacoes: state.observacoes
      }
    })

    startTransition(async () => {
      const result = await submitRelatoriosUnificados(parseInt(mes), parseInt(ano), payload)
      if (result?.error) {
        setError(result.error)
      } else {
        toast.success('Relatório único enviado com sucesso!')
        router.push('/dashboard/meus-relatorios')
      }
    })
  }

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="shadow-lg border-[#2a3441] bg-[#1b2331] text-white rounded-xl">
        <CardHeader className="pb-4 border-b border-[#2a3441] bg-[#131924]">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-yellow-500" />
            Emissão de Relatório Único por Período
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              {error}
            </div>
          )}

          <div className="space-y-3 max-w-md">
            <Label className="text-sm font-bold text-gray-300">Selecione o Período de Competência</Label>
            <div className="flex gap-4">
              <select 
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[#2a3441] bg-[#131924] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              >
                {meses.map((mesName, i) => (
                  <option key={i+1} value={`${i+1}`} className="bg-[#131924]">
                    {`${i+1}`.padStart(2, '0')} - {mesName}
                  </option>
                ))}
              </select>
              <Input 
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                type="number" 
                min="2020" 
                max="2050" 
                className="w-32 bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500 font-bold" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-800">Contratos para Avaliação ({contratos.length})</h2>

        {contratos.map((cont) => {
          const state = formStates[cont.id]
          const papel = cont.fiscal_titular_id === userId ? 'Titular' : 'Substituto'

          return (
            <Card key={cont.id} className="shadow-md border-[#2a3441] bg-[#1b2331] overflow-hidden text-white rounded-xl">
              <CardHeader className="pb-3 border-b border-[#2a3441] bg-[#131924] flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black flex items-center gap-2 text-white">
                    <Building className="h-4 w-4 text-yellow-500" />
                    Contrato: {cont.numero_contrato} - {cont.empresa}
                  </CardTitle>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    Objeto: {cont.objeto}
                  </p>
                </div>
                <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  papel === 'Titular' ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                }`}>
                  {papel}
                </span>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4 bg-[#131924] p-4 rounded-xl border border-[#2a3441]">
                  <h4 className="font-bold text-xs text-yellow-500 flex items-center gap-2 uppercase tracking-wider">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verificações
                  </h4>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-[#2a3441]">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold text-white">Fiscalização Realizada?</Label>
                      <p className="text-[0.7rem] text-gray-400">Ocorreu vistoria in loco ou acompanhamento remoto.</p>
                    </div>
                    <div className="flex sm:justify-end">
                      <StyledSwitch 
                        id={`fiscalizacao_realizada_${cont.id}`} 
                        checked={state.fiscalizacao_realizada} 
                        onChange={(val) => handleStateChange(cont.id, 'fiscalizacao_realizada', val)} 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-[#2a3441]">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold text-white">Serviços e/ou Materiais Conformes?</Label>
                      <p className="text-[0.7rem] text-gray-400">A empresa cumpriu as obrigações estipuladas no contrato sem falhas graves.</p>
                    </div>
                    <div className="flex sm:justify-end">
                      <StyledSwitch 
                        id={`servico_conforme_${cont.id}`} 
                        checked={state.servico_conforme} 
                        onChange={(val) => handleStateChange(cont.id, 'servico_conforme', val)} 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold text-white">Documentação Trabalhista/Fiscal Apresentada?</Label>
                      <p className="text-[0.7rem] text-gray-400">Certidões e guias negativas conferidas e regulares.</p>
                    </div>
                    <div className="flex sm:justify-end">
                      <StyledSwitch 
                        id={`documentacao_apresentada_${cont.id}`} 
                        checked={state.documentacao_apresentada} 
                        onChange={(val) => handleStateChange(cont.id, 'documentacao_apresentada', val)} 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-300">Ocorrências / Faltas Anotadas</Label>
                    <Textarea 
                      value={state.ocorrencias}
                      onChange={(e) => handleStateChange(cont.id, 'ocorrencias', e.target.value)}
                      placeholder="Descreva ocorrências negativas..."
                      className="min-h-[80px] text-xs bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-300">Pendências da Empresa</Label>
                    <Textarea 
                      value={state.pendencias}
                      onChange={(e) => handleStateChange(cont.id, 'pendencias', e.target.value)}
                      placeholder="Ex: Faltou entregar termo..."
                      className="min-h-[80px] text-xs bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-300">Observações / Recomendações</Label>
                    <Textarea 
                      value={state.observacoes}
                      onChange={(e) => handleStateChange(cont.id, 'observacoes', e.target.value)}
                      placeholder="Ex: Recomendo o pagamento..."
                      className="min-h-[80px] text-xs bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-end gap-4 bg-[#131924] p-4 rounded-xl border border-[#2a3441]">
        <Button type="button" variant="outline" onClick={() => router.back()} className="border-[#2a3441] text-gray-300 hover:bg-[#1b2331] hover:text-white">Cancelar</Button>
        <Button type="submit" disabled={isPending} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold animate-pulse hover:animate-none">
          {isPending ? 'Enviando...' : 'Salvar e Enviar Relatório Único'}
        </Button>
      </div>
    </form>
  )
}
