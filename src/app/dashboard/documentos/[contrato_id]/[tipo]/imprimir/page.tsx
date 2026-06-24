import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { PrintTrigger } from '@/components/dashboard/print-trigger'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type TipoDocumento =
  | 'capa-livro'
  | 'abertura-livro'
  | 'solicitacao-preposto'
  | 'notificacao-irregularidade'
  | 'juntada-documentos'
  | 'encerramento'

// ─── Utilitários ──────────────────────────────────────────────────────────────
function formatarData(isoDate: string): string {
  if (!isoDate) return ''
  const parts = isoDate.split('-')
  if (parts.length === 3 && parts[0].length === 4) {
    const [ano, mes, dia] = parts
    const meses = [
      '', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    ]
    return `${dia} de ${meses[parseInt(mes)]} de ${ano}`
  }
  return isoDate
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarCPF(cpf: string): string {
  if (!cpf || cpf.length < 11) return cpf || ''
  return `***.${ cpf.slice(3, 6) }.${ cpf.slice(6, 9) }-**`
}

function nomeMotivo(slug: string): string {
  const map: Record<string, string> = {
    cumprimento: 'Cumprimento do Objeto Contratual',
    rescisao_consensual: 'Rescisão Consensual',
    rescisao_unilateral: 'Rescisão Unilateral pela Administração',
  }
  return map[slug] || slug
}

// ─── Cabeçalho Institucional ─────────────────────────────────────────────────
function CabecalhoExercito({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-1 mb-8 border-b-2 border-black pb-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Logo 71º BI Mtz" className="w-16 h-16 object-contain mb-2" />
      <span className="font-bold text-sm uppercase tracking-wider">Ministério da Defesa</span>
      <span className="font-bold text-sm uppercase tracking-wider">Exército Brasileiro</span>
      <span className="font-bold text-sm uppercase tracking-wider">71º Batalhão de Infantaria Motorizado</span>
      <span className="text-xs uppercase italic tracking-widest text-gray-600">(Seção de Contratos)</span>

      <div className="pt-4 space-y-1">
        <h1 className="text-base font-extrabold uppercase tracking-widest">{titulo}</h1>
        {subtitulo && <p className="text-xs text-gray-600">{subtitulo}</p>}
      </div>
    </div>
  )
}

// ─── Bloco de Assinatura Digital (igual ao relatório) ────────────────────────
function BlocoAssinaturaDigital({
  fiscal,
  papel,
  dataGeracao,
  contratoId,
  tipoDoc,
}: {
  fiscal: { nome: string; posto_graduacao: string; nome_guerra: string; cpf: string }
  papel: string
  dataGeracao: string
  contratoId: string
  tipoDoc: string
}) {
  return (
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
          <div><strong>Responsável:</strong> {fiscal.posto_graduacao} {fiscal.nome}</div>
          <div><strong>Papel:</strong> Fiscal Contratual {papel}</div>
          <div><strong>CPF:</strong> {formatarCPF(fiscal.cpf)}</div>
          <div><strong>Data de Geração:</strong> {dataGeracao}</div>
        </div>
      </div>

      {/* Registro do Sistema */}
      <div className="p-3 border border-dashed border-gray-400 bg-gray-50/50 rounded flex flex-col justify-between">
        <div>
          <div className="font-bold uppercase text-[0.7rem] text-green-800 mb-1 flex items-center gap-1">
            ✓ Gerado pelo Sistema
          </div>
          <p className="text-gray-600">Documento gerado eletronicamente pelo Sistema de Fiscalização — 71º BI Mtz.</p>
        </div>
        <div className="mt-4 space-y-0.5">
          <div><strong>Tipo:</strong> {tipoDoc}</div>
          <div><strong>Status:</strong> Emitido Eletronicamente</div>
          <div><strong>Data:</strong> {dataGeracao}</div>
          <div className="truncate text-gray-500"><strong>Ref. Contrato:</strong> {contratoId.slice(0, 8).toUpperCase()}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Rodapé ──────────────────────────────────────────────────────────────────
function Rodape({ contratoId }: { contratoId: string }) {
  return (
    <div className="mt-12 text-center text-[0.6rem] text-gray-500 font-mono border-t pt-4">
      A autenticidade deste documento pode ser confirmada diretamente no painel administrativo do Sistema de Fiscalização do 71º BI Mtz.<br />
      Chave de referência: {contratoId}
    </div>
  )
}

// ─── DOCUMENTO 0: Capa do Livro ──────────────────────────────────────────────
function CapaLivro({ contratos, params }: any) {
  const numeroLivro = params.numero_livro || ''
  const ano = params.ano || new Date().getFullYear()

  return (
    <div className="print-area h-full flex flex-col justify-between items-center py-6 text-center" style={{ minHeight: '235mm' }}>
      
      {/* Cabeçalho */}
      <div className="flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Logo 71º BI Mtz" className="w-20 h-20 object-contain mb-4" />
        <h2 className="text-lg font-bold uppercase tracking-widest mb-1">Ministério da Defesa</h2>
        <h3 className="text-base font-bold uppercase tracking-widest mb-1">Exército Brasileiro</h3>
        <h4 className="text-sm font-bold uppercase tracking-widest mb-8">71º Batalhão de Infantaria Motorizado</h4>
      </div>

      {/* Título Central */}
      <div className="border-4 border-black p-6 w-full max-w-2xl mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold uppercase tracking-widest">
          Livro de Acompanhamento
        </h1>
        {numeroLivro && (
          <h3 className="text-lg font-bold uppercase tracking-wider text-gray-700">
            Livro nº {numeroLivro} / {ano}
          </h3>
        )}
      </div>

      {/* Lista de Contratos */}
      <div className="w-full max-w-2xl text-left flex-1">
        <p className="text-xs uppercase tracking-wider font-bold text-center mb-4 text-gray-800">Contratos Vinculados</p>
        <div className="space-y-3">
          {contratos.map((c: any) => (
            <div key={c.id} className="border-b border-gray-300 pb-2 last:border-0 last:pb-0">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                Contrato nº {c.numero_contrato}
              </h2>
              <p className="text-xs font-bold mt-0.5 uppercase text-gray-700">{c.empresa}</p>
              <p className="text-[0.65rem] text-gray-600 font-medium uppercase">CNPJ: {c.cnpj}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé da Capa */}
      <div className="pt-8 font-bold uppercase tracking-widest text-sm">
        Garanhuns — PE<br />{ano}
      </div>
    </div>
  )
}

// ─── DOCUMENTO 1: Termo de Abertura do Livro ─────────────────────────────────
function TermoAberturaLivro({ contratos, fiscal, papel, params }: any) {
  const dataAbertura = params.data_abertura || ''
  const numeroLivro = params.numero_livro || ''
  const isMulti = contratos.length > 1
  const contratoId = isMulti ? contratos.map((c: any) => c.id).join(',') : contratos[0].id

  return (
    <div className="print-area">
      <CabecalhoExercito
        titulo="Termo de Abertura do Livro de Acompanhamento"
        subtitulo={isMulti ? `Múltiplos Contratos${numeroLivro ? ` — Livro nº ${numeroLivro}` : ''}` : `Contrato nº ${contratos[0].numero_contrato}${numeroLivro ? ` — Livro nº ${numeroLivro}` : ''}`}
      />

      <div className="space-y-5 text-sm text-justify leading-relaxed">
        <p>
          Aos <strong>{formatarData(dataAbertura)}</strong>, eu, <strong>{fiscal.posto_graduacao}{' '}
          {fiscal.nome}</strong>, na qualidade de Fiscal <strong>{papel}</strong>{' '}
          {isMulti ? (
            <>
              dos contratos abaixo relacionados, celebrados pelo{' '}
              <strong>71º Batalhão de Infantaria Motorizado</strong>, procedo à abertura do presente Livro de
              Acompanhamento da Execução Contratual.
            </>
          ) : (
            <>
              do Contrato nº <strong>{contratos[0].numero_contrato}</strong>, celebrado entre o{' '}
              <strong>71º Batalhão de Infantaria Motorizado</strong> e a empresa{' '}
              <strong>{contratos[0].empresa}</strong> (CNPJ: {contratos[0].cnpj}), cujo objeto é{' '}
              <em>&quot;{contratos[0].objeto}&quot;</em>, procedo à abertura do presente Livro de
              Acompanhamento da Execução Contratual.
            </>
          )}
        </p>

        {isMulti && (
          <div className="my-6 pl-4 border-l-2 border-gray-300 space-y-3">
            {contratos.map((c: any) => (
              <div key={c.id}>
                <strong>Contrato nº {c.numero_contrato}</strong> — {c.empresa} (CNPJ: {c.cnpj})<br/>
                <span className="text-xs text-gray-600">
                  Vigência: {new Date(c.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')} a {new Date(c.data_termino + 'T00:00:00').toLocaleDateString('pt-BR')} | Valor: {formatarMoeda(c.valor)}
                </span>
                <p className="text-xs italic mt-0.5">&quot;{c.objeto}&quot;</p>
              </div>
            ))}
          </div>
        )}

        <p>
          O presente livro destina-se ao registro cronológico de todas as ocorrências, anotações,
          notificações, correspondências e demais documentos relacionados à fiscalização e ao
          acompanhamento da execução {isMulti ? 'dos referidos contratos' : 'do referido contrato'}, em conformidade com o disposto na{' '}
          <strong>Lei nº 14.133, de 1º de abril de 2021</strong> (Lei de Licitações e Contratos
          Administrativos) e nas normas internas do Exército Brasileiro.
        </p>

        {!isMulti && (
          <p>
            O valor global do contrato é de <strong>{formatarMoeda(contratos[0].valor)}</strong>, com
            vigência de{' '}
            <strong>{new Date(contratos[0].data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>{' '}
            a{' '}
            <strong>{new Date(contratos[0].data_termino + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>.
          </p>
        )}

        <p>
          Determino que todas as anotações sejam efetuadas com clareza e objetividade, assinadas
          pelo fiscal responsável, visando garantir a transparência, o controle e a regularidade
          da execução contratual.
        </p>
        <p>
          E para constar, lavro o presente Termo de Abertura.
        </p>
      </div>

      <BlocoAssinaturaDigital
        fiscal={fiscal}
        papel={papel}
        dataGeracao={formatarData(dataAbertura)}
        contratoId={contratoId}
        tipoDoc="Termo de Abertura do Livro"
      />
      <Rodape contratoId={contratoId} />
    </div>
  )
}

// ─── DOCUMENTO 2: Ofício de Solicitação de Preposto ──────────────────────────
function OficioSolicitacaoPreposto({ contrato, fiscal, papel, params }: any) {
  const dataOficio = params.data_oficio || ''
  const numeroOficio = params.numero_oficio || ''
  const prazo = params.prazo_resposta || '5'

  return (
    <div className="print-area">
      <CabecalhoExercito titulo={`Ofício nº ${numeroOficio}/71BI-SC`} />

      <div className="text-right text-xs mb-6 text-gray-700">
        <p>Garanhuns — PE, {formatarData(dataOficio)}</p>
      </div>

      <div className="mb-6 text-sm">
        <p className="font-bold">Ao(À) Senhor(a) Responsável pela Empresa</p>
        <p className="font-bold uppercase">{contrato.empresa}</p>
        <p className="text-gray-600">CNPJ: {contrato.cnpj}</p>
      </div>

      <div className="space-y-5 text-sm text-justify leading-relaxed">
        <p>
          <strong>Assunto:</strong> Solicitação de indicação de preposto (representante) para
          acompanhamento da execução do Contrato nº <strong>{contrato.numero_contrato}</strong>.
        </p>
        <p>
          Senhor(a) Representante,
        </p>
        <p>
          Na qualidade de Fiscal <strong>{papel}</strong> do contrato supracitado, celebrado entre
          o <strong>71º Batalhão de Infantaria Motorizado</strong> e essa empresa, cujo objeto é{' '}
          <em>&quot;{contrato.objeto}&quot;</em>, venho, por meio deste ofício, solicitar a
          indicação formal de um <strong>preposto (representante)</strong> da contratada para
          acompanhar a execução do contrato e facilitar a comunicação com a Administração.
        </p>
        <p>
          O preposto deverá ser indicado formalmente, mediante documento escrito com nome completo,
          cargo/função, CPF e dados de contato (telefone e e-mail), no prazo de{' '}
          <strong>{prazo} dias úteis</strong> a contar do recebimento deste ofício.
        </p>
        <p>
          A indicação do preposto é requisito obrigatório nos termos do{' '}
          <strong>art. 118 da Lei nº 14.133/2021</strong>, que determina que a contratada mantenha
          preposto aceito pela Administração para representá-la na execução do contrato.
        </p>
        <p>
          Informamos que a ausência de indicação no prazo estabelecido poderá ensejar as medidas
          previstas no instrumento contratual.
        </p>
        <p>Atenciosamente,</p>
      </div>

      <BlocoAssinaturaDigital
        fiscal={fiscal}
        papel={papel}
        dataGeracao={formatarData(dataOficio)}
        contratoId={contrato.id}
        tipoDoc="Ofício de Solicitação de Preposto"
      />
      <Rodape contratoId={contrato.id} />
    </div>
  )
}

// ─── DOCUMENTO 3: Ofício de Notificação de Irregularidade ────────────────────
function OficioNotificacaoIrregularidade({ contrato, fiscal, papel, params }: any) {
  const dataOficio = params.data_oficio || ''
  const numeroOficio = params.numero_oficio || ''
  const descricao = params.descricao_irregularidade || ''
  const prazo = params.prazo_resposta || '10'

  return (
    <div className="print-area">
      <CabecalhoExercito titulo={`Ofício nº ${numeroOficio}/71BI-SC`} subtitulo="Notificação de Irregularidade na Execução Contratual" />

      <div className="text-right text-xs mb-6 text-gray-700">
        <p>Garanhuns — PE, {formatarData(dataOficio)}</p>
      </div>

      <div className="mb-6 text-sm">
        <p className="font-bold">Ao(À) Senhor(a) Responsável pela Empresa</p>
        <p className="font-bold uppercase">{contrato.empresa}</p>
        <p className="text-gray-600">CNPJ: {contrato.cnpj}</p>
      </div>

      <div className="space-y-5 text-sm text-justify leading-relaxed">
        <p>
          <strong>Assunto:</strong> Notificação de irregularidade na execução do Contrato nº{' '}
          <strong>{contrato.numero_contrato}</strong>.
        </p>
        <p>Senhor(a) Representante,</p>
        <p>
          Na qualidade de Fiscal <strong>{papel}</strong> do Contrato nº{' '}
          <strong>{contrato.numero_contrato}</strong>, celebrado entre o{' '}
          <strong>71º Batalhão de Infantaria Motorizado</strong> e essa empresa, cujo objeto é{' '}
          <em>&quot;{contrato.objeto}&quot;</em>, venho, por meio deste ofício, notificá-la
          formalmente acerca da seguinte irregularidade verificada na execução contratual:
        </p>

        <div className="border border-black rounded p-4 bg-gray-50 my-2">
          <p className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2">
            Irregularidade Identificada:
          </p>
          <p className="whitespace-pre-wrap text-sm">{descricao}</p>
        </div>

        <p>
          Diante do exposto, fica essa empresa <strong>NOTIFICADA</strong> para que, no prazo de{' '}
          <strong>{prazo} dias úteis</strong> a contar do recebimento deste ofício, adote as
          providências necessárias à regularização da situação e apresente à Fiscalização, por
          escrito, as justificativas ou comprovantes da regularização.
        </p>
        <p>
          Cientificamos que o descumprimento das obrigações contratuais, sem justificativa aceita
          pela Administração, poderá ensejar a aplicação das sanções previstas no instrumento
          contratual e na <strong>Lei nº 14.133/2021</strong>.
        </p>
        <p>Atenciosamente,</p>
      </div>

      <BlocoAssinaturaDigital
        fiscal={fiscal}
        papel={papel}
        dataGeracao={formatarData(dataOficio)}
        contratoId={contrato.id}
        tipoDoc="Ofício de Notificação de Irregularidade"
      />
      <Rodape contratoId={contrato.id} />
    </div>
  )
}

// ─── DOCUMENTO 4: Termo de Juntada de Documentos ─────────────────────────────
function TermoJuntadaDocumentos({ contrato, fiscal, papel, params }: any) {
  const dataJuntada = params.data_juntada || ''
  const listaRaw = params.lista_documentos || ''
  const listaDocumentos = listaRaw
    .split('\n')
    .map((l: string) => l.replace(/^[-*\s]+/, '').trim())
    .filter(Boolean)

  return (
    <div className="print-area">
      <CabecalhoExercito
        titulo="Termo de Juntada de Documentos"
        subtitulo={`Contrato nº ${contrato.numero_contrato}`}
      />

      <div className="space-y-5 text-sm text-justify leading-relaxed">
        <p>
          Aos <strong>{formatarData(dataJuntada)}</strong>, eu, <strong>{fiscal.posto_graduacao}{' '}
          {fiscal.nome}</strong>, na qualidade de Fiscal <strong>{papel}</strong> do Contrato nº{' '}
          <strong>{contrato.numero_contrato}</strong>, celebrado entre o{' '}
          <strong>71º Batalhão de Infantaria Motorizado</strong> e a empresa{' '}
          <strong>{contrato.empresa}</strong> (CNPJ: {contrato.cnpj}), cujo objeto é{' '}
          <em>&quot;{contrato.objeto}&quot;</em>, procedo à juntada dos documentos abaixo
          relacionados à pasta de acompanhamento da execução contratual:
        </p>

        <div className="border border-black rounded overflow-hidden my-4">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-black font-bold">
                <th className="px-4 py-2 border-r border-black w-12 text-center">Nº</th>
                <th className="px-4 py-2">Documento</th>
              </tr>
            </thead>
            <tbody>
              {listaDocumentos.map((doc: string, idx: number) => (
                <tr key={idx} className={idx < listaDocumentos.length - 1 ? 'border-b border-black' : ''}>
                  <td className="px-4 py-2 border-r border-black text-center font-bold">
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="px-4 py-2">{doc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          Os documentos acima listados foram conferidos e se encontram em conformidade com o
          exigido pelo instrumento contratual e pelas normas vigentes, sendo juntados à pasta de
          acompanhamento para fins de controle e eventual consulta.
        </p>
        <p>
          E por ser verdade, lavro o presente Termo de Juntada de Documentos para que produza
          seus efeitos legais.
        </p>
      </div>

      <BlocoAssinaturaDigital
        fiscal={fiscal}
        papel={papel}
        dataGeracao={formatarData(dataJuntada)}
        contratoId={contrato.id}
        tipoDoc="Termo de Juntada de Documentos"
      />
      <Rodape contratoId={contrato.id} />
    </div>
  )
}

// ─── DOCUMENTO 5: Termo de Encerramento ──────────────────────────────────────
function TermoEncerramento({ contrato, fiscal, papel, params }: any) {
  const dataEncerramento = params.data_encerramento || ''
  const motivo = params.motivo || 'cumprimento'
  const observacoes = params.observacoes || ''

  return (
    <div className="print-area">
      <CabecalhoExercito
        titulo="Termo de Encerramento de Contrato"
        subtitulo={`Contrato nº ${contrato.numero_contrato}`}
      />

      <div className="space-y-5 text-sm text-justify leading-relaxed">
        <p>
          Aos <strong>{formatarData(dataEncerramento)}</strong>, na sede do{' '}
          <strong>71º Batalhão de Infantaria Motorizado</strong>, lavro o presente Termo de
          Encerramento do Contrato nº <strong>{contrato.numero_contrato}</strong>, celebrado entre
          esta Organização Militar e a empresa{' '}
          <strong>{contrato.empresa}</strong> (CNPJ: {contrato.cnpj}), cujo objeto é{' '}
          <em>&quot;{contrato.objeto}&quot;</em>.
        </p>
        <p>
          O valor global do contrato foi de <strong>{formatarMoeda(contrato.valor)}</strong>, com
          vigência de{' '}
          <strong>{new Date(contrato.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>{' '}
          a{' '}
          <strong>{new Date(contrato.data_termino + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>.
        </p>
        <p>
          <strong>Motivo do Encerramento:</strong> <em>{nomeMotivo(motivo)}</em>.
        </p>

        {motivo === 'cumprimento' && (
          <p>
            Declaro, na qualidade de Fiscal <strong>{papel}</strong>, que a execução do contrato
            foi concluída de forma satisfatória, com o cumprimento integral do objeto pactuado,
            inexistindo pendências financeiras, documentais ou de qualquer natureza a serem
            regularizadas pelas partes.
          </p>
        )}
        {motivo === 'rescisao_consensual' && (
          <p>
            Declaro que o presente encerramento decorre de rescisão consensual entre as partes,
            nos termos do instrumento contratual, não havendo ônus ou sanções para quaisquer das
            partes envolvidas, observadas as cláusulas avençadas.
          </p>
        )}
        {motivo === 'rescisao_unilateral' && (
          <p>
            Declaro que o presente encerramento decorre de rescisão unilateral pela Administração,
            nos termos do <strong>art. 137 da Lei nº 14.133/2021</strong>, em virtude de
            descumprimento das obrigações contratuais pela contratada, cabendo as sanções previstas
            no instrumento e na legislação vigente.
          </p>
        )}

        {observacoes && (
          <div className="border border-gray-400 rounded p-4 bg-gray-50">
            <p className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2">
              Observações Adicionais:
            </p>
            <p className="whitespace-pre-wrap text-sm">{observacoes}</p>
          </div>
        )}

        <p>
          E por ser expressão da verdade, lavro o presente Termo de Encerramento, que será juntado
          à pasta de acompanhamento do contrato e aos autos do processo administrativo.
        </p>
      </div>

      <BlocoAssinaturaDigital
        fiscal={fiscal}
        papel={papel}
        dataGeracao={formatarData(dataEncerramento)}
        contratoId={contrato.id}
        tipoDoc="Termo de Encerramento de Contrato"
      />
      <Rodape contratoId={contrato.id} />
    </div>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default async function ImprimirDocumentoPage({
  params,
  searchParams,
}: {
  params: Promise<{ contrato_id: string; tipo: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { contrato_id, tipo } = await params
  const sp = await searchParams

  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Apenas fiscais podem gerar documentos
  const { data: perfilData } = await supabaseAdmin
    .from('users')
    .select('perfil, nome, posto_graduacao, nome_guerra, cpf')
    .eq('id', user.id)
    .single()

  if (perfilData?.perfil === 'ADMIN') redirect('/dashboard')

  // Buscar os contratos e garantir vínculo com o fiscal logado
  const ids = decodeURIComponent(contrato_id).split(',')
  const { data: contratos } = await supabaseAdmin
    .from('contratos')
    .select('*')
    .in('id', ids)
    .or(`fiscal_titular_id.eq.${user.id},fiscal_substituto_id.eq.${user.id}`)

  if (!contratos || contratos.length === 0) redirect('/dashboard/documentos')

  const contrato = contratos[0]
  const papel = contrato.fiscal_titular_id === user.id ? 'Titular' : 'Substituto'
  const fiscal = perfilData!

  function renderDocumento() {
    switch (tipo as TipoDocumento) {
      case 'capa-livro':
        return <CapaLivro contratos={contratos} params={sp} />
      case 'abertura-livro':
        return <TermoAberturaLivro contratos={contratos} fiscal={fiscal} papel={papel} params={sp} />
      case 'solicitacao-preposto':
        return <OficioSolicitacaoPreposto contrato={contrato} fiscal={fiscal} papel={papel} params={sp} />
      case 'notificacao-irregularidade':
        return <OficioNotificacaoIrregularidade contrato={contrato} fiscal={fiscal} papel={papel} params={sp} />
      case 'juntada-documentos':
        return <TermoJuntadaDocumentos contrato={contrato} fiscal={fiscal} papel={papel} params={sp} />
      case 'encerramento':
        return <TermoEncerramento contrato={contrato} fiscal={fiscal} papel={papel} params={sp} />
      default:
        return <p className="text-center text-red-600 font-bold">Tipo de documento desconhecido.</p>
    }
  }

  return (
    <div className="bg-gray-200 text-black font-serif leading-relaxed min-h-screen flex flex-col">
      {/* Barra de ações — oculta na impressão */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-gray-100 px-6 py-4 border-b border-gray-300 shadow-sm sticky top-0 z-10">
        <Link
          href="/dashboard/documentos"
          className={buttonVariants({ variant: 'outline', className: 'text-gray-700 border-gray-300 bg-white' })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Documentos
        </Link>
        <PrintTrigger />
      </div>

      {/* Container de visualização (escala no mobile para manter formato A4 sem cortar) */}
      <div className="flex-1 overflow-x-auto p-4 sm:p-8 flex justify-center bg-gray-200">
        {/* Folha simulada estilo A4 com zoom automático */}
        <div className="mobile-a4-wrapper bg-white shadow-xl shrink-0">
          {/* Conteúdo imprimível com margens oficiais idênticas à impressão */}
          <div className="px-[30mm] py-[25mm] print-area text-base">
            {renderDocumento()}
          </div>
        </div>
      </div>

      {/* Estilos de impressão */}
      <style dangerouslySetInnerHTML={{ __html: printCSS }} />
    </div>
  )
}

const printCSS = `
  .mobile-a4-wrapper {
    width: 210mm;
    min-width: 210mm;
    margin: 0 auto;
    transform-origin: top center;
  }
  
  /* Fallback escalonado para navegadores mobile que não suportam calc() no zoom */
  @media screen and (max-width: 850px) { .mobile-a4-wrapper { zoom: 0.9; } }
  @media screen and (max-width: 768px) { .mobile-a4-wrapper { zoom: 0.85; } }
  @media screen and (max-width: 640px) { .mobile-a4-wrapper { zoom: 0.7; } }
  @media screen and (max-width: 550px) { .mobile-a4-wrapper { zoom: 0.6; } }
  @media screen and (max-width: 480px) { .mobile-a4-wrapper { zoom: 0.52; } }
  @media screen and (max-width: 430px) { .mobile-a4-wrapper { zoom: 0.46; } }
  @media screen and (max-width: 390px) { .mobile-a4-wrapper { zoom: 0.42; } }
  @media screen and (max-width: 350px) { .mobile-a4-wrapper { zoom: 0.38; } }

  @page {
    size: A4 portrait;
    margin: 25mm 20mm 25mm 30mm;
  }
  @media print {
    html, body {
      background: white !important;
      color: black !important;
      padding: 0 !important;
      margin: 0 !important;
      overflow: visible !important;
      height: auto !important;
    }
    header, aside, [data-sidebar], .no-print, nav, #mobile-nav {
      display: none !important;
    }
    main {
      padding: 0 !important;
      margin: 0 !important;
      background: transparent !important;
      overflow: visible !important;
    }
    .min-h-screen, .shadow-xl {
      background: white !important;
      box-shadow: none !important;
      height: auto !important;
      min-height: unset !important;
      overflow: visible !important;
    }
    .bg-gray-100 {
      background: white !important;
    }
    .print-area {
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      overflow: visible !important;
      border: none !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    /* Remove height/overflow constraints on all wrappers */
    div {
      overflow: visible !important;
    }
    table {
      width: 100% !important;
      table-layout: fixed !important;
    }
    .break-inside-avoid {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
`
