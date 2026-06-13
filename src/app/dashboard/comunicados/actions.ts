'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createComunicado(formData: FormData) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: currentUserData } = await supabaseAdmin.from('users').select('perfil, posto_graduacao, nome_guerra').eq('id', user.id).single()
  if (currentUserData?.perfil !== 'ADMIN') {
    return { error: 'Apenas administradores podem gerenciar comunicados.' }
  }

  const titulo = formData.get('titulo') as string
  const conteudo = formData.get('conteudo') as string
  const autor = `${currentUserData.posto_graduacao} ${currentUserData.nome_guerra}`

  if (!titulo || !conteudo) {
    return { error: 'Todos os campos são obrigatórios.' }
  }

  const { error: dbError } = await supabaseAdmin.from('comunicados').insert({
    titulo,
    conteudo,
    autor
  })

  if (dbError) {
    console.error(dbError)
    return { error: 'Erro ao salvar comunicado no banco de dados. Certifique-se de que a tabela public.comunicados foi criada no Supabase.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/comunicados')
  return { success: true }
}

export async function deleteComunicado(id: string) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: currentUserData } = await supabaseAdmin.from('users').select('perfil').eq('id', user.id).single()
  if (currentUserData?.perfil !== 'ADMIN') {
    return { error: 'Apenas administradores podem gerenciar comunicados.' }
  }

  const { error: dbError } = await supabaseAdmin.from('comunicados').delete().eq('id', id)

  if (dbError) {
    console.error(dbError)
    return { error: 'Erro ao remover comunicado no banco de dados.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/comunicados')
  return { success: true }
}
