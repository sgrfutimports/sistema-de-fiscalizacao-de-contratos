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
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#133215] dark:text-yellow-500 flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-yellow-500" />
              Fila de Homologação Administrativa
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Parecer técnico nos relatórios preenchidos pelos fiscais. Homologue ou devolva para correção com um clique.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {totalFila > 0 && (
              <span className="bg-amber-500/10 text-amber-600 border border-amber-500/30 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap flex items-center justify-center">
                {totalFila} pendente{totalFila !== 1 ? 's' : ''}
              </span>
            )}
            <form action="/dashboard/fila">
              <button type="submit"
                className="flex items-center gap-2 bg-[#133215] hover:bg-[#1B3B22] dark:bg-[#131924] dark:hover:bg-[#1b2331] text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors shadow-md uppercase tracking-wider whitespace-nowrap cursor-pointer">
                <RefreshCw className="h-3.5 w-3.5" />
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
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-16">
          <ShieldCheck className="h-16 w-16 text-green-600 dark:text-green-500 mb-6" strokeWidth={1.5} />
          <p className="text-gray-900 dark:text-white font-bold text-base text-center">Fila zerada!</p>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm text-center mt-1">
            Todos os relatórios enviados já foram apreciados e homologados pela Seção.
          </p>
        </div>
      )}

      {/* Tabela da fila */}
      {totalFila > 0 && (
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/40">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-500">
              Relatórios Aguardando Análise
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-700 dark:text-gray-300">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/40">
                  <th className="text-left px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Contrato / Empresa</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Fiscal</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Competência</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Enviado em</th>
                  <th className="text-right px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {fila!.map((item) => (
                  <FilaActions key={item.id} item={item as any} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/40">
            <p className="text-[0.65rem] text-gray-500 dark:text-gray-400 font-medium">
              Total: <strong className="text-gray-800 dark:text-gray-300">{totalFila}</strong> relatório{totalFila !== 1 ? 's' : ''} aguardando homologação
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
