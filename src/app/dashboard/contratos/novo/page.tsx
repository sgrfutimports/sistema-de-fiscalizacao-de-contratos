import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { NovoContratoForm } from '@/components/dashboard/novo-contrato-form'

export default async function NovoContratoPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Busca lista de usuários ativos
  const { data: fiscais } = await supabaseAdmin
    .from('users')
    .select('id, nome, perfil')
    .eq('ativo', true)
    .order('nome')

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Contrato</h1>
        <p className="text-muted-foreground mt-1">
          Cadastre um novo contrato e vincule seus respectivos fiscais.
        </p>
      </div>
      
      <NovoContratoForm fiscais={fiscais || []} />
    </div>
  )
}
