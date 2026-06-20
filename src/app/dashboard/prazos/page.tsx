import { getCachedUser, getCachedUserProfile } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CalendarClock } from 'lucide-react'
import { redirect } from 'next/navigation'
import { FormPrazos } from '@/components/dashboard/form-prazos'

export default async function PrazosPage() {
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await getCachedUser()
  if (!user) {
    redirect('/login')
  }

  // Executar a verificação do perfil atual, busca de contratos e exceções em paralelo
  const [profileRes, contratosRes, excecoesRes] = await Promise.all([
    getCachedUserProfile(user.id),
    supabaseAdmin
      .from('contratos')
      .select('id, numero_contrato, empresa')
      .eq('status', 'ATIVO')
      .order('numero_contrato'),
    supabaseAdmin
      .from('comunicados')
      .select('id, titulo, conteudo, autor, created_at')
      .eq('titulo', 'EXCECAO_PRAZO')
      .order('created_at', { ascending: false })
  ])

  const currentUser = profileRes.data
  const contratos = contratosRes.data || []
  const excecoes = (excecoesRes.data as any[]) || []

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#133215] dark:text-yellow-500 flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-yellow-500" />
            Reabertura de Prazos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Gerencie as exceções de prazo para envio de relatórios fora do 5º dia útil.
          </p>
        </div>
      </div>

      <FormPrazos contratos={contratos} excecoes={excecoes} />
    </div>
  )
}

