import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileSignature, FileText, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Buscar usuário atual para definir se é admin ou fiscal
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  const isAdmin = userData?.perfil === 'ADMIN'

  // 1. Contratos Ativos
  let contratosAtivosCount = 0
  if (isAdmin) {
    const { count } = await supabaseAdmin
      .from('contratos')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ATIVO')
    contratosAtivosCount = count || 0
  } else {
    const { count } = await supabaseAdmin
      .from('contratos')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ATIVO')
      .or(`fiscal_titular_id.eq.${user?.id},fiscal_substituto_id.eq.${user?.id}`)
    contratosAtivosCount = count || 0
  }

  // 2. Relatórios Pendentes
  let relatoriosPendentesCount = 0
  if (isAdmin) {
    const { count } = await supabaseAdmin
      .from('relatorios')
      .select('id', { count: 'exact', head: true })
      .in('status', ['ENVIADO', 'EM_ANALISE'])
    relatoriosPendentesCount = count || 0
  } else {
    const { count } = await supabaseAdmin
      .from('relatorios')
      .select('id', { count: 'exact', head: true })
      .eq('fiscal_id', user?.id)
      .eq('status', 'DEVOLVIDO')
    relatoriosPendentesCount = count || 0
  }

  // 3. Relatórios Aprovados / Enviados
  let relatoriosAprovadosCount = 0
  if (isAdmin) {
    const { count } = await supabaseAdmin
      .from('relatorios')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'APROVADO')
    relatoriosAprovadosCount = count || 0
  } else {
    const { count } = await supabaseAdmin
      .from('relatorios')
      .select('id', { count: 'exact', head: true })
      .eq('fiscal_id', user?.id)
      .in('status', ['ENVIADO', 'EM_ANALISE', 'APROVADO'])
    relatoriosAprovadosCount = count || 0
  }

  // 4. Total de Fiscais (apenas para Admin)
  let totalFiscaisCount = 0
  if (isAdmin) {
    const { count } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('ativo', true)
      .in('perfil', ['FISCAL_TITULAR', 'FISCAL_SUBSTITUTO'])
    totalFiscaisCount = count || 0
  }

  // 5. Buscar comunicados oficiais do comando cadastrados na tabela 'comunicados'
  const { data: dbComunicados } = await supabaseAdmin
    .from('comunicados')
    .select('titulo, conteudo, autor, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const avisos = dbComunicados || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="bg-gradient-to-r from-[#133215]/80 via-[#1B3B22]/60 to-[#133215]/40 p-6 sm:p-8 rounded-2xl border border-[#2a3441] shadow-lg relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] h-[300px] w-[300px] rounded-full bg-[#133215]/40 blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">Painel de Controle</h1>
          <p className="text-gray-100 text-sm sm:text-base font-semibold whitespace-nowrap overflow-x-auto pb-1">
            Bem-vindo ao Sistema de Fiscalização de Contratos do <strong className="text-yellow-400 font-extrabold">71º Batalhão de Infantaria Motorizado</strong>.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contratos Ativos</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileSignature className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{contratosAtivosCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de contratos em vigor</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {isAdmin ? 'Aguardando Análise' : 'Devolvidos p/ Correção'}
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{relatoriosPendentesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isAdmin ? 'Relatórios enviados pelos fiscais' : 'Necessitam de ajuste ou reenvio'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {isAdmin ? 'Relatórios Aprovados' : 'Meus Enviados'}
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{relatoriosAprovadosCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Status global de entregas</p>
          </CardContent>
        </Card>

        {isAdmin ? (
          <Card className="shadow-md border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total de Fiscais</CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-foreground">{totalFiscaisCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Usuários ativos cadastrados</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Perfil de Acesso</CardTitle>
              <div className="h-8 w-8 rounded-full bg-[#133215]/10 flex items-center justify-center">
                <ShieldAlert className="h-4 w-4 text-[#133215]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold tracking-tight text-foreground uppercase truncate">
                {userData?.perfil === 'FISCAL_TITULAR' ? 'FISCAL TITULAR' : 'FISCAL SUBST.'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Nível de permissão no sistema</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-4 shadow-md border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle>Visão Geral de Contratos</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-center items-center h-[300px] text-muted-foreground text-center">
            <FileSignature className="h-10 w-10 text-primary mb-3 opacity-80" />
            <p className="font-bold text-foreground">Distribuição de Contratos Ativos</p>
            <p className="text-xs mt-1">Você possui {contratosAtivosCount} contrato(s) ativo(s) vinculado(s) à sua conta no momento.</p>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-md border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle>Avisos Recentes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px] flex flex-col justify-start space-y-4 overflow-y-auto">
            {avisos.length === 0 ? (
              <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
                Nenhum comunicado recente do comando.
              </div>
            ) : (
              avisos.map((aviso, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-muted/40 border border-border/50 space-y-2 hover:bg-muted/60 transition-colors">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[0.65rem] font-extrabold text-yellow-600 uppercase tracking-wider">MENSAGEM OFICIAL</span>
                    <span className="text-[0.6rem] text-gray-500 font-bold">
                      {new Date(aviso.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">{aviso.titulo}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{aviso.conteudo}</p>
                  <div className="text-[0.6rem] font-bold text-gray-500 uppercase mt-1">
                    Por: <span className="text-foreground">{aviso.autor}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
