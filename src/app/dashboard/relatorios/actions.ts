'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verificarPrazoEnvio } from '@/lib/prazos-util'

export async function submitRelatorio(payload: {
  contrato_id: string
  competencia_mes: number
  competencia_ano: number
  tipo_fiscal: string
  fiscalizacao_realizada: boolean
  servico_conforme: boolean
  documentacao_apresentada: boolean
  ocorrencias: string
  pendencias: string
  observacoes: string
  verificacoes?: Record<string, any>
  documentos?: Record<string, any>
  relatorio_id?: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const {
    contrato_id, competencia_mes, competencia_ano, tipo_fiscal,
    fiscalizacao_realizada, servico_conforme, documentacao_apresentada,
    ocorrencias, pendencias, observacoes, verificacoes, documentos,
    relatorio_id,
  } = payload

  const supabaseAdmin = createAdminClient()

  // Buscar exceções de prazo ativas (comunicados com título 'EXCECAO_PRAZO')
  const { data: excecoes } = await supabaseAdmin
    .from('comunicados')
    .select('conteudo, autor')
    .eq('titulo', 'EXCECAO_PRAZO')

  // Validar o prazo de envio
  const validacao = verificarPrazoEnvio(
    competencia_mes,
    competencia_ano,
    contrato_id,
    excecoes || []
  )

  if (!validacao.valido) {
    return { error: validacao.erro }
  }

  // Verifica se já existe relatório para este contrato nesta competência
  const query = supabaseAdmin
    .from('relatorios')
    .select('id')
    .eq('contrato_id', contrato_id)
    .eq('competencia_mes', competencia_mes)
    .eq('competencia_ano', competencia_ano)

  if (relatorio_id) {
    query.neq('id', relatorio_id)
  }

  const { data: existente } = await query.maybeSingle()

  if (existente) {
    return { error: 'Já existe um relatório submetido para este contrato neste mês/ano.' }
  }

  const jsonbFields = {
    ...(verificacoes !== undefined ? { verificacoes } : {}),
    ...(documentos !== undefined ? { documentos } : {}),
  }

  if (relatorio_id) {
    const { error: updateError } = await supabaseAdmin
      .from('relatorios')
      .update({
        competencia_mes,
        competencia_ano,
        fiscalizacao_realizada,
        servico_conforme,
        documentacao_apresentada,
        ocorrencias,
        pendencias,
        observacoes,
        ...jsonbFields,
        status: 'ENVIADO',
        data_envio: new Date().toISOString()
      })
      .eq('id', relatorio_id)

    if (updateError) {
      console.error('Erro ao atualizar relatório:', updateError)
      return { error: 'Erro ao atualizar relatório. Tente novamente.' }
    }
  } else {
    const { error: insertError } = await supabaseAdmin.from('relatorios').insert({
      contrato_id,
      competencia_mes,
      competencia_ano,
      fiscal_id: user.id,
      tipo_fiscal,
      fiscalizacao_realizada,
      servico_conforme,
      documentacao_apresentada,
      ocorrencias,
      pendencias,
      observacoes,
      ...jsonbFields,
      status: 'ENVIADO'
    })

    if (insertError) {
      console.error('Erro ao inserir relatório:', insertError)
      return { error: 'Erro ao enviar relatório. Tente novamente.' }
    }
  }

  // Registra no Log via Admin Client
  await supabaseAdmin.from('logs').insert({
    usuario: user.id,
    cpf: 'SISTEMA',
    perfil: 'FISCAL',
    operacao: relatorio_id ? 'ATUALIZACAO_RELATORIO' : 'ENVIO_RELATORIO',
    descricao: relatorio_id
      ? `Relatório da competência ${competencia_mes}/${competencia_ano} atualizado e resubmetido.`
      : `Relatório da competência ${competencia_mes}/${competencia_ano} submetido para o contrato.`
  })

  revalidatePath('/dashboard/meus-contratos')
  revalidatePath('/dashboard/relatorios')
  revalidatePath('/dashboard/meus-relatorios')
  if (relatorio_id) {
    revalidatePath(`/dashboard/relatorios/${relatorio_id}`)
  }

  return { success: true }
}


export async function analisarRelatorio(id: string, acao: 'APROVAR' | 'DEVOLVER', parecer: string) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  if (userData?.perfil !== 'ADMIN') {
    return { error: 'Permissão negada. Apenas Administradores podem analisar relatórios.' }
  }

  const statusMap = {
    'APROVAR': 'APROVADO',
    'DEVOLVER': 'DEVOLVIDO'
  }

  const { error: updateError } = await supabaseAdmin
    .from('relatorios')
    .update({
      status: statusMap[acao],
      parecer_administrador: parecer,
      data_aprovacao: acao === 'APROVAR' ? new Date().toISOString() : null
    })
    .eq('id', id)

  if (updateError) {
    return { error: 'Erro ao analisar relatório.' }
  }

  revalidatePath('/dashboard/relatorios')
  revalidatePath('/dashboard/fila')
  revalidatePath(`/dashboard/relatorios/${id}`)

  return { success: true }
}

