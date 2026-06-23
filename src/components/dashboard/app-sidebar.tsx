'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar'
import { BookOpen, FileSignature, Calendar, ClipboardList, Users, CalendarClock, Terminal, LayoutDashboard, FolderArchive, KeyRound, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export function AppSidebar({ userNome, userPerfil }: { userNome?: string; userPerfil: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile, setOpenMobile } = useSidebar()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const adminMenu = [
    { title: 'INÍCIO', url: '/dashboard', icon: BookOpen },
    { title: 'CONTRATOS', url: '/dashboard/contratos', icon: FileSignature },
    { title: 'COMUNICADOS', url: '/dashboard/comunicados', icon: ClipboardList },
    { title: 'HISTÓRICO', url: '/dashboard/relatorios', icon: Calendar },
  ]

  const consolaMenu = [
    { title: 'FILA DE HOMOLOGAÇÃO', url: '/dashboard/fila', icon: ClipboardList },
    { title: 'FISCAIS', url: '/dashboard/usuarios', icon: Users },
    { title: 'REABERTURA DE PRAZOS', url: '/dashboard/prazos', icon: CalendarClock },
    { title: 'LOGS E ALERTAS', url: '/dashboard/auditoria', icon: Terminal },
  ]

  const fiscalMenu = [
    { title: 'INÍCIO', url: '/dashboard', icon: LayoutDashboard },
    { title: 'CONTRATOS', url: '/dashboard/meus-contratos', icon: FileSignature },
    { title: 'HISTÓRICO', url: '/dashboard/meus-relatorios', icon: FolderArchive },
    { title: 'DOCUMENTOS', url: '/dashboard/documentos', icon: FileText },
  ]

  const items = userPerfil === 'ADMIN' ? adminMenu : fiscalMenu

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'US'
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Sidebar className="border-none text-white bg-[#133215] shadow-2xl">
      <div className="flex flex-col h-full bg-[#133215] text-white">
        
        {/* Header com Logo compacta do 71º BI Mtz */}
        <SidebarHeader className="flex flex-col items-center pt-6 pb-2 border-b border-[#234d26]/40">
          <div className="flex items-center gap-3 text-white font-bold tracking-wider">
            <div className="w-10 h-10 bg-[#133215] overflow-hidden flex items-center justify-center rounded-lg border border-yellow-500/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo 71º BI Mtz" className="w-8 h-8 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight">71º BI MTZ</span>
              <span className="text-[0.55rem] text-yellow-500 font-black uppercase tracking-widest">Fiscalização</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4 py-6 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Bloco de Perfil Centralizado - Estilo Banco do Brasil Drawer */}
            <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-yellow-500/20 bg-gradient-to-b from-[#1c4720]/80 to-[#102d13]/90 shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              {/* Avatar Circular Grande */}
              <div className="relative mb-3">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-500 to-yellow-600 blur-[4px] opacity-70 animate-pulse" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#133215] border-2 border-yellow-500 overflow-hidden shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/militar-avatar.png" alt="Fiscal Avatar" className="w-12 h-12 object-contain" />
                </div>
              </div>
              
              <div className="flex flex-col max-w-full">
                <span className="text-sm font-black truncate text-white uppercase tracking-wide px-1" title={userNome}>
                  {userNome || 'Usuário'}
                </span>
                <span className="mt-1 text-[0.65rem] font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-yellow-500/20 self-center">
                  {userPerfil}
                </span>
              </div>
            </div>

            {/* Menu Principal */}
            <div className="space-y-1.5">
              <div className="px-3 mb-2">
                <span className="text-[0.6rem] font-black text-[#688a6d] uppercase tracking-widest">Navegação</span>
              </div>
              <div className="flex flex-col gap-1">
                {items.map((item) => {
                  const isActive = pathname === item.url || (item.url !== '/dashboard' && pathname.startsWith(item.url))
                  
                  return (
                    <Link 
                      key={item.title} 
                      href={item.url} 
                      className="w-full block" 
                      title={item.title}
                      onClick={() => {
                        if (isMobile) {
                          setOpenMobile(false)
                        }
                      }}
                    >
                      <div 
                        className={`flex w-full items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 border-l-4 ${
                          isActive 
                            ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 font-black shadow-sm' 
                            : 'text-[#9cb5a1] border-transparent hover:text-white hover:bg-white/5 font-bold'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-yellow-500' : 'text-[#9cb5a1]'}`} />
                        <span className="text-[0.7rem] uppercase tracking-wider font-extrabold">{item.title}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Console de Comando - Apenas Admin */}
            {userPerfil === 'ADMIN' && (
              <div className="space-y-1.5 pt-2">
                <div className="px-3 mb-2">
                  <span className="text-[0.6rem] font-black text-[#688a6d] uppercase tracking-widest">Console de Comando</span>
                </div>
                <div className="flex flex-col gap-1">
                  {consolaMenu.map((item) => {
                    const isActive = pathname === item.url || pathname.startsWith(item.url)
                    
                    return (
                      <Link 
                        key={item.title} 
                        href={item.url} 
                        className="w-full block" 
                        title={item.title}
                        onClick={() => {
                          if (isMobile) {
                            setOpenMobile(false)
                          }
                        }}
                      >
                        <div 
                          className={`flex w-full items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 border-l-4 ${
                            isActive 
                              ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 font-black shadow-sm' 
                              : 'text-[#9cb5a1] border-transparent hover:text-white hover:bg-white/5 font-bold'
                          }`}
                        >
                          <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-yellow-500' : 'text-[#9cb5a1]'}`} />
                          <span className="text-[0.7rem] uppercase tracking-wider font-extrabold">{item.title}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Rodapé institucional com direitos autorais */}
          <div className="mt-auto pt-6 border-t border-white/5 flex flex-col items-center text-center space-y-1 text-white/30">
            <span className="text-[0.55rem] font-bold tracking-wider uppercase">71º BI Mtz &bull; © {new Date().getFullYear()}</span>
            <span className="text-[0.6rem] font-medium text-white/40">Desenvolvido por 1º Sgt Gaudêncio</span>
          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  )
}
