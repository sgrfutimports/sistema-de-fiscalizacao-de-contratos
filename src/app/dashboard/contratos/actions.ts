'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createContrato(formData: FormData) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: currentUserData } = await supabaseAdmin.from('users').select('perfil').eq('id', user.id).single()
  if (currentUserData?.perfil !== 'ADMIN') return { error: 'Apenas administradores podem gerenciar contratos.' }

  const numero_contrato = formData.get('numero_contrato') as string
  const processo_administrativo = formData.get('processo_administrativo') as string
  const empresa = formData.get('empresa') as string
  const cnpj = formData.get('cnpj') as string
  const objeto = formData.get('objeto') as string
  const valor = parseFloat((formData.get('valor') as string).replace(',', '.'))
  const data_inicio = formData.get('data_inicio') as string
  const data_termino = formData.get('data_termino') as string
  const fiscal_titular_id = formData.get('fiscal_titular_id') as string
  const fiscal_substituto_id = formData.get('fiscal_substituto_id') as string

  if (fiscal_titular_id === fiscal_substituto_id) {
    return { error: 'O fiscal titular e substituto não podem ser a mesma pessoa.' }
  }

  // Validar limite de 5 contratos para Titular
  const { count: countTitular, error: errTitular } = await supabase
    .from('contratos')
    .select('id', { count: 'exact', head: true })
    .eq('fiscal_titular_id', fiscal_titular_id)
    .eq('status', 'ATIVO')

  if (countTitular !== null && countTitular >= 5) {
    return { error: 'O fiscal TITULAR selecionado atingiu o limite máximo permitido de 5 contratos ativos.' }
  }

  // Validar limite de 5 contratos para Substituto
  const { count: countSubstituto, error: errSubstituto } = await supabase
    .from('contratos')
    .select('id', { count: 'exact', head: true })
    .eq('fiscal_substituto_id', fiscal_substituto_id)
    .eq('status', 'ATIVO')

  if (countSubstituto !== null && countSubstituto >= 5) {
    return { error: 'O fiscal SUBSTITUTO selecionado atingiu o limite máximo permitido de 5 contratos ativos.' }
  }

  const { error: dbError } = await supabaseAdmin.from('contratos').insert({
    numero_contrato,
    processo_administrativo,
    empresa,
    cnpj,
    objeto,
    valor,
    data_inicio,
    data_termino,
    fiscal_titular_id,
    fiscal_substituto_id,
    status: 'ATIVO'
  })

  if (dbError) {
    console.error(dbError)
    return { error: 'Erro ao cadastrar contrato no banco de dados.' }
  }

  revalidatePath('/dashboard/contratos')
  return { success: true }
}

export async function updateContrato(formData: FormData) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: currentUserData } = await supabaseAdmin.from('users').select('perfil').eq('id', user.id).single()
  if (currentUserData?.perfil !== 'ADMIN') return { error: 'Apenas administradores podem gerenciar contratos.' }

  const id = formData.get('id') as string
  const numero_contrato = formData.get('numero_contrato') as string
  const empresa = formData.get('empresa') as string
  const cnpj = formData.get('cnpj') as string
  const objeto = formData.get('objeto') as string
  const valor = parseFloat((formData.get('valor') as string).replace(',', '.'))
  const data_inicio = formData.get('data_inicio') as string
  const data_termino = formData.get('data_termino') as string
  const fiscal_titular_id = formData.get('fiscal_titular_id') as string
  const fiscal_substituto_id = formData.get('fiscal_substituto_id') as string
  const status = formData.get('status') as string

  if (fiscal_titular_id === fiscal_substituto_id) {
    return { error: 'O fiscal titular e substituto não podem ser a mesma pessoa.' }
  }

  // Obter o contrato antes da atualização para verificar se mudou de fiscal titular e validar limite
  const { data: oldContrato } = await supabaseAdmin.from('contratos').select('*').eq('id', id).single()
  if (!oldContrato) return { error: 'Contrato não encontrado.' }

  // Se alterou o titular ou reativou, validar limite de 5
  if ((oldContrato.fiscal_titular_id !== fiscal_titular_id || oldContrato.status !== 'ATIVO') && status === 'ATIVO') {
    const { count: countTitular } = await supabaseAdmin
      .from('contratos')
      .select('id', { count: 'exact', head: true })
      .eq('fiscal_titular_id', fiscal_titular_id)
      .eq('status', 'ATIVO')
      .neq('id', id)

    if (countTitular !== null && countTitular >= 5) {
      return { error: 'O fiscal TITULAR selecionado atingiu o limite máximo permitido de 5 contratos ativos.' }
    }
  }

  // Se alterou o substituto ou reativou, validar limite de 5
  if ((oldContrato.fiscal_substituto_id !== fiscal_substituto_id || oldContrato.status !== 'ATIVO') && status === 'ATIVO') {
    const { count: countSubstituto } = await supabaseAdmin
      .from('contratos')
      .select('id', { count: 'exact', head: true })
      .eq('fiscal_substituto_id', fiscal_substituto_id)
      .eq('status', 'ATIVO')
      .neq('id', id)

    if (countSubstituto !== null && countSubstituto >= 5) {
      return { error: 'O fiscal SUBSTITUTO selecionado atingiu o limite máximo permitido de 5 contratos ativos.' }
    }
  }

  const { error: dbError } = await supabaseAdmin
    .from('contratos')
    .update({
      numero_contrato,
      empresa,
      cnpj,
      objeto,
      valor,
      data_inicio,
      data_termino,
      fiscal_titular_id,
      fiscal_substituto_id,
      status
    })
    .eq('id', id)

  if (dbError) {
    console.error(dbError)
    return { error: 'Erro ao atualizar contrato no banco de dados.' }
  }

  revalidatePath('/dashboard/contratos')
  return { success: true }
}
