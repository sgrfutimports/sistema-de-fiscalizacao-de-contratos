import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Search, Mail, Phone, Edit, KeyRound } from 'lucide-react'
import { redirect } from 'next/navigation'
import { NovoUsuarioDialog } from '@/components/dashboard/novo-usuario-dialog'
import { ResetarSenhaButton } from '@/components/dashboard/resetar-senha-button'
import { EditarUsuarioDialog } from '@/components/dashboard/editar-usuario-dialog'
import { ExcluirUsuarioButton } from '@/components/dashboard/excluir-usuario-button'


export default async function UsuariosPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificação de segurança: apenas admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentUser } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  if (currentUser?.perfil !== 'ADMIN') {
    redirect('/dashboard') // Redireciona se não for admin
  }

  // Busca todos os usuários
  const { data: usuarios } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('nome')

  // Formatar CPF
  const formatCPF = (cpf: string) => {
    if (!cpf) return ''
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPerfil = (perfil: string) => {
    if (perfil === 'ADMIN') return 'Administrador'
    if (perfil === 'FISCAL_TITULAR') return 'Fiscal Titular'
    if (perfil === 'FISCAL_SUBSTITUTO') return 'Fiscal Substituto'
    return perfil
  }

  const getPerfilColor = (perfil: string) => {
    if (perfil === 'ADMIN') return 'border-purple-500 text-purple-400'
    if (perfil === 'FISCAL_TITULAR') return 'border-blue-500 text-blue-400'
    if (perfil === 'FISCAL_SUBSTITUTO') return 'border-amber-500 text-amber-400'
    return 'border-gray-500 text-gray-300'
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#133215] dark:text-yellow-500 flex items-center gap-2">
            <Shield className="h-6 w-6 text-yellow-500" />
            Cadastros de Oficiais & Praças
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Gestão operacional dos Fiscais Titulares/Substitutos e perfis administradores do sistema de contratos.
          </p>
        </div>
        <NovoUsuarioDialog />
      </div>

      {/* Barra de Pesquisa e Filtros (Adaptivo) */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between rounded-xl p-4 bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome, CPF ou e-mail militar..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 outline-none text-sm text-gray-700 dark:text-white bg-slate-50 dark:bg-gray-900/40 rounded-lg placeholder-gray-400 focus:ring-1 focus:ring-yellow-500/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select className="bg-slate-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm px-4 py-2 rounded-lg outline-none w-full md:w-auto cursor-pointer">
            <option>Todos Perfis</option>
            <option>Administrador</option>
            <option>Fiscal</option>
          </select>
          <select className="bg-slate-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm px-4 py-2 rounded-lg outline-none w-full md:w-auto cursor-pointer">
            <option>Todos Status</option>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>
        </div>
      </div>

      {/* Tabela Responsiva */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-slate-50 dark:bg-gray-900/40 text-xs uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-left">Militar</th>
                <th className="px-6 py-4 text-center">CPF</th>
                <th className="px-6 py-4 text-center">Contatos de Serviço</th>
                <th className="px-6 py-4 text-center">Função e Status</th>
                <th className="px-6 py-4 text-center">Controles Adm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {!usuarios || usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Nenhum militar encontrado.
                  </td>
                </tr>
              ) : (
                usuarios.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/50 dark:hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white mb-0.5">
                        {usr.posto_graduacao} {usr.nome_guerra}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{usr.nome}</div>
                      <div className="text-[0.65rem] text-gray-400 dark:text-gray-500 tracking-wider">Reg: USR-{usr.id.substring(0, 4).toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-center whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {formatCPF(usr.cpf)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-1 text-xs text-yellow-600 dark:text-yellow-500">
                          <Mail className="h-3 w-3" />
                          <span className="text-gray-600 dark:text-gray-300">{usr.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-500">
                          <Phone className="h-3 w-3" />
                          <span className="text-gray-600 dark:text-gray-300">{usr.telefone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          getPerfilColor(usr.perfil)
                        }`}>
                          {formatPerfil(usr.perfil)}
                        </span>
                        <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          usr.ativo ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-500/5' : 'border-red-500 text-red-600 dark:text-red-400 bg-red-500/5'
                        }`}>
                          {usr.ativo ? 'ATIVO' : 'INATIVO'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {usr.perfil !== 'ADMIN' && (
                          <ResetarSenhaButton userId={usr.id} userName={`${usr.posto_graduacao} ${usr.nome_guerra}`} />
                        )}
                        <EditarUsuarioDialog usuario={usr} />
                        {usr.id !== user?.id && (
                          <ExcluirUsuarioButton userId={usr.id} userName={`${usr.posto_graduacao} ${usr.nome_guerra}`} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
