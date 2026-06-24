import Link from 'next/link'
import { 
  FileSignature, 
  ShieldCheck, 
  Clock, 
  FileText, 
  ArrowRight, 
  Smartphone, 
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Briefcase,
  History
} from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#050A06] text-white relative overflow-x-hidden font-sans selection:bg-[#fedf00] selection:text-black pb-24">
      
      {/* Background Aurora FX */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[60vh] bg-gradient-to-b from-[#009b3a]/10 via-[#050A06]/80 to-[#050A06] pointer-events-none" />
      <div className="absolute top-[10%] left-[-20%] w-[70vw] h-[70vw] md:w-[40vw] md:h-[40vw] bg-[#fedf00] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[-20%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] bg-[#009b3a] opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />
      
      {/* Grid Noise */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_0%,#000_10%,transparent_100%)] pointer-events-none" />

      {/* Header Minimalista */}
      <header className="relative z-20 w-full px-6 py-6 flex items-center justify-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="relative w-8 h-8 object-contain filter drop-shadow-[0_0_8px_rgba(254,223,0,0.4)]" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-black tracking-widest text-white uppercase leading-none">71º BI Mtz</span>
            <span className="text-[0.55rem] text-[#fedf00] font-bold uppercase tracking-[0.2em] opacity-80 mt-1">Fiscalização</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-md mx-auto px-6 pt-6 flex flex-col items-center text-center">
        
        {/* Badge Hero */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[#fedf00] text-[0.65rem] font-bold uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both shadow-lg backdrop-blur-md" style={{ animationDelay: '100ms' }}>
          <ShieldCheck className="h-3.5 w-3.5" />
          Acesso Exclusivo
        </div>

        {/* Título */}
        <h1 className="text-[2.5rem] leading-[1.1] font-black tracking-tight text-white mb-5 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both" style={{ animationDelay: '200ms' }}>
          Controle <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fedf00] to-[#ffed4a] drop-shadow-[0_0_25px_rgba(254,223,0,0.2)]">
            Absoluto.
          </span>
        </h1>

        <p className="text-zinc-400 text-[0.95rem] leading-relaxed mb-10 max-w-[280px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both" style={{ animationDelay: '300ms' }}>
          Sua ferramenta de bolso para fiscalizar, aprovar relatórios e garantir a conformidade sem burocracia.
        </p>

        {/* Dynamic UI Showcase (Plan A) */}
        <div className="w-full relative h-[320px] mb-12 animate-in fade-in zoom-in-95 duration-1000 fill-mode-both" style={{ animationDelay: '400ms' }}>
          {/* Brilho traseiro do mockup */}
          <div className="absolute inset-0 bg-[#fedf00]/5 blur-[60px] rounded-full" />
          
          {/* Card 1: Alerta de Prazo */}
          <div className="absolute top-0 right-4 left-8 transform rotate-3 p-4 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 shadow-2xl backdrop-blur-xl opacity-90 transition-transform duration-[2000ms] hover:rotate-0 hover:scale-105 z-10" style={{ animation: 'float 6s ease-in-out infinite' }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <Clock className="h-5 w-5 text-red-400" />
              </div>
              <div className="text-left">
                <h4 className="text-white text-xs font-bold">Relatório Pendente</h4>
                <p className="text-red-400 text-[0.65rem] font-medium">Vence em 2 dias</p>
              </div>
            </div>
          </div>

          {/* Card 2: Contrato Principal (Centro) */}
          <div className="absolute top-[70px] left-0 right-0 p-5 rounded-3xl bg-gradient-to-br from-[#0a180b] to-[#050A06] border border-[#009b3a]/30 shadow-[0_20px_50px_rgba(0,155,58,0.15)] backdrop-blur-2xl z-20" style={{ animation: 'float 7s ease-in-out infinite 1s' }}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[#009b3a]/20 flex items-center justify-center border border-[#009b3a]/30">
                  <Briefcase className="h-6 w-6 text-[#009b3a]" />
                </div>
                <div className="text-left">
                  <h4 className="text-white text-sm font-black">Serviço de Limpeza</h4>
                  <p className="text-zinc-400 text-[0.7rem] font-medium">Contrato nº 12/2023</p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-[#009b3a]/20 text-[#009b3a] text-[0.6rem] font-bold uppercase">
                Ativo
              </div>
            </div>
            
            <div className="w-full bg-white/5 rounded-full h-1.5 mb-2 overflow-hidden">
              <div className="bg-[#fedf00] h-1.5 rounded-full w-[85%] shadow-[0_0_10px_rgba(254,223,0,0.8)]" />
            </div>
            <p className="text-right text-[0.6rem] text-zinc-500 font-medium">Execução: 85%</p>
          </div>

          {/* Card 3: PDF Gerado */}
          <div className="absolute top-[180px] left-4 right-8 transform -rotate-3 p-4 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 shadow-2xl backdrop-blur-xl opacity-95 transition-transform duration-[2000ms] hover:rotate-0 hover:scale-105 z-30" style={{ animation: 'float 8s ease-in-out infinite 2s' }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#fedf00]/10 flex items-center justify-center border border-[#fedf00]/20">
                <FileCheck2 className="h-5 w-5 text-[#fedf00]" />
              </div>
              <div className="text-left">
                <h4 className="text-white text-xs font-bold">Termo de Recebimento</h4>
                <p className="text-[#fedf00] text-[0.65rem] font-medium">PDF gerado com sucesso</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-[#fedf00] ml-auto" />
            </div>
          </div>
        </div>

        {/* CTA Mobile-First Fixed (Ou inline super destacado) */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both" style={{ animationDelay: '500ms' }}>
          <Link 
            href="/dashboard" 
            className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-b from-[#fedf00] to-[#e6c900] active:from-[#d4b900] active:to-[#b39c00] text-[#051006] px-8 py-4 rounded-2xl text-[0.9rem] font-black transition-all shadow-[0_10px_40px_rgba(254,223,0,0.25)] uppercase tracking-widest overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Acessar o Sistema
              <ArrowRight className="h-4 w-4" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
          </Link>
        </div>

      </main>

      {/* Seção de Facilidades (Lista Elegante em Coluna para Mobile) */}
      <section className="relative z-10 w-full max-w-md mx-auto px-6 mt-16 pb-12">
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both" style={{ animationDelay: '600ms' }}>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
            <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center">
              <FileSignature className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Avaliação Rápida</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">Formulários digitais que guiam você passo a passo na nota do serviço.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#009b3a]/5 border border-[#009b3a]/20 flex items-start gap-4 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] w-20 h-20 bg-[#009b3a]/10 blur-xl rounded-full" />
            <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-[#009b3a]/10 flex items-center justify-center border border-[#009b3a]/20">
              <FileText className="h-4 w-4 text-[#009b3a]" />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-white mb-1">PDFs 100% Nativos</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">Baixe relatórios circunstanciados prontos para impressão no padrão EB.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#fedf00]/5 border border-[#fedf00]/20 flex items-start gap-4 relative overflow-hidden">
            <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 bg-[#fedf00]/10 blur-xl rounded-full" />
            <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-[#fedf00]/10 flex items-center justify-center border border-[#fedf00]/20">
              <Smartphone className="h-4 w-4 text-[#fedf00]" />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-[#fedf00] mb-1">Aplicativo de Bolso</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">Instale o PWA no celular e faça rondas de fiscalização de onde estiver.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
            <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center">
              <History className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Acervo Centralizado</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">Todo o histórico da empresa gravado para auditorias e conferências futuras.</p>
            </div>
          </div>

        </div>
      </section>

      {/* CSS Extra for Keyframes (Injecting directly for simplicity) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(var(--tw-rotate)); }
          50% { transform: translateY(-10px) rotate(var(--tw-rotate)); }
          100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
        }
      `}} />
    </div>
  )
}
