import { getCachedUser, getCachedUserProfile } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, PlusCircle, Search, Shield, User } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { EditarContratoDialog } from '@/components/dashboard/editar-contrato-dialog'
import { ExcluirContratoButton } from '@/components/dashboard/excluir-contrato-button'
import { FiltrosContratos } from '@/components/dashboard/filtros-contratos'

export default async function ContratosPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    q?: string
  }>
}) {
  const resolvedParams = await searchParams
  const activeStatus = resolvedParams.status
  const searchQuery = resolvedParams.q

  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await getCachedUser()
  if (!user) {
    redirect('/login')
  }
  const { data: currentUser } = await getCachedUserProfile(user.id)

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Executar consultas de fiscais e contratos em paralelo para otimizar latência
  const [fiscaisRes, rawContratosRes] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, nome, perfil, posto_graduacao, nome_guerra')
      .eq('ativo', true),
    supabaseAdmin
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
  ])

  const fiscais = fiscaisRes.data
  const rawContratos = rawContratosRes.data

  const contratos = (rawContratos || []).filter((cont) => {
    if (activeStatus && activeStatus !== 'TODOS' && cont.status !== activeStatus) {
      return false
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const numContrato = cont.numero_contrato?.toLowerCase() || ''
      const empresa = cont.empresa?.toLowerCase() || ''
      const objeto = cont.objeto?.toLowerCase() || ''
      const titularNome = cont.titular?.nome?.toLowerCase() || ''
      const titularGuerra = cont.titular?.nome_guerra?.toLowerCase() || ''
      const substitutoNome = cont.substituto?.nome?.toLowerCase() || ''
      const substitutoGuerra = cont.substituto?.nome_guerra?.toLowerCase() || ''

      const matches =
        numContrato.includes(q) ||
        empresa.includes(q) ||
        objeto.includes(q) ||
        titularNome.includes(q) ||
        titularGuerra.includes(q) ||
        substitutoNome.includes(q) ||
        substitutoGuerra.includes(q)

      if (!matches) return false
    }
    return true
  })

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
    <div className="space-y-8">
      {/* Cabeçalho Oficial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#133215] dark:text-yellow-500 flex items-center gap-2">
            <FileText className="h-6 w-6 text-yellow-500" />
            Contratos Administrativos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Gestão e atribuição de encargo de fiscalização aos militares do batalhão.
          </p>
        </div>
        <Link href="/dashboard/contratos/novo" className="flex items-center gap-2 bg-[#133215] hover:bg-[#1B3B22] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md">
          <PlusCircle className="h-4 w-4 text-yellow-500" />
          CADASTRAR CONTRATO
        </Link>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <FiltrosContratos 
        initialFilters={{
          status: activeStatus,
          search: searchQuery,
        }}
      />

      {/* Grid de Cards de Contrato */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!contratos || contratos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 font-medium border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-card">
            Nenhum contrato cadastrado.
          </div>
        ) : (
          contratos.map((cont) => (
            <div key={cont.id} className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between">
              <div>
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[0.7rem] font-bold text-yellow-600 dark:text-yellow-500 tracking-wider">CONTRATO ADM.</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">Nº {cont.numero_contrato}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`font-bold px-3 py-1 uppercase tracking-wide text-[0.65rem] border ${getStatusColor(cont.status)}`}>
                      {cont.status}
                    </Badge>
                    <EditarContratoDialog contrato={cont} fiscais={fiscais || []} />
                    <ExcluirContratoButton contratoId={cont.id} numeroContrato={cont.numero_contrato} />
                  </div>
                </div>

                {/* Corpo do Card */}
                <div className="space-y-5">
                  <div>
                    <span className="text-[0.7rem] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">Empresa Contratada</span>
                    <p className="font-extrabold text-gray-900 dark:text-white text-base mt-0.5">{cont.empresa}</p>
                    <p className="text-[0.75rem] text-yellow-600 dark:text-yellow-500/90 font-mono mt-0.5">CNPJ: {cont.cnpj || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <span className="text-[0.7rem] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">Objeto do Contrato</span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-1 font-medium">{cont.objeto}</p>
                  </div>

                  {/* Fiscais do Contrato */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#131924]/50 border border-gray-100 dark:border-[#2a3441]/50">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[0.65rem] font-bold text-gray-400 dark:text-gray-500 block uppercase">Fiscal Titular</span>
                        <span className="text-xs font-bold text-gray-800 dark:text-white">
                          {cont.titular ? `${cont.titular.posto_graduacao} ${cont.titular.nome_guerra}` : 'Não vinculado'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[0.65rem] font-bold text-gray-400 dark:text-gray-500 block uppercase">Fiscal Substituto</span>
                        <span className="text-xs font-bold text-gray-800 dark:text-white">
                          {cont.substituto ? `${cont.substituto.posto_graduacao} ${cont.substituto.nome_guerra}` : 'Não vinculado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                <div>
                  <span className="text-[0.7rem] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">Valor Global</span>
                  <p className="font-extrabold text-yellow-600 dark:text-yellow-500 text-lg mt-0.5">{formatCurrency(cont.valor)}</p>
                </div>
                {cont.processo_administrativo && (
                  <div className="text-right">
                    <span className="text-[0.7rem] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">Processo</span>
                    <p className="font-bold text-gray-800 dark:text-white text-xs mt-0.5">{cont.processo_administrativo}</p>
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
