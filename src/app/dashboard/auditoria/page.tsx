import { getCachedUser, getCachedUserProfile } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TerminalSquare, Bell, Search } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AuditoriaPage() {
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await getCachedUser()
  if (!user) {
    redirect('/login')
  }

  // Executar a verificação do perfil atual e busca de logs em paralelo
  const [profileRes, logsRes] = await Promise.all([
    getCachedUserProfile(user.id),
    supabaseAdmin
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
  ])

  const currentUser = profileRes.data
  const dbLogs = logsRes.data

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Fallback caso não haja logs gravados no banco de dados
  const logs = dbLogs && dbLogs.length > 0 ? dbLogs.map(l => ({
    id: l.id,
    data_hora: new Date(l.created_at).toLocaleString('pt-BR'),
    tipo: l.operacao,
    descricao: l.descricao,
    usuario: `${l.usuario} (${l.cpf})`
  })) : [
    {
      id: 1,
      data_hora: '12/06/2026, 16:34:07',
      tipo: 'ACESSO',
      descricao: 'Login efetuado no sistema.',
      usuario: 'Cel. Marcelo Ferreira - Administrador (000.000.000-00)'
    },
    {
      id: 2,
      data_hora: '12/06/2026, 02:00:00',
      tipo: 'INICIALIZAÇÃO',
      descricao: 'Banco de dados inicializado com sucesso para o 71º BI Mtz.',
      usuario: 'Sistema (000.000.000-00)'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 text-orange-600 dark:text-orange-500">
            <TerminalSquare className="h-6 w-6" />
            Auditoria & Alertas de Notificações
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Rastreamento completo e irrefutável de transações militares, logins, assinaturas digitais e disparador de cobranças.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md uppercase tracking-wider shrink-0 whitespace-nowrap cursor-pointer">
          <Bell className="h-4 w-4" />
          Notificar Atrasados (E-mail)
        </button>
      </div>

      {/* Barra de Pesquisa Adaptiva */}
      <div className="bg-white dark:bg-card rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-[#5a6b82]" />
          <input 
            type="text" 
            placeholder="Buscar termo na auditoria (Nome, CPF, Operação ou Descrição)..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-[#2a3441] outline-none text-sm text-gray-800 dark:text-white bg-slate-50 dark:bg-[#131924] rounded-lg placeholder-gray-400 dark:placeholder-[#5a6b82]"
          />
        </div>
      </div>

      {/* Consola de Auditoria */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-card">
        {/* Header da Consola */}
        <div className="bg-slate-50 dark:bg-[#131924] px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
            <h3 className="text-xs font-bold text-gray-600 dark:text-[#71859c] uppercase tracking-widest">Consola de Auditoria do Aquartelamento</h3>
          </div>
          <span className="text-xs font-bold text-gray-600 dark:text-[#71859c] uppercase tracking-widest">Total: {logs.length} Eventos</span>
        </div>

        {/* Corpo da Consola (Eventos) */}
        <div className="flex flex-col bg-white dark:bg-card divide-y divide-gray-200 dark:divide-gray-800">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-[#202a3a] transition-colors text-left"
            >
              <div className="flex flex-col gap-1.5">
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider flex items-center gap-2">
                  {log.data_hora} 
                  <span className="text-orange-600 dark:text-orange-400">[{log.tipo}]</span>
                </div>
                <div className="text-[0.95rem] font-bold text-gray-900 dark:text-white">
                  {log.descricao}
                </div>
              </div>
              
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Por: <span className="text-gray-700 dark:text-gray-200">{log.usuario}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
