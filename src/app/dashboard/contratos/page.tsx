import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, PlusCircle, Search, Shield, User } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { EditarContratoDialog } from '@/components/dashboard/editar-contrato-dialog'

export default async function ContratosPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Busca lista de todos os usuários ativos para o modal de edição
  const { data: fiscais } = await supabaseAdmin
    .from('users')
    .select('id, nome, perfil, posto_graduacao, nome_guerra')
    .eq('ativo', true)

  // Busca contratos com dados dos fiscais associados
  const { data: contratos } = await supabaseAdmin
    .from('contratos')
    .select(`
      *,
      titular:users!fiscal_titular_id (
        id,
        nome,
        posto_graduacao,
        nome_guerra
      ),
      substituto:users!fiscal_substituto_id (
        id,
        nome,
        posto_graduacao,
        nome_guerra
      )
    `)
    .order('created_at', { ascending: false })

  function getStatusColor(status: string) {
    switch (status) {
      case 'ATIVO': return 'border-green-500 text-green-400 bg-green-500/10'
      case 'SUSPENSO': return 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
      case 'ENCERRADO': return 'border-red-500 text-red-400 bg-red-500/10'
      default: return 'border-gray-500 text-gray-400 bg-gray-500/10'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
  }

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl shadow-sm min-h-full">
      {/* Cabeçalho Oficial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="h-6 w-6 text-yellow-500" />
            Contratos Administrativos
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Gestão e atribuição de encargo de fiscalização aos militares do batalhão.
          </p>
        </div>
        <Link href="/dashboard/contratos/novo" className="flex items-center gap-2 bg-[#133215] hover:bg-[#1B3B22] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md">
          <PlusCircle className="h-4 w-4 text-yellow-500" />
          CADASTRAR CONTRATO
        </Link>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border rounded-lg p-3 bg-white shadow-sm">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por Nº Contrato, Empresa, Objeto ou Fiscal..."
            className="w-full pl-10 pr-4 py-2 border-none outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <span className="text-xs font-bold text-gray-700 whitespace-nowrap">FILTRO DE STATUS:</span>
          <div className="flex items-center gap-2">
            <button className="text-xs font-bold bg-[#133215] text-white px-3 py-1.5 rounded-md">TODOS</button>
            <button className="text-xs font-bold text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">ATIVO</button>
            <button className="text-xs font-bold text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">SUSPENSO</button>
            <button className="text-xs font-bold text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">ENCERRADO</button>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Contrato */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!contratos || contratos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 font-medium border-2 border-dashed rounded-xl">
            Nenhum contrato cadastrado.
          </div>
        ) : (
          contratos.map((cont) => (
            <div key={cont.id} className="bg-[#1b2331] rounded-xl border border-[#2a3441] overflow-hidden shadow-lg hover:shadow-xl transition-all p-6 flex flex-col justify-between">
              <div>
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[0.7rem] font-bold text-yellow-500 tracking-wider">CONTRATO ADM.</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">Nº {cont.numero_contrato}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`font-bold px-3 py-1 uppercase tracking-wide text-[0.65rem] border ${getStatusColor(cont.status)}`}>
                      {cont.status}
                    </Badge>
                    <EditarContratoDialog contrato={cont} fiscais={fiscais || []} />
                  </div>
                </div>

                {/* Corpo do Card */}
                <div className="space-y-5">
                  <div>
                    <span className="text-[0.7rem] font-bold text-gray-400 tracking-wider uppercase">Empresa Contratada</span>
                    <p className="font-extrabold text-white text-base mt-0.5">{cont.empresa}</p>
                    <p className="text-[0.75rem] text-yellow-500/90 font-mono mt-0.5">CNPJ: {cont.cnpj || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <span className="text-[0.7rem] font-bold text-gray-400 tracking-wider uppercase">Objeto do Contrato</span>
                    <p className="text-sm text-gray-300 leading-relaxed mt-1 font-medium">{cont.objeto}</p>
                  </div>

                  {/* Fiscais do Contrato */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg bg-[#131924]/50 border border-[#2a3441]/50">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[0.65rem] font-bold text-gray-400 block uppercase">Fiscal Titular</span>
                        <span className="text-xs font-bold text-white">
                          {cont.titular ? `${cont.titular.posto_graduacao} ${cont.titular.nome_guerra}` : 'Não vinculado'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[0.65rem] font-bold text-gray-400 block uppercase">Fiscal Substituto</span>
                        <span className="text-xs font-bold text-white">
                          {cont.substituto ? `${cont.substituto.posto_graduacao} ${cont.substituto.nome_guerra}` : 'Não vinculado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-[#2a3441] mt-6">
                <div>
                  <span className="text-[0.7rem] font-bold text-gray-400 tracking-wider uppercase">Valor Global</span>
                  <p className="font-extrabold text-yellow-500 text-lg mt-0.5">{formatCurrency(cont.valor)}</p>
                </div>
                {cont.processo_administrativo && (
                  <div className="text-right">
                    <span className="text-[0.7rem] font-bold text-gray-400 tracking-wider uppercase">Processo</span>
                    <p className="font-bold text-white text-xs mt-0.5">{cont.processo_administrativo}</p>
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}
