import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Calendar, Filter, Printer, Eye, RotateCcw } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RelatoriosPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Busca relatórios com detalhes do contrato e fiscal (agora pedindo CPF também)
  const { data: relatorios } = await supabaseAdmin
    .from('relatorios')
    .select(`
      *,
      contrato:contratos!contrato_id(numero_contrato, empresa),
      fiscal:users!fiscal_id(nome, cpf)
    `)
    .order('created_at', { ascending: false })

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

  // Formatar CPF
  const formatCPF = (cpf: string) => {
    if (!cpf) return ''
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl shadow-sm min-h-full">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-yellow-500" />
            Histórico e Acervo de Fiscalizações
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Histórico de registros submetido, em análise, pareceres emitidos e certidões eletrônicas militarizadas.
          </p>
        </div>
      </div>

      {/* Caixa de Filtros de Auditoria (Azul Escuro) */}
      <div className="bg-[#1b2331] rounded-xl p-5 shadow-md border border-[#2a3441]">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-yellow-500" />
          <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider">Filtros de Auditoria</h3>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider">Situação do Relato</label>
              <select className="bg-[#131924] text-gray-300 text-xs px-3 py-2 rounded-lg border-none outline-none w-full appearance-none">
                <option>-- Todos --</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider">Contrato Específico</label>
              <select className="bg-[#131924] text-gray-300 text-xs px-3 py-2 rounded-lg border-none outline-none w-full appearance-none">
                <option>-- Todos --</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider">Competência Mês</label>
              <select className="bg-[#131924] text-gray-300 text-xs px-3 py-2 rounded-lg border-none outline-none w-full appearance-none">
                <option>-- Todos --</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider">Exercício Ano</label>
              <select className="bg-[#131924] text-gray-300 text-xs px-3 py-2 rounded-lg border-none outline-none w-full appearance-none">
                <option>-- Todos --</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider">Busca Livre</label>
              <input 
                type="text" 
                placeholder="Empresa, militar, objeto..." 
                className="bg-[#131924] text-gray-300 text-xs px-3 py-2 rounded-lg border-none outline-none w-full placeholder-gray-500"
              />
            </div>

          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 text-[0.65rem] font-bold text-yellow-500 border border-yellow-500/50 rounded-lg hover:bg-yellow-500/10 transition-colors uppercase tracking-wider whitespace-nowrap mt-4 lg:mt-0">
            <RotateCcw className="h-3 w-3" />
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Tabela Dark */}
      <div className="bg-[#1b2331] rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#131924] text-xs uppercase font-bold tracking-wider text-gray-400">
              <tr>
                <th className="px-6 py-4">Contrato / Empresa</th>
                <th className="px-6 py-4">Competência</th>
                <th className="px-6 py-4">Fiscal Responsável</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ação de Certidão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3441]">
              {!relatorios || relatorios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Nenhum relatório encontrado.
                  </td>
                </tr>
              ) : (
                relatorios.map((rel) => (
                  <tr key={rel.id} className="hover:bg-[#202a3a] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white mb-1">Contrato Nº {(rel.contrato as any)?.numero_contrato}</div>
                      <div className="text-[0.65rem] text-gray-500 tracking-wider">{(rel.contrato as any)?.empresa}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      {formatCompetencia(rel.competencia_mes, rel.competencia_ano)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white mb-1">{(rel.fiscal as any)?.nome || 'Não definido'}</div>
                      <div className="text-[0.65rem] text-gray-500 tracking-wider">CPF: {formatCPF((rel.fiscal as any)?.cpf)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {rel.status === 'APROVADO' && <div className="h-2 w-2 rounded-full bg-green-500"></div>}
                        {rel.status === 'EM_ANALISE' && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                        {rel.status === 'ENVIADO' && <div className="h-2 w-2 rounded-full bg-yellow-500"></div>}
                        {rel.status === 'DEVOLVIDO' && <div className="h-2 w-2 rounded-full bg-red-500"></div>}
                        
                        <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusStyle(rel.status)}`}>
                          {rel.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <Link href={`/dashboard/relatorios/${rel.id}`} title="Analisar Relatório">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-bold text-yellow-500 border border-yellow-500/50 rounded hover:bg-yellow-500/10 transition-colors uppercase tracking-wider">
                            {rel.status === 'APROVADO' ? <Printer className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            {rel.status === 'APROVADO' ? 'Certidão / PDF' : 'Analisar'}
                          </button>
                        </Link>
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
