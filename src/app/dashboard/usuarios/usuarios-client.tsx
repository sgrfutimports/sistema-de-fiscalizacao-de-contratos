'use client'

import { useState } from 'react'
import { Mail, Phone, Search } from 'lucide-react'
import { NovoUsuarioDialog } from '@/components/dashboard/novo-usuario-dialog'
import { ResetarSenhaButton } from '@/components/dashboard/resetar-senha-button'
import { EditarUsuarioDialog } from '@/components/dashboard/editar-usuario-dialog'
import { ExcluirUsuarioButton } from '@/components/dashboard/excluir-usuario-button'

export function UsuariosClient({ 
  initialUsuarios, 
  currentUser 
}: { 
  initialUsuarios: any[], 
  currentUser: any 
}) {
  const [busca, setBusca] = useState('')
  const [filtroPerfil, setFiltroPerfil] = useState('Todos Perfis')
  const [filtroStatus, setFiltroStatus] = useState('Todos Status')

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

  // Filtragem
  const usuariosFiltrados = initialUsuarios.filter(usr => {
    // Busca textual
    const termo = busca.toLowerCase()
    const matchBusca = !termo || 
      (usr.nome && usr.nome.toLowerCase().includes(termo)) ||
      (usr.nome_guerra && usr.nome_guerra.toLowerCase().includes(termo)) ||
      (usr.cpf && usr.cpf.includes(termo)) ||
      (usr.email && usr.email.toLowerCase().includes(termo)) ||
      (usr.posto_graduacao && usr.posto_graduacao.toLowerCase().includes(termo))

    // Filtro Perfil
    const matchPerfil = filtroPerfil === 'Todos Perfis' || 
      (filtroPerfil === 'Administrador' && usr.perfil === 'ADMIN') ||
      (filtroPerfil === 'Fiscal' && (usr.perfil === 'FISCAL_TITULAR' || usr.perfil === 'FISCAL_SUBSTITUTO'))

    // Filtro Status
    const matchStatus = filtroStatus === 'Todos Status' ||
      (filtroStatus === 'Ativo' && usr.ativo === true) ||
      (filtroStatus === 'Inativo' && usr.ativo === false)

    return matchBusca && matchPerfil && matchStatus
  })

  return (
    <div className="space-y-6">
      {/* Barra de Pesquisa e Filtros (Adaptivo) */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between rounded-xl p-4 bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome, posto/graduação, CPF ou e-mail militar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 outline-none text-sm text-gray-700 dark:text-white bg-slate-50 dark:bg-gray-900/40 rounded-lg placeholder-gray-400 focus:ring-1 focus:ring-yellow-500/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={filtroPerfil}
            onChange={(e) => setFiltroPerfil(e.target.value)}
            className="bg-slate-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm px-4 py-2 rounded-lg outline-none w-full md:w-auto cursor-pointer"
          >
            <option>Todos Perfis</option>
            <option>Administrador</option>
            <option>Fiscal</option>
          </select>
          <select 
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-slate-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm px-4 py-2 rounded-lg outline-none w-full md:w-auto cursor-pointer"
          >
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
              {!usuariosFiltrados || usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Nenhum militar encontrado com esses filtros.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usr) => (
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
                        {usr.id !== currentUser?.id && (
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
