import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ClipboardList, RefreshCw, ShieldCheck } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function FilaHomologacaoPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Busca relatórios que estão "ENVIADO" ou "EM_ANALISE" aguardando homologação
  const { data: fila } = await supabaseAdmin
    .from('relatorios')
    .select(`
      *,
      contrato:contratos!contrato_id(numero_contrato, empresa),
      fiscal:users!fiscal_id(nome, cpf)
    `)
    .in('status', ['ENVIADO', 'EM_ANALISE'])
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl shadow-sm min-h-full">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-yellow-500" />
            Fila de Homologação Administrativa
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Parecer técnico nos relatórios preenchidos pelos fiscais. Homologue ou devolva para correção com um clique.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#131924] hover:bg-[#1b2331] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md uppercase tracking-wider">
          <RefreshCw className="h-4 w-4" />
          Sincronizar Fila
        </button>
      </div>

      {(!fila || fila.length === 0) ? (
        <div className="bg-[#1b2331] rounded-xl shadow-lg border border-[#2a3441] flex flex-col items-center justify-center p-16">
          <ShieldCheck className="h-16 w-16 text-green-500 mb-6" strokeWidth={1.5} />
          <p className="text-gray-400 font-medium text-sm text-center">
            Todos os relatórios enviados já foram apreciados e homologados pela Seção.
          </p>
        </div>
      ) : (
        <div className="bg-[#1b2331] rounded-xl overflow-hidden shadow-md">
          {/* Se houver fila, renderizar uma tabela similar a do acervo, 
              mas por enquanto deixamos o empty state que o usuário mostrou na imagem,
              a menos que a query retorne algo. */}
          <div className="p-6">
            <p className="text-white">Há {fila.length} relatório(s) aguardando homologação.</p>
            {/* Aqui entraria a lista... */}
          </div>
        </div>
      )}

    </div>
  )
}
