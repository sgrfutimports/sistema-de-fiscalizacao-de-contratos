'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function changeInitialPassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem.' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter no mínimo 6 caracteres.' }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Sessão inválida. Faça login novamente.' }
  }

  // Atualiza a senha no Supabase Auth
  const { error: updateError } = await supabase.auth.updateUser({
    password: password
  })

  if (updateError) {
    return { error: 'Erro ao atualizar a senha. Tente novamente.' }
  }

  // Atualiza o status de 'primeiro_acesso' na tabela users usando o client admin para ignorar restrição RLS de alteração
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabaseAdmin = createAdminClient()
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .update({ primeiro_acesso: false })
    .eq('id', user.id)

  if (dbError) {
    console.error(dbError)
    return { error: 'Erro ao registrar acesso no banco de dados.' }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}
