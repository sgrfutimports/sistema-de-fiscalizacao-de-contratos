'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ComunicadosModal } from '@/components/dashboard/comunicados-modal'
import { VisibilityText } from '@/components/dashboard/visibility-text'
import { 
  FileSignature, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert,
  ClipboardList,
  Users,
  CalendarClock,
  Terminal,
  Settings,
  Search,
  TrendingUp,
  MessageCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Eye,
  X,
  FolderOpen
} from 'lucide-react'

interface Contrato {
  id: string
  numero_contrato: string
  empresa: string
  objeto: string
  valor: number
  status: string
  data_termino: string
  fiscal_titular_id: string
  fiscal_substituto_id: string
  titular: {
    posto_graduacao: string
    nome_guerra: string
  } | null
  substituto: {
    posto_graduacao: string
    nome_guerra: string
  } | null
}

interface Aviso {
  id: string
  titulo: string
  conteudo: string
  autor: string
  created_at: string
}

interface DashboardHomeClientProps {
  contratosAtivosCount: number
  contratosAtivos: Contrato[]
  relatoriosPendentesCount: number
  relatoriosAprovadosCount: number
  totalFiscaisCount: number
  avisos: Aviso[]
  unreadComunicados: any[]
  adminSuporte: {
    nome: string
    posto_graduacao: string
    nome_guerra: string
    telefone: string
  } | null
  whatsappLink: string
  userPerfil: string
  userNome: string
  userId: string
}

