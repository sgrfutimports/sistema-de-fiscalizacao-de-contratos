import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { NovoUnificadoForm } from '@/components/dashboard/novo-unificado-form'

export default async function NovoUnificadoPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca todos os contratos ativos vinculados ao fiscal
  const { data: contratos } = await supabaseAdmin
    .from('contratos')
    .select('id, numero_contrato, empresa, objeto, fiscal_titular_id')
    .or(`fiscal_titular_id.eq.${user.id},fiscal_substituto_id.eq.${user.id}`)
    .eq('status', 'ATIVO')
    .order('numero_contrato', { ascending: true })

  if (!contratos || contratos.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Relatório Unificado</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Você não possui contratos ativos vinculados ao seu perfil para emitir relatórios.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Emitir Relatório Único</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Preencha a avaliação mensal de todos os seus contratos vinculados em uma única tela.
        </p>
      </div>

      <NovoUnificadoForm contratos={contratos} userId={user.id} />
    </div>
  )
}
