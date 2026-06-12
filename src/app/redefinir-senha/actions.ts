'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function redefinirSenha(formData: FormData) {
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
    return { error: 'Sessão expirada ou inválida. Solicite um novo link de recuperação.' }
  }

  // Atualiza a senha no Supabase Auth
  const { error: updateError } = await supabase.auth.updateUser({
    password: password
  })

  if (updateError) {
    console.error('Reset password auth error:', updateError)
    return { error: 'Erro ao atualizar a senha. Tente novamente.' }
  }

  // Garante que o status primeiro_acesso é falso
  const { error: dbError } = await supabase
    .from('users')
    .update({ primeiro_acesso: false })
    .eq('id', user.id)

  if (dbError) {
    console.error('Reset password db error:', dbError)
    return { error: 'Senha atualizada, mas erro ao registrar no banco de dados.' }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}
