import Link from 'next/link'
import { FileSignature, ShieldCheck, Clock, FileText, ArrowRight } from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#0b1d0c] text-white relative overflow-hidden font-sans flex flex-col justify-between">
      
      {/* Luzes e Efeitos de Brilho de Fundo (SaaS moderno) */}
      <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-white/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] h-[500px] w-[500px] rounded-full bg-yellow-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-[0.02] pointer-events-none" />

      {/* Header com Identificação do Batalhão */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#133215] border border-yellow-500/30 flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo 71º BI Mtz" className="w-10 h-10 object-contain" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base font-black tracking-wider text-white">71º BI Mtz</span>
            <span className="text-[0.6rem] text-yellow-500 font-extrabold uppercase tracking-widest">Fiscalização</span>
          </div>
        </div>

        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 bg-[#133215] border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-[#1a401c] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-md"
        >
          Acessar Sistema
          <ArrowRight className="h-3.5 w-3.5 text-yellow-500" />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 md:py-20 text-center flex-1 flex flex-col justify-center items-center">
        
        {/* Badge Slogan */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[0.65rem] font-black uppercase tracking-wider mb-6 animate-pulse">
          <ShieldCheck className="h-3.5 w-3.5" />
          Portal de Controle e Conformidade
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight max-w-4xl">
          Sistema de Fiscalização de <span className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">Contratos Administrativos</span>
        </h1>

        {/* Subhead */}
        <p className="text-gray-300 text-sm sm:text-lg max-w-2xl leading-relaxed mb-10 font-medium">
          Otimize a emissão de relatórios mensais, acompanhe os prazos de vigência e garanta a total conformidade das empresas prestadoras de serviço no 71º Batalhão de Infantaria Motorizado.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-[#070f08] px-8 py-4 rounded-xl text-sm font-black transition-all shadow-lg shadow-yellow-500/10 uppercase tracking-widest"
          >
            Entrar no Portal Seguro
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 w-full text-left">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-[#0d1c0e] border border-white/5 hover:border-yellow-500/20 hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 mb-4 group-hover:bg-yellow-500/20 transition-colors">
              <FileSignature className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Relatórios Digitais</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Preenchimento intuitivo e rápido das avaliações mensais de serviços de forma 100% digital e sem papelada física.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-[#0d1c0e] border border-white/5 hover:border-yellow-500/20 hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 mb-4 group-hover:bg-yellow-500/20 transition-colors">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Controle de Prazos</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Alertas automáticos de vigência de contratos e notificações imediatas para preenchimento de obrigações contratuais.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-[#0d1c0e] border border-white/5 hover:border-yellow-500/20 hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 mb-4 group-hover:bg-yellow-500/20 transition-colors">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Certidões em PDF</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Geração automatizada de PDFs oficiais de certidões e relatórios com os dados de conformidade revisados pelos fiscais.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-6 border-t border-white/5 text-[0.65rem] text-gray-500 font-bold uppercase tracking-widest bg-[#050b06] flex flex-col items-center justify-center gap-1.5 px-6">
        <span>71º Batalhão de Infantaria Motorizado &bull; Exército Brasileiro &bull; Fiscalização &copy; {new Date().getFullYear()}</span>
        <span className="text-gray-600 font-medium normal-case tracking-normal text-[0.6rem]">Desenvolvido por 1º Sgt Gaudêncio</span>
      </footer>

    </div>
  )
}
