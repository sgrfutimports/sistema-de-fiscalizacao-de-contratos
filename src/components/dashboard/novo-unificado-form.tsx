'use client'

import { useState, useTransition } from 'react'
import { submitRelatoriosUnificados } from '@/app/dashboard/relatorios/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Building, Briefcase, AlertTriangle, CheckSquare,
  FileText, CreditCard, Banknote, Settings, Paperclip
} from 'lucide-react'

// ─── Componentes primitivos ────────────────────────────────────────────────────

function StyledSwitch({
  id, checked, onChange,
}: { id: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-black uppercase tracking-wider transition-colors duration-200 ${checked ? 'text-green-400' : 'text-red-400'}`}>
        {checked ? 'Sim' : 'Não'}
      </span>
      <label className="relative inline-flex items-center cursor-pointer select-none">
        <input type="checkbox" id={id} checked={checked}
          onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-600/60 peer-focus:outline-none rounded-full peer
          peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px]
          after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
          peer-checked:bg-green-600 border border-[#3f526b]" />
      </label>
    </div>
  )
}

function BlocoHeader({ icon: Icon, title, cor }: { icon: any; title: string; cor: string }) {
  return (
    <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${cor}`}>
      <Icon className="h-4 w-4" />
      <h4 className="font-black text-xs uppercase tracking-wider">{title}</h4>
    </div>
  )
}

