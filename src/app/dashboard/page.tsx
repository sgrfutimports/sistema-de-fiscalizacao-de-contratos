import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DashboardHomeClient } from '@/components/dashboard/dashboard-home-client'

export default async function DashboardPage() {
  // Garantir que a animação pós-login dure pelo menos 3 segundos para uma transição premium
  await new Promise(resolve => setTimeout(resolve, 3000))

  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Buscar usuário atual para definir se é admin ou fiscal
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('id, perfil, posto_graduacao, nome_guerra')
    .eq('id', user?.id)
    .single()

  const userPerfil = userData?.perfil || 'FISCAL'
  const isAdmin = userPerfil === 'ADMIN'

  // 1. Contratos Ativos
  let contratosAtivosCount = 0
  let contratosAtivos: any[] = []
  if (isAdmin) {
    const { data, count } = await supabaseAdmin
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
    contratosAtivosCount = count || 0
    contratosAtivos = data || []
  } else {
    const { data, count } = await supabaseAdmin
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
    contratosAtivosCount = count || 0
    contratosAtivos = data || []
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

  // 5. Buscar comunicados oficiais do comando
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
