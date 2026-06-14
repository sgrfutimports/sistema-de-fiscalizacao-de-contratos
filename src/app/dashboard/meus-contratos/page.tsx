import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FileSignature, PlusCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default async function MeusContratosPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca apenas contratos onde o usuário é titular ou substituto usando o admin client para ignorar RLS
  const { data: contratos } = await supabaseAdmin
    .from('contratos')
    .select('*')
    .or(`fiscal_titular_id.eq.${user.id},fiscal_substituto_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  function getStatusColor(status: string) {
    switch (status) {
      case 'ATIVO': return 'border-green-500 text-green-400 bg-green-500/10'
      case 'SUSPENSO': return 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
      case 'ENCERRADO': return 'border-red-500 text-red-400 bg-red-500/10'
      default: return 'border-gray-500 text-gray-400 bg-gray-500/10'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Meus Contratos</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Contratos em que você está vinculado como Titular ou Substituto.
          </p>
        </div>
        {contratos && contratos.length > 0 && (
          <Link
            href="/dashboard/relatorios/novo-unificado"
            className="inline-flex items-center gap-1.5 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-md uppercase tracking-wider"
          >
            <PlusCircle className="h-4 w-4" />
            Emitir Relatório Unificado
          </Link>
        )}
      </div>

      <Card className="shadow-lg border-[#2a3441] bg-[#1b2331] overflow-hidden text-white rounded-xl">
        <CardHeader className="pb-4 border-b border-[#2a3441] bg-[#131924]">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
            <FileSignature className="h-5 w-5 text-yellow-500" />
            Contratos Vinculados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#131924] text-xs uppercase font-bold tracking-wider text-gray-400">
                <tr>
                  <th className="px-6 py-4">Contrato</th>
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4 text-center">Seu Papel</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a3441] bg-[#1b2331]">
                {!contratos || contratos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 font-medium">
                      Nenhum contrato vinculado a você no momento.
                    </td>
                  </tr>
                ) : (
                  contratos.map((cont) => {
                    const papel = cont.fiscal_titular_id === user.id ? 'Titular' : 'Substituto'
                    
                    return (
                      <tr key={cont.id} className="hover:bg-[#202a3a] transition-colors">
                        <td className="px-6 py-4 font-extrabold text-white text-sm whitespace-nowrap">
                          {cont.numero_contrato}
                        </td>
                        <td className="px-6 py-4 font-bold text-white text-sm">
                          {cont.empresa}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[0.65rem] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                            papel === 'Titular' ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                          }`}>
                            {papel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[0.65rem] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                            getStatusColor(cont.status)
                          }`}>
                            {cont.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link 
                            href={`/dashboard/relatorios/novo/${cont.id}`} 
                            className="inline-flex items-center gap-1.5 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-md uppercase"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            Emitir Relatório
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden divide-y divide-[#2a3441] bg-[#1b2331]">
            {!contratos || contratos.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-medium p-4">
                Nenhum contrato vinculado a você no momento.
              </div>
            ) : (
              contratos.map((cont) => {
                const papel = cont.fiscal_titular_id === user.id ? 'Titular' : 'Substituto'
                
                return (
                  <div key={cont.id} className="p-5 space-y-4 hover:bg-[#202a3a] transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="text-[0.65rem] font-extrabold text-yellow-500 uppercase tracking-widest">Nº Contrato</div>
                        <div className="text-sm font-black text-white mt-0.5">{cont.numero_contrato}</div>
                      </div>
                      <span className={`text-[0.6rem] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        getStatusColor(cont.status)
                      }`}>
                        {cont.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-[0.65rem] font-extrabold text-gray-400 uppercase tracking-widest">Empresa</div>
                      <div className="text-xs font-bold text-white mt-0.5">{cont.empresa}</div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-[#2a3441]/50">
                      <div>
                        <div className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-wider">Papel</div>
                        <span className={`inline-block text-[0.6rem] font-bold px-2 py-0.5 rounded border uppercase tracking-wider mt-1 ${
                          papel === 'Titular' ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                        }`}>
                          {papel}
                        </span>
                      </div>

                      <Link 
                        href={`/dashboard/relatorios/novo/${cont.id}`} 
                        className="inline-flex items-center gap-1.5 bg-yellow-600 hover:bg-yellow-700 text-white px-3.5 py-2 rounded-xl font-bold text-[0.7rem] transition-colors shadow-md uppercase tracking-wider"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        Emitir Relatório
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
