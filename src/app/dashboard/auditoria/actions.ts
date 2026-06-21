'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCachedUser, getCachedUserProfile } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail, gerarTemplateCobranca } from '@/lib/email/sender'

export async function listarAtrasados() {
  const supabaseAdmin = createAdminClient()
  
  // Exemplo simplificado: Busca fiscais que têm contratos ativos, mas poderíamos 
  // refinar para buscar apenas quem tem pendência real via left join em relatorios.
  const { data: contratos, error } = await supabaseAdmin
    .from('contratos')
    .select(`
      id, numero_contrato, objeto, 
      fiscal_id,
      fiscal:users!contratos_fiscal_id_fkey(id, nome_guerra, email)
    `)
    .eq('status', 'ATIVO')

  if (error || !contratos) return []

  // Filtra apenas os que têm e-mail cadastrado
  const atrasados = contratos
    .map(c => {
      // Supabase pode retornar como array ou objeto dependendo da tipagem gerada
      const fiscal = Array.isArray(c.fiscal) ? c.fiscal[0] : c.fiscal
      return {
        contrato_id: c.id,
        contrato_desc: `Nº ${c.numero_contrato} - ${c.objeto}`,
        fiscal_id: fiscal?.id,
        nome_fiscal: fiscal?.nome_guerra || 'Fiscal',
        email: fiscal?.email
      }
    })
    .filter(item => item.email)

  // Para simulação vamos limitar ou dedup
  const uniqueAtrasados = []
  const seenEmails = new Set()
  for (const item of atrasados) {
    if (!seenEmails.has(item.email)) {
      seenEmails.add(item.email)
      uniqueAtrasados.push(item)
    }
  }

  return uniqueAtrasados
}

export async function notificarAtrasados(lista: any[]) {
  try {
    const { data: { user } } = await getCachedUser()
    if (!user) return { error: 'Não autorizado.' }

    const profileRes = await getCachedUserProfile(user.id)
    if (profileRes.data?.perfil !== 'ADMIN') {
      return { error: 'Apenas administradores podem disparar notificações.' }
    }

    const supabaseAdmin = createAdminClient()
    let enviados = 0
    let falhas = 0

    for (const item of lista) {
      const html = gerarTemplateCobranca(item.nome_fiscal, item.contrato_desc)
      const envio = await sendEmail({
        to: item.email,
        subject: '⚠️ Pendência no Sistema de Fiscalização (Ação Necessária)',
        html
      })

      // Registrar no histórico de notificações_enviadas
      await supabaseAdmin.from('notificacoes_enviadas').insert({
        contrato_id: item.contrato_id,
        fiscal_id: item.fiscal_id,
        destinatario_email: item.email,
        destinatario_nome: item.nome_fiscal,
        tipo: 'COBRANCA_RELATORIO',
        status: envio.success ? 'ENVIADO' : 'FALHA',
        erro_log: envio.error || null
      })

      if (envio.success) enviados++
      else falhas++
    }

    // Registrar o log de auditoria global
    await supabaseAdmin.from('logs').insert({
      usuario: profileRes.data.nome_guerra || profileRes.data.nome_completo || 'Admin',
      cpf: profileRes.data.cpf,
      operacao: 'NOTIFICAÇÃO',
      descricao: `Disparo de e-mails em lote. Sucesso: ${enviados}, Falhas: ${falhas}.`,
    })

    revalidatePath('/dashboard/auditoria')

    return { 
      success: true, 
      message: `Disparo concluído: ${enviados} e-mails enviados${falhas > 0 ? `, ${falhas} falhas` : ''}.` 
    }
  } catch (error: any) {
    return { error: error.message || 'Erro ao realizar disparo de e-mails.' }
  }
}
