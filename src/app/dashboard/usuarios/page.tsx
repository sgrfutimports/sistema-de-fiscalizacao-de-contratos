import { getCachedUser, getCachedUserProfile } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Shield } from 'lucide-react'
import { redirect } from 'next/navigation'
import { NovoUsuarioDialog } from '@/components/dashboard/novo-usuario-dialog'
import { UsuariosClient } from './usuarios-client'

export default async function UsuariosPage() {
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await getCachedUser()
  if (!user) {
    redirect('/login')
  }

  // Executar a verificação do perfil atual e busca de todos os usuários em paralelo
  const [profileRes, usuariosRes] = await Promise.all([
    getCachedUserProfile(user.id),
    supabaseAdmin.from('users').select('*').order('nome')
  ])

  const currentUser = profileRes.data
  const usuarios = usuariosRes.data || []

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard') // Redireciona se não for admin
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#133215] dark:text-yellow-500 flex items-center gap-2">
            <Shield className="h-6 w-6 text-yellow-500" />
            Cadastro
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Gestão operacional dos Fiscais Titulares/Substitutos e perfis administradores do sistema de contratos.
          </p>
        </div>
        <NovoUsuarioDialog />
      </div>

      <UsuariosClient initialUsuarios={usuarios} currentUser={currentUser} />
    </div>
  )
}
