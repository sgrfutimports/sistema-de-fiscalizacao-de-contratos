'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function homologarReabertura(
  contratoId: string,
  competenciaMes: number,
  competenciaAno: number
) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: currentUser } = await supabaseAdmin
    .from('users')
    .select('perfil, cpf')
    .eq('id', user.id)
    .single()

  if (currentUser?.perfil !== 'ADMIN') {
    return { error: 'Permissão negada. Apenas Administradores podem homologar reaberturas de prazos.' }
  }

  if (!contratoId || !competenciaMes || !competenciaAno) {
    return { error: 'Todos os campos são obrigatórios para a reabertura.' }
  }

  // Obter número do contrato para o log
  const { data: contrato } = await supabaseAdmin
    .from('contratos')
    .select('numero_contrato')
    .eq('id', contratoId)
    .single()

  // Insere a reabertura de prazo utilizando a tabela public.comunicados com título 'EXCECAO_PRAZO'
  const { error: dbError } = await supabaseAdmin.from('comunicados').insert({
    titulo: 'EXCECAO_PRAZO',
    conteudo: contratoId,
    autor: `${competenciaMes}/${competenciaAno}`
  })

  if (dbError) {
    console.error('Erro ao homologar reabertura:', dbError)
    return { error: 'Erro ao homologar reabertura de prazo.' }
  }

  // Registrar log de auditoria
  await supabaseAdmin.from('logs').insert({
    usuario: user.id,
    cpf: currentUser.cpf || 'ADMIN',
    perfil: 'ADMIN',
    operacao: 'HOMOLOGAR_REABERTURA_PRAZO',
    descricao: `Reabertura de prazo homologada para o contrato ${contrato?.numero_contrato || 'N/A'} na competência ${competenciaMes}/${competenciaAno}.`
  })

  revalidatePath('/dashboard/prazos')
  revalidatePath('/dashboard/relatorios')
  return { success: true }
}

export async function revogarReabertura(id: string) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: currentUser } = await supabaseAdmin
    .from('users')
    .select('perfil, cpf')
    .eq('id', user.id)
    .single()

  if (currentUser?.perfil !== 'ADMIN') {
    return { error: 'Permissão negada. Apenas Administradores podem revogar reaberturas de prazos.' }
  }

  // Buscar detalhes do comunicado antes de deletar para fins de auditoria
  const { data: exc } = await supabaseAdmin
    .from('comunicados')
    .select('*')
    .eq('id', id)
    .single()

  if (!exc) {
    return { error: 'Exceção não encontrada.' }
  }

  // Obter número do contrato
  const { data: contrato } = await supabaseAdmin
    .from('contratos')
    .select('numero_contrato')
    .eq('id', exc.conteudo)
    .single()

  const { error: dbError } = await supabaseAdmin
    .from('comunicados')
    .delete()
    .eq('id', id)

  if (dbError) {
    console.error('Erro ao revogar reabertura:', dbError)
    return { error: 'Erro ao revogar reabertura de prazo.' }
  }

  // Registrar log de auditoria
  await supabaseAdmin.from('logs').insert({
    usuario: user.id,
    cpf: currentUser.cpf || 'ADMIN',
    perfil: 'ADMIN',
    operacao: 'REVOGAR_REABERTURA_PRAZO',
    descricao: `Reabertura de prazo revogada para o contrato ${contrato?.numero_contrato || 'N/A'} na competência ${exc.autor}.`
  })

  revalidatePath('/dashboard/prazos')
  revalidatePath('/dashboard/relatorios')
  return { success: true }
}
