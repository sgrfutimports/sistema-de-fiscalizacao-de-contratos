import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TerminalSquare, Bell, Search } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AuditoriaPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Dados mockados baseados na imagem para evitar tela vazia caso não haja tabela real
  const logs = [
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
    <div className="space-y-8 bg-white p-6 rounded-xl shadow-sm min-h-full">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-orange-500">
            <TerminalSquare className="h-6 w-6" />
            &gt;_ Auditoria & Alertas de Notificações
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Rastreamento completo e irrefutável de transações militares, logins, assinaturas digitais e disparador de cobranças.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#ff9800] hover:bg-[#f57c00] text-black px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md uppercase tracking-wider">
          <Bell className="h-4 w-4" />
          Notificar Atrasados (E-mail)
        </button>
      </div>

      {/* Barra de Pesquisa Dark */}
      <div className="bg-[#1b2331] rounded-xl p-4 shadow-md">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5a6b82]" />
          <input 
            type="text" 
            placeholder="Buscar termo na auditoria (Nome, CPF, Operação ou Descrição)..."
            className="w-full pl-12 pr-4 py-3 border border-[#2a3441] outline-none text-sm text-white bg-[#131924] rounded-lg placeholder-[#5a6b82]"
          />
        </div>
      </div>

      {/* Consola de Auditoria */}
      <div className="rounded-xl overflow-hidden shadow-lg border border-[#0d1421]">
        {/* Header da Consola */}
        <div className="bg-[#0b101a] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
            <h3 className="text-xs font-bold text-[#71859c] uppercase tracking-widest">Consola de Auditoria do Aquartelamento</h3>
          </div>
          <span className="text-xs font-bold text-[#71859c] uppercase tracking-widest">Total: {logs.length} Eventos</span>
        </div>

        {/* Corpo da Consola (Eventos) */}
        <div className="flex flex-col bg-[#616c7c]">
          {logs.map((log, index) => (
            <div 
              key={log.id} 
              className={`px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${index !== logs.length - 1 ? 'border-b border-[#4f5968]' : ''}`}
            >
              <div className="flex flex-col gap-1.5">
                <div className="text-xs font-bold text-[#a6b1c2] tracking-wider flex items-center gap-2">
                  {log.data_hora} 
                  <span className="text-orange-400">[{log.tipo}]</span>
                </div>
                <div className="text-[0.95rem] font-medium text-white">
                  {log.descricao}
                </div>
              </div>
              
              <div className="text-xs font-bold text-[#a6b1c2]">
                Por: <span className="text-[#c1c9d6]">{log.usuario}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
