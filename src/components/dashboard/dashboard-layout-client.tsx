'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { 
  Eye, 
  EyeOff, 
  Bell, 
  MessageSquareMore, 
  Home, 
  Search, 
  FileText, 
  User, 
  LogOut,
  ChevronDown,
  Menu
} from 'lucide-react'
import { VisibilityProvider, useVisibility } from './visibility-context'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  userNome: string
  userPerfil: string
  userCPF: string
  whatsappLink: string
  logoutAction: () => void
}

function HeaderAndNav({
  children,
  userNome,
  userPerfil,
  userCPF,
  whatsappLink,
  logoutAction
}: DashboardLayoutClientProps) {
  const pathname = usePathname()
  const { visible, toggle: toggleVisibility } = useVisibility()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Determinar link dos contratos com base no perfil
  const contratosUrl = userPerfil === 'ADMIN' ? '/dashboard/contratos' : '/dashboard/meus-contratos'
  const historicoUrl = userPerfil === 'ADMIN' ? '/dashboard/relatorios' : '/dashboard/meus-relatorios'
  const alertasUrl = userPerfil === 'ADMIN' ? '/dashboard/auditoria' : '/dashboard'

  // Função para abreviar nome de guerra
  const formatGreetingName = (name: string) => {
    if (!name) return 'Militar'
    const parts = name.split(' ')
    // Ex: "1º Sgt GAUDENCIO" -> "Sgt GAUDENCIO" ou mantém o posto
    return parts.join(' ')
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-h-screen pb-16 md:pb-0">
      {/* Cabeçalho Premium Fixo (Sticky Header) - Estilo Banco do Brasil */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-yellow-500/20 bg-[#133215] px-4 md:px-6 shadow-md text-white">
        
        {/* Lado Esquerdo: Menu Hambúrguer + Logo + Saudação */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-white hover:text-yellow-500 bg-transparent hover:bg-white/10 p-2 rounded-xl transition-all" />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0e2410] border border-yellow-500/30 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo.png" alt="Logo 71º BI Mtz" className="w-6 h-6 object-contain" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-black tracking-wider text-white">71º BI Mtz</span>
              <span className="text-[0.5rem] text-yellow-500 font-extrabold uppercase tracking-widest">Fiscalização</span>
            </div>
          </div>

          {/* Saudação Oficial */}
          <div className="flex flex-col text-left">
            <span className="text-xs text-yellow-500/80 font-bold uppercase tracking-wider">Boas-vindas</span>
            <span className="text-sm font-black text-white tracking-wide">
              Olá, {formatGreetingName(userNome)}
            </span>
          </div>
        </div>

        {/* Lado Direito: Ações Rápidas do Cabeçalho */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Botão Ver/Ocultar Valores */}
          <button 
            onClick={toggleVisibility}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white hover:text-yellow-500"
            title={visible ? "Ocultar saldos/valores" : "Mostrar saldos/valores"}
          >
            {visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>

          {/* Suporte WhatsApp */}
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white hover:text-yellow-500 hidden xs:block"
            title="Falar com Gestor de Contratos"
          >
            <MessageSquareMore className="h-5 w-5" />
          </a>

          {/* Notificações / Alertas */}
          <Link 
            href={alertasUrl}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white hover:text-yellow-500 relative"
            title="Alertas e Logs"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-yellow-500 border-2 border-[#133215] animate-ping" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-yellow-500 border-2 border-[#133215]" />
          </Link>

          <div className="h-6 w-px bg-white/10 mx-1" />

          {/* Avatar com Menu Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-yellow-500/20"
            >
              <div className="h-8 w-8 rounded-full bg-[#1b441d] border border-yellow-500/30 overflow-hidden flex items-center justify-center">
                <img src="/militar-avatar.png" alt="User Avatar" className="w-6.5 h-6.5 object-contain" />
              </div>
              <ChevronDown className="h-3 w-3 text-yellow-500 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-gray-100 shadow-2xl py-2 z-40 text-gray-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-gray-100 text-left">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Usuário</p>
                    <p className="text-sm font-black text-[#133215] truncate">{userNome}</p>
                    <p className="text-[0.65rem] font-bold text-yellow-600 uppercase tracking-wider mt-0.5">{userPerfil}</p>
                  </div>
                  <Link 
                    href="/dashboard/perfil"
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="h-3.5 w-3.5 text-gray-500" />
                    MEU PERFIL
                  </Link>
                  <form action={logoutAction} className="border-t border-gray-100 mt-1">
                    <button 
                      type="submit" 
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      SAIR DO PORTAL
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Scrollable Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
        <div className="mx-auto w-full max-w-7xl animate-in fade-in duration-300">
          {children}
        </div>
      </main>

      {/* Navegação Inferior Mobile (Bottom Navigation) - Estilo Banco do Brasil */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#133215] border-t border-[#234d26]/60 flex items-center justify-around px-2 text-white md:hidden shadow-lg">
        <Link 
          href="/dashboard"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
            pathname === '/dashboard' ? 'text-yellow-500 font-extrabold' : 'text-[#8ca190] hover:text-white'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[0.65rem] tracking-tight">Início</span>
        </Link>

        <Link 
          href="/dashboard?focusSearch=true"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
            pathname.includes('buscar') ? 'text-yellow-500 font-extrabold' : 'text-[#8ca190] hover:text-white'
          }`}
        >
          <Search className="h-5 w-5" />
          <span className="text-[0.65rem] tracking-tight">Buscar</span>
        </Link>

        <Link 
          href={alertasUrl}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative ${
            pathname === '/dashboard/auditoria' ? 'text-yellow-500 font-extrabold' : 'text-[#8ca190] hover:text-white'
          }`}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-6 h-2 w-2 rounded-full bg-yellow-500" />
          <span className="text-[0.65rem] tracking-tight">Alertas</span>
        </Link>

        <Link 
          href={contratosUrl}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
            pathname === contratosUrl ? 'text-yellow-500 font-extrabold' : 'text-[#8ca190] hover:text-white'
          }`}
        >
          <FileText className="h-5 w-5" />
          <span className="text-[0.65rem] tracking-tight">Contratos</span>
        </Link>

        <Link 
          href="/dashboard/perfil"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
            pathname === '/dashboard/perfil' ? 'text-yellow-500 font-extrabold' : 'text-[#8ca190] hover:text-white'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[0.65rem] tracking-tight">Perfil</span>
        </Link>
      </nav>
    </div>
  )
}

export function DashboardLayoutClient({ children, ...props }: DashboardLayoutClientProps) {
  return (
    <VisibilityProvider>
      <HeaderAndNav {...props}>{children}</HeaderAndNav>
    </VisibilityProvider>
  )
}
