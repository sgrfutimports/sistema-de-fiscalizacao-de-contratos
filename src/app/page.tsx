import Link from 'next/link'
import Image from 'next/image'
import { 
  FileSignature, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  Clock, 
  Bell
} from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#050A06] text-white relative overflow-x-hidden font-sans selection:bg-[#fedf00] selection:text-black pb-24">
      
      {/* Background Dinâmico e Premium */}
      <div className="absolute top-[0%] left-1/2 -translate-x-1/2 w-[150vw] md:w-[80vw] h-[60vh] bg-gradient-to-b from-[#009b3a]/15 via-[#050A06]/80 to-[#050A06] pointer-events-none" />
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[90vw] md:w-[40vw] h-[90vw] md:h-[40vw] bg-[#fedf00] opacity-[0.05] blur-[100px] rounded-full pointer-events-none" />
      
      {/* Textura Grainy */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      
      {/* Header Minimalista */}
      <header className="relative z-20 w-full px-6 py-6 flex items-center justify-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="relative w-8 h-8 object-contain filter drop-shadow-[0_0_8px_rgba(254,223,0,0.4)]" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-black tracking-widest text-white uppercase leading-none">71º BI Mtz</span>
            <span className="text-[0.55rem] text-[#fedf00] font-bold uppercase tracking-[0.2em] opacity-80 mt-1">Pioneiro</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-md mx-auto px-5 pt-4 flex flex-col items-center text-center">
        
        {/* Badge Hero */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[#fedf00] text-[0.65rem] font-bold uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-lg backdrop-blur-md" style={{ animationDelay: '100ms' }}>
          <ShieldCheck className="h-3.5 w-3.5" />
          Perfil de Fiscal de Contrato
        </div>

        {/* Título Principal */}
        <h1 className="text-[2.5rem] leading-[1.1] font-black tracking-tight text-white mb-5 animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ animationDelay: '200ms' }}>
          Tudo na palma <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fedf00] to-[#ffed4a] drop-shadow-[0_0_25px_rgba(254,223,0,0.2)]">
            da sua mão.
          </span>
        </h1>

        <p className="text-zinc-400 text-[0.95rem] leading-relaxed mb-10 max-w-[300px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ animationDelay: '300ms' }}>
          Aplicação pioneira e exclusiva do <strong>71º BI Mtz</strong> focada na gestão rápida de prazos, emissão de relatórios mensais e geração de documentos nativos.
        </p>

        {/* Mockup do App (Plano B restaurado com imagem real) */}
        <div className="w-full relative flex justify-center mb-12 animate-in fade-in zoom-in-95 duration-1000" style={{ animationDelay: '400ms' }}>
          {/* Efeitos Visuais ao Redor da Imagem */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050A06] via-transparent to-transparent z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#009b3a]/20 blur-[60px] rounded-full" />
          
          <div className="relative w-[280px] h-[550px] md:w-[320px] md:h-[620px] rounded-[2.5rem] overflow-hidden border-[8px] border-[#1a1a1a] shadow-[0_30px_60px_rgba(0,155,58,0.2)] bg-[#112415] z-0 group">
            {/* Imagem Realista da Aplicação (Fornecida pelo Usuário) */}
            <Image 
              src="/mobile-mockup.png" 
              alt="Interface Mobile do Sistema" 
              fill
              className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
              priority
            />
            {/* Notch Fake (para estética de celular) */}
            <div className="absolute w-[120px] h-[25px] bg-[#1a1a1a] top-0 left-1/2 -translate-x-1/2 rounded-b-[1rem] z-30" />
            
            {/* Efeito de Reflexo no Vidro do Celular */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none z-20" />
          </div>

          {/* Floater Informativo sobreposto na imagem */}
          <div className="absolute bottom-16 right-0 md:-right-8 p-4 rounded-2xl bg-[#0a180b]/90 border border-[#009b3a]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl z-20 animate-in slide-in-from-right-8 duration-1000" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#009b3a]/20 flex items-center justify-center border border-[#009b3a]/30">
                <FileSignature className="h-5 w-5 text-[#009b3a]" />
              </div>
              <div className="text-left pr-4">
                <h4 className="text-white text-xs font-bold">Relatório PDF</h4>
                <p className="text-[#009b3a] text-[0.65rem] font-medium uppercase tracking-wider mt-0.5">Assinado</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Mobile-First Fixed */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-30" style={{ animationDelay: '600ms' }}>
          <Link 
            href="/dashboard" 
            className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-b from-[#fedf00] to-[#e6c900] active:scale-[0.98] text-[#051006] px-8 py-4.5 rounded-2xl text-[0.95rem] font-black transition-all shadow-[0_10px_40px_rgba(254,223,0,0.25)] uppercase tracking-widest overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Acessar Painel do Fiscal
              <ArrowRight className="h-4 w-4" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
          </Link>
        </div>

      </main>

      {/* Grade de Facilidades */}
      <section className="relative z-10 w-full max-w-md mx-auto px-5 mt-16 pb-12">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: '700ms' }}>
          <h2 className="text-xl font-black text-white">Funções Exclusivas do 71º BI Mtz</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000" style={{ animationDelay: '800ms' }}>
          
          <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#fedf00]/10 flex shrink-0 items-center justify-center border border-[#fedf00]/20">
              <FileSignature className="h-5 w-5 text-[#fedf00]" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white mb-1">Relatórios Mensais de Fiscalização</h3>
              <p className="text-zinc-400 text-[0.75rem] leading-relaxed">Emita a avaliação da empresa preenchendo as notas e checklist diretamente pelo celular.</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex shrink-0 items-center justify-center border border-red-500/20">
              <Bell className="h-5 w-5 text-red-400" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white mb-1">Notificação e Solicitação</h3>
              <p className="text-zinc-400 text-[0.75rem] leading-relaxed">Gere ofícios PDF oficiais para notificar a empresa ou solicitar troca de representante na hora.</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex shrink-0 items-center justify-center border border-blue-500/20">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white mb-1">Controle de Prazos</h3>
              <p className="text-zinc-400 text-[0.75rem] leading-relaxed">Alertas de vigência dos contratos e vencimento dos prazos de fiscalização para você não perder datas.</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
