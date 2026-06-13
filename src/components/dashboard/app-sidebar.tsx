'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { BookOpen, FileSignature, Calendar, ClipboardList, Users, CalendarClock, Terminal, LayoutDashboard, FolderArchive } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export function AppSidebar({ userNome, userPerfil }: { userNome?: string; userPerfil: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const adminMenu = [
    { title: 'INÍCIO (RESUMOS)', url: '/dashboard', icon: BookOpen },
    { title: 'CONTRATOS DO BATALHÃO', url: '/dashboard/contratos', icon: FileSignature },
    { title: 'COMUNICADOS DO COMANDO', url: '/dashboard/comunicados', icon: ClipboardList },
    { title: 'ACERVO DE HISTÓRICOS', url: '/dashboard/relatorios', icon: Calendar },
  ]

  const consolaMenu = [
    { title: 'FILA DE HOMOLOGAÇÃO', url: '/dashboard/fila', icon: ClipboardList },
    { title: 'MILITARES FISCAIS', url: '/dashboard/usuarios', icon: Users },
    { title: 'REABERTURA DE PRAZOS', url: '/dashboard/prazos', icon: CalendarClock },
    { title: 'LOGS E ALERTAS', url: '/dashboard/auditoria', icon: Terminal },
  ]

  const fiscalMenu = [
    { title: 'INÍCIO (RESUMOS)', url: '/dashboard', icon: LayoutDashboard },
    { title: 'CONTRATOS DO BATALHÃO', url: '/dashboard/meus-contratos', icon: FileSignature },
    { title: 'ACERVO DE HISTÓRICOS', url: '/dashboard/meus-relatorios', icon: FolderArchive },
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
    <Sidebar className="border-none text-white bg-[#133215]">
      {/* Background override directly since Shadcn uses variables */}
      <div className="flex flex-col h-full bg-[#133215] text-white">
        
        <SidebarHeader className="flex flex-col items-center pt-8 pb-4">
          <div className="flex items-center gap-2 text-white font-bold tracking-wider">
            <div style={{ 
              width: 48, 
              height: 48, 
              background: '#133215', 
              flexShrink: 0, 
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo 71º BI Mtz" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl">71º BI MTZ</span>
              <span className="text-[0.6rem] text-yellow-500 font-normal uppercase tracking-widest">Sistema de Fiscalização</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4 py-6">
          
          {/* Perfil do Usuário na Sidebar */}
          <div className="mb-8 p-3 rounded-xl border border-yellow-500/50 bg-[#0f2811] flex items-center gap-3 shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2a4d2c] border border-yellow-500 text-yellow-500 font-bold text-sm">
              {getInitials(userNome || 'Usuário')}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate text-white" title={userNome}>{userNome || 'Usuário'}</span>
              <span className="text-[0.65rem] font-bold text-yellow-500 tracking-wider">{userPerfil}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {items.map((item) => {
              const isActive = pathname === item.url || (item.url !== '/dashboard' && pathname.startsWith(item.url))
              
              return (
                <Link key={item.title} href={item.url} className="w-full" title={item.title}>
                  <div 
                    className={`flex w-full items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-[#1b262c]/40 border-l-4 border-yellow-500 text-white font-bold' 
                        : 'text-[#8ca190] hover:text-white hover:bg-[#1b262c]/20 border-l-4 border-transparent font-semibold'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-[#8ca190]'}`} />
                    <span className="text-xs uppercase tracking-wider">{item.title}</span>
                  </div>
                </Link>
              )
            })}
          </div>

          {userPerfil === 'ADMIN' && (
            <>
              <div className="mt-8 mb-4 px-3">
                <span className="text-[0.65rem] font-bold text-[#647966] uppercase tracking-widest">Consola de Comando</span>
              </div>
              <div className="flex flex-col gap-1">
                {consolaMenu.map((item) => {
                  const isActive = pathname === item.url || pathname.startsWith(item.url)
                  
                  return (
                    <Link key={item.title} href={item.url} className="w-full" title={item.title}>
                      <div 
                        className={`flex w-full items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                          isActive 
                            ? 'bg-[#1b262c]/40 border-l-4 border-yellow-500 text-white font-bold' 
                            : 'text-[#8ca190] hover:text-white hover:bg-[#1b262c]/20 border-l-4 border-transparent font-semibold'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-[#8ca190]'}`} />
                        <span className="text-xs uppercase tracking-wider">{item.title}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </SidebarContent>

      </div>
    </Sidebar>
  )
}
