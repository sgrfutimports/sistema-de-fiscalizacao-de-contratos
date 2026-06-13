import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Usar o admin client para bypassar o RLS e garantir que consiga ler o perfil
  const supabaseAdmin = createAdminClient()
  const { data: userData, error: dbError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Redireciona para o primeiro acesso se ainda não tiver alterado a senha inicial
  if (userData?.primeiro_acesso) {
    redirect('/primeiro-acesso')
  }

  const userPerfil = userData?.perfil || 'FISCAL'

  // Formatar CPF
  const formatCPF = (cpf: string) => {
    if (!cpf) return ''
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  // Função para formatar a data completa por extenso
  const formatFullDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    const formatter = new Intl.DateTimeFormat('pt-BR', options)
    const formatted = formatter.format(new Date())
    // Forçar capitalização correta do dia da semana (ex: Sábado, 13 de Junho...)
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  // Abreviação do perfil
  const formatPerfilAbreviado = (perfil: string) => {
    if (perfil === 'ADMIN') return 'Admin'
    if (perfil === 'FISCAL_TITULAR') return 'Fiscal Titular'
    if (perfil === 'FISCAL_SUBSTITUTO') return 'Fiscal Subst.'
    return 'Fiscal'
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50/50 w-full font-sans">
        {/* App Sidebar com design oficial */}
        <AppSidebar userNome={userData ? `${userData.posto_graduacao} ${userData.nome_guerra}` : undefined} userPerfil={userPerfil} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header Superior Oficial */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-gray-500 hover:text-primary transition-colors" />
            </div>
            
            {/* Título Centralizado com Localidade, Data e Hora (escondido no mobile) */}
            <div className="hidden lg:flex flex-col items-center text-center">
              <h2 className="text-gray-800 font-bold text-sm tracking-wide">
                Sistema de Fiscalização de Contratos
              </h2>
              <span className="text-[0.7rem] font-bold text-gray-500">
                Garanhuns/PE, {formatFullDate()}
              </span>
            </div>

            {/* Informações do Usuário e Botão Sair à Direita */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-sm font-bold text-[#133215]">
                  {userData ? `${userData.posto_graduacao} ${userData.nome_guerra}` : 'Usuário'} ({formatPerfilAbreviado(userPerfil)})
                </span>
                <span className="text-[0.65rem] font-bold text-gray-400">
                  {formatCPF(userData?.cpf)} | 71º BI Mtz
                </span>
              </div>
              <form action={logout}>
                <button type="submit" className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-200">
                  <LogOut className="h-3 w-3" />
                  SAIR
                </button>
              </form>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
