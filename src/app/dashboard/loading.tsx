'use client'

import { useEffect, useState } from 'react'

export default function DashboardLoading() {
  const [statusText, setStatusText] = useState('Autenticando credenciais...')

  useEffect(() => {
    const statuses = [
      'Iniciando conexão segura...',
      'Carregando contratos vinculados...',
      'Verificando avisos do comando...',
      'Preparando painel de controle...'
    ]
    let index = 0
    const interval = setInterval(() => {
      if (index < statuses.length) {
        setStatusText(statuses[index])
        index++
      }
    }, 600)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0d1f0f] text-white">
      {/* Efeito de brilho de fundo radial */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-[#1c4720]/40 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full px-6">
        
        {/* Container do Logo com Anel Dourado Rotativo */}
        <div className="relative flex items-center justify-center w-36 h-36">
          <div className="absolute inset-0 rounded-full bg-yellow-500/5 blur-md" />
          
          <svg className="absolute w-full h-full animate-spin" style={{ animationDuration: '2.5s' }} viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="url(#goldGradient)" 
              strokeWidth="2.5" 
              strokeDasharray="80 170" 
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Logo Central Pulsante */}
          <div className="relative flex items-center justify-center w-26 h-26 rounded-full bg-[#0a180b] border border-yellow-500/20 shadow-2xl animate-[pulse_2s_infinite_ease-in-out]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.png" 
              alt="71º BI Mtz" 
              className="w-18 h-18 object-contain"
            />
          </div>
        </div>

        {/* Textos da Marca */}
        <div className="flex flex-col items-center text-center">
          <span className="text-2xl font-black tracking-widest text-white uppercase">71º BI Mtz</span>
          <span className="text-[0.6rem] text-yellow-500 font-extrabold uppercase tracking-[0.3em] mt-1.5">
            Sistema de Fiscalização
          </span>
        </div>

        {/* Barra de Progresso Segura */}
        <div className="w-full h-[3px] bg-[#1a3a1f] rounded-full overflow-hidden relative mt-2">
          <div className="h-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 rounded-full animate-[loading-bar_1.8s_infinite_ease-in-out]" />
        </div>

        {/* Texto do Status Dinâmico */}
        <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest text-center min-h-[16px]">
          {statusText}
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  )
}
