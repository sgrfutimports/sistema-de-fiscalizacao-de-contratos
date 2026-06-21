import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { FileText, Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

// Componente para lidar com a chamada do print no lado do cliente
import { PrintTrigger } from '@/components/dashboard/print-trigger'

export default async function ImprimirRelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Busca sessão do usuário
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca detalhes do relatório usando o admin client
  const { data: relatorio } = await supabaseAdmin
    .from('relatorios')
    .select(`
      *,
      contrato:contratos!contrato_id(numero_contrato, empresa, objeto, valor),
      fiscal:users!fiscal_id(nome, posto_graduacao, nome_guerra, cpf, email, perfil)
    `)
    .eq('id', id)
    .single()

  if (!relatorio) {
    redirect('/dashboard/meus-relatorios')
  }

  // Verifica se o usuário tem permissão para visualizar (Dono do relatório ou Admin)
  const { data: currentUser } = await supabaseAdmin.from('users').select('perfil').eq('id', user.id).single()
  const isAdmin = currentUser?.perfil === 'ADMIN'
  const isOwner = relatorio.fiscal_id === user.id

  if (!isAdmin && !isOwner) {
    redirect('/dashboard/meus-relatorios')
  }

  // Só permite gerar a certidão se o relatório estiver APROVADO
  if (relatorio.status !== 'APROVADO') {
    redirect(`/dashboard/relatorios/${relatorio.id}`)
  }

  function formatCompetencia(mes: number, ano: number) {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return `${meses[mes - 1]} de ${ano}`
  }

  const formatCPF = (cpf: string) => {
    if (!cpf) return ''
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**')
  }

  const hasDetailedVerifications = relatorio.verificacoes && typeof relatorio.verificacoes === 'object' && Object.keys(relatorio.verificacoes).length > 0;

  function renderVerificacoesTable(v: any, docs: any) {
    const formatValue = (val: boolean | undefined) => {
      if (val === true) return <span className="text-green-700 font-bold">SIM</span>
      if (val === false) return <span className="text-red-700 font-bold">NÃO</span>
      return <span className="text-gray-400 font-bold">N/A</span>
    }

    const formatDoc = (val: string | undefined) => {
      if (val) return <span className="text-green-700 font-bold">APRESENTADO</span>
      return <span className="text-gray-500">NÃO APRESENTADO</span>
    }

    return (
      <div className="my-4 border border-black rounded overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-black font-bold">
              <th className="px-4 py-2 border-r border-black w-3/4">Indicador / Item de Controle</th>
              <th className="px-4 py-2 text-center">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {/* Bloco 1 */}
            <tr className="bg-gray-50 border-b border-black font-bold">
              <td colSpan={2} className="px-4 py-1 text-[0.65rem] uppercase tracking-wider text-gray-600">Bloco 1 – Execução Contratual</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">1.1. Fiscalização realizada?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.execucao?.realizada)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">1.2. Objeto executado conforme contratado?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.execucao?.conforme)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">1.3. Ocorrências registradas?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.execucao?.ocorrencias)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">1.4. Necessidade de notificação?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.execucao?.notificacao)}</td>
            </tr>

            {/* Bloco 2 */}
            <tr className="bg-gray-50 border-b border-black font-bold">
              <td colSpan={2} className="px-4 py-1 text-[0.65rem] uppercase tracking-wider text-gray-600">Bloco 2 – Regularidade Fiscal</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">2.1. SICAF regular?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.fiscal?.sicaf)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">2.2. Certidões Federais válidas?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.fiscal?.certidoes)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">2.3. FGTS regular?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.fiscal?.fgts)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">2.4. CNDT válida?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.fiscal?.cndt)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">2.5. CEIS/CNEP sem restrições?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.fiscal?.ceis)}</td>
            </tr>

            {/* Bloco 3 */}
            <tr className="bg-gray-50 border-b border-black font-bold">
              <td colSpan={2} className="px-4 py-1 text-[0.65rem] uppercase tracking-wider text-gray-600">Bloco 3 – Pagamento (Despesa)</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">3.1. Nota Fiscal apresentada?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.pagamento?.nf_apresentada)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">3.2. Nota Fiscal atestada?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.pagamento?.nf_atestada)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">3.3. Ordem Bancária emitida?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.pagamento?.ob_emitida)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">3.4. Pagamento realizado?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.pagamento?.realizado)}</td>
            </tr>

            {/* Bloco 4 */}
            <tr className="bg-gray-50 border-b border-black font-bold">
              <td colSpan={2} className="px-4 py-1 text-[0.65rem] uppercase tracking-wider text-gray-600">Bloco 4 – Receita (Permissionários)</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">4.1. GRU emitida?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.receita?.gru_emitida)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">4.2. GRU paga?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.receita?.gru_paga)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">4.3. Valor recolhido corretamente?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.receita?.valor_correto)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">4.4. Comprovante anexado?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.receita?.comprovante)}</td>
            </tr>

            {/* Bloco 5 */}
            <tr className="bg-gray-50 border-b border-black font-bold">
              <td colSpan={2} className="px-4 py-1 text-[0.65rem] uppercase tracking-wider text-gray-600">Bloco 5 – Gestão Contratual</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">5.1. Garantia vigente?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.gestao?.garantia)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">5.2. Vigência regular?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.gestao?.vigencia)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">5.3. Necessidade de aditivo?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.gestao?.aditivo)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">5.4. Necessidade de reajuste?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.gestao?.reajuste)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">5.5. Necessidade de repactuação?</td>
              <td className="px-4 py-1 text-center">{formatValue(v.gestao?.repactuacao)}</td>
            </tr>

            {/* Bloco 6 */}
            <tr className="bg-gray-50 border-b border-black font-bold">
              <td colSpan={2} className="px-4 py-1 text-[0.65rem] uppercase tracking-wider text-gray-600">Bloco 6 – Documentos Anexados</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">6.1. Nota Fiscal</td>
              <td className="px-4 py-1 text-center">{formatDoc(docs.nota_fiscal)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">6.2. GRU</td>
              <td className="px-4 py-1 text-center">{formatDoc(docs.gru)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">6.3. Ordem Bancária</td>
              <td className="px-4 py-1 text-center">{formatDoc(docs.ordem_bancaria)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">6.4. Certidões</td>
              <td className="px-4 py-1 text-center">{formatDoc(docs.certidoes)}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="px-6 py-1 border-r border-black">6.5. Relatório Fotográfico</td>
              <td className="px-4 py-1 text-center">{formatDoc(docs.fotografico)}</td>
            </tr>
            <tr>
              <td className="px-6 py-1 border-r border-black">6.6. Notificações</td>
              <td className="px-4 py-1 text-center">{formatDoc(docs.notificacoes)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-white text-black p-4 sm:p-8 font-serif leading-relaxed max-w-4xl mx-auto shadow-inner relative overflow-x-hidden">
      {/* Botões do Topo (Escondidos na impressão) */}
      <div className="no-print mb-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-gray-100 p-4 rounded-lg border border-gray-200">
        <Link href={`/dashboard/relatorios/${relatorio.id}`} className={buttonVariants({ variant: "outline", className: "text-gray-700 border-gray-300" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Detalhes
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
          <span className="text-xs uppercase italic tracking-widest text-gray-600">(Fiscalização)</span>
        </div>

        {/* Título da Certidão */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-lg font-extrabold uppercase tracking-widest decoration-1">
            Certidão de Fiscalização de Contrato
          </h1>
          <p className="text-xs font-mono text-gray-500">Competência: {formatCompetencia(relatorio.competencia_mes, relatorio.competencia_ano)}</p>
        </div>

        {/* Corpo do Texto */}
        <div className="space-y-6 text-sm text-justify">
          <p>
            Certifico, para fins de acompanhamento da execução contratual e liquidação de despesa, que na qualidade de 
            Fiscal {relatorio.tipo_fiscal === 'Titular' ? 'Titular' : 'Substituto'} do Contrato nº <strong>{relatorio.contrato.numero_contrato}</strong>, 
            celebrado entre a União, por intermédio do 71º Batalhão de Infantaria Motorizada, e a empresa <strong>{relatorio.contrato.empresa}</strong>, 
            tendo por objeto <em>&quot;{relatorio.contrato.objeto}&quot;</em>, procedi ao acompanhamento e fiscalização dos serviços prestados e/ou materiais fornecidos durante o mês de <strong>{formatCompetencia(relatorio.competencia_mes, relatorio.competencia_ano)}</strong>.
          </p>

          <p>
            Com base nas verificações efetuadas in loco, nos canais oficiais de comunicação e na análise documental, atesto os seguintes indicadores de regularidade contratual:
          </p>

          {/* Tabela de Verificações */}
          {hasDetailedVerifications ? (
            renderVerificacoesTable(relatorio.verificacoes, relatorio.documentos)
          ) : (
            <div className="my-4 border border-black rounded overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-black font-bold">
                    <th className="px-4 py-2 border-r border-black w-3/4">Item Avaliado</th>
                    <th className="px-4 py-2 text-center">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="px-4 py-2 border-r border-black font-bold">1. Acompanhamento/Vistoria de Campo Realizada?</td>
                    <td className={`px-4 py-2 text-center font-bold ${relatorio.fiscalizacao_realizada ? 'text-green-700' : 'text-red-700'}`}>
                      {relatorio.fiscalizacao_realizada ? 'SIM' : 'NÃO'}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="px-4 py-2 border-r border-black font-bold">2. Serviços prestados/Materiais entregues estão em conformidade?</td>
                    <td className={`px-4 py-2 text-center font-bold ${relatorio.servico_conforme ? 'text-green-700' : 'text-red-700'}`}>
                      {relatorio.servico_conforme ? 'SIM' : 'NÃO'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-r border-black font-bold">3. Regularidade fiscal e trabalhista da contratada apresentada?</td>
                    <td className={`px-4 py-2 text-center font-bold ${relatorio.documentacao_apresentada ? 'text-green-700' : 'text-red-700'}`}>
                      {relatorio.documentacao_apresentada ? 'SIM' : 'NÃO'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Anotações de Ocorrência */}
          <div className="space-y-4 pt-4">
            <div>
              <span className="font-bold text-xs uppercase block text-gray-700">A. Ocorrências / Faltas Anotadas:</span>
              <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs mt-1 min-h-[50px] whitespace-pre-wrap">
                {relatorio.ocorrencias || 'Sem ocorrências registradas na competência.'}
              </div>
            </div>

            <div>
              <span className="font-bold text-xs uppercase block text-gray-700">B. Pendências Pendentes de Regularização:</span>
              <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs mt-1 min-h-[50px] whitespace-pre-wrap">
                {relatorio.pendencias || 'Nenhuma pendência financeira ou documental em aberto.'}
              </div>
            </div>

            <div>
              <span className="font-bold text-xs uppercase block text-gray-700">C. Observações Adicionais / Sugestões ao Gestor:</span>
              <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs mt-1 min-h-[50px] whitespace-pre-wrap">
                {relatorio.observacoes || 'Sem observações adicionais.'}
              </div>
            </div>
          </div>
        </div>

        {/* Bloco de Assinaturas Digitais / Eletrônicas */}
        <div className="mt-12 pt-8 border-t border-black grid grid-cols-2 gap-8 text-[0.65rem] leading-normal font-mono break-inside-avoid">
          
          {/* Assinatura do Fiscal */}
          <div className="p-3 border border-dashed border-gray-400 bg-gray-50/50 rounded flex flex-col justify-between">
            <div>
              <div className="font-bold uppercase text-[0.7rem] text-green-800 mb-1 flex items-center gap-1">
                ✓ Assinado Eletronicamente
              </div>
              <p className="text-gray-600">Documento assinado digitalmente no portal de fiscalização do 71º BI Mtz.</p>
            </div>
            <div className="mt-4 space-y-0.5">
              <div><strong>Responsável:</strong> {relatorio.fiscal.posto_graduacao} {relatorio.fiscal.nome}</div>
              <div><strong>Papel:</strong> Fiscal Contratual {relatorio.tipo_fiscal}</div>
              <div><strong>CPF:</strong> {formatCPF(relatorio.fiscal.cpf)}</div>
              <div><strong>Data do Envio:</strong> {new Date(relatorio.data_envio).toLocaleString('pt-BR')}</div>
            </div>
          </div>

          {/* Homologação do Gestor */}
          <div className="p-3 border border-dashed border-gray-400 bg-gray-50/50 rounded flex flex-col justify-between">
            <div>
              <div className="font-bold uppercase text-[0.7rem] text-green-800 mb-1 flex items-center gap-1">
                ✓ Homologado e Aprovado
              </div>
              <p className="text-gray-600">Certidão chancelada pela Seção de Contratos / Ordenador de Despesas.</p>
              {relatorio.parecer_administrador && (
                <div className="mt-2 text-gray-700 italic border-l-2 border-gray-400 pl-2">
                  &quot;{relatorio.parecer_administrador}&quot;
                </div>
              )}
            </div>
            <div className="mt-4 space-y-0.5">
              <div><strong>Gestor:</strong> Fiscal Administrativo / Gestor</div>
              <div><strong>Status:</strong> Homologado Eletronicamente</div>
              <div><strong>Data de Aprovação:</strong> {relatorio.data_aprovacao ? new Date(relatorio.data_aprovacao).toLocaleString('pt-BR') : ''}</div>
              <div className="truncate text-gray-500"><strong>Identificação:</strong> {relatorio.id}</div>
            </div>
          </div>

        </div>

        {/* Rodapé de autenticação */}
        <div className="mt-12 text-center text-[0.6rem] text-gray-500 font-mono border-t pt-4">
          A autenticidade deste documento pode ser confirmada diretamente no painel administrativo do Sistema de Fiscalização do 71º BI Mtz.<br />
          Chave única de verificação: {relatorio.id}
        </div>
      </div>

      {/* Estilos específicos para impressão */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4;
          margin: 20mm 15mm 20mm 30mm;
        }
        @media print {
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          header, aside, [data-sidebar], .no-print, nav.fixed.bottom-0, #mobile-nav {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
          }
          .print-area {
            width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Força as tabelas a não quebrarem a formatação no mobile */
          table {
            width: 100% !important;
            table-layout: fixed !important;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}} />
    </div>
  )
}
