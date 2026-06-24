import Link from 'next/link'
import { 
  FileSignature, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  Clock, 
  History,
  Bell,
  UserPlus
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

        {/* Mockup do App CSS-Based (Idêntico ao Real) */}
        <div className="w-full relative flex justify-center mb-12 animate-in fade-in zoom-in-95 duration-1000" style={{ animationDelay: '400ms' }}>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#050A06] via-transparent to-transparent z-20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-[#009b3a]/20 blur-[60px] rounded-full" />
          
          {/* Frame de Celular CSS */}
          <div className="relative border-[#1a1a1a] bg-[#1a1a1a] border-[10px] rounded-[3rem] h-[580px] w-[290px] shadow-[0_30px_60px_rgba(0,155,58,0.2)] z-10 overflow-hidden transform hover:scale-[1.02] transition-transform duration-700">
            {/* Notch */}
            <div className="absolute w-[120px] h-[25px] bg-[#1a1a1a] top-0 left-1/2 -translate-x-1/2 rounded-b-[1rem] z-30" />
            
            {/* Tela Real do Sistema (Replicação Visual) */}
            <div className="relative w-full h-full bg-[#f8fafc] text-slate-900 flex flex-col font-sans overflow-hidden">
              
              {/* Header do Sistema */}
              <div className="bg-[#009b3a] px-4 pt-10 pb-4 text-white shadow-md relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] opacity-90 uppercase font-bold leading-tight">Fiscalização</span>
                    <span className="text-xs font-black">Sgt João - 71º BI Mtz</span>
                  </div>
                </div>
              </div>

              {/* Corpo do Sistema */}
              <div className="flex-1 p-4 flex flex-col gap-3 bg-slate-50 relative">
                
                {/* Banner de Prazo */}
                <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 flex gap-3 shadow-sm items-center">
                  <div className="bg-amber-500 rounded-full p-2 h-8 w-8 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-amber-900 text-[0.65rem] font-bold uppercase">Atenção ao Prazo</span>
                    <span className="text-amber-800 text-xs font-medium">Faltam 5 dias para o relatório.</span>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-800 mt-2 mb-1">Ações Rápidas (Fiscal)</h3>

                {/* Botões de Ação Iguais aos Reais */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2 shadow-sm">
                    <FileSignature className="w-6 h-6 text-[#009b3a]" />
                    <span className="text-[0.65rem] font-bold text-center text-slate-700 leading-tight">Relatório<br/>Mensal</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2 shadow-sm">
                    <Bell className="w-6 h-6 text-red-600" />
                    <span className="text-[0.65rem] font-bold text-center text-slate-700 leading-tight">Emitir<br/>Notificação</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2 shadow-sm">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                    <span className="text-[0.65rem] font-bold text-center text-slate-700 leading-tight">Solicitar<br/>Representante</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2 shadow-sm">
                    <FileText className="w-6 h-6 text-slate-700" />
                    <span className="text-[0.65rem] font-bold text-center text-slate-700 leading-tight">Termo de<br/>Recebimento</span>
                  </div>
                </div>

                {/* Contrato Ativo */}
                <div className="mt-2 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-800">Serviço de Limpeza</span>
                    <span className="text-[0.6rem] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">Ativo</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1 overflow-hidden">
                    <div className="bg-[#009b3a] h-1.5 rounded-full w-[65%]" />
                  </div>
                  <span className="text-[0.55rem] text-slate-500 font-medium">Vigência: 65% concluída</span>
                </div>
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
