import { getCachedUser, getCachedUserProfile } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DashboardHomeClient } from '@/components/dashboard/dashboard-home-client'

export default async function DashboardPage() {
  const { data: { user } } = await getCachedUser()
  const { data: userData } = await getCachedUserProfile(user?.id || '')

  const supabaseAdmin = createAdminClient()

  const userPerfil = userData?.perfil || 'FISCAL'
  const isAdmin = userPerfil === 'ADMIN'

  // Preparar todas as Promises para execução em paralelo
  const contratosPromise = isAdmin
    ? supabaseAdmin
        .from('contratos')
        .select(`
          id,
          numero_contrato,
          empresa,
          objeto,
          valor,
          status,
          data_termino,
          fiscal_titular_id,
          fiscal_substituto_id,
          titular:users!fiscal_titular_id (
            posto_graduacao,
            nome_guerra
          ),
          substituto:users!fiscal_substituto_id (
            posto_graduacao,
            nome_guerra
          )
        `, { count: 'exact' })
        .eq('status', 'ATIVO')
        .order('created_at', { ascending: false })
    : supabaseAdmin
        .from('contratos')
        .select(`
          id,
          numero_contrato,
          empresa,
          objeto,
          valor,
          status,
          data_termino,
          fiscal_titular_id,
          fiscal_substituto_id,
          titular:users!fiscal_titular_id (
            posto_graduacao,
            nome_guerra
          ),
          substituto:users!fiscal_substituto_id (
            posto_graduacao,
            nome_guerra
          )
        `, { count: 'exact' })
        .eq('status', 'ATIVO')
        .or(`fiscal_titular_id.eq.${user?.id},fiscal_substituto_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })

  const relatoriosPendentesPromise = isAdmin
    ? supabaseAdmin
        .from('relatorios')
        .select('id', { count: 'exact', head: true })
        .in('status', ['ENVIADO', 'EM_ANALISE'])
    : supabaseAdmin
        .from('relatorios')
        .select('id', { count: 'exact', head: true })
        .eq('fiscal_id', user?.id)
        .eq('status', 'DEVOLVIDO')

  const relatoriosAprovadosPromise = isAdmin
    ? supabaseAdmin
        .from('relatorios')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'APROVADO')
    : supabaseAdmin
        .from('relatorios')
        .select('id', { count: 'exact', head: true })
        .eq('fiscal_id', user?.id)
        .in('status', ['ENVIADO', 'EM_ANALISE', 'APROVADO'])

  const totalFiscaisPromise = isAdmin
    ? supabaseAdmin
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('ativo', true)
        .in('perfil', ['FISCAL_TITULAR', 'FISCAL_SUBSTITUTO'])
    : Promise.resolve({ count: 0 }) as Promise<{ count: number | null }>

  const dbComunicadosPromise = supabaseAdmin
    .from('comunicados')
    .select('id, titulo, conteudo, autor, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const unreadComunicadosPromise = (!isAdmin && user)
    ? supabaseAdmin
        .from('comunicados')
        .select('id, titulo, conteudo, autor, created_at')
        .order('created_at', { ascending: false })
    : Promise.resolve({ data: null }) as Promise<{ data: any[] | null }>

  const readLogsPromise = (!isAdmin && user)
    ? supabaseAdmin
        .from('comunicados_lidos')
        .select('comunicado_id')
        .eq('user_id', user.id)
    : Promise.resolve({ data: null }) as Promise<{ data: any[] | null }>

  const adminSuportePromise = (!isAdmin)
    ? supabaseAdmin
        .from('users')
        .select('nome, posto_graduacao, nome_guerra, telefone')
        .eq('perfil', 'ADMIN')
        .eq('ativo', true)
        .limit(1)
    : Promise.resolve({ data: null }) as Promise<{ data: any[] | null }>

  // Executar todas as consultas em paralelo
  const [
    contratosRes,
    relatoriosPendentesRes,
    relatoriosAprovadosRes,
    totalFiscaisRes,
    dbComunicadosRes,
    unreadComunicadosRes,
    readLogsRes,
    adminSuporteRes
  ] = await Promise.all([
    contratosPromise,
    relatoriosPendentesPromise,
    relatoriosAprovadosPromise,
    totalFiscaisPromise,
    dbComunicadosPromise,
    unreadComunicadosPromise,
    readLogsPromise,
    adminSuportePromise
  ])

  const contratosAtivosCount = contratosRes.count || 0
  const contratosAtivos = (contratosRes.data as any[]) || []
  const relatoriosPendentesCount = relatoriosPendentesRes.count || 0
  const relatoriosAprovadosCount = relatoriosAprovadosRes.count || 0
  const totalFiscaisCount = totalFiscaisRes.count || 0
  const avisos = dbComunicadosRes.data || []

  // Filtrar comunicados não lidos
  let unreadComunicados: any[] = []
  if (!isAdmin && user && unreadComunicadosRes.data) {
    const readIds = new Set((readLogsRes.data || []).map((r: any) => r.comunicado_id))
    unreadComunicados = (unreadComunicadosRes.data || []).filter((c: any) => !readIds.has(c.id))
  }

  const adminSuporte = adminSuporteRes.data && adminSuporteRes.data.length > 0 ? adminSuporteRes.data[0] : null

  const getWhatsappLink = (telefone: string | null) => {
    let limpo = (telefone || '').replace(/\D/g, '')
    if (!limpo || limpo === '00000000000' || limpo.length < 10) {
      limpo = '87999334728' // Fallback
    }
    const fone = limpo.startsWith('55') ? limpo : `55${limpo}`
    const rankName = userData?.posto_graduacao && userData?.nome_guerra
      ? `${userData.posto_graduacao} ${userData.nome_guerra}`
      : 'Fiscal'
    const texto = encodeURIComponent(`Olá, sou ${rankName}, Fiscal de Contrato do 71º BI Mtz e estou com uma dúvida no Sistema de Fiscalização, pode me ajudar?`)
    return `https://wa.me/${fone}?text=${texto}`
  }

  const userNome = userData ? `${userData.posto_graduacao} ${userData.nome_guerra}` : 'Militar'
  const whatsappLink = getWhatsappLink(adminSuporte?.telefone)

  return (
    <DashboardHomeClient
      contratosAtivosCount={contratosAtivosCount}
      contratosAtivos={contratosAtivos}
      relatoriosPendentesCount={relatoriosPendentesCount}
      relatoriosAprovadosCount={relatoriosAprovadosCount}
      totalFiscaisCount={totalFiscaisCount}
      avisos={avisos}
      unreadComunicados={unreadComunicados}
      adminSuporte={adminSuporte}
      whatsappLink={whatsappLink}
      userPerfil={userPerfil}
      userNome={userNome}
      userId={user?.id || ''}
    />
  )
}

