import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CalendarClock, Unlock, Lock, AlertTriangle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function PrazosPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Busca contratos ativos para o select
  const { data: contratos } = await supabaseAdmin
    .from('contratos')
    .select('id, numero_contrato, empresa')
    .eq('status', 'ATIVO')
    .order('numero_contrato')

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl shadow-sm min-h-full">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-yellow-500" />
            Reabertura de Prazos
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Gerencie as exceções de prazo para envio de relatórios fora do 5º dia útil.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Coluna 1: Autorizar Nova Exceção */}
        <div className="bg-[#1b2331] rounded-xl shadow-md border border-[#2a3441] overflow-hidden flex flex-col h-full">
          <div className="bg-[#131924] px-5 py-4 border-b border-[#2a3441] flex items-center gap-2">
            <Unlock className="h-4 w-4 text-yellow-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Autorizar Nova Exceção</h3>
          </div>
          
          <div className="p-5 flex-1 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider">Contrato Administrativo *</label>
              <select className="bg-[#131924] text-gray-300 text-sm px-4 py-2.5 rounded-lg border-none outline-none w-full appearance-none shadow-inner">
                <option value="">-- Escolher Contrato Ativo --</option>
                {contratos?.map(c => (
                  <option key={c.id} value={c.id}>Contrato Nº {c.numero_contrato} - {c.empresa}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider">Mês de Referência *</label>
              <select className="bg-[#131924] text-gray-300 text-sm px-4 py-2.5 rounded-lg border-none outline-none w-full appearance-none shadow-inner">
                <option value="">-- Escolher Competência --</option>
                <option value="1">Janeiro</option>
                <option value="2">Fevereiro</option>
                <option value="3">Março</option>
                <option value="4">Abril</option>
                <option value="5">Maio</option>
                <option value="6">Junho</option>
                <option value="7">Julho</option>
                <option value="8">Agosto</option>
                <option value="9">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider">Exercício Ano *</label>
              <input 
                type="number" 
                defaultValue="2026"
                className="bg-[#131924] text-gray-300 text-sm px-4 py-2.5 rounded-lg border-none outline-none w-full shadow-inner"
              />
            </div>

            <div className="mt-auto pt-4">
              <div className="flex gap-3 items-start bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mb-6">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[0.7rem] text-yellow-500/90 font-medium leading-relaxed">
                  Esta ação desvia a validação ordinária de bloqueio do 5º dia útil para esta competência específica.
                </p>
              </div>

              <button className="w-full bg-[#1b5e20] hover:bg-[#2e7d32] text-white font-bold text-sm py-3 rounded-lg transition-colors shadow-md uppercase tracking-wide">
                Homologar Reabertura
              </button>
            </div>
          </div>
        </div>

        {/* Coluna 2: Exceções Vigentes */}
        <div className="bg-[#1b2331] rounded-xl shadow-md border border-[#2a3441] overflow-hidden flex flex-col h-full">
          <div className="bg-[#131924] px-5 py-4 border-b border-[#2a3441] flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Exceções Vigentes Homologadas</h3>
          </div>
          
          <div className="p-5 flex-1 flex flex-col items-center justify-center min-h-[300px]">
            <Lock className="h-12 w-12 text-[#2a3441] mb-4" strokeWidth={1} />
            <p className="text-gray-500 text-sm font-medium">Nenhuma exceção de prazo vigente no momento.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
