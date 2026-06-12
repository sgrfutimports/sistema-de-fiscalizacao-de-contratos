import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, FileText, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { AnaliseRelatorioForm } from '@/components/dashboard/analise-relatorio-form'

export default async function DetalhesRelatorioPage({ params }: { params: { id: string } }) {
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
    .eq('id', params.id)
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
      case 'APROVADO': return 'bg-green-600'
      case 'EM_ANALISE': return 'bg-blue-600'
      case 'ENVIADO': return 'bg-yellow-600 text-yellow-950'
      case 'DEVOLVIDO': return 'bg-red-600'
      case 'ARQUIVADO': return 'bg-gray-600'
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
            <h1 className="text-3xl font-bold tracking-tight">Análise de Relatório</h1>
            <p className="text-muted-foreground mt-1">
              Competência: <strong>{relatorio.competencia_mes.toString().padStart(2, '0')}/{relatorio.competencia_ano}</strong>
            </p>
          </div>
          <Badge className={`text-base px-3 py-1 ${getStatusColor(relatorio.status)}`}>
            {relatorio.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg">Dados do Contrato</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label className="text-muted-foreground">Número</Label>
              <p className="font-medium text-lg">{(relatorio.contrato as any)?.numero_contrato}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Empresa</Label>
              <p className="font-medium">{(relatorio.contrato as any)?.empresa}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Objeto</Label>
              <p className="text-sm">{(relatorio.contrato as any)?.objeto}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Valor Mensal / Total</Label>
              <p className="font-medium">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((relatorio.contrato as any)?.valor || 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg">Responsável pela Emissão</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label className="text-muted-foreground">Fiscal Responsável</Label>
              <p className="font-medium text-lg">{(relatorio.fiscal as any)?.nome}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Papel</Label>
              <p className="font-medium">{relatorio.tipo_fiscal}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Contato</Label>
              <p className="text-sm">{(relatorio.fiscal as any)?.telefone} • {(relatorio.fiscal as any)?.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Data de Submissão</Label>
              <p className="font-medium">{new Date(relatorio.data_envio).toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="bg-primary/5 border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Itens Avaliados pelo Fiscal
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${relatorio.fiscalizacao_realizada ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900'}`}>
              <Label className="text-muted-foreground block mb-2">Vistoria Realizada?</Label>
              <div className="flex items-center gap-2 font-semibold">
                {relatorio.fiscalizacao_realizada ? <CheckCircle2 className="text-green-600" /> : <AlertTriangle className="text-red-600" />}
                {relatorio.fiscalizacao_realizada ? 'Sim' : 'Não'}
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${relatorio.servico_conforme ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900'}`}>
              <Label className="text-muted-foreground block mb-2">Serviço Conforme?</Label>
              <div className="flex items-center gap-2 font-semibold">
                {relatorio.servico_conforme ? <CheckCircle2 className="text-green-600" /> : <AlertTriangle className="text-red-600" />}
                {relatorio.servico_conforme ? 'Sim' : 'Não'}
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${relatorio.documentacao_apresentada ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900'}`}>
              <Label className="text-muted-foreground block mb-2">Documentação Regular?</Label>
              <div className="flex items-center gap-2 font-semibold">
                {relatorio.documentacao_apresentada ? <CheckCircle2 className="text-green-600" /> : <AlertTriangle className="text-red-600" />}
                {relatorio.documentacao_apresentada ? 'Sim' : 'Não'}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label className="text-muted-foreground">Ocorrências / Faltas Anotadas</Label>
              <div className="bg-muted/30 p-4 rounded-md mt-1 min-h-[80px] whitespace-pre-wrap">
                {relatorio.ocorrencias || <span className="text-muted-foreground italic">Nenhuma ocorrência relatada.</span>}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Pendências da Empresa</Label>
              <div className="bg-muted/30 p-4 rounded-md mt-1 min-h-[80px] whitespace-pre-wrap">
                {relatorio.pendencias || <span className="text-muted-foreground italic">Nenhuma pendência relatada.</span>}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Observações Adicionais</Label>
              <div className="bg-muted/30 p-4 rounded-md mt-1 min-h-[80px] whitespace-pre-wrap">
                {relatorio.observacoes || <span className="text-muted-foreground italic">Nenhuma observação.</span>}
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
          <Card className="border-t-4 border-t-gray-500">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg">Parecer do Ordenador / Gestor</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-muted/30 p-4 rounded-md whitespace-pre-wrap">
                {relatorio.parecer_administrador}
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}
