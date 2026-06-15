'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function alterarSenha(formData: FormData) {
  const supabase = await createClient()

  const senhaAtual = formData.get('senhaAtual') as string
  const novaSenha = formData.get('novaSenha') as string
  const confirmarNovaSenha = formData.get('confirmarNovaSenha') as string

  if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
    return { error: 'Todos os campos são obrigatórios.' }
  }

  if (novaSenha !== confirmarNovaSenha) {
    return { error: 'A nova senha e a confirmação não coincidem.' }
  }

  if (novaSenha.length < 6) {
    return { error: 'A nova senha deve ter no mínimo 6 caracteres.' }
  }

  if (novaSenha === senhaAtual) {
    return { error: 'A nova senha não pode ser igual à senha atual.' }
  }

  // Verifica a identidade do usuário autenticando com a senha atual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return { error: 'Sessão inválida. Faça login novamente.' }
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: senhaAtual,
  })

  if (verifyError) {
    return { error: 'Senha atual incorreta. Verifique e tente novamente.' }
  }

  // Atualiza para a nova senha
  const { error: updateError } = await supabase.auth.updateUser({
    password: novaSenha,
  })

  if (updateError) {
    return { error: 'Erro ao atualizar a senha. Tente novamente.' }
  }

  revalidatePath('/dashboard/perfil')
  return { success: true }
}