export function DashboardHomeClient({
  contratosAtivosCount,
  contratosAtivos,
  relatoriosPendentesCount,
  relatoriosAprovadosCount,
  totalFiscaisCount,
  avisos,
  unreadComunicados,
  adminSuporte,
  whatsappLink,
  userPerfil,
  userNome,
  userId
}: DashboardHomeClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false)
  
  const isAdmin = userPerfil === 'ADMIN'

  // Lida com parâmetros da URL (foco na busca ou abrir modal de alertas)
  useEffect(() => {
    // Foca na busca
    if (searchParams.get('focusSearch') === 'true' && searchInputRef.current) {
      searchInputRef.current.focus()
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    
    // Abre o modal de Alertas Críticos
    if (searchParams.get('show_alerts') === 'true') {
      setIsAlertsModalOpen(true)
      
      // Limpa o parâmetro da URL silenciosamente para permitir que o botão funcione novamente
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('show_alerts')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams])

  // Filtragem dos contratos
  const filteredContratos = contratosAtivos.filter(c => 
    c.numero_contrato.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.titular && c.titular.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.substituto && c.substituto.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Calcular contratos perto do vencimento (menos de 90 dias) para Alertas
  const now = new Date()
  const contratosVencimentoBreve = contratosAtivos.filter(c => {
    if (!c.data_termino) return false
    const term = new Date(c.data_termino)
    const diffTime = term.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 90
  })
  
  const alertasCount = contratosVencimentoBreve.length + unreadComunicados.length

  // Formatar valores monetários
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
  }

  // Definição das Ações Rápidas com base no perfil - Circular Grid estilo Banco do Brasil
  const quickActions = isAdmin ? [
    { title: 'Contratos', icon: FileSignature, url: '/dashboard/contratos', bg: 'bg-[#133215]/10 dark:bg-yellow-500/10 text-[#133215] dark:text-yellow-500' },
    { title: 'Comunicados', icon: ClipboardList, url: '/dashboard/comunicados', bg: 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
    { title: 'Histórico', icon: FileText, url: '/dashboard/relatorios', bg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' },
    { title: 'Homologação', icon: CheckCircle2, url: '/dashboard/fila', bg: 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400' },
    { title: 'Fiscais', icon: Users, url: '/dashboard/usuarios', bg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' },
    { title: 'Prazos', icon: CalendarClock, url: '/dashboard/prazos', bg: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' },
    { title: 'Logs', icon: Terminal, url: '/dashboard/auditoria', bg: 'bg-gray-500/10 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400' },
    { title: 'Configurações', icon: Settings, url: '/dashboard/perfil', bg: 'bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400' },
  ] : [
    { title: 'Contratos', icon: FileSignature, url: '/dashboard/meus-contratos', bg: 'bg-[#133215]/10 dark:bg-yellow-500/10 text-[#133215] dark:text-yellow-500' },
    { title: 'Histórico', icon: FileText, url: '/dashboard/meus-relatorios', bg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' },
    { title: 'Documentos', icon: FolderOpen, url: '/dashboard/documentos', bg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' },
    { title: 'Suporte Gestor', icon: MessageCircle, url: whatsappLink, external: true, bg: 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400' },
    { title: 'Configurações', icon: Settings, url: '/dashboard/perfil', bg: 'bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400' },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Modal de leitura obrigatória para Fiscais */}
      <ComunicadosModal comunicados={unreadComunicados} />

      {/* Card Resumo Principal - Layout Horizontal Premium (semelhante ao painel de saldos do BB) */}
      <div className="bg-gradient-to-r from-[#133215] to-[#102d13] p-5 sm:p-6 rounded-[20px] border border-yellow-500/20 shadow-lg relative overflow-hidden text-white">
        <div className="absolute top-[-50%] right-[-10%] h-[300px] w-[300px] rounded-full bg-yellow-500/5 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-50%] left-[-10%] h-[200px] w-[200px] rounded-full bg-white/5 blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> RESUMO GERAL DO PORTAL
            </span>
            <span className="text-[0.65rem] font-bold text-white/50">71º BI Mtz • Garanhuns/PE</span>
          </div>
          
          <div className="h-px bg-white/10 w-full" />
          
          {/* Métricas Horizontais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="flex flex-col">
              <span className="text-[0.65rem] font-bold text-gray-300 uppercase tracking-wider">Contratos Ativos</span>
              <span className="text-2xl font-black text-white mt-1">
                <VisibilityText value={contratosAtivosCount} />
              </span>
            </div>
            
            <div className="flex flex-col md:border-l md:border-white/10 md:pl-6">
              <span className="text-[0.65rem] font-bold text-gray-300 uppercase tracking-wider">
                {isAdmin ? 'Aguardando Análise' : 'Devolvidos p/ Ajuste'}
              </span>
              <span className="text-2xl font-black text-white mt-1">
                <VisibilityText value={relatoriosPendentesCount} />
              </span>
            </div>
            
            <div className="flex flex-col md:border-l md:border-white/10 md:pl-6">
              <span className="text-[0.65rem] font-bold text-gray-300 uppercase tracking-wider">
                {isAdmin ? 'Relatórios Aprovados' : 'Meus Enviados'}
              </span>
              <span className="text-2xl font-black text-white mt-1">
                <VisibilityText value={relatoriosAprovadosCount} />
              </span>
            </div>
            
            <button 
              onClick={() => setIsAlertsModalOpen(true)}
              className="flex flex-col text-left hover:bg-white/5 p-1 -m-1 rounded-lg transition-all focus:outline-none cursor-pointer group md:border-l md:border-white/10 md:pl-6"
            >
              <span className="text-[0.65rem] font-bold text-gray-300 uppercase tracking-wider group-hover:text-yellow-500 transition-colors">Alertas Críticos</span>
              <span className="text-2xl font-black text-yellow-500 mt-1 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                <VisibilityText value={alertasCount} />
                <span className="text-[0.6rem] font-black text-yellow-500/70 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 group-hover:bg-yellow-500/20 transition-all uppercase tracking-wider">
                  Ver Detalhes
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Grade de Ações Rápidas - Atalhos Circulares estilo Banco do Brasil */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-[#133215] dark:text-yellow-500 uppercase tracking-wider text-left pl-1">Ações Rápidas</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
          {quickActions.map((action, idx) => {
            const content = (
              <div className="flex flex-col items-center text-center group cursor-pointer">
                {/* Círculo Centralizado com Feedback ao Toque */}
                <div className={`h-12 w-12 rounded-full ${action.bg} flex items-center justify-center mb-1.5 transition-all duration-300 transform group-hover:scale-110 active:scale-90 shadow-sm border border-black/5`}>
                  <action.icon className="h-5 w-5" />
                </div>
                {/* Texto abaixo */}
                <span className="text-[0.65rem] font-extrabold text-gray-600 dark:text-gray-300 group-hover:text-[#133215] dark:group-hover:text-yellow-500 transition-colors leading-tight text-center w-full max-w-[80px] break-words line-clamp-2">
                  {action.title}
                </span>
              </div>
            )

            if ('external' in action && action.external) {
              return (
                <a key={idx} href={action.url} target="_blank" rel="noopener noreferrer" className="block focus:outline-none">
                  {content}
                </a>
              )
            }

            return (
              <Link key={idx} href={action.url} className="block focus:outline-none">
                {content}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Grid de Cards de Dashboard Compactos (exibição premium de 2 por linha no celular) */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-[#133215] dark:text-yellow-500 uppercase tracking-wider text-left pl-1">Indicadores e Métricas</h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <Card className="rounded-[20px] shadow-sm border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-4">
              <CardTitle className="text-[0.65rem] font-extrabold text-gray-400 dark:text-gray-300 uppercase tracking-wider leading-tight pr-2">Contratos Ativos</CardTitle>
              <div className="h-7 w-7 rounded-full bg-[#133215]/10 flex items-center justify-center text-[#133215] dark:text-[#a0c5a2]">
                <FileSignature className="h-3.5 w-3.5" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                <VisibilityText value={contratosAtivosCount} />
              </div>
              <div className="flex items-center gap-1 text-[0.6rem] font-bold text-green-600 dark:text-green-400 mt-1">
                <TrendingUp className="h-3 w-3 shrink-0" />
                <span>+0% em relação ao mês anterior</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="rounded-[20px] shadow-sm border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-4">
              <CardTitle className="text-[0.65rem] font-extrabold text-gray-400 dark:text-gray-300 uppercase tracking-wider leading-tight pr-2">
                {isAdmin ? 'Aguardando Análise' : 'Pendentes de Correção'}
              </CardTitle>
              <div className="h-7 w-7 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                <VisibilityText value={relatoriosPendentesCount} />
              </div>
              <div className="flex items-center gap-1 text-[0.6rem] font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                <span>● {relatoriosPendentesCount > 0 ? 'Exige atenção imediata' : 'Sem pendências ativas'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="rounded-[20px] shadow-sm border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-4">
              <CardTitle className="text-[0.65rem] font-extrabold text-gray-400 dark:text-gray-300 uppercase tracking-wider leading-tight pr-2">
                {isAdmin ? 'Aprovados' : 'Meus Enviados'}
              </CardTitle>
              <div className="h-7 w-7 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                <VisibilityText value={relatoriosAprovadosCount} />
              </div>
              <div className="flex items-center gap-1 text-[0.6rem] font-bold text-gray-500 dark:text-gray-400 mt-1">
                <span>Refere-se ao status global</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4 */}
          {isAdmin ? (
            <Card className="rounded-[20px] shadow-sm border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-4">
                <CardTitle className="text-[0.65rem] font-extrabold text-gray-400 dark:text-gray-300 uppercase tracking-wider leading-tight pr-2">Total de Fiscais</CardTitle>
                <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Users className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                  <VisibilityText value={totalFiscaisCount} />
                </div>
                <div className="flex items-center gap-1 text-[0.6rem] font-bold text-gray-500 dark:text-gray-400 mt-1">
                  <span>Fiscais ativos no batalhão</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-[20px] shadow-sm border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-4">
                <CardTitle className="text-[0.65rem] font-extrabold text-gray-400 dark:text-gray-300 uppercase tracking-wider leading-tight pr-2">Perfil de Acesso</CardTitle>
                <div className="h-7 w-7 rounded-full bg-[#133215]/10 flex items-center justify-center text-[#133215] dark:text-[#a0c5a2]">
                  <ShieldAlert className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-sm font-black text-gray-800 dark:text-white tracking-tight uppercase truncate">
                  {userPerfil === 'FISCAL_TITULAR' ? 'FISCAL TITULAR' : 'FISCAL SUBST.'}
                </div>
                <div className="flex items-center gap-1 text-[0.6rem] font-bold text-gray-500 dark:text-gray-400 mt-1.5">
                  <span>Permissão restrita de fiscal</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Campo de Busca de Contratos Rápida - Padrão de Barra de Busca Bancária */}
      <div className="relative max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
          <Search className="h-5 w-5" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar contratos por número, empresa ou objeto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-gray-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 text-sm font-semibold shadow-sm focus:outline-none transition-all placeholder:text-gray-400 text-gray-800 dark:text-white"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-black text-[#133215] dark:text-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400"
          >
            LIMPAR
          </button>
        )}
      </div>

      {/* Grid Principal: Contratos e Comunicados */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        
        {/* Bloco de Contratos Filtrados */}
        <Card className="col-span-1 lg:col-span-4 shadow-sm border-gray-100 dark:border-gray-800 rounded-[20px] overflow-hidden bg-card">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 py-4 px-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-black text-[#133215] dark:text-yellow-500 uppercase tracking-wider">Visão Geral de Contratos Ativos</CardTitle>
              <span className="text-[0.65rem] font-bold bg-[#133215]/10 dark:bg-yellow-500/15 text-[#133215] dark:text-yellow-500 px-2 py-0.5 rounded-full uppercase">
                {filteredContratos.length} contratos
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 h-[350px] overflow-y-auto">
            {filteredContratos.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-muted-foreground text-center p-6">
                <FileSignature className="h-10 w-10 text-[#133215] dark:text-yellow-500 mb-3 opacity-60" />
                <p className="font-bold text-gray-700 dark:text-gray-200">Nenhum contrato encontrado</p>
                <p className="text-xs mt-1 max-w-xs text-gray-400 dark:text-gray-500">Verifique os termos de pesquisa ou confira os vínculos nas configurações do sistema.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredContratos.map((contrato) => {
                  const isTitular = contrato.fiscal_titular_id === userId
                  const roleLabel = isAdmin 
                    ? null 
                    : isTitular ? 'Titular' : 'Substituto'

                  const dataTerminoFormatada = contrato.data_termino 
                    ? contrato.data_termino.split('-').reverse().join('/')
                    : 'Não informada'

                  return (
                    <div key={contrato.id} className="p-4 rounded-2xl bg-white dark:bg-card/40 border border-gray-100 dark:border-gray-800 space-y-3 hover:border-yellow-500/30 dark:hover:border-yellow-500/50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-left">
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[0.65rem] font-black text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-2.5 py-0.5 rounded-full border border-yellow-500/20 dark:border-yellow-500/30 uppercase tracking-widest">
                            CONTRATO Nº {contrato.numero_contrato}
                          </span>
                          {roleLabel && (
                            <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                              roleLabel === 'Titular' ? 'border-green-500/50 text-green-600 dark:text-green-400 bg-green-500/10' : 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10'
                            }`}>
                              {roleLabel}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-black text-yellow-600 dark:text-yellow-400 bg-yellow-500/5 dark:bg-yellow-500/10 px-2.5 py-0.5 rounded-full">
                          <VisibilityText value={formatCurrency(contrato.valor)} />
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-wider">Empresa</div>
                          <div className="font-extrabold text-[#133215] dark:text-white truncate max-w-[220px]" title={contrato.empresa}>{contrato.empresa}</div>
                        </div>
                        <div className="space-y-0.5 sm:text-right">
                          <div className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-wider">Vigência até</div>
                          <div className="font-extrabold text-gray-700 dark:text-gray-200">{dataTerminoFormatada}</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[0.7rem]">
                        <div>
                          <span className="font-bold block text-[0.6rem] uppercase tracking-wider text-gray-400">Fiscal Titular</span>
                          <span className="font-extrabold text-gray-700 dark:text-gray-200 block truncate">
                            {contrato.titular ? `${contrato.titular.posto_graduacao} ${contrato.titular.nome_guerra}` : 'Não vinculado'}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold block text-[0.6rem] uppercase tracking-wider text-gray-400 sm:text-right">Fiscal Substituto</span>
                          <span className="font-extrabold text-gray-700 dark:text-gray-200 block truncate sm:text-right">
                            {contrato.substituto ? `${contrato.substituto.posto_graduacao} ${contrato.substituto.nome_guerra}` : 'Não vinculado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bloco de Avisos Recentes */}
        <Card className="col-span-1 lg:col-span-3 shadow-sm border-gray-100 dark:border-gray-800 rounded-[20px] overflow-hidden bg-card">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 py-4 px-5">
            <CardTitle className="text-sm font-black text-[#133215] dark:text-yellow-500 uppercase tracking-wider">Avisos Recentes do Comando</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[350px] overflow-y-auto flex flex-col gap-3.5">
            {avisos.length === 0 ? (
              <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
                Nenhum comunicado oficial do comando registrado.
              </div>
            ) : (
              avisos.map((aviso, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-card/40 border border-gray-100 dark:border-gray-800 space-y-2.5 hover:border-yellow-500/20 hover:shadow-sm transition-all duration-300 text-left">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[0.6rem] font-black text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 dark:border-yellow-500/30 uppercase tracking-widest">
                      MENSAGEM OFICIAL
                    </span>
                    <span className="text-[0.6rem] text-gray-400 dark:text-gray-500 font-extrabold">
                      {new Date(aviso.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#133215] dark:text-white">{aviso.titulo}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">{aviso.conteudo}</p>
                  <div className="text-[0.6rem] font-bold text-gray-400 uppercase pt-2 border-t border-gray-100 dark:border-gray-800">
                    Por: <span className="text-[#133215] dark:text-yellow-500 font-black">{aviso.autor}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Banner de Suporte WhatsApp para Fiscais - Estilo Bancário */}
      {!isAdmin && adminSuporte && (
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-[#102d13] rounded-[20px] p-5 border border-gray-800 shadow-md flex flex-col md:flex-row justify-between items-center gap-5 text-white">
          <div className="flex items-center gap-4 text-left">
            <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-400 shrink-0">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97-1.861-1.868-4.339-2.897-6.97-2.899-5.437 0-9.862 4.37-9.866 9.801-.001 1.762.463 3.484 1.344 5.013l-.974 3.559 3.656-.947zm12.308-3.693c-.27-.133-1.597-.778-1.844-.867-.248-.09-.429-.133-.61.133-.18.267-.698.867-.856 1.047-.158.18-.316.2-.586.067-.27-.133-1.14-.413-2.17-1.32-.803-.707-1.346-1.58-1.504-1.846-.158-.267-.017-.411.118-.544.121-.12.27-.312.405-.468.135-.156.18-.267.27-.444.09-.178.045-.334-.023-.468-.067-.133-.61-1.449-.836-1.984-.22-.524-.482-.452-.61-.452-.124-.003-.266-.003-.408-.003-.143 0-.376.053-.572.264-.196.211-.749.723-.749 1.762 0 1.04.766 2.042.872 2.18.106.138 1.506 2.274 3.649 3.186.51.217.907.348 1.217.444.512.161.977.138 1.345.084.41-.06 1.597-.644 1.821-1.265.224-.62.224-1.15.158-1.265-.067-.116-.248-.198-.518-.332z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-black uppercase tracking-wider text-yellow-500">Ajuda com Prazos ou Dúvidas</h4>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed font-medium">
                Precisa de apoio? Entre em contato com o Fiscal Administrativo: <strong className="text-white">{adminSuporte.posto_graduacao} {adminSuporte.nome_guerra}</strong>.
              </p>
            </div>
          </div>
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-5.5 py-3 rounded-2xl font-black text-xs transition-all shadow-lg active:scale-95 uppercase tracking-widest whitespace-nowrap"
          >
            Falar no WhatsApp
          </a>
        </div>
      )}

      {/* Modal de Alertas Críticos */}
      {isAlertsModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-[#1b2331] border border-[#2a3441] text-white rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#131924] border-b border-[#2a3441] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500/10 p-2.5 rounded-lg border border-yellow-500/30 text-yellow-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-yellow-500">Alertas Críticos Ativos</h2>
                  <p className="text-xs text-gray-400 font-bold mt-0.5">Pendências e prazos que requerem sua atenção</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAlertsModalOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-5 space-y-5">
              {/* Contratos perto do vencimento */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4 text-yellow-500" />
                  Contratos Vencendo Breve (≤ 90 dias)
                </h3>
                {contratosVencimentoBreve.length === 0 ? (
                  <p className="text-xs text-gray-500 font-bold bg-[#131924]/40 p-3 rounded-lg border border-[#2a3441]/40">
                    Nenhum contrato ativo próximo ao vencimento.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {contratosVencimentoBreve.map((contrato) => {
                      const now = new Date()
                      const term = new Date(contrato.data_termino)
                      const diffTime = term.getTime() - now.getTime()
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                      const dataTerminoFormatada = contrato.data_termino.split('-').reverse().join('/')

                      return (
                        <div key={contrato.id} className="p-3.5 rounded-lg bg-[#131924]/40 border border-[#2a3441]/80 hover:border-yellow-500/40 transition-colors text-left flex flex-col gap-1.5">
                          <div className="flex justify-between items-center gap-2 flex-wrap">
                            <span className="text-[0.65rem] font-black text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 uppercase tracking-wider">
                              CONTRATO Nº {contrato.numero_contrato}
                            </span>
                            <span className="text-[0.65rem] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20 uppercase">
                              vence em {diffDays} dias
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white truncate">{contrato.empresa}</div>
                          <div className="text-[0.65rem] text-gray-400">
                            Objeto: <span className="font-semibold text-gray-300">{contrato.objeto}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1 text-[0.65rem] text-gray-400 pt-2 border-t border-[#2a3441]/50">
                            <span>Término: <strong className="text-gray-300">{dataTerminoFormatada}</strong></span>
                            <Link 
                              href={isAdmin ? `/dashboard/contratos` : `/dashboard/meus-contratos`}
                              onClick={() => setIsAlertsModalOpen(false)}
                              className="text-yellow-500 hover:text-yellow-400 font-extrabold flex items-center gap-0.5 uppercase tracking-wider"
                            >
                              Ver Contrato <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Comunicados Não Lidos */}
              <div className="space-y-3 pt-3 border-t border-[#2a3441]/50">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4 text-yellow-500" />
                  Comunicados Oficiais Não Lidos
                </h3>
                {unreadComunicados.length === 0 ? (
                  <p className="text-xs text-gray-500 font-bold bg-[#131924]/40 p-3 rounded-lg border border-[#2a3441]/40">
                    Todos os comunicados oficiais foram lidos.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {unreadComunicados.map((comunicado) => (
                      <div key={comunicado.id} className="p-3.5 rounded-lg bg-[#131924]/40 border border-[#2a3441]/80 hover:border-yellow-500/40 transition-colors text-left flex flex-col gap-1.5">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[0.65rem] font-black text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 uppercase tracking-wider">
                            NÃO LIDO
                          </span>
                          <span className="text-[0.65rem] text-gray-400 font-semibold">
                            {new Date(comunicado.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="text-xs font-black text-white">{comunicado.titulo}</div>
                        <div className="text-[0.65rem] text-gray-400">
                          Autor: <strong className="text-gray-300">{comunicado.autor}</strong>
                        </div>
                        <div className="flex justify-end mt-1 text-[0.65rem] pt-2 border-t border-[#2a3441]/50">
                          <Link 
                            href="/dashboard/comunicados"
                            onClick={() => setIsAlertsModalOpen(false)}
                            className="text-yellow-500 hover:text-yellow-400 font-extrabold flex items-center gap-0.5 uppercase tracking-wider"
                          >
                            Ir para Comunicados <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#131924] border-t border-[#2a3441] p-4 flex justify-end">
              <button 
                onClick={() => setIsAlertsModalOpen(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer focus:outline-none uppercase tracking-wider"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
