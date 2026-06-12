'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function createUsuario(formData: FormData) {
  const adminAuthClient = createAdminClient()
  const supabase = await createClient()

  // Verify if current user is ADMIN
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { error: 'Não autorizado.' }

  const { data: currentUserData } = await supabase.from('users').select('perfil').eq('id', currentUser.id).single()
  if (currentUserData?.perfil !== 'ADMIN') return { error: 'Apenas administradores podem criar usuários.' }

  const nome = formData.get('nome') as string
  const cpf = formData.get('cpf') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string
  const perfil = formData.get('perfil') as 'ADMIN' | 'FISCAL'

  const cleanCpf = cpf.replace(/\D/g, '')
  if (cleanCpf.length !== 11) {
    return { error: 'CPF inválido.' }
  }

  // Define a senha inicial como o CPF sem pontuação
  const initialPassword = cleanCpf
  const authEmail = email // Real, valid email is used now!

  // 1. Criar usuário no Supabase Auth
  const { data: authUser, error: authError } = await adminAuthClient.auth.admin.createUser({
    email: authEmail,
    password: initialPassword,
    email_confirm: true,
  })

  if (authError) {
    console.error("Auth Error:", authError)
    if (authError.message.includes('already exists')) {
      return { error: 'Usuário com este e-mail já existe no sistema.' }
    }
    return { error: 'Erro ao criar autenticação do usuário. Verifique se o e-mail ou CPF já estão cadastrados.' }
  }

  if (!authUser.user) {
    return { error: 'Erro desconhecido ao criar usuário.' }
  }

  // 2. Inserir dados na tabela pública de usuários
  const { error: dbError } = await supabase.from('users').insert({
    id: authUser.user.id,
    nome,
    cpf: cleanCpf,
    email,
    telefone,
    perfil,
    ativo: true,
    primeiro_acesso: true
  })

  if (dbError) {
    console.error("DB Error:", dbError)
    // Rollback auth user creation if DB insert fails
    await adminAuthClient.auth.admin.deleteUser(authUser.user.id)
    return { error: 'Erro ao salvar os dados do usuário no banco.' }
  }

  revalidatePath('/dashboard/usuarios')
  return { success: true }
}

export async function resetUsuarioPassword(userId: string) {
  const adminAuthClient = createAdminClient()
  const supabase = await createClient()

  // Verify if current user is ADMIN
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { error: 'Não autorizado.' }

  const { data: currentUserData } = await supabase.from('users').select('perfil').eq('id', currentUser.id).single()
  if (currentUserData?.perfil !== 'ADMIN') return { error: 'Apenas administradores podem resetar senhas.' }

  // Obter o CPF do usuário
  const { data: targetUser, error: fetchError } = await supabase
    .from('users')
    .select('cpf, nome')
    .eq('id', userId)
    .single()

  if (fetchError || !targetUser) {
    return { error: 'Usuário não encontrado.' }
  }

  const cleanCpf = targetUser.cpf.replace(/\D/g, '')

  // 1. Atualizar a senha no Supabase Auth usando o Admin Client
  const { error: authError } = await adminAuthClient.auth.admin.updateUserById(
    userId,
    { password: cleanCpf }
  )

  if (authError) {
    console.error("Auth Reset Error:", authError)
    return { error: 'Erro ao resetar senha na autenticação.' }
  }

  // 2. Atualizar tabela pública para marcar primeiro_acesso = true
  const { error: dbError } = await supabase
    .from('users')
    .update({ primeiro_acesso: true })
    .eq('id', userId)

  if (dbError) {
    console.error("DB Reset Error:", dbError)
    return { error: 'Erro ao atualizar status de primeiro acesso no banco.' }
  }

  // 3. Registrar no Log de auditoria
  await adminAuthClient.from('logs').insert({
    usuario: currentUser.id,
    cpf: targetUser.cpf,
    perfil: 'ADMIN',
    operacao: 'RESET_SENHA',
    descricao: `Redefinida a senha do militar ${targetUser.nome} para o padrão (CPF).`
  })

  revalidatePath('/dashboard/usuarios')
  return { success: true }
}

