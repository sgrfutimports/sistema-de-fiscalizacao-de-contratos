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

  const { data: currentUserData } = await adminAuthClient.from('users').select('perfil').eq('id', currentUser.id).single()
  if (currentUserData?.perfil !== 'ADMIN') return { error: 'Apenas administradores podem criar usuários.' }

  const nome = formData.get('nome') as string
  const posto_graduacao = formData.get('posto_graduacao') as string
  const nome_guerra = formData.get('nome_guerra') as string
  const cpf = formData.get('cpf') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string
  const perfil = formData.get('perfil') as 'ADMIN' | 'FISCAL_TITULAR' | 'FISCAL_SUBSTITUTO'

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
  const { error: dbError } = await adminAuthClient.from('users').insert({
    id: authUser.user.id,
    nome,
    posto_graduacao,
    nome_guerra,
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

  const { data: currentUserData } = await adminAuthClient.from('users').select('perfil').eq('id', currentUser.id).single()
  if (currentUserData?.perfil !== 'ADMIN') return { error: 'Apenas administradores podem resetar senhas.' }

  // Obter o CPF do usuário
  const { data: targetUser, error: fetchError } = await supabase
    .from('users')
    .select('cpf, nome, posto_graduacao, nome_guerra')
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
  const { error: dbError } = await adminAuthClient
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
    descricao: `Redefinida a senha do militar ${targetUser.posto_graduacao} ${targetUser.nome_guerra} para o padrão (CPF).`
  })

  revalidatePath('/dashboard/usuarios')
  return { success: true }
}

export async function updateUsuario(userId: string, formData: FormData) {
  const adminAuthClient = createAdminClient()
  const supabase = await createClient()

  // Verify if current user is ADMIN
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { error: 'Não autorizado.' }

  const { data: currentUserData, error: adminCheckError } = await adminAuthClient.from('users').select('perfil, cpf').eq('id', currentUser.id).single()
  console.log("DEBUG: currentUser.id =", currentUser.id)
  console.log("DEBUG: currentUserData =", currentUserData)
  console.log("DEBUG: adminCheckError =", adminCheckError)
  if (currentUserData?.perfil !== 'ADMIN') return { error: 'Apenas administradores podem editar usuários.' }

  const nome = formData.get('nome') as string
  const posto_graduacao = formData.get('posto_graduacao') as string
  const nome_guerra = formData.get('nome_guerra') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone') as string
  const perfil = formData.get('perfil') as 'ADMIN' | 'FISCAL_TITULAR' | 'FISCAL_SUBSTITUTO'
  const ativo = formData.get('ativo') === 'true'

  // Fetch existing user data to check if email changed
  const { data: targetUserData, error: targetError } = await adminAuthClient
    .from('users')
    .select('email')
    .eq('id', userId)
    .single()

  if (targetError || !targetUserData) {
    return { error: 'Usuário não encontrado.' }
  }

  if (targetUserData.email !== email) {
    // Update in Supabase Auth (email) only if it changed
    const { error: authError } = await adminAuthClient.auth.admin.updateUserById(userId, {
      email: email
    })

    if (authError) {
      console.error("Auth Update Error:", authError)
      if (authError.message.includes('already exists')) {
        return { error: 'Usuário com este e-mail já existe no sistema.' }
      }
      return { error: 'Erro ao atualizar e-mail do usuário na autenticação.' }
    }
  }

  // Update in public.users table using admin client to bypass RLS recursion
  const { error: dbError } = await adminAuthClient.from('users').update({
    nome,
    posto_graduacao,
    nome_guerra,
    email,
    telefone,
    perfil,
    ativo
  }).eq('id', userId)

  if (dbError) {
    console.error("DB Update Error:", dbError)
    return { error: 'Erro ao atualizar dados do usuário no banco.' }
  }

  // Registrar no Log de auditoria
  await adminAuthClient.from('logs').insert({
    usuario: currentUser.id,
    cpf: currentUserData.cpf || '',
    perfil: 'ADMIN',
    operacao: 'ATUALIZAR_USUARIO',
    descricao: `Atualizado cadastro do militar ${posto_graduacao} ${nome_guerra} (${nome}). Status: ${ativo ? 'Ativo' : 'Inativo'}.`
  })

  revalidatePath('/dashboard/usuarios')
  return { success: true }
}

