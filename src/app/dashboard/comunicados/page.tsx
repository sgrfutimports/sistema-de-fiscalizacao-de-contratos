import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Megaphone } from 'lucide-react'
import { GerenciarComunicados } from './GerenciarComunicados'

export default async function ComunicadosPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Busca lista de comunicados ordenados do mais recente
  const { data: comunicados } = await supabaseAdmin
    .from('comunicados')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="h-7 w-7 text-yellow-500" />
          Gerenciar Comunicados do Comando
        </h1>
        <p className="text-muted-foreground mt-1">
          Envie avisos, atualizações e comunicados oficiais aos fiscais titulares e substitutos cadastrados no sistema.
        </p>
      </div>
      
      <GerenciarComunicados comunicados={comunicados || []} />
    </div>
  )
}
