'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

// Declarar a interface global para o evento BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      // Previne o Chrome 67 e anteriores de mostrar o prompt automaticamente
      e.preventDefault()
      // Guarda o evento para ser disparado mais tarde
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Atualiza a UI para mostrar o botão de instalação
      setIsVisible(true)
    }

    // Ouve o evento de instalação
    window.addEventListener('beforeinstallprompt', handler)

    // Ouve se o app já foi instalado
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null)
      setIsVisible(false)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Mostra o prompt de instalação
    deferredPrompt.prompt()

    // Aguarda o usuário responder ao prompt
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsVisible(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-fade-in">
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 bg-[#fedf00] hover:bg-[#ffed4a] text-[#009b3a] px-4 py-3 rounded-full font-black uppercase tracking-widest shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-2 border-[#009b3a] transition-transform hover:scale-105 active:scale-95"
      >
        <Download className="h-5 w-5" />
        <span className="hidden sm:inline">Instalar Aplicativo</span>
        <span className="sm:hidden">Instalar App</span>
      </button>
    </div>
  )
}