function CheckRow({
  label, desc, id, checked, onChange,
}: { label: string; desc?: string; id: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 border-b border-[#2a3441]/50 last:border-0">
      <div className="flex-1 space-y-0.5">
        <Label className="text-xs font-bold text-white cursor-pointer">{label}</Label>
        {desc && <p className="text-[0.68rem] text-gray-400">{desc}</p>}
      </div>
      <div className="flex sm:justify-end">
        <StyledSwitch id={id} checked={checked} onChange={onChange} />
      </div>
    </div>
  )
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ContratoItem {
  id: string
  numero_contrato: string
  empresa: string
  objeto: string
  fiscal_titular_id: string
}

interface VerificacoesContrato {
  // Bloco 1 – Execução Contratual
  exec_realizada: boolean
  exec_conforme: boolean
  exec_ocorrencias: boolean
  exec_notificacao: boolean
  // Bloco 2 – Regularidade Fiscal
  fiscal_sicaf: boolean
  fiscal_certidoes: boolean
  fiscal_fgts: boolean
  fiscal_cndt: boolean
  fiscal_ceis: boolean
  // Bloco 3 – Pagamento
  pag_nf_apresentada: boolean
  pag_nf_atestada: boolean
  pag_ob_emitida: boolean
  pag_realizado: boolean
  // Bloco 4 – Receita (Permissionários)
  rec_gru_emitida: boolean
  rec_gru_paga: boolean
  rec_valor_correto: boolean
  rec_comprovante: boolean
  // Bloco 5 – Gestão Contratual
  gest_garantia: boolean
  gest_vigencia: boolean
  gest_aditivo: boolean
  gest_reajuste: boolean
  gest_repactuacao: boolean
  // Textuais
  ocorrencias: string
  pendencias: string
  observacoes: string
  // Bloco 6 – Documentos (nomes de arquivo)
  doc_nota_fiscal: string
  doc_gru: string
  doc_ordem_bancaria: string
  doc_certidoes: string
  doc_fotografico: string
  doc_notificacoes: string
}

function defaultVerificacoes(): VerificacoesContrato {
  return {
    exec_realizada: true, exec_conforme: true, exec_ocorrencias: false, exec_notificacao: false,
    fiscal_sicaf: true, fiscal_certidoes: true, fiscal_fgts: true, fiscal_cndt: true, fiscal_ceis: true,
    pag_nf_apresentada: true, pag_nf_atestada: true, pag_ob_emitida: true, pag_realizado: true,
    rec_gru_emitida: false, rec_gru_paga: false, rec_valor_correto: false, rec_comprovante: false,
    gest_garantia: true, gest_vigencia: true, gest_aditivo: false, gest_reajuste: false, gest_repactuacao: false,
    ocorrencias: '', pendencias: '', observacoes: '',
    doc_nota_fiscal: '', doc_gru: '', doc_ordem_bancaria: '',
    doc_certidoes: '', doc_fotografico: '', doc_notificacoes: '',
  }
}

interface NovoUnificadoFormProps {
  contratos: ContratoItem[]
  userId: string
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function NovoUnificadoForm({ contratos, userId }: NovoUnificadoFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const currentDate = new Date()
  const [mes, setMes] = useState((currentDate.getMonth() + 1).toString())
  const [ano, setAno] = useState(currentDate.getFullYear().toString())

  const [formStates, setFormStates] = useState<Record<string, VerificacoesContrato>>(() => {
    const init: Record<string, VerificacoesContrato> = {}
    contratos.forEach((c) => { init[c.id] = defaultVerificacoes() })
    return init
  })

  const setField = (contratoId: string, field: keyof VerificacoesContrato, value: any) =>
    setFormStates(prev => ({ ...prev, [contratoId]: { ...prev[contratoId], [field]: value } }))

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const payload = contratos.map((c) => {
      const s = formStates[c.id]
      const papel = c.fiscal_titular_id === userId ? 'Titular' : 'Substituto'
      return {
        contrato_id: c.id,
        tipo_fiscal: papel,
        fiscalizacao_realizada: s.exec_realizada,
        servico_conforme: s.exec_conforme,
        documentacao_apresentada: s.fiscal_certidoes,
        ocorrencias: s.ocorrencias,
        pendencias: s.pendencias,
        observacoes: s.observacoes,
        verificacoes: {
          execucao: { realizada: s.exec_realizada, conforme: s.exec_conforme, ocorrencias: s.exec_ocorrencias, notificacao: s.exec_notificacao },
          fiscal: { sicaf: s.fiscal_sicaf, certidoes: s.fiscal_certidoes, fgts: s.fiscal_fgts, cndt: s.fiscal_cndt, ceis: s.fiscal_ceis },
          pagamento: { nf_apresentada: s.pag_nf_apresentada, nf_atestada: s.pag_nf_atestada, ob_emitida: s.pag_ob_emitida, realizado: s.pag_realizado },
          receita: { gru_emitida: s.rec_gru_emitida, gru_paga: s.rec_gru_paga, valor_correto: s.rec_valor_correto, comprovante: s.rec_comprovante },
          gestao: { garantia: s.gest_garantia, vigencia: s.gest_vigencia, aditivo: s.gest_aditivo, reajuste: s.gest_reajuste, repactuacao: s.gest_repactuacao },
        },
        documentos: {
          nota_fiscal: s.doc_nota_fiscal, gru: s.doc_gru, ordem_bancaria: s.doc_ordem_bancaria,
          certidoes: s.doc_certidoes, fotografico: s.doc_fotografico, notificacoes: s.doc_notificacoes,
        },
      }
    })

    startTransition(async () => {
      const result = await submitRelatoriosUnificados(parseInt(mes), parseInt(ano), payload)
      if (result?.error) { setError(result.error) }
      else {
        toast.success('Relatório único enviado com sucesso para análise!')
        router.push('/dashboard/meus-relatorios')
      }
    })
  }

  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Cabeçalho do período */}
      <Card className="shadow-lg border-[#2a3441] bg-[#1b2331] text-white rounded-xl">
        <CardHeader className="pb-4 border-b border-[#2a3441] bg-[#131924]">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-yellow-500" />
            Relatório Mensal de Fiscalização Contratual — Período de Competência
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-md flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <div className="space-y-2 max-w-md">
            <Label className="text-sm font-bold text-gray-300">Mês/Ano de Competência</Label>
            <div className="flex gap-4">
              <select value={mes} onChange={(e) => setMes(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[#2a3441] bg-[#131924] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500">
                {meses.map((m, i) => (
                  <option key={i+1} value={`${i+1}`} className="bg-[#131924]">{`${i+1}`.padStart(2,'0')} - {m}</option>
                ))}
              </select>
              <Input value={ano} onChange={(e) => setAno(e.target.value)}
                type="number" min="2020" max="2050"
                className="w-32 bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500 font-bold" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Um card por contrato */}
      <div className="space-y-6">
        <h2 className="text-base font-black text-gray-700 uppercase tracking-wider">
          Avaliação por Contrato ({contratos.length})
        </h2>

        {contratos.map((cont) => {
          const s = formStates[cont.id]
          const papel = cont.fiscal_titular_id === userId ? 'Titular' : 'Substituto'

          return (
            <Card key={cont.id} className="shadow-md border-[#2a3441] bg-[#1b2331] text-white rounded-xl overflow-hidden">
              {/* Header do contrato */}
              <CardHeader className="pb-3 border-b border-[#2a3441] bg-[#0e1720]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-black flex items-center gap-2">
                      <Building className="h-4 w-4 text-yellow-500" />
                      {cont.numero_contrato} — {cont.empresa}
                    </CardTitle>
                    <p className="text-[0.7rem] text-gray-400 mt-1 flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> {cont.objeto}
                    </p>
                  </div>
                  <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ${papel === 'Titular' ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-yellow-500 text-yellow-400 bg-yellow-500/10'}`}>
                    {papel}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Grid dos 5 blocos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Bloco 1 – Execução Contratual */}
                  <div className="bg-[#0e1720] border border-[#1e3a2e] rounded-xl p-4">
                    <BlocoHeader icon={CheckSquare} title="Bloco 1 — Execução Contratual" cor="border-green-600/40 text-green-400" />
                    <CheckRow label="Fiscalização realizada?" id={`exec_realizada_${cont.id}`} checked={s.exec_realizada} onChange={v => setField(cont.id,'exec_realizada',v)} />
                    <CheckRow label="Objeto executado conforme contratado?" id={`exec_conforme_${cont.id}`} checked={s.exec_conforme} onChange={v => setField(cont.id,'exec_conforme',v)} />
                    <CheckRow label="Ocorrências registradas?" desc="Faltas, atrasos ou descumprimentos" id={`exec_ocorrencias_${cont.id}`} checked={s.exec_ocorrencias} onChange={v => setField(cont.id,'exec_ocorrencias',v)} />
                    <CheckRow label="Necessidade de notificação?" id={`exec_notificacao_${cont.id}`} checked={s.exec_notificacao} onChange={v => setField(cont.id,'exec_notificacao',v)} />
                  </div>

                  {/* Bloco 2 – Regularidade Fiscal */}
                  <div className="bg-[#0e1720] border border-[#1e2e3a] rounded-xl p-4">
                    <BlocoHeader icon={FileText} title="Bloco 2 — Regularidade Fiscal" cor="border-blue-600/40 text-blue-400" />
                    <CheckRow label="SICAF regular?" id={`fiscal_sicaf_${cont.id}`} checked={s.fiscal_sicaf} onChange={v => setField(cont.id,'fiscal_sicaf',v)} />
                    <CheckRow label="Certidões Federais válidas?" desc="CND Federal, Estadual, Municipal" id={`fiscal_certidoes_${cont.id}`} checked={s.fiscal_certidoes} onChange={v => setField(cont.id,'fiscal_certidoes',v)} />
                    <CheckRow label="FGTS regular?" id={`fiscal_fgts_${cont.id}`} checked={s.fiscal_fgts} onChange={v => setField(cont.id,'fiscal_fgts',v)} />
                    <CheckRow label="CNDT válida?" desc="Certidão Negativa de Débitos Trabalhistas" id={`fiscal_cndt_${cont.id}`} checked={s.fiscal_cndt} onChange={v => setField(cont.id,'fiscal_cndt',v)} />
                    <CheckRow label="CEIS/CNEP sem restrições?" id={`fiscal_ceis_${cont.id}`} checked={s.fiscal_ceis} onChange={v => setField(cont.id,'fiscal_ceis',v)} />
                  </div>

                  {/* Bloco 3 – Pagamento */}
                  <div className="bg-[#0e1720] border border-[#3a2e1e] rounded-xl p-4">
                    <BlocoHeader icon={CreditCard} title="Bloco 3 — Pagamento (Despesa)" cor="border-yellow-600/40 text-yellow-400" />
                    <CheckRow label="Nota Fiscal apresentada?" id={`pag_nf_apresentada_${cont.id}`} checked={s.pag_nf_apresentada} onChange={v => setField(cont.id,'pag_nf_apresentada',v)} />
                    <CheckRow label="Nota Fiscal atestada?" desc="Assinada pelo fiscal responsável" id={`pag_nf_atestada_${cont.id}`} checked={s.pag_nf_atestada} onChange={v => setField(cont.id,'pag_nf_atestada',v)} />
                    <CheckRow label="Ordem Bancária emitida?" id={`pag_ob_emitida_${cont.id}`} checked={s.pag_ob_emitida} onChange={v => setField(cont.id,'pag_ob_emitida',v)} />
                    <CheckRow label="Pagamento realizado?" id={`pag_realizado_${cont.id}`} checked={s.pag_realizado} onChange={v => setField(cont.id,'pag_realizado',v)} />
                  </div>

                  {/* Bloco 4 – Receita */}
                  <div className="bg-[#0e1720] border border-[#2e1e3a] rounded-xl p-4">
                    <BlocoHeader icon={Banknote} title="Bloco 4 — Receita (Permissionários)" cor="border-purple-600/40 text-purple-400" />
                    <CheckRow label="GRU emitida?" desc="Guia de Recolhimento da União" id={`rec_gru_emitida_${cont.id}`} checked={s.rec_gru_emitida} onChange={v => setField(cont.id,'rec_gru_emitida',v)} />
                    <CheckRow label="GRU paga?" id={`rec_gru_paga_${cont.id}`} checked={s.rec_gru_paga} onChange={v => setField(cont.id,'rec_gru_paga',v)} />
                    <CheckRow label="Valor recolhido corretamente?" id={`rec_valor_correto_${cont.id}`} checked={s.rec_valor_correto} onChange={v => setField(cont.id,'rec_valor_correto',v)} />
                    <CheckRow label="Comprovante anexado?" id={`rec_comprovante_${cont.id}`} checked={s.rec_comprovante} onChange={v => setField(cont.id,'rec_comprovante',v)} />
                  </div>

                </div>

                {/* Bloco 5 – Gestão Contratual (largura total) */}
                <div className="bg-[#0e1720] border border-[#2a3441] rounded-xl p-4">
                  <BlocoHeader icon={Settings} title="Bloco 5 — Gestão Contratual" cor="border-orange-600/40 text-orange-400" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6">
                    <CheckRow label="Garantia vigente?" id={`gest_garantia_${cont.id}`} checked={s.gest_garantia} onChange={v => setField(cont.id,'gest_garantia',v)} />
                    <CheckRow label="Vigência regular?" desc="Contrato dentro do prazo" id={`gest_vigencia_${cont.id}`} checked={s.gest_vigencia} onChange={v => setField(cont.id,'gest_vigencia',v)} />
                    <CheckRow label="Necessidade de aditivo?" id={`gest_aditivo_${cont.id}`} checked={s.gest_aditivo} onChange={v => setField(cont.id,'gest_aditivo',v)} />
                    <CheckRow label="Necessidade de reajuste?" id={`gest_reajuste_${cont.id}`} checked={s.gest_reajuste} onChange={v => setField(cont.id,'gest_reajuste',v)} />
                    <CheckRow label="Necessidade de repactuação?" id={`gest_repactuacao_${cont.id}`} checked={s.gest_repactuacao} onChange={v => setField(cont.id,'gest_repactuacao',v)} />
                  </div>
                </div>

                {/* Campos de texto */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-300">Ocorrências / Faltas Anotadas</Label>
                    <Textarea value={s.ocorrencias} onChange={e => setField(cont.id,'ocorrencias',e.target.value)}
                      placeholder="Descreva detalhadamente..."
                      className="min-h-[80px] text-xs bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-300">Pendências da Empresa</Label>
                    <Textarea value={s.pendencias} onChange={e => setField(cont.id,'pendencias',e.target.value)}
                      placeholder="Ex: Faltou entregar certidão..."
                      className="min-h-[80px] text-xs bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-300">Observações / Recomendações</Label>
                    <Textarea value={s.observacoes} onChange={e => setField(cont.id,'observacoes',e.target.value)}
                      placeholder="Ex: Recomendo o pagamento integral..."
                      className="min-h-[80px] text-xs bg-[#131924] border-[#2a3441] text-white focus:ring-yellow-500" />
                  </div>
                </div>

                {/* Bloco 6 – Documentos */}
                <div className="bg-[#0e1720] border border-[#2a3441] rounded-xl p-4">
                  <BlocoHeader icon={Paperclip} title="Bloco 6 — Documentos e Anexos" cor="border-cyan-600/40 text-cyan-400" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { field: 'doc_nota_fiscal' as const, label: 'Nota Fiscal' },
                      { field: 'doc_gru' as const, label: 'GRU' },
                      { field: 'doc_ordem_bancaria' as const, label: 'Ordem Bancária' },
                      { field: 'doc_certidoes' as const, label: 'Certidões' },
                      { field: 'doc_fotografico' as const, label: 'Relatório Fotográfico' },
                      { field: 'doc_notificacoes' as const, label: 'Notificações' },
                    ].map(({ field, label }) => (
                      <div key={field} className="space-y-1">
                        <Label className="text-[0.68rem] font-bold text-gray-300 uppercase tracking-wider">{label}</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              setField(cont.id, field, file ? file.name : '')
                            }}
                            className="block w-full text-[0.68rem] text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[0.68rem] file:font-bold file:bg-yellow-600/20 file:text-yellow-400 hover:file:bg-yellow-600/30 cursor-pointer bg-[#131924] border border-[#2a3441] rounded-lg p-1"
                          />
                        </div>
                        {s[field] && (
                          <p className="text-[0.65rem] text-green-400 font-bold truncate">✓ {s[field]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Footer de submissão */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 bg-[#131924] p-4 rounded-xl border border-[#2a3441] sticky bottom-4 shadow-2xl">
        <Button type="button" variant="destructive" onClick={() => router.back()}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-sm transition-all">
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}
          className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white font-black whitespace-normal h-auto py-2">
          {isPending ? 'Enviando...' : `Salvar e Enviar Relatório Único (${contratos.length} contrato${contratos.length > 1 ? 's' : ''})`}
        </Button>
      </div>
    </form>
  )
}
