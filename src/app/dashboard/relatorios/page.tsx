import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Calendar, Printer, Eye } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FiltrosAuditoria } from '@/components/dashboard/filtros-auditoria'
import { ExcluirRelatorioButton } from '@/components/dashboard/excluir-relatorio-button'

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    contratoId?: string
    mes?: string
    ano?: string
    q?: string
  }>
}) {
  const resolvedParams = await searchParams
  const activeStatus = resolvedParams.status
  const activeContratoId = resolvedParams.contratoId
  const activeMes = resolvedParams.mes
  const activeAno = resolvedParams.ano
  const searchQuery = resolvedParams.q

  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Busca todos os contratos para popular o dropdown de filtros
  const { data: contratos } = await supabaseAdmin
    .from('contratos')
    .select('id, numero_contrato, empresa')
    .order('numero_contrato')

  // Busca relatórios com detalhes do contrato e fiscal
  const { data: rawRelatorios } = await supabaseAdmin
    .from('relatorios')
    .select(`
      *,
      contrato:contratos!contrato_id(numero_contrato, empresa, objeto),
      fiscal:users!fiscal_id(nome, cpf)
    `)
    .order('created_at', { ascending: false })

  // Extrai anos distintos de competência dos relatórios para o filtro de Exercício Ano
  const distinctYears = Array.from(
    new Set((rawRelatorios || []).map((r) => r.competencia_ano))
  ).sort((a, b) => b - a)

  // Filtra os relatórios em memória de forma robusta e dinâmica
  const relatorios = (rawRelatorios || []).filter((rel) => {
    if (activeStatus && activeStatus !== '-- Todos --' && rel.status !== activeStatus) {
      return false
    }
    if (activeContratoId && activeContratoId !== '-- Todos --' && rel.contrato_id !== activeContratoId) {
      return false
    }
    if (activeMes && activeMes !== '-- Todos --' && String(rel.competencia_mes) !== activeMes) {
      return false
    }
    if (activeAno && activeAno !== '-- Todos --' && String(rel.competencia_ano) !== activeAno) {
      return false
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const numContrato = rel.contrato?.numero_contrato?.toLowerCase() || ''
      const empresa = rel.contrato?.empresa?.toLowerCase() || ''
      const objeto = rel.contrato?.objeto?.toLowerCase() || ''
      const fiscalNome = rel.fiscal?.nome?.toLowerCase() || ''
      const fiscalCpf = rel.fiscal?.cpf || ''

      const matches =
        numContrato.includes(q) ||
        empresa.includes(q) ||
        objeto.includes(q) ||
        fiscalNome.includes(q) ||
        fiscalCpf.includes(q)

      if (!matches) return false
    }
    return true
  })

  function getStatusStyle(status: string) {
    switch (status) {
      case 'APROVADO': return 'border-green-500 text-green-400'
      case 'EM_ANALISE': return 'border-blue-500 text-blue-400'
      case 'ENVIADO': return 'border-yellow-500 text-yellow-400'
      case 'DEVOLVIDO': return 'border-red-500 text-red-400'
      case 'ARQUIVADO': return 'border-gray-500 text-gray-400'
      default: return 'border-gray-500 text-gray-400'
    }
  }

  function formatCompetencia(mes: number, ano: number) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${meses[mes - 1]}/${ano}`
  }

  function formatStatusLabel(status: string) {
    switch (status) {
      case 'ENVIADO': return 'Aguardando'
      case 'EM_ANALISE': return 'Em Análise'
      case 'APROVADO': return 'Aprovado'
      case 'DEVOLVIDO': return 'Devolvido'
      case 'ARQUIVADO': return 'Arquivado'
      default: return status
    }
  }

  const formatCPF = (cpf: string) => {
    if (!cpf) return ''
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const initialFilters = {
    status: activeStatus,
    contratoId: activeContratoId,
    mes: activeMes,
    ano: activeAno,
    search: searchQuery,
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#133215] dark:text-yellow-500 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-yellow-500" />
            Histórico e Acervo de Fiscalizações
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Histórico de registros submetido, em análise, pareceres emitidos e certidões eletrônicas militarizadas.
          </p>
        </div>
      </div>

      {/* Caixa de Filtros de Auditoria */}
      <FiltrosAuditoria 
        contratos={contratos || []} 
        anos={distinctYears} 
        initialFilters={initialFilters} 
      />

      {/* Tabela Responsiva */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-slate-50 dark:bg-gray-900/40 text-xs uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Contrato / Empresa</th>
                <th className="px-6 py-4 text-center">Competência</th>
                <th className="px-6 py-4">Fiscal Responsável</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Controles Adm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {!relatorios || relatorios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Nenhum relatório encontrado.
                  </td>
                </tr>
              ) : (
                relatorios.map((rel) => (
                  <tr key={rel.id} className="hover:bg-slate-50/50 dark:hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white mb-1">Contrato Nº {(rel.contrato as any)?.numero_contrato}</div>
                      <div className="text-[0.65rem] text-gray-500 dark:text-gray-400 tracking-wider">{(rel.contrato as any)?.empresa}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-300 text-center">
                      {formatCompetencia(rel.competencia_mes, rel.competencia_ano)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white mb-1">{(rel.fiscal as any)?.nome || 'Não definido'}</div>
                      <div className="text-[0.65rem] text-gray-500 dark:text-gray-400 tracking-wider">CPF: {formatCPF((rel.fiscal as any)?.cpf)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {rel.status === 'APROVADO' && <div className="h-2 w-2 rounded-full bg-green-500"></div>}
                        {rel.status === 'EM_ANALISE' && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                        {rel.status === 'ENVIADO' && <div className="h-2 w-2 rounded-full bg-yellow-500"></div>}
                        {rel.status === 'DEVOLVIDO' && <div className="h-2 w-2 rounded-full bg-red-500"></div>}
                        
                        <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusStyle(rel.status)}`}>
                          {formatStatusLabel(rel.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/relatorios/${rel.id}`} title={rel.status === 'APROVADO' ? "Visualizar Certidão" : "Visualizar Relatório"}>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-bold text-yellow-600 dark:text-yellow-500 border border-yellow-500/50 rounded hover:bg-yellow-500/10 transition-colors uppercase tracking-wider">
                            {rel.status === 'APROVADO' ? <Printer className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            {rel.status === 'APROVADO' ? 'Certidão / PDF' : 'Visualizar'}
                          </button>
                        </Link>
                        <ExcluirRelatorioButton 
                          relatorioId={rel.id} 
                          label={`Contrato Nº ${(rel.contrato as any)?.numero_contrato} - Competência ${formatCompetencia(rel.competencia_mes, rel.competencia_ano)}`} 
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
