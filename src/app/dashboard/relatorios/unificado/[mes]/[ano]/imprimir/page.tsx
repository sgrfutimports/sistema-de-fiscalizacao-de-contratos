import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { FileText, Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { PrintTrigger } from '@/components/dashboard/print-trigger'

export default async function ImprimirRelatorioUnificadoPage({
  params
}: {
  params: Promise<{ mes: string; ano: string }>
}) {
  const { mes, ano } = await params
  const mesNum = parseInt(mes)
  const anoNum = parseInt(ano)

  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Busca sessão do usuário
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca todos os relatórios do fiscal para o período selecionado
  const { data: relatorios } = await supabaseAdmin
    .from('relatorios')
    .select(`
      *,
      contrato:contratos!contrato_id(numero_contrato, empresa, objeto, valor),
      fiscal:users!fiscal_id(nome, posto_graduacao, nome_guerra, cpf, email, perfil)
    `)
    .eq('fiscal_id', user.id)
    .eq('competencia_mes', mesNum)
    .eq('competencia_ano', anoNum)

  if (!relatorios || relatorios.length === 0) {
    redirect('/dashboard/meus-relatorios')
  }

  // Obter dados do fiscal
  const fiscal = relatorios[0].fiscal
  const dataEnvioMaisRecente = relatorios.reduce((latest, r) => {
    return new Date(r.data_envio) > new Date(latest) ? r.data_envio : latest
  }, relatorios[0].data_envio)

  // Apenas relatórios aprovados podem gerar certidão unificada
  const todosAprovados = relatorios.every(r => r.status === 'APROVADO')
  const dataAprovacaoMaisRecente = todosAprovados 
    ? relatorios.reduce((latest, r) => {
        return r.data_aprovacao && new Date(r.data_aprovacao) > new Date(latest) ? r.data_aprovacao : latest
      }, relatorios[0].data_aprovacao || new Date().toISOString())
    : null

  function formatCompetencia(m: number, a: number) {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return `${meses[m - 1]} de ${a}`
  }

  const formatCPF = (cpf: string) => {
    if (!cpf) return ''
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**')
  }

  return (
    <div className="min-h-screen bg-white text-black p-8 font-serif leading-relaxed max-w-4xl mx-auto shadow-inner relative">
      {/* Botões do Topo (Escondidos na impressão) */}
      <div className="no-print mb-8 flex justify-between items-center bg-gray-100 p-4 rounded-lg border border-gray-200">
        <Link href="/dashboard/meus-relatorios" className={buttonVariants({ variant: "outline", className: "text-gray-700 border-gray-300" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Meus Relatórios
        </Link>
        <PrintTrigger />
      </div>

      {/* Conteúdo Imprimível */}
      <div className="print-area">
        {/* Cabeçalho do Exército */}
        <div className="flex flex-col items-center text-center space-y-1 mb-8 border-b-2 border-black pb-6">
          <div className="w-16 h-16 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo 71º BI Mtz" className="w-full height-full object-contain" />
          </div>
          <span className="font-bold text-sm uppercase tracking-wider">Ministério da Defesa</span>
          <span className="font-bold text-sm uppercase tracking-wider">Exército Brasileiro</span>
          <span className="font-bold text-sm uppercase tracking-wider">71º Batalhão de Infantaria Motorizada</span>
          <span className="text-xs uppercase italic tracking-widest text-gray-600">(Batalhão Duarte Coelho)</span>
        </div>

        {/* Título da Certidão */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-lg font-extrabold uppercase tracking-widest decoration-1">
            Certidão Unificada de Fiscalização de Contratos
          </h1>
          <p className="text-xs font-mono text-gray-500">Período de Competência: {formatCompetencia(mesNum, anoNum)}</p>
        </div>

        {/* Corpo do Texto */}
        <div className="space-y-6 text-sm text-justify">
          <p>
            Certifico, para fins de acompanhamento da execução contratual e liquidação de despesa, que na qualidade de 
            Fiscal Contratual do 71º Batalhão de Infantaria Motorizada, procedi ao acompanhamento e à fiscalização mensal 
            dos serviços prestados e/ou materiais fornecidos relativos aos contratos sob minha responsabilidade descritos a seguir, 
            durante o período de <strong>{formatCompetencia(mesNum, anoNum)}</strong>.
          </p>

          <p>
            Com base nas verificações efetuadas, apresento o ateste e os indicadores de regularidade de cada contrato:
          </p>

          {/* Tabela Consolidada de Contratos */}
          <div className="my-6 border border-black rounded overflow-hidden">
            <table className="w-full text-[0.75rem] text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-black font-bold">
                  <th className="px-3 py-2 border-r border-black">Contrato / Empresa</th>
                  <th className="px-3 py-2 border-r border-black text-center">Vistoria Realizada</th>
                  <th className="px-3 py-2 border-r border-black text-center">Serviço Conforme</th>
                  <th className="px-3 py-2 text-center">Doc. Regular</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {relatorios.map((rel) => (
                  <tr key={rel.id}>
                    <td className="px-3 py-2 border-r border-black font-bold">
                      {rel.contrato.numero_contrato} - {rel.contrato.empresa}
                    </td>
                    <td className="px-3 py-2 border-r border-black text-center font-bold">
                      {rel.fiscalizacao_realizada ? 'SIM' : 'NÃO'}
                    </td>
                    <td className="px-3 py-2 border-r border-black text-center font-bold">
                      {rel.servico_conforme ? 'SIM' : 'NÃO'}
                    </td>
                    <td className="px-3 py-2 text-center font-bold">
                      {rel.documentacao_apresentada ? 'SIM' : 'NÃO'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detalhamento das anotações de cada contrato */}
          <div className="space-y-6 pt-4">
            <h3 className="font-bold text-xs uppercase tracking-wider border-b pb-1">Detalhamento por Contrato</h3>
            
            {relatorios.map((rel) => (
              <div key={rel.id} className="space-y-3 p-4 bg-gray-50/50 border border-gray-200 rounded-lg">
                <div className="font-bold text-xs text-gray-800">
                  Contrato: {rel.contrato.numero_contrato} ({rel.contrato.empresa})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-[0.65rem] uppercase text-gray-500 block">Anotações / Ocorrências:</span>
                    <p className="mt-1 italic text-gray-700">{rel.ocorrencias || 'Sem ocorrências.'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-[0.65rem] uppercase text-gray-500 block">Pendências da Empresa:</span>
                    <p className="mt-1 italic text-gray-700">{rel.pendencias || 'Nenhuma pendência.'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-[0.65rem] uppercase text-gray-500 block">Recomendações / Observações:</span>
                    <p className="mt-1 italic text-gray-700">{rel.observacoes || 'Sem observações.'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bloco de Assinaturas Digitais / Eletrônicas */}
        <div className="mt-12 pt-8 border-t border-black grid grid-cols-1 md:grid-cols-2 gap-8 text-[0.65rem] leading-normal font-mono">
          
          {/* Assinatura do Fiscal */}
          <div className="p-3 border border-dashed border-gray-400 bg-gray-50/50 rounded flex flex-col justify-between">
            <div>
              <div className="font-bold uppercase text-[0.7rem] text-green-800 mb-1 flex items-center gap-1">
                ✓ Assinado Eletronicamente
              </div>
              <p className="text-gray-600">Documento assinado digitalmente no portal de fiscalização do 71º BI Mtz.</p>
            </div>
            <div className="mt-4 space-y-0.5">
              <div><strong>Responsável:</strong> {fiscal.posto_graduacao} {fiscal.nome}</div>
              <div><strong>CPF:</strong> {formatCPF(fiscal.cpf)}</div>
              <div><strong>Data do Envio:</strong> {new Date(dataEnvioMaisRecente).toLocaleString('pt-BR')}</div>
            </div>
          </div>

          {/* Homologação do Gestor */}
          <div className="p-3 border border-dashed border-gray-400 bg-gray-50/50 rounded flex flex-col justify-between">
            <div>
              <div className="font-bold uppercase text-[0.7rem] text-green-800 mb-1 flex items-center gap-1">
                {todosAprovados ? '✓ Homologado e Aprovado' : '⏳ Aguardando Homologação'}
              </div>
              <p className="text-gray-600">
                {todosAprovados 
                  ? 'Certidão consolidada chancelada pelo Ordenador de Despesas.' 
                  : 'A certidão unificada ficará disponível após aprovação de todos os relatórios deste período.'}
              </p>
            </div>
            {todosAprovados && (
              <div className="mt-4 space-y-0.5">
                <div><strong>Gestor:</strong> Seção de Contratos</div>
                <div><strong>Status:</strong> Homologado Eletronicamente</div>
                <div><strong>Data de Aprovação:</strong> {dataAprovacaoMaisRecente ? new Date(dataAprovacaoMaisRecente).toLocaleString('pt-BR') : ''}</div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé de autenticação */}
        <div className="mt-12 text-center text-[0.6rem] text-gray-500 font-mono border-t pt-4">
          A autenticidade deste documento unificado pode ser confirmada diretamente no painel administrativo do 71º BI Mtz.
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}} />
    </div>
  )
}