export async function submitRelatoriosUnificados(
  competencia_mes: number,
  competencia_ano: number,
  relatorios: Array<{
    contrato_id: string
    tipo_fiscal: string
    fiscalizacao_realizada: boolean
    servico_conforme: boolean
    documentacao_apresentada: boolean
    ocorrencias: string
    pendencias: string
    observacoes: string
    verificacoes?: Record<string, any>
    documentos?: Record<string, any>
  }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const supabaseAdmin = createAdminClient()

  // Buscar exceções de prazo ativas
  const { data: excecoes } = await supabaseAdmin
    .from('comunicados')
    .select('conteudo, autor')
    .eq('titulo', 'EXCECAO_PRAZO')

  // Validar o prazo de envio para cada contrato
  for (const rel of relatorios) {
    const validacao = verificarPrazoEnvio(
      competencia_mes,
      competencia_ano,
      rel.contrato_id,
      excecoes || []
    )
    if (!validacao.valido) {
      const { data: contrato } = await supabaseAdmin
        .from('contratos')
        .select('numero_contrato')
        .eq('id', rel.contrato_id)
        .single()
      return { 
        error: `Contrato Nº ${contrato?.numero_contrato || 'N/A'}: ${validacao.erro}` 
      }
    }
  }

  for (const rel of relatorios) {
    const { data: existente } = await supabaseAdmin
      .from('relatorios')
      .select('id')
      .eq('contrato_id', rel.contrato_id)
      .eq('competencia_mes', competencia_mes)
      .eq('competencia_ano', competencia_ano)
      .maybeSingle()

    if (existente) {
      const { error: updateError } = await supabaseAdmin
        .from('relatorios')
        .update({
          fiscalizacao_realizada: rel.fiscalizacao_realizada,
          servico_conforme: rel.servico_conforme,
          documentacao_apresentada: rel.documentacao_apresentada,
          ocorrencias: rel.ocorrencias,
          pendencias: rel.pendencias,
          observacoes: rel.observacoes,
          ...(rel.verificacoes !== undefined ? { verificacoes: rel.verificacoes } : {}),
          ...(rel.documentos !== undefined ? { documentos: rel.documentos } : {}),
          status: 'ENVIADO',
          data_envio: new Date().toISOString()
        })
        .eq('id', existente.id)

      if (updateError) {
        console.error('Erro ao atualizar relatório unificado:', updateError)
        return { error: `Erro ao atualizar o relatório do contrato.` }
      }
    } else {
      const { error: insertError } = await supabaseAdmin.from('relatorios').insert({
        contrato_id: rel.contrato_id,
        competencia_mes,
        competencia_ano,
        fiscal_id: user.id,
        tipo_fiscal: rel.tipo_fiscal,
        fiscalizacao_realizada: rel.fiscalizacao_realizada,
        servico_conforme: rel.servico_conforme,
        documentacao_apresentada: rel.documentacao_apresentada,
        ocorrencias: rel.ocorrencias,
        pendencias: rel.pendencias,
        observacoes: rel.observacoes,
        ...(rel.verificacoes !== undefined ? { verificacoes: rel.verificacoes } : {}),
        ...(rel.documentos !== undefined ? { documentos: rel.documentos } : {}),
        status: 'ENVIADO'
      })

      if (insertError) {
        console.error('Erro ao inserir relatório unificado:', insertError)
        return { error: `Erro ao enviar o relatório do contrato.` }
      }
    }
  }

  await supabaseAdmin.from('logs').insert({
    usuario: user.id,
    cpf: 'SISTEMA',
    perfil: 'FISCAL',
    operacao: 'ENVIO_RELATORIO_UNIFICADO',
    descricao: `Relatório unificado enviado para o período ${competencia_mes}/${competencia_ano} contendo ${relatorios.length} contratos.`
  })

  revalidatePath('/dashboard/meus-contratos')
  revalidatePath('/dashboard/relatorios')
  revalidatePath('/dashboard/meus-relatorios')

  return { success: true }
}

export async function deleteRelatorio(id: string, passwordConfirm: string) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: currentUser } = await supabaseAdmin.from('users').select('perfil, cpf').eq('id', user.id).single()
  if (currentUser?.perfil !== 'ADMIN') {
    return { error: 'Apenas administradores podem excluir relatórios do histórico.' }
  }

  // Validar senha de confirmação do administrador
  if (!passwordConfirm) {
    return { error: 'A senha de confirmação é obrigatória.' }
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email || '',
    password: passwordConfirm
  })

  if (verifyError) {
    return { error: 'Senha de confirmação incorreta. Exclusão não autorizada.' }
  }

  // Primeiro obter detalhes do relatório para log de auditoria
  const { data: rel } = await supabaseAdmin
    .from('relatorios')
    .select('competencia_mes, competencia_ano, contrato:contratos(numero_contrato)')
    .eq('id', id)
    .single()

  const { error } = await supabaseAdmin
    .from('relatorios')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar relatório:', error)
    return { error: 'Erro ao excluir o relatório do banco de dados.' }
  }

  // Registrar no Log de auditoria
  const contratoStr = (rel?.contrato as any)?.numero_contrato ? ` do contrato ${(rel?.contrato as any).numero_contrato}` : ''
  await supabaseAdmin.from('logs').insert({
    usuario: user.id,
    cpf: currentUser.cpf || 'ADMIN',
    perfil: 'ADMIN',
    operacao: 'EXCLUIR_RELATORIO',
    descricao: `Relatório de competência ${rel?.competencia_mes}/${rel?.competencia_ano}${contratoStr} foi excluído permanentemente.`
  })

  revalidatePath('/dashboard/relatorios')
  revalidatePath('/dashboard/fila')
  return { success: true }
}

