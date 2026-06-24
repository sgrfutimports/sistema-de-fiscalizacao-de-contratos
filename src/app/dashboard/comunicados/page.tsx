import { getCachedUser, getCachedUserProfile } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Megaphone } from 'lucide-react'
import { GerenciarComunicados } from './GerenciarComunicados'

export default async function ComunicadosPage() {
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await getCachedUser()
  if (!user) {
    redirect('/login')
  }

  // Busca lista de comunicados ordenados do mais recente, ocultando as exceções de prazo
  const [profileRes, comunicadosRes] = await Promise.all([
    getCachedUserProfile(user.id),
    supabaseAdmin
      .from('comunicados')
      .select('*')
      .neq('titulo', 'EXCECAO_PRAZO')
      .order('created_at', { ascending: false })
  ])

  const currentUser = profileRes.data
  const comunicados = comunicadosRes.data

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="h-7 w-7 text-yellow-500" />
          Gerenciar Comunicados
        </h1>
        <p className="text-muted-foreground mt-1">
          Envie avisos, atualizações e comunicados oficiais aos fiscais titulares e substitutos cadastrados no sistema.
        </p>
      </div>
      
      <GerenciarComunicados comunicados={comunicados || []} />
    </div>
  )
}
