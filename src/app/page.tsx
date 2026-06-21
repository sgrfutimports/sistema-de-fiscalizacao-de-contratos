import Link from 'next/link'
import { FileSignature, ShieldCheck, Clock, FileText, ArrowRight } from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#009b3a] to-[#005f23] text-white relative overflow-hidden font-sans flex flex-col justify-between">
      
      {/* Luzes Vibrantes de Fundo - Copa do Mundo */}
      <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[#fedf00]/20 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-15%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#002776]/30 blur-[100px] pointer-events-none z-0" />

      {/* Confetes Flutuantes */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Confetes Amarelos */}
        <div className="absolute left-[10%] bottom-0 w-3 h-6 bg-[#fedf00] opacity-80 animate-float-up" style={{ animationDelay: '0s', animationDuration: '6s' }} />
        <div className="absolute left-[30%] bottom-0 w-4 h-4 rounded-full bg-[#fedf00] opacity-90 animate-float-up" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute left-[50%] bottom-0 w-3 h-8 bg-[#fedf00] opacity-70 animate-float-up" style={{ animationDelay: '1s', animationDuration: '7s' }} />
        <div className="absolute left-[70%] bottom-0 w-5 h-5 rounded-full bg-[#fedf00] opacity-80 animate-float-up" style={{ animationDelay: '4s', animationDuration: '4s' }} />
        <div className="absolute left-[90%] bottom-0 w-2 h-6 bg-[#fedf00] opacity-90 animate-float-up" style={{ animationDelay: '3s', animationDuration: '6s' }} />
        
        {/* Confetes Azuis */}
        <div className="absolute left-[20%] bottom-0 w-4 h-4 bg-[#002776] opacity-80 animate-float-up" style={{ animationDelay: '1.5s', animationDuration: '5.5s' }} />
        <div className="absolute left-[40%] bottom-0 w-3 h-3 rounded-full bg-[#002776] opacity-70 animate-float-up" style={{ animationDelay: '0.5s', animationDuration: '6.5s' }} />
        <div className="absolute left-[60%] bottom-0 w-5 h-2 bg-[#002776] opacity-90 animate-float-up" style={{ animationDelay: '2.5s', animationDuration: '4.5s' }} />
        <div className="absolute left-[80%] bottom-0 w-3 h-3 rounded-full bg-[#002776] opacity-80 animate-float-up" style={{ animationDelay: '3.5s', animationDuration: '5s' }} />
        
        {/* Confetes Brancos */}
        <div className="absolute left-[15%] bottom-0 w-2 h-2 rounded-full bg-white opacity-80 animate-float-up" style={{ animationDelay: '0.2s', animationDuration: '4s' }} />
        <div className="absolute left-[45%] bottom-0 w-3 h-3 bg-white opacity-90 animate-float-up" style={{ animationDelay: '1.8s', animationDuration: '7s' }} />
        <div className="absolute left-[75%] bottom-0 w-4 h-2 bg-white opacity-70 animate-float-up" style={{ animationDelay: '2.2s', animationDuration: '5s' }} />
        <div className="absolute left-[85%] bottom-0 w-2 h-2 rounded-full bg-white opacity-80 animate-float-up" style={{ animationDelay: '4.5s', animationDuration: '6s' }} />
      </div>

      {/* Bandeirinhas de Festa Junina estilizadas */}
      <div className="absolute top-0 inset-x-0 h-24 overflow-hidden pointer-events-none z-10 flex justify-around opacity-90">
        <div className="absolute top-4 left-[-10%] right-[-10%] h-[1px] bg-white/30 transform rotate-[-2deg] z-0" />
        {[
          '#fedf00', '#002776', '#ffffff', '#fedf00', '#009b3a', 
          '#ffffff', '#002776', '#fedf00', '#009b3a', '#ffffff',
          '#fedf00', '#002776', '#ffffff', '#fedf00', '#009b3a',
          '#ffffff', '#fedf00', '#002776', '#ffffff', '#fedf00'
        ].map((color, i) => (
          <div key={i} className={`relative w-8 sm:w-12 h-12 sm:h-16 origin-top animate-sway`} style={{ animationDelay: `${i * 0.15}s` }}>
            <svg viewBox="0 0 100 120" preserveAspectRatio="none" className="w-full h-full drop-shadow-md">
              <path d="M0,0 L100,0 L100,120 L50,90 L0,120 Z" fill={color} />
            </svg>
          </div>
        ))}
      </div>

      {/* Header com Identificação do Batalhão */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/20 mt-16 sm:mt-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center filter drop-shadow-[0_0_10px_rgba(254,223,0,0.5)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo 71º BI Mtz" className="w-10 h-10 object-contain" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base font-black tracking-wider text-white drop-shadow-md">71º BI Mtz</span>
            <span className="text-[0.6rem] text-[#fedf00] font-extrabold uppercase tracking-widest drop-shadow-md">Fiscalização</span>
          </div>
        </div>

        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-[#fedf00]/40 hover:bg-white/20 text-[#fedf00] px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-md"
        >
          Acessar Sistema
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 md:py-20 text-center flex-1 flex flex-col justify-center items-center">
        
        {/* Badge Slogan */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fedf00]/20 backdrop-blur-md border border-[#fedf00]/50 text-[#fedf00] text-[0.65rem] font-black uppercase tracking-wider mb-6 animate-pulse shadow-[0_0_15px_rgba(254,223,0,0.4)]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Portal de Controle Festivo e Conformidade
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight max-w-4xl drop-shadow-lg">
          Sistema de Fiscalização de <span className="bg-gradient-to-r from-[#fedf00] via-white to-[#fedf00] bg-clip-text text-transparent">Contratos Administrativos</span>
        </h1>

        {/* Subhead */}
        <p className="text-green-50 text-sm sm:text-lg max-w-2xl leading-relaxed mb-10 font-bold drop-shadow-md">
          Otimize a emissão de relatórios mensais, acompanhe os prazos de vigência e garanta a total conformidade das empresas prestadoras de serviço no 71º Batalhão de Infantaria Motorizado. 🔥 Pula a fogueira e bora pro Hexa!
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#fedf00] to-[#e6c900] hover:from-[#e6c900] hover:to-[#cca300] text-[#005f23] px-8 py-4 rounded-xl text-sm font-black transition-all shadow-[0_0_30px_rgba(254,223,0,0.5)] uppercase tracking-widest hover:scale-105"
          >
            Entrar no Portal Seguro
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 w-full text-left">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-[#fedf00]/50 hover:-translate-y-1 transition-all duration-300 group shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-[#fedf00]/20 border border-[#fedf00]/30 flex items-center justify-center text-[#fedf00] mb-4 group-hover:bg-[#fedf00]/40 transition-colors shadow-inner">
              <FileSignature className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-[#fedf00] uppercase tracking-wider mb-2">Relatórios Digitais</h3>
            <p className="text-xs text-green-50 leading-relaxed font-bold">
              Preenchimento intuitivo e rápido das avaliações mensais de serviços de forma 100% digital e sem papelada física.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-[#fedf00]/50 hover:-translate-y-1 transition-all duration-300 group shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-[#fedf00]/20 border border-[#fedf00]/30 flex items-center justify-center text-[#fedf00] mb-4 group-hover:bg-[#fedf00]/40 transition-colors shadow-inner">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-[#fedf00] uppercase tracking-wider mb-2">Controle de Prazos</h3>
            <p className="text-xs text-green-50 leading-relaxed font-bold">
              Alertas automáticos de vigência de contratos e notificações imediatas para preenchimento de obrigações contratuais.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-[#fedf00]/50 hover:-translate-y-1 transition-all duration-300 group shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-[#fedf00]/20 border border-[#fedf00]/30 flex items-center justify-center text-[#fedf00] mb-4 group-hover:bg-[#fedf00]/40 transition-colors shadow-inner">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-[#fedf00] uppercase tracking-wider mb-2">Certidões em PDF</h3>
            <p className="text-xs text-green-50 leading-relaxed font-bold">
              Geração automatizada de PDFs oficiais de certidões e relatórios com os dados de conformidade revisados pelos fiscais.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-6 border-t border-white/20 text-[0.65rem] text-[#fedf00] font-bold uppercase tracking-widest bg-gradient-to-t from-[#002776]/40 to-transparent flex flex-col items-center justify-center gap-1.5 px-6 backdrop-blur-sm">
        <span className="drop-shadow-md">71º Batalhão de Infantaria Motorizado &bull; Exército Brasileiro &bull; Fiscalização &copy; {new Date().getFullYear()}</span>
        <span className="text-white font-medium normal-case tracking-normal text-[0.6rem] opacity-90 drop-shadow-md">Desenvolvido por 1º Sgt Gaudêncio | Feliz São João! 🇧🇷</span>
      </footer>

    </div>
  )
}
