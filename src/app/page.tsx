import Link from 'next/link'
import Image from 'next/image'
import { 
  FileSignature, 
  ShieldCheck, 
  Clock, 
  FileText, 
  ArrowRight, 
  Smartphone, 
  History, 
  CheckCircle2,
} from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#050A06] text-white relative overflow-hidden font-sans selection:bg-[#fedf00] selection:text-black">
      
      {/* Background Decorativo e Luzes (Premium Aesthetic) */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-[#009b3a] opacity-[0.08] blur-[120px] rounded-[100%] pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vw] bg-[#fedf00] opacity-[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#005f23] opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />

      {/* Grid Pattern Fundo */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navbar */}
        <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="relative w-12 h-12 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <div className="absolute inset-0 bg-[#fedf00]/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo 71º BI Mtz" className="relative w-10 h-10 object-contain filter drop-shadow-[0_0_10px_rgba(254,223,0,0.3)]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black tracking-widest text-white/90 uppercase">71º BI Mtz</span>
              <span className="text-[0.6rem] text-[#fedf00] font-bold uppercase tracking-[0.2em] opacity-80">Fiscalização</span>
            </div>
          </div>

          <Link 
            href="/dashboard" 
            className="group relative flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-white/20 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all uppercase tracking-widest overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Acessar
              <ArrowRight className="h-3.5 w-3.5 text-[#fedf00] group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </header>

        {/* Hero Section Split Layout */}
        <main className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-16 md:pb-24 flex-1 flex flex-col lg:flex-row items-center gap-10 md:gap-16">
          
          {/* Lado Esquerdo: Textos e CTA */}
          <div className="flex-1 flex flex-col items-start text-left w-full z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#fedf00]/20 to-transparent border border-[#fedf00]/30 text-[#fedf00] text-[0.65rem] font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-left-8 duration-1000 fill-mode-both" style={{ animationDelay: '100ms' }}>
              <ShieldCheck className="h-3.5 w-3.5" />
              Sistema Exclusivo de Fiscalização
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter text-white mb-4 md:mb-6 leading-[1.1] animate-in fade-in slide-in-from-left-8 duration-1000 fill-mode-both" style={{ animationDelay: '200ms' }}>
              O futuro do <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fedf00] via-[#ffed4a] to-white drop-shadow-[0_0_30px_rgba(254,223,0,0.3)]">
                controle contratual.
              </span>
            </h1>

            <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-8 md:mb-10 max-w-lg font-medium animate-in fade-in slide-in-from-left-8 duration-1000 fill-mode-both" style={{ animationDelay: '300ms' }}>
              Uma plataforma intuitiva, elegante e de alta performance. Otimize seu tempo, garanta a conformidade legal e abandone planilhas complexas com uma gestão 100% digital.
            </p>

            <div className="flex w-full sm:w-auto animate-in fade-in slide-in-from-left-8 duration-1000 fill-mode-both" style={{ animationDelay: '400ms' }}>
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 bg-[#fedf00] text-[#051006] px-8 py-4 rounded-full text-sm font-black transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(254,223,0,0.2)] hover:shadow-[0_0_50px_rgba(254,223,0,0.4)] uppercase tracking-widest"
              >
                Entrar no Portal
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Lado Direito: Imagem Premium Mockup gerada por IA */}
          <div className="flex-1 w-full relative h-[300px] md:h-[400px] lg:h-[600px] animate-in fade-in slide-in-from-right-12 duration-1000 fill-mode-both" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#009b3a]/20 to-transparent rounded-[3rem] blur-3xl opacity-50 mix-blend-screen" />
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-3xl group">
              {/* Imagem de Fundo Premium */}
              <Image 
                src="/hero-dashboard.png" 
                alt="Interface do Sistema de Fiscalização" 
                fill
                className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                priority
              />
              {/* Efeito de Vidro sobreposto */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050A06] via-[#050A06]/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#fedf00]/20 flex items-center justify-center border border-[#fedf00]/30 animate-pulse">
                    <CheckCircle2 className="h-6 w-6 text-[#fedf00]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold tracking-wide">Relatório Conformado</h4>
                    <p className="text-xs text-zinc-400">Processado instantaneamente pelo sistema</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bento Box Features Section */}
        <section className="w-full max-w-7xl mx-auto px-6 pb-32">
          <div className="text-center mb-10 md:mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both" style={{ animationDelay: '500ms' }}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">Projetado para <span className="text-[#fedf00]">Excelência</span></h2>
            <p className="text-zinc-500 mt-3 md:mt-4 text-sm md:text-lg">Tudo que o fiscal precisa em um mosaico inteligente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[250px] animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both" style={{ animationDelay: '600ms' }}>
            
            {/* Bento Card 1: Avaliação (Ocupa 2 colunas no desktop) */}
            <div className="md:col-span-2 relative p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 hover:border-white/10 transition-colors overflow-hidden group flex flex-col justify-end">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#fedf00]/5 blur-[80px] rounded-full group-hover:bg-[#fedf00]/10 transition-colors" />
              <FileSignature className="absolute top-8 right-8 h-12 w-12 text-[#fedf00]/30 group-hover:text-[#fedf00]/60 transition-colors" />
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2 z-10 relative">Avaliação Descomplicada</h3>
              <p className="text-zinc-400 text-xs md:text-base max-w-md z-10 relative">Preenchimento de notas e critérios através de uma interface step-by-step hiper fluida.</p>
            </div>

            {/* Bento Card 2: PDFs */}
            <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-[#009b3a]/10 to-transparent border border-[#009b3a]/20 hover:border-[#009b3a]/40 transition-colors overflow-hidden group flex flex-col justify-end">
              <FileText className="absolute top-8 right-8 h-10 w-10 text-[#009b3a]/50 group-hover:text-[#009b3a] transition-colors" />
              <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 z-10 relative">PDFs Nativos</h3>
              <p className="text-zinc-400 text-xs md:text-sm z-10 relative">Geração automática de relatórios no padrão EB.</p>
            </div>

            {/* Bento Card 3: Prazos */}
            <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 hover:border-white/10 transition-colors overflow-hidden group flex flex-col justify-end">
              <Clock className="absolute top-8 right-8 h-10 w-10 text-zinc-500 group-hover:text-white transition-colors" />
              <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 z-10 relative">Prazos Inteligentes</h3>
              <p className="text-zinc-400 text-xs md:text-sm z-10 relative">Alertas prévios antes do vencimento do relatório.</p>
            </div>

            {/* Bento Card 4: Histórico */}
            <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 hover:border-white/10 transition-colors overflow-hidden group flex flex-col justify-end">
              <History className="absolute top-8 right-8 h-10 w-10 text-zinc-500 group-hover:text-white transition-colors" />
              <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 z-10 relative">Histórico Universal</h3>
              <p className="text-zinc-400 text-xs md:text-sm z-10 relative">Consulte o passado da empresa em 1 clique.</p>
            </div>

            {/* Bento Card 5: Mobile (Destaque) */}
            <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-[#fedf00]/10 to-transparent border border-[#fedf00]/20 hover:border-[#fedf00]/40 transition-colors overflow-hidden group flex flex-col justify-end">
              <Smartphone className="absolute top-8 right-8 h-10 w-10 text-[#fedf00]/50 group-hover:text-[#fedf00] transition-colors" />
              <h3 className="text-lg md:text-xl font-bold text-[#fedf00] mb-1 md:mb-2 z-10 relative">100% Mobile & PWA</h3>
              <p className="text-zinc-300 text-xs md:text-sm z-10 relative">Instale o aplicativo direto na tela inicial do seu celular e fiscalize de qualquer pavilhão.</p>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="w-full text-center py-10 border-t border-white/5 mt-auto relative z-10">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-zinc-500" />
            </div>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
              71º Batalhão de Infantaria Motorizado &copy; {new Date().getFullYear()}
            </span>
          </div>
        </footer>

      </div>
    </div>
  )
}
