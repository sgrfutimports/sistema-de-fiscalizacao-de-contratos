'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const cpf = formData.get('cpf') as string
  const password = formData.get('password') as string
  
  const cleanCpf = cpf.replace(/\D/g, '')

  // Busca o email real associado a este CPF
  const { data: userData, error: dbError } = await supabaseAdmin
    .from('users')
    .select('email, primeiro_acesso, ativo')
    .eq('cpf', cleanCpf)
    .single()

  if (dbError || !userData) {
    return { error: 'CPF ou senha inválidos. Verifique suas credenciais.' }
  }

  if (!userData.ativo) {
    return { error: 'Este usuário está inativo no sistema. Contate o administrador.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: userData.email,
    password,
  })

  if (error) {
    return { error: 'CPF ou senha inválidos. Verifique suas credenciais.' }
  }

  if (userData.primeiro_acesso) {
    redirect('/primeiro-acesso')
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function sendResetPasswordEmail(cpf: string, origin: string) {
  const cleanCpf = cpf.replace(/\D/g, '')
  if (cleanCpf.length !== 11) {
    return { error: 'CPF inválido.' }
  }

  const supabaseAdmin = createAdminClient()

  // Buscar usuário e e-mail real
  const { data: userData, error: dbError } = await supabaseAdmin
    .from('users')
    .select('email, ativo')
    .eq('cpf', cleanCpf)
    .single()

  if (dbError || !userData) {
    return { error: 'Nenhum usuário encontrado com este CPF.' }
  }

  if (!userData.ativo) {
    return { error: 'Este usuário está inativo no sistema. Contate o administrador.' }
  }

  const email = userData.email
  const redirectTo = `${origin}/auth/callback?next=/redefinir-senha`

  const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (resetError) {
    console.error('Reset password error:', resetError)
    return { error: 'Erro ao enviar e-mail de redefinição. Tente novamente.' }
  }

  // Mascara o e-mail para exibir feedback seguro (ex: r******o@gmail.com)
  const [localPart, domain] = email.split('@')
  const maskedLocal = localPart.length > 2 
    ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
    : localPart[0] + '*'
  const maskedEmail = `${maskedLocal}@${domain}`

  return { success: true, email: maskedEmail }
}

