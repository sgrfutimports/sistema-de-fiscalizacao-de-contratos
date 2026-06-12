'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function submitRelatorio(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const contrato_id = formData.get('contrato_id') as string
  const competencia_mes = parseInt(formData.get('competencia_mes') as string)
  const competencia_ano = parseInt(formData.get('competencia_ano') as string)
  const tipo_fiscal = formData.get('tipo_fiscal') as string
  const fiscalizacao_realizada = formData.get('fiscalizacao_realizada') === 'on'
  const servico_conforme = formData.get('servico_conforme') === 'on'
  const documentacao_apresentada = formData.get('documentacao_apresentada') === 'on'
  const ocorrencias = formData.get('ocorrencias') as string
  const pendencias = formData.get('pendencias') as string
  const observacoes = formData.get('observacoes') as string

  // Verifica se já existe relatório para este contrato nesta competência
  const { data: existente } = await supabase
    .from('relatorios')
    .select('id')
    .eq('contrato_id', contrato_id)
    .eq('competencia_mes', competencia_mes)
    .eq('competencia_ano', competencia_ano)
    .single()

  if (existente) {
    return { error: 'Já existe um relatório submetido para este contrato neste mês/ano.' }
  }

  const { error: insertError } = await supabase.from('relatorios').insert({
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
    status: 'ENVIADO'
  })

  if (insertError) {
    console.error('Erro ao inserir relatório:', insertError)
    return { error: 'Erro ao enviar relatório. Tente novamente.' }
  }

  // Registra no Log via RPC ou Admin Client (como Fiscal pode não ter permissão direta em logs avançados)
  const supabaseAdmin = createAdminClient()
  await supabaseAdmin.from('logs').insert({
    usuario: user.id,
    cpf: 'SISTEMA', // Podemos refinar depois
    perfil: 'FISCAL',
    operacao: 'ENVIO_RELATORIO',
    descricao: `Relatório da competência ${competencia_mes}/${competencia_ano} submetido para o contrato.`
  })

  revalidatePath('/dashboard/meus-contratos')
  revalidatePath('/dashboard/relatorios')
  revalidatePath('/dashboard/meus-relatorios')

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
  revalidatePath(`/dashboard/relatorios/${id}`)

  return { success: true }
}
