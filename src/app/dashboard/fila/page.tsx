import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ClipboardList, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import { FilaActions } from '@/components/dashboard/fila-actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FilaHomologacaoPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabaseAdmin
    .from('users')
    .select('perfil')
    .eq('id', user?.id)
    .single()

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Busca relatórios que estão "ENVIADO" ou "EM_ANALISE" aguardando homologação
  const { data: fila, error } = await supabaseAdmin
    .from('relatorios')
    .select(`
      *,
      contrato:contratos!contrato_id(numero_contrato, empresa),
      fiscal:users!fiscal_id(nome, cpf)
    `)
    .in('status', ['ENVIADO', 'EM_ANALISE'])
    .order('created_at', { ascending: true })

  const totalFila = fila?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-yellow-500" />
              Fila de Homologação Administrativa
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Parecer técnico nos relatórios preenchidos pelos fiscais. Homologue ou devolva para correção com um clique.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {totalFila > 0 && (
              <span className="bg-yellow-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                {totalFila} pendente{totalFila !== 1 ? 's' : ''}
              </span>
            )}
            <form action="/dashboard/fila">
              <button type="submit"
                className="flex items-center gap-2 bg-[#131924] hover:bg-[#1b2331] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md uppercase tracking-wider">
                <RefreshCw className="h-4 w-4" />
                Sincronizar Fila
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Erro de banco */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">Erro ao carregar a fila: {error.message}</p>
        </div>
      )}

      {/* Estado vazio */}
      {totalFila === 0 && !error && (
        <div className="bg-[#1b2331] rounded-xl shadow-lg border border-[#2a3441] flex flex-col items-center justify-center p-16">
          <ShieldCheck className="h-16 w-16 text-green-500 mb-6" strokeWidth={1.5} />
          <p className="text-gray-300 font-bold text-base text-center">Fila zerada!</p>
          <p className="text-gray-400 font-medium text-sm text-center mt-1">
            Todos os relatórios enviados já foram apreciados e homologados pela Seção.
          </p>
        </div>
      )}

      {/* Tabela da fila */}
      {totalFila > 0 && (
        <div className="bg-[#1b2331] rounded-xl shadow-lg border border-[#2a3441] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#2a3441] bg-[#131924]/80">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-500">
              Relatórios Aguardando Análise
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a3441] bg-[#131924]/50">
                  <th className="text-left px-4 py-2.5 text-[0.65rem] font-black uppercase tracking-wider text-gray-500">Contrato / Empresa</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] font-black uppercase tracking-wider text-gray-500">Fiscal</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] font-black uppercase tracking-wider text-gray-500">Competência</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] font-black uppercase tracking-wider text-gray-500">Status</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] font-black uppercase tracking-wider text-gray-500">Enviado em</th>
                  <th className="text-right px-4 py-2.5 text-[0.65rem] font-black uppercase tracking-wider text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {fila!.map((item) => (
                  <FilaActions key={item.id} item={item as any} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-[#2a3441] bg-[#131924]/50">
            <p className="text-[0.65rem] text-gray-500 font-medium">
              Total: <strong className="text-gray-300">{totalFila}</strong> relatório{totalFila !== 1 ? 's' : ''} aguardando homologação
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
