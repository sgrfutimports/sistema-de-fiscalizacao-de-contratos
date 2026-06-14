import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileSignature, FileText, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react'
import { ComunicadosModal } from '@/components/dashboard/comunicados-modal'

export default async function DashboardPage() {
  // Garantir que a animação pós-login dure pelo menos 3 segundos para uma transição premium
  await new Promise(resolve => setTimeout(resolve, 3000))

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
    .select('id, titulo, conteudo, autor, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const avisos = dbComunicados || []

  // 6. Buscar comunicados não lidos pelo fiscal atual
  let unreadComunicados: any[] = []
  if (!isAdmin && user) {
    const { data: allActive } = await supabaseAdmin
      .from('comunicados')
      .select('id, titulo, conteudo, autor, created_at')
      .order('created_at', { ascending: false })

    if (allActive && allActive.length > 0) {
      const { data: readLogs } = await supabaseAdmin
        .from('comunicados_lidos')
        .select('comunicado_id')
        .eq('user_id', user.id)

      const readIds = new Set(readLogs?.map(r => r.comunicado_id) || [])
      unreadComunicados = allActive.filter(c => !readIds.has(c.id))
    }
  }

  // 7. Buscar administrador para suporte/whatsapp do fiscal
  let adminSuporte: any = null
  if (!isAdmin) {
    const { data: admins } = await supabaseAdmin
      .from('users')
      .select('nome, posto_graduacao, nome_guerra, telefone')
      .eq('perfil', 'ADMIN')
      .eq('ativo', true)
      .limit(1)
    adminSuporte = admins && admins.length > 0 ? admins[0] : null
  }

  const getWhatsappLink = (telefone: string | null) => {
    let limpo = (telefone || '').replace(/\D/g, '')
    if (!limpo || limpo === '00000000000' || limpo.length < 10) {
      limpo = '87999334728' // Fallback
    }
    const fone = limpo.startsWith('55') ? limpo : `55${limpo}`
    const texto = encodeURIComponent(`Olá, sou Fiscal de Contrato do 71º BI Mtz e estou com uma dúvida no Sistema de Fiscalização.`)
    return `https://wa.me/${fone}?text=${texto}`
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      {/* Modal de leitura obrigatória para Fiscais */}
      <ComunicadosModal comunicados={unreadComunicados} />

      <div className="bg-gradient-to-r from-[#133215]/80 via-[#1B3B22]/60 to-[#133215]/40 p-6 sm:p-8 rounded-2xl border border-[#2a3441] shadow-lg relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] h-[300px] w-[300px] rounded-full bg-[#133215]/40 blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">Painel de Controle</h1>
          <p className="text-gray-100 text-sm sm:text-base font-semibold leading-relaxed">
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
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7 mt-8">
        <Card className="col-span-1 lg:col-span-4 shadow-md border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle>Visão Geral de Contratos</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-center items-center h-[300px] text-muted-foreground text-center">
            <FileSignature className="h-10 w-10 text-primary mb-3 opacity-80" />
            <p className="font-bold text-foreground">Distribuição de Contratos Ativos</p>
            <p className="text-xs mt-1">Você possui {contratosAtivosCount} contrato(s) ativo(s) vinculado(s) à sua conta no momento.</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 shadow-md border-border/50 rounded-2xl overflow-hidden">
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

      {/* Banner de Suporte WhatsApp para Fiscais */}
      {!isAdmin && adminSuporte && (
        <div className="bg-[#1b2331] rounded-2xl p-6 border border-[#2a3441] shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 mt-8">
          <div className="flex items-center gap-4 text-left">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-400 shrink-0">
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97-1.861-1.868-4.339-2.897-6.97-2.899-5.437 0-9.862 4.37-9.866 9.801-.001 1.762.463 3.484 1.344 5.013l-.974 3.559 3.656-.947zm12.308-3.693c-.27-.133-1.597-.778-1.844-.867-.248-.09-.429-.133-.61.133-.18.267-.698.867-.856 1.047-.158.18-.316.2-.586.067-.27-.133-1.14-.413-2.17-1.32-.803-.707-1.346-1.58-1.504-1.846-.158-.267-.017-.411.118-.544.121-.12.27-.312.405-.468.135-.156.18-.267.27-.444.09-.178.045-.334-.023-.468-.067-.133-.61-1.449-.836-1.984-.22-.524-.482-.452-.61-.452-.124-.003-.266-.003-.408-.003-.143 0-.376.053-.572.264-.196.211-.749.723-.749 1.762 0 1.04.766 2.042.872 2.18.106.138 1.506 2.274 3.649 3.186.51.217.907.348 1.217.444.512.161.977.138 1.345.084.41-.06 1.597-.644 1.821-1.265.224-.62.224-1.15.158-1.265-.067-.116-.248-.198-.518-.332z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Suporte e Ajuda Contratual</h4>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Dúvidas sobre o preenchimento ou prazos de fiscalização? Entre em contato com o Gestor de Contratos / Fiscal Administrativo: <strong className="text-yellow-500 font-extrabold">{adminSuporte.posto_graduacao} {adminSuporte.nome_guerra}</strong>.
              </p>
            </div>
          </div>
          <a 
            href={getWhatsappLink(adminSuporte.telefone)} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-5 py-3 rounded-xl font-extrabold text-xs transition-colors shadow-lg shadow-[#25D366]/10 uppercase tracking-wider whitespace-nowrap"
          >
            Falar no WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