export async function deleteUsuario(userId: string, passwordConfirm: string) {
  const adminAuthClient = createAdminClient()
  const supabase = await createClient()

  // Verify if current user is ADMIN
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { error: 'Não autorizado.' }

  const { data: currentUserData } = await adminAuthClient.from('users').select('perfil, cpf').eq('id', currentUser.id).single()
  if (currentUserData?.perfil !== 'ADMIN') return { error: 'Apenas administradores podem excluir usuários.' }

  // Validar senha de confirmação do administrador
  if (!passwordConfirm) {
    return { error: 'A senha de confirmação é obrigatória.' }
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: currentUser.email || '',
    password: passwordConfirm
  })

  if (verifyError) {
    return { error: 'Senha de confirmação incorreta. Exclusão não autorizada.' }
  }

  // Prevent deleting oneself
  if (userId === currentUser.id) {
    return { error: 'Você não pode excluir a sua própria conta.' }
  }

  // 1. Verificações de vínculos antes de excluir
  // Contratos como titular ou substituto
  const { data: contracts, error: contractsError } = await adminAuthClient
    .from('contratos')
    .select('id, numero_contrato')
    .or(`fiscal_titular_id.eq.${userId},fiscal_substituto_id.eq.${userId}`)

  if (contractsError) {
    console.error("Error checking contracts for deletion:", contractsError)
    return { error: 'Erro ao verificar vínculos com contratos.' }
  }

  if (contracts && contracts.length > 0) {
    const contratosStr = contracts.map(c => c.numero_contrato).join(', ')
    return { 
      error: `Não é possível excluir o militar porque ele está vinculado como fiscal em contrato(s) ativo(s) (${contratosStr}). Remova-o desses contratos antes de excluir, ou desative sua conta.` 
    }
  }

  // Relatórios enviados
  const { data: reports, error: reportsError } = await adminAuthClient
    .from('relatorios')
    .select('id')
    .eq('fiscal_id', userId)
    .limit(1)

  if (reportsError) {
    console.error("Error checking reports for deletion:", reportsError)
    return { error: 'Erro ao verificar relatórios enviados.' }
  }

  if (reports && reports.length > 0) {
    return { 
      error: 'Não é possível excluir o militar porque ele possui relatórios históricos registrados no sistema. Por favor, desative a conta dele em "Editar" para impedir novos acessos.' 
    }
  }

  // Se passou em todas as verificações, podemos excluir!
  // Primeiro obter informações sobre quem está sendo excluído para fins de logs
  const { data: targetUser } = await adminAuthClient
    .from('users')
    .select('nome, posto_graduacao, nome_guerra')
    .eq('id', userId)
    .single()

  const targetName = targetUser ? `${targetUser.posto_graduacao} ${targetUser.nome_guerra}` : 'Usuário'

  // 2. Excluir da tabela pública
  const { error: dbDeleteError } = await adminAuthClient
    .from('users')
    .delete()
    .eq('id', userId)

  if (dbDeleteError) {
    console.error("DB Delete Error:", dbDeleteError)
    return { error: 'Erro ao excluir dados do usuário no banco.' }
  }

  // 3. Excluir do Supabase Auth
  const { error: authDeleteError } = await adminAuthClient.auth.admin.deleteUser(userId)
  if (authDeleteError) {
    console.error("Auth Delete Error:", authDeleteError)
    // Nota: Mesmo se falhar na auth por algum motivo, o usuário já saiu da tabela do banco, mas é bom retornar um erro se der pau
    return { error: 'Erro ao excluir credenciais de acesso do militar.' }
  }

  // 4. Registrar no Log de auditoria
  await adminAuthClient.from('logs').insert({
    usuario: currentUser.id,
    cpf: currentUserData.cpf || '',
    perfil: 'ADMIN',
    operacao: 'EXCLUIR_USUARIO',
    descricao: `Militar ${targetName} foi excluído permanentemente do sistema.`
  })

  revalidatePath('/dashboard/usuarios')
  return { success: true }
}


