import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, FileText, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { AnaliseRelatorioForm } from '@/components/dashboard/analise-relatorio-form'

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <Link href={isAdmin ? "/dashboard/relatorios" : "/dashboard/meus-relatorios"} className={buttonVariants({ variant: "ghost", className: "w-fit -ml-4" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Lista
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-800">Visualizar Relatório</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Competência: <strong>{relatorio.competencia_mes.toString().padStart(2, '0')}/{relatorio.competencia_ano}</strong>
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded border uppercase tracking-wider ${getStatusColor(relatorio.status)}`}>
            {relatorio.status.replace('_', ' ')}
          </span>
        </div>
      </div>

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

      {/* Formulário de Parecer do Admin */}
      {isAdmin ? (
        <AnaliseRelatorioForm relatorioId={relatorio.id} statusAtual={relatorio.status} parecerAtual={relatorio.parecer_administrador} />
      ) : (
        relatorio.parecer_administrador && (
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
        )
      )}
    </div>
  )
}
