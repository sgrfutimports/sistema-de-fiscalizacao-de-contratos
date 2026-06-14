import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, FileText, AlertTriangle, Printer, CheckSquare, CreditCard, Banknote, Settings, Paperclip } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { NovoRelatorioForm } from '@/components/dashboard/novo-relatorio-form'

export default async function DetalhesRelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Busca sessão do usuário e o perfil
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  // Busca detalhes do relatório (usamos admin client para ignorar RLS e podermos checar as permissões manualmente aqui)
  const { data: relatorio } = await supabaseAdmin
    .from('relatorios')
    .select(`
      *,
      contrato:contratos!contrato_id(numero_contrato, empresa, objeto, valor),
      fiscal:users!fiscal_id(nome, email, telefone)
    `)
    .eq('id', id)
    .single()

  if (!relatorio) {
    redirect('/dashboard/relatorios')
  }

  const isAdmin = currentUser?.perfil === 'ADMIN'
  const isOwner = relatorio.fiscal_id === user?.id

  // Se não for admin e não for o dono do relatório, bloqueia
  if (!isAdmin && !isOwner) {
    redirect('/dashboard/meus-relatorios')
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'APROVADO': return 'border-green-500 text-green-400 bg-green-500/10'
      case 'EM_ANALISE': return 'border-blue-500 text-blue-400 bg-blue-500/10'
      case 'ENVIADO': return 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
      case 'DEVOLVIDO': return 'border-red-500 text-red-400 bg-red-500/10'
      case 'ARQUIVADO': return 'border-gray-500 text-gray-400 bg-gray-500/10'
      default: return ''
    }
  }

  function formatStatusLabel(status: string) {
    switch (status) {
      case 'ENVIADO': return 'Aguardando'
      case 'EM_ANALISE': return 'Em Análise'
      case 'APROVADO': return 'Aprovado'
      case 'DEVOLVIDO': return 'Devolvido'
      case 'ARQUIVADO': return 'Arquivado'
      default: return status
    }
  }

  const isDevolvidoEdicao = isOwner && relatorio.status === 'DEVOLVIDO'
  const hasDetailedVerifications = relatorio.verificacoes && typeof relatorio.verificacoes === 'object' && Object.keys(relatorio.verificacoes).length > 0;

  function renderVerificacoesDetalhes(v: any, docs: any) {
    const renderRow = (label: string, value: boolean | undefined) => {
      let statusBadge = (
        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-gray-500/30 text-gray-400 bg-gray-500/5">
          N/A
        </span>
      )
      if (value === true) {
        statusBadge = (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-green-500/30 text-green-400 bg-green-500/10">
            Sim
          </span>
        )
      } else if (value === false) {
        statusBadge = (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-red-500/30 text-red-400 bg-red-500/10">
            Não
          </span>
        )
      }
      return (
        <div className="flex items-center justify-between py-2 border-b border-[#2a3441]/30 last:border-0 text-xs">
          <span className="text-gray-300 font-medium">{label}</span>
          {statusBadge}
        </div>
      )
    }

    const renderDocRow = (label: string, val: string | undefined) => {
      const statusBadge = val ? (
        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-green-500/30 text-green-400 bg-green-500/10 truncate max-w-[150px]" title={val}>
          Apresentado ({val})
        </span>
      ) : (
        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-gray-600/30 text-gray-500 bg-gray-600/5">
          Não Apresentado
        </span>
      )
      return (
        <div className="flex items-center justify-between py-2 border-b border-[#2a3441]/30 last:border-0 text-xs">
          <span className="text-gray-300 font-medium">{label}</span>
          {statusBadge}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bloco 1 */}
        <div className="bg-[#131924]/60 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-500/20 text-green-400">
            <CheckSquare className="h-4 w-4" />
            <h4 className="font-black text-xs uppercase tracking-wider">Bloco 1 — Execução Contratual</h4>
          </div>
          <div className="space-y-1">
            {renderRow("1.1. Fiscalização realizada?", v.execucao?.realizada)}
            {renderRow("1.2. Objeto executado conforme contratado?", v.execucao?.conforme)}
            {renderRow("1.3. Ocorrências registradas?", v.execucao?.ocorrencias)}
            {renderRow("1.4. Necessidade de notificação?", v.execucao?.notificacao)}
          </div>
        </div>

        {/* Bloco 2 */}
        <div className="bg-[#131924]/60 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/20 text-blue-400">
            <FileText className="h-4 w-4" />
            <h4 className="font-black text-xs uppercase tracking-wider">Bloco 2 — Regularidade Fiscal</h4>
          </div>
          <div className="space-y-1">
            {renderRow("2.1. SICAF regular?", v.fiscal?.sicaf)}
            {renderRow("2.2. Certidões Federais válidas?", v.fiscal?.certidoes)}
            {renderRow("2.3. FGTS regular?", v.fiscal?.fgts)}
            {renderRow("2.4. CNDT válida?", v.fiscal?.cndt)}
            {renderRow("2.5. CEIS/CNEP sem restrições?", v.fiscal?.ceis)}
          </div>
        </div>

        {/* Bloco 3 */}
        <div className="bg-[#131924]/60 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-yellow-500/20 text-yellow-400">
            <CreditCard className="h-4 w-4" />
            <h4 className="font-black text-xs uppercase tracking-wider">Bloco 3 — Pagamento (Despesa)</h4>
          </div>
          <div className="space-y-1">
            {renderRow("3.1. Nota Fiscal apresentada?", v.pagamento?.nf_apresentada)}
            {renderRow("3.2. Nota Fiscal atestada?", v.pagamento?.nf_atestada)}
            {renderRow("3.3. Ordem Bancária emitida?", v.pagamento?.ob_emitida)}
            {renderRow("3.4. Pagamento realizado?", v.pagamento?.realizado)}
          </div>
        </div>

        {/* Bloco 4 */}
        <div className="bg-[#131924]/60 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-500/20 text-purple-400">
            <Banknote className="h-4 w-4" />
            <h4 className="font-black text-xs uppercase tracking-wider">Bloco 4 — Receita (Permissionários)</h4>
          </div>
          <div className="space-y-1">
            {renderRow("4.1. GRU emitida?", v.receita?.gru_emitida)}
            {renderRow("4.2. GRU paga?", v.receita?.gru_paga)}
            {renderRow("4.3. Valor recolhido corretamente?", v.receita?.valor_correto)}
            {renderRow("4.4. Comprovante anexado?", v.receita?.comprovante)}
          </div>
        </div>

        {/* Bloco 5 */}
        <div className="bg-[#131924]/60 border border-orange-500/20 rounded-xl p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-orange-500/20 text-orange-400">
            <Settings className="h-4 w-4" />
            <h4 className="font-black text-xs uppercase tracking-wider">Bloco 5 — Gestão Contratual</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
            {renderRow("5.1. Garantia vigente?", v.gestao?.garantia)}
            {renderRow("5.2. Vigência regular?", v.gestao?.vigencia)}
            {renderRow("5.3. Necessidade de aditivo?", v.gestao?.aditivo)}
            {renderRow("5.4. Necessidade de reajuste?", v.gestao?.reajuste)}
            {renderRow("5.5. Necessidade de repactuação?", v.gestao?.repactuacao)}
          </div>
        </div>

        {/* Bloco 6 */}
        <div className="bg-[#131924]/60 border border-cyan-500/20 rounded-xl p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cyan-500/20 text-cyan-400">
            <Paperclip className="h-4 w-4" />
            <h4 className="font-black text-xs uppercase tracking-wider">Bloco 6 — Documentos e Anexos</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
            {renderDocRow("6.1. Nota Fiscal", docs.nota_fiscal)}
            {renderDocRow("6.2. GRU", docs.gru)}
            {renderDocRow("6.3. Ordem Bancária", docs.ordem_bancaria)}
            {renderDocRow("6.4. Certidões", docs.certidoes)}
            {renderDocRow("6.5. Relatório Fotográfico", docs.fotografico)}
            {renderDocRow("6.6. Notificações", docs.notificacoes)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <Link href={isAdmin ? "/dashboard/relatorios" : "/dashboard/meus-relatorios"} className={buttonVariants({ variant: "ghost", className: "w-fit -ml-4" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Lista
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-800">
              {isDevolvidoEdicao ? 'Corrigir Relatório Devolvido' : 'Visualizar Relatório'}
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Competência: <strong>{relatorio.competencia_mes.toString().padStart(2, '0')}/{relatorio.competencia_ano}</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1.5 rounded border uppercase tracking-wider ${getStatusColor(relatorio.status)}`}>
              {formatStatusLabel(relatorio.status)}
            </span>
            {relatorio.status === 'APROVADO' && (
              <Link 
                href={`/dashboard/relatorios/${relatorio.id}/imprimir`}
                className="inline-flex items-center gap-1.5 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-md uppercase"
              >
                <Printer className="h-3.5 w-3.5" />
                Certidão / PDF
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Alerta de motivo da devolução se o relatório foi devolvido */}
      {relatorio.status === 'DEVOLVIDO' && relatorio.parecer_administrador && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-xl flex flex-col gap-3 shadow-md">
          <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-red-400">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Motivo da Devolução pelo Gestor de Contratos
          </div>
          <div className="text-sm bg-[#131924]/60 p-4 rounded border border-red-500/20 whitespace-pre-wrap text-gray-300 font-medium">
            {relatorio.parecer_administrador}
          </div>
        </div>
      )}

      {isDevolvidoEdicao ? (
        /* Se o relatório estiver devolvido e for o dono, renderiza o formulário de edição pré-preenchido */
        <NovoRelatorioForm 
          contratoId={relatorio.contrato_id} 
          papel={relatorio.tipo_fiscal} 
          relatorioInicial={relatorio} 
        />
      ) : (
        /* Caso contrário, renderiza a visualização estática tradicional (Leitura apenas) */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg border-[#2a3441] bg-[#1b2331] overflow-hidden text-white rounded-xl">
              <CardHeader className="pb-4 border-b border-[#2a3441] bg-[#131924]">
                <CardTitle className="text-base font-bold text-white">Dados do Contrato</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-gray-400 font-bold text-xs uppercase tracking-wider">Número</Label>
                  <p className="font-extrabold text-white text-lg mt-1">{(relatorio.contrato as any)?.numero_contrato}</p>
                </div>
                <div>
                  <Label className="text-gray-400 font-bold text-xs uppercase tracking-wider">Empresa</Label>
                  <p className="font-bold text-white mt-1">{(relatorio.contrato as any)?.empresa}</p>
                </div>
                <div>
                  <Label className="text-gray-400 font-bold text-xs uppercase tracking-wider">Objeto</Label>
                  <p className="text-sm text-gray-300 mt-1">{(relatorio.contrato as any)?.objeto}</p>
                </div>
                <div>
                  <Label className="text-gray-400 font-bold text-xs uppercase tracking-wider">Valor Mensal / Total</Label>
                  <p className="font-bold text-white mt-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((relatorio.contrato as any)?.valor || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-[#2a3441] bg-[#1b2331] overflow-hidden text-white rounded-xl">
              <CardHeader className="pb-4 border-b border-[#2a3441] bg-[#131924]">
                <CardTitle className="text-base font-bold text-white">Responsável pela Emissão</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-gray-400 font-bold text-xs uppercase tracking-wider">Fiscal Responsável</Label>
                  <p className="font-bold text-white text-lg mt-1">{(relatorio.fiscal as any)?.nome}</p>
                </div>
                <div>
                  <Label className="text-gray-400 font-bold text-xs uppercase tracking-wider">Papel</Label>
                  <p className="font-bold text-white mt-1">{relatorio.tipo_fiscal}</p>
                </div>
                <div>
                  <Label className="text-gray-400 font-bold text-xs uppercase tracking-wider">Contato</Label>
                  <p className="text-sm text-gray-300 mt-1">{(relatorio.fiscal as any)?.telefone} • {(relatorio.fiscal as any)?.email}</p>
                </div>
                <div>
                  <Label className="text-gray-400 font-bold text-xs uppercase tracking-wider">Data de Submissão</Label>
                  <p className="font-bold text-white mt-1">{new Date(relatorio.data_envio).toLocaleString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg border-[#2a3441] bg-[#1b2331] overflow-hidden text-white rounded-xl">
            <CardHeader className="pb-4 border-b border-[#2a3441] bg-[#131924]">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-yellow-500" />
                Itens Avaliados pelo Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {hasDetailedVerifications ? (
                renderVerificacoesDetalhes(relatorio.verificacoes, relatorio.documentos || {})
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border ${relatorio.fiscalizacao_realizada ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <Label className="text-gray-400 block mb-2 font-bold text-xs uppercase tracking-wider">Vistoria Realizada?</Label>
                    <div className="flex items-center gap-2 font-bold text-white">
                      {relatorio.fiscalizacao_realizada ? <CheckCircle2 className="text-green-500 h-5 w-5" /> : <AlertTriangle className="text-red-500 h-5 w-5" />}
                      {relatorio.fiscalizacao_realizada ? 'Sim' : 'Não'}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg border ${relatorio.servico_conforme ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <Label className="text-gray-400 block mb-2 font-bold text-xs uppercase tracking-wider">Serviço Conforme?</Label>
                    <div className="flex items-center gap-2 font-bold text-white">
                      {relatorio.servico_conforme ? <CheckCircle2 className="text-green-500 h-5 w-5" /> : <AlertTriangle className="text-red-500 h-5 w-5" />}
                      {relatorio.servico_conforme ? 'Sim' : 'Não'}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg border ${relatorio.documentacao_apresentada ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <Label className="text-gray-400 block mb-2 font-bold text-xs uppercase tracking-wider">Documentação Regular?</Label>
                    <div className="flex items-center gap-2 font-bold text-white">
                      {relatorio.documentacao_apresentada ? <CheckCircle2 className="text-green-500 h-5 w-5" /> : <AlertTriangle className="text-red-500 h-5 w-5" />}
                      {relatorio.documentacao_apresentada ? 'Sim' : 'Não'}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-[#2a3441]">
                <div>
                  <Label className="text-gray-400 font-bold text-xs uppercase tracking-wider">Ocorrências / Faltas Anotadas</Label>
                  <div className="bg-[#131924] border border-[#2a3441] p-4 rounded-md mt-1 min-h-[80px] whitespace-pre-wrap text-white text-sm">
                    {relatorio.ocorrencias || <span className="text-gray-500 italic">Nenhuma ocorrência relatada.</span>}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400 font-bold text-xs uppercase tracking-wider">Pendências da Empresa</Label>
                  <div className="bg-[#131924] border border-[#2a3441] p-4 rounded-md mt-1 min-h-[80px] whitespace-pre-wrap text-white text-sm">
                    {relatorio.pendencias || <span className="text-gray-500 italic">Nenhuma pendência relatada.</span>}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400 font-bold text-xs uppercase tracking-wider">Observações Adicionais</Label>
                  <div className="bg-[#131924] border border-[#2a3441] p-4 rounded-md mt-1 min-h-[80px] whitespace-pre-wrap text-white text-sm">
                    {relatorio.observacoes || <span className="text-gray-500 italic">Nenhuma observação.</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parecer do Ordenador / Gestor (se houver) */}
          {relatorio.parecer_administrador && (
            <Card className="shadow-lg border-[#2a3441] bg-[#1b2331] overflow-hidden text-white rounded-xl">
              <CardHeader className="pb-4 border-b border-[#2a3441] bg-[#131924]">
                <CardTitle className="text-base font-bold text-white">Parecer do Ordenador / Gestor</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-[#131924] border border-[#2a3441] p-4 rounded-md whitespace-pre-wrap text-white text-sm">
                  {relatorio.parecer_administrador}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
