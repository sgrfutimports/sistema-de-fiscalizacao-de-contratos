import Link from 'next/link'
import { 
  FileSignature, 
  ShieldCheck, 
  Clock, 
  FileText, 
  ArrowRight, 
  Smartphone, 
  History, 
  CheckCircle2,
  BarChart3,
  ChevronRight
} from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#133516] via-[#061207] to-[#000000] text-white relative overflow-hidden font-sans selection:bg-[#fedf00] selection:text-black">
      
      {/* Background Decorativo Premium */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-[#fedf00] opacity-[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#009b3a] opacity-[0.04] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Elegante */}
        <header className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between mt-8 sm:mt-0 animate-in fade-in duration-1000">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="relative w-14 h-14 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <div className="absolute inset-0 bg-[#fedf00]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo 71º BI Mtz" className="relative w-12 h-12 object-contain filter drop-shadow-[0_0_15px_rgba(254,223,0,0.4)]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg font-black tracking-widest text-white/90 uppercase">71º BI Mtz</span>
              <span className="text-[0.65rem] text-[#fedf00] font-bold uppercase tracking-[0.3em] opacity-80">Fiscalização</span>
            </div>
          </div>

          <Link 
            href="/dashboard" 
            className="hidden sm:inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-[#fedf00]/50 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all uppercase tracking-widest shadow-2xl"
          >
            Acessar Sistema
            <ArrowRight className="h-4 w-4 text-[#fedf00]" />
          </Link>
        </header>

        {/* Hero Section Masterpiece */}
        <main className="w-full max-w-7xl mx-auto px-6 py-12 md:py-24 flex-1 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fedf00]/10 border border-[#fedf00]/20 text-[#fedf00] text-xs font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both" style={{ animationDelay: '100ms' }}>
            <ShieldCheck className="h-4 w-4" />
            Exclusivo para Fiscais de Contrato
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.1] max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both" style={{ animationDelay: '200ms' }}>
            Gestão Contratual Inteligente e <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-[#fedf00] via-[#ffed4a] to-[#d4b900] bg-clip-text text-transparent">Sem Burocracia.</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl leading-relaxed mb-12 font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both" style={{ animationDelay: '300ms' }}>
            A plataforma definitiva projetada para otimizar o seu tempo. Fiscalize, avalie e emita relatórios com precisão cirúrgica e total conformidade legal, tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 mb-24 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both" style={{ animationDelay: '400ms' }}>
            <Link 
              href="/dashboard" 
              className="group relative inline-flex items-center justify-center gap-3 bg-[#fedf00] hover:bg-[#ffed4a] text-[#051006] px-10 py-5 rounded-2xl text-sm font-black transition-all shadow-[0_0_40px_rgba(254,223,0,0.3)] hover:shadow-[0_0_60px_rgba(254,223,0,0.5)] uppercase tracking-widest overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Entrar no Portal
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </Link>
          </div>

          {/* Destaques / Facilidades Premium */}
          <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both" style={{ animationDelay: '500ms' }}>
            <div className="text-left mb-12 border-b border-white/10 pb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white tracking-wide">Poder em suas mãos</h2>
                <p className="text-zinc-500 mt-2 font-medium">As principais facilidades desenvolvidas para o Fiscal</p>
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 text-left">
              
              {/* Feature 1 */}
              <div className="p-8 rounded-[2rem] bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-[#fedf00]/30 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fedf00]/5 blur-3xl rounded-full group-hover:bg-[#fedf00]/10 transition-colors" />
                <div className="h-14 w-14 rounded-2xl bg-[#fedf00]/10 flex items-center justify-center text-[#fedf00] mb-6 group-hover:scale-110 transition-transform duration-500">
                  <FileSignature className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#fedf00] transition-colors">Avaliação Descomplicada</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  Preenchimento 100% digital e inteligente dos formulários de avaliação mensal. Esqueça planilhas complexas; use uma interface fluida que guia você passo a passo.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-[2rem] bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-[#fedf00]/30 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fedf00]/5 blur-3xl rounded-full group-hover:bg-[#fedf00]/10 transition-colors" />
                <div className="h-14 w-14 rounded-2xl bg-[#fedf00]/10 flex items-center justify-center text-[#fedf00] mb-6 group-hover:scale-110 transition-transform duration-500">
                  <FileText className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#fedf00] transition-colors">Emissão Automática de PDFs</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  Geração instantânea de Termos de Recebimento, Relatórios Circunstanciados e Ofícios. Tudo sai perfeitamente formatado no padrão oficial do Exército Brasileiro.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-[2rem] bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-[#fedf00]/30 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fedf00]/5 blur-3xl rounded-full group-hover:bg-[#fedf00]/10 transition-colors" />
                <div className="h-14 w-14 rounded-2xl bg-[#fedf00]/10 flex items-center justify-center text-[#fedf00] mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Clock className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#fedf00] transition-colors">Controle de Prazos Ativo</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  Dashboards dinâmicos que mapeiam a vigência dos contratos e alertam sobre a janela de preenchimento dos relatórios antes que os prazos expirem.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-[2rem] bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-[#fedf00]/30 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fedf00]/5 blur-3xl rounded-full group-hover:bg-[#fedf00]/10 transition-colors" />
                <div className="h-14 w-14 rounded-2xl bg-[#fedf00]/10 flex items-center justify-center text-[#fedf00] mb-6 group-hover:scale-110 transition-transform duration-500">
                  <History className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#fedf00] transition-colors">Histórico e Rastreabilidade</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  Consulte todo o histórico de avaliações, notas e observações técnicas de qualquer empresa prestadora de serviço em um acervo digital imutável e organizado.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-8 rounded-[2rem] bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-[#fedf00]/30 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fedf00]/5 blur-3xl rounded-full group-hover:bg-[#fedf00]/10 transition-colors" />
                <div className="h-14 w-14 rounded-2xl bg-[#fedf00]/10 flex items-center justify-center text-[#fedf00] mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Smartphone className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#fedf00] transition-colors">Mobilidade Extrema (PWA)</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  Precisa conferir algo na rua ou durante a ronda no pavilhão? O sistema é 100% responsivo e pode ser instalado como um aplicativo nativo no seu iOS ou Android.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-8 rounded-[2rem] bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-[#fedf00]/30 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fedf00]/5 blur-3xl rounded-full group-hover:bg-[#fedf00]/10 transition-colors" />
                <div className="h-14 w-14 rounded-2xl bg-[#fedf00]/10 flex items-center justify-center text-[#fedf00] mb-6 group-hover:scale-110 transition-transform duration-500">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#fedf00] transition-colors">Segurança e Conformidade</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  Todos os ritos processuais exigidos pela Administração Pública são validados automaticamente, garantindo que nenhum passo legal seja esquecido pela Fiscalização.
                </p>
              </div>

            </div>
          </div>

        </main>

        {/* Footer Minimalista Premium */}
        <footer className="w-full text-center py-8 border-t border-white/5 mt-auto relative z-10 backdrop-blur-md">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-xs text-[#fedf00] font-black uppercase tracking-[0.2em] opacity-80">
              71º Batalhão de Infantaria Motorizado
            </span>
            <span className="text-[0.65rem] text-zinc-500 font-medium uppercase tracking-widest">
              Desenvolvido por 1º Sgt Gaudêncio &copy; {new Date().getFullYear()}
            </span>
          </div>
        </footer>

      </div>
    </div>
  )
}
