import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Eye, Printer } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MeusRelatoriosPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca relatórios emitidos por este fiscal usando admin client para contornar RLS
  const { data: relatorios } = await supabaseAdmin
    .from('relatorios')
    .select(`
      *,
      contrato:contratos!contrato_id(numero_contrato, empresa)
    `)
    .eq('fiscal_id', user.id)
    .order('created_at', { ascending: false })

  function formatCompetencia(mes: number, ano: number) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${meses[mes - 1]}/${ano}`
  }

  function formatCompetenciaCompleta(mes: number, ano: number) {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return `${meses[mes - 1]} de ${ano}`
  }

  // Agrupa períodos únicos para disponibilizar a impressão unificada
  const periodosUnicosMap = new Map<string, { mes: number; ano: number; status: string; count: number }>()
  if (relatorios) {
    relatorios.forEach((rel) => {
      const key = `${rel.competencia_mes}/${rel.competencia_ano}`
      const existing = periodosUnicosMap.get(key)
      if (existing) {
        existing.count += 1
        if (rel.status !== 'APROVADO') {
          existing.status = 'PENDENTE'
        }
      } else {
        periodosUnicosMap.set(key, {
          mes: rel.competencia_mes,
          ano: rel.competencia_ano,
          status: rel.status === 'APROVADO' ? 'APROVADO' : 'PENDENTE',
          count: 1
        })
      }
    })
  }
  const periodosUnicos = Array.from(periodosUnicosMap.values())

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Meus Relatórios</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Acompanhe o status de aprovação dos seus relatórios mensais.
          </p>
        </div>
      </div>

      {periodosUnicos.length > 0 && (
        <Card className="shadow-lg border-[#2a3441] bg-[#1b2331] overflow-hidden text-white rounded-xl">
          <CardHeader className="pb-4 border-b border-[#2a3441] bg-[#131924]">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
              <Printer className="h-5 w-5 text-yellow-500" />
              Certidões Unificadas do Período
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {periodosUnicos.map((p) => (
              <div key={`${p.mes}/${p.ano}`} className="bg-[#131924] border border-[#2a3441] rounded-xl p-4 flex flex-col justify-between items-start gap-3">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Período</div>
                  <div className="text-sm font-black text-white mt-1">{formatCompetenciaCompleta(p.mes, p.ano)}</div>
                  <div className="text-[0.65rem] text-gray-400 mt-1 font-medium">{p.count} contrato(s) avaliado(s)</div>
                </div>
                <div className="flex w-full justify-between items-center mt-2 pt-2 border-t border-[#2a3441]/50">
                  <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    p.status === 'APROVADO' ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                  }`}>
                    {p.status === 'APROVADO' ? 'APROVADO' : 'EM ANÁLISE / DEV.'}
                  </span>
                  {p.status === 'APROVADO' ? (
                    <Link
                      href={`/dashboard/relatorios/unificado/${p.mes}/${p.ano}/imprimir`}
                      className="inline-flex items-center gap-1 bg-yellow-600 hover:bg-yellow-700 text-white px-2.5 py-1 rounded-lg font-bold text-[0.65rem] uppercase tracking-wider transition-colors"
                    >
                      <Printer className="h-3 w-3" />
                      Imprimir
                    </Link>
                  ) : (
                    <span className="text-[0.65rem] text-gray-500 font-bold uppercase">Aguardando Aprov.</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg border-[#2a3441] bg-[#1b2331] overflow-hidden text-white rounded-xl">
        <CardHeader className="pb-4 border-b border-[#2a3441] bg-[#131924]">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-yellow-500" />
            Meus Envios Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#131924] text-xs uppercase font-bold tracking-wider text-gray-400">
                <tr>
                  <th className="px-6 py-4">Contrato</th>
                  <th className="px-6 py-4">Competência</th>
                  <th className="px-6 py-4">Data de Envio</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Visualizar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a3441] bg-[#1b2331]">
                {!relatorios || relatorios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 font-medium">
                      Você ainda não enviou nenhum relatório.
                    </td>
                  </tr>
                ) : (
                  relatorios.map((rel) => (
                    <tr key={rel.id} className="hover:bg-[#202a3a] transition-colors">
                      <td className="px-6 py-4 font-bold text-white text-sm">
                        <div className="font-extrabold">{String((rel.contrato as any)?.numero_contrato || '')}</div>
                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                          {String((rel.contrato as any)?.empresa || '')}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-white text-sm">
                        {formatCompetencia(rel.competencia_mes, rel.competencia_ano)}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {rel.data_envio ? new Date(rel.data_envio).toLocaleDateString('pt-BR') : ''}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[0.65rem] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                          rel.status === 'APROVADO' ? 'border-green-500 text-green-400 bg-green-500/10' :
                          rel.status === 'DEVOLVIDO' ? 'border-red-500 text-red-400 bg-red-500/10' :
                          rel.status === 'ENVIADO' ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' :
                          'border-blue-500 text-blue-400 bg-blue-500/10'
                        }`}>
                          {rel.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link 
                          href={`/dashboard/relatorios/${rel.id}`} 
                          className="inline-flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 p-1.5 rounded-lg transition-colors"
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden divide-y divide-[#2a3441] bg-[#1b2331]">
            {!relatorios || relatorios.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-medium p-4">
                Você ainda não enviou nenhum relatório.
              </div>
            ) : (
              relatorios.map((rel) => (
                <div key={rel.id} className="p-5 space-y-3 hover:bg-[#202a3a] transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="text-[0.65rem] font-extrabold text-yellow-500 uppercase tracking-widest">Contrato</div>
                      <div className="text-sm font-black text-white mt-0.5">{(rel.contrato as any)?.numero_contrato}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5">{(rel.contrato as any)?.empresa}</div>
                    </div>
                    <span className={`text-[0.6rem] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      rel.status === 'APROVADO' ? 'border-green-500 text-green-400 bg-green-500/10' :
                      rel.status === 'DEVOLVIDO' ? 'border-red-500 text-red-400 bg-red-500/10' :
                      rel.status === 'ENVIADO' ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' :
                      'border-blue-500 text-blue-400 bg-blue-500/10'
                    }`}>
                      {rel.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#2a3441]/50 text-xs">
                    <div>
                      <div className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-wider">Competência</div>
                      <div className="font-bold text-white mt-0.5">{formatCompetencia(rel.competencia_mes, rel.competencia_ano)}</div>
                    </div>
                    <div>
                      <div className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-wider">Data de Envio</div>
                      <div className="text-gray-300 mt-0.5">{rel.data_envio ? new Date(rel.data_envio).toLocaleDateString('pt-BR') : ''}</div>
                    </div>
                    <Link 
                      href={`/dashboard/relatorios/${rel.id}`} 
                      className="inline-flex items-center justify-center bg-[#131924] hover:bg-[#1b2331] text-gray-300 hover:text-white p-2 rounded-xl border border-[#2a3441] transition-colors"
                      title="Ver Detalhes"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
