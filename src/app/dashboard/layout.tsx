import { getCachedUser, getCachedUserProfile } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import { DashboardLayoutClient } from '@/components/dashboard/dashboard-layout-client'
import { AutoLogout } from '@/components/auth/auto-logout'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: { user }, error } = await getCachedUser()

  if (!user) {
    // Fallback de segurança caso o middleware falhe em algum edge case
    redirect('/login')
  }

  // Usar o admin client para consultas adicionais e o cache para o perfil do usuário logado
  const supabaseAdmin = createAdminClient()
  const { data: userData } = await getCachedUserProfile(user.id)

  // Redireciona para o primeiro acesso se ainda não tiver alterado a senha inicial
  if (userData?.primeiro_acesso) {
    redirect('/primeiro-acesso')
  }

  const userPerfil = userData?.perfil || 'FISCAL'

  // Buscar administrador para suporte/whatsapp
  let adminSuporte: any = null
  if (userPerfil !== 'ADMIN') {
    const { data: admins } = await supabaseAdmin
      .from('users')
      .select('nome, posto_graduacao, nome_guerra, telefone')
      .eq('perfil', 'ADMIN')
      .eq('ativo', true)
      .limit(1)
    adminSuporte = admins && admins.length > 0 ? admins[0] : null
  }

  // Função para formatar o link do WhatsApp de suporte
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
  const userCPF = userData?.cpf || ''
  const whatsappLink = getWhatsappLink(adminSuporte?.telefone)

  return (
    <SidebarProvider>
      <AutoLogout />
      <div className="flex h-screen bg-background w-full font-sans overflow-hidden">
        {/* App Sidebar com design oficial modernizado */}
        <AppSidebar userNome={userNome} userPerfil={userPerfil} />

        {/* Componente Client com Cabeçalho Premium e Navegação Mobile do Banco do Brasil */}
        <DashboardLayoutClient 
          userNome={userNome} 
          userPerfil={userPerfil} 
          userCPF={userCPF}
          whatsappLink={whatsappLink}
          logoutAction={logout}
        >
          {children}
        </DashboardLayoutClient>
      </div>
    </SidebarProvider>
  )
}
