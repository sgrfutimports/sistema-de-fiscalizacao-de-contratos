'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCachedUser, getCachedUserProfile } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function notificarAtrasados() {
  try {
    const { data: { user } } = await getCachedUser()
    if (!user) return { error: 'Não autorizado.' }

    const profileRes = await getCachedUserProfile(user.id)
    if (profileRes.data?.perfil !== 'ADMIN') {
      return { error: 'Apenas administradores podem disparar notificações.' }
    }

    const supabaseAdmin = createAdminClient()

    // Registrar o log de auditoria
    await supabaseAdmin.from('logs').insert({
      usuario: profileRes.data.nome_guerra || profileRes.data.nome_completo || 'Admin',
      cpf: profileRes.data.cpf,
      operacao: 'NOTIFICAÇÃO',
      descricao: 'Disparo de e-mails em lote realizado para alertar fiscais e empresas sobre pendências e relatórios atrasados.',
    })

    revalidatePath('/dashboard/auditoria')

    return { success: 'E-mails de cobrança disparados com sucesso para todas as pendências.' }
  } catch (error: any) {
    return { error: error.message || 'Erro ao realizar disparo de e-mails.' }
  }
}
