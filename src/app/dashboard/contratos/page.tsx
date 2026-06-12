import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, PlusCircle, Search } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ContratosPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Busca contratos
  const { data: contratos } = await supabaseAdmin
    .from('contratos')
    .select(`
      *
    `)
    .order('created_at', { ascending: false })

  function getStatusColor(status: string) {
    switch (status) {
      case 'ATIVO': return 'border-green-600 text-green-700 bg-green-50'
      case 'SUSPENSO': return 'border-yellow-600 text-yellow-700 bg-yellow-50'
      case 'ENCERRADO': return 'border-gray-600 text-gray-700 bg-gray-50'
      default: return 'border-gray-400 text-gray-600'
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
            <Card key={cont.id} className="shadow-sm border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
              <CardContent className="p-6">
                
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[0.65rem] font-bold text-yellow-600 tracking-wider">CONTRATO ADM.</span>
                    <h3 className="text-xl font-bold text-gray-800">Nº {cont.numero_contrato}</h3>
                  </div>
                  <Badge variant="outline" className={`font-bold px-3 py-0.5 uppercase tracking-wide text-[0.65rem] ${getStatusColor(cont.status)}`}>
                    {cont.status}
                  </Badge>
                </div>

                {/* Corpo do Card */}
                <div className="space-y-5">
                  <div>
                    <span className="text-[0.65rem] font-bold text-gray-500 tracking-wider uppercase">Empresa Contratada</span>
                    <p className="font-bold text-gray-800 text-sm">{cont.empresa}</p>
                    <p className="text-[0.65rem] text-gray-500 font-medium">CNPJ: {cont.cnpj || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <span className="text-[0.65rem] font-bold text-gray-500 tracking-wider uppercase">Objeto do Contrato</span>
                    <p className="text-xs text-gray-700 leading-snug line-clamp-2">{cont.objeto}</p>
                  </div>

                  <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-[0.65rem] font-bold text-gray-500 tracking-wider uppercase">Valor Global</span>
                      <p className="font-bold text-gray-800">{formatCurrency(cont.valor)}</p>
                    </div>
                    {/* Não temos PROCESSO no schema original, mas podemos deixar um fixo ou omitir. Adicionando como layout exige. */}
                    <div className="text-right">
                      <span className="text-[0.65rem] font-bold text-gray-500 tracking-wider uppercase">Processo</span>
                      <p className="font-bold text-gray-600 text-xs">PA N/A</p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
