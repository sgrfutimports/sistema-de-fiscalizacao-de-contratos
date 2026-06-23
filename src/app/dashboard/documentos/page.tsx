'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  FileText,
  BookOpen,
  Send,
  AlertTriangle,
  FolderOpen,
  XCircle,
  ChevronRight,
  Loader2,
  FileSignature,
  LayoutTemplate,
} from 'lucide-react'

const TIPOS_DOCUMENTO = [
  {
    slug: 'abertura-livro',
    titulo: 'Termo de Abertura do Livro de Acompanhamento',
    descricao: 'Formaliza a abertura do livro de registro de fiscalização do contrato.',
    icon: BookOpen,
    cor: 'from-emerald-600 to-emerald-700',
    corBorder: 'border-emerald-500/40',
    corBg: 'bg-emerald-500/10',
    corText: 'text-emerald-400',
    campos: [
      { name: 'data_abertura', label: 'Data de Abertura', type: 'date', required: true },
      { name: 'numero_livro', label: 'Nº do Livro (opcional)', type: 'text', required: false, placeholder: 'Ex: 001' },
    ],
  },
  {
    slug: 'capa-livro',
    titulo: 'Capa do Livro de Acompanhamento',
    descricao: 'Gera a página de rosto/capa para o livro físico de registro de fiscalização.',
    icon: LayoutTemplate,
    cor: 'from-slate-600 to-slate-700',
    corBorder: 'border-slate-500/40',
    corBg: 'bg-slate-500/10',
    corText: 'text-slate-400',
    multiContrato: true,
    campos: [
      { name: 'numero_livro', label: 'Nº do Livro (opcional)', type: 'text', required: false, placeholder: 'Ex: 001' },
      { name: 'ano', label: 'Ano de Abertura', type: 'text', required: true, placeholder: 'Ex: 2026' },
    ],
  },
  {
    slug: 'solicitacao-preposto',
    titulo: 'Ofício de Solicitação de Preposto (Representante)',
    descricao: 'Solicita formalmente à contratada a indicação de seu representante (preposto).',
    icon: Send,
    cor: 'from-blue-600 to-blue-700',
    corBorder: 'border-blue-500/40',
    corBg: 'bg-blue-500/10',
    corText: 'text-blue-400',
    campos: [
      { name: 'numero_oficio', label: 'Nº do Ofício', type: 'text', required: true, placeholder: 'Ex: 001/2026' },
      { name: 'data_oficio', label: 'Data do Ofício', type: 'date', required: true },
      { name: 'prazo_resposta', label: 'Prazo para Indicação (dias)', type: 'number', required: true, placeholder: 'Ex: 5' },
    ],
  },
  {
    slug: 'notificacao-irregularidade',
    titulo: 'Ofício de Notificação de Irregularidade',
    descricao: 'Notifica formalmente a contratada sobre irregularidades identificadas na execução do contrato.',
    icon: AlertTriangle,
    cor: 'from-orange-600 to-red-700',
    corBorder: 'border-orange-500/40',
    corBg: 'bg-orange-500/10',
    corText: 'text-orange-400',
    campos: [
      { name: 'numero_oficio', label: 'Nº do Ofício', type: 'text', required: true, placeholder: 'Ex: 002/2026' },
      { name: 'data_oficio', label: 'Data do Ofício', type: 'date', required: true },
      { name: 'descricao_irregularidade', label: 'Descrição da Irregularidade', type: 'textarea', required: true, placeholder: 'Descreva detalhadamente a irregularidade identificada...' },
      { name: 'prazo_resposta', label: 'Prazo para Regularização (dias)', type: 'number', required: true, placeholder: 'Ex: 10' },
    ],
  },
  {
    slug: 'juntada-documentos',
    titulo: 'Termo de Juntada de Documentos',
    descricao: 'Formaliza a juntada de documentos à pasta de acompanhamento do contrato.',
    icon: FolderOpen,
    cor: 'from-purple-600 to-purple-700',
    corBorder: 'border-purple-500/40',
    corBg: 'bg-purple-500/10',
    corText: 'text-purple-400',
    campos: [
      { name: 'data_juntada', label: 'Data da Juntada', type: 'date', required: true },
      { name: 'lista_documentos', label: 'Documentos a Juntar', type: 'textarea', required: true, placeholder: 'Liste os documentos, um por linha:\nEx:\n- Nota Fiscal nº 1234\n- Certidão de Regularidade FGTS\n- Relatório Fotográfico de junho/2026' },
    ],
  },
  {
    slug: 'encerramento',
    titulo: 'Termo de Encerramento do Contrato',
    descricao: 'Documenta o encerramento formal do contrato, por cumprimento ou rescisão.',
    icon: XCircle,
    cor: 'from-red-700 to-rose-700',
    corBorder: 'border-red-500/40',
    corBg: 'bg-red-500/10',
    corText: 'text-red-400',
    campos: [
      { name: 'data_encerramento', label: 'Data de Encerramento', type: 'date', required: true },
      {
        name: 'motivo',
        label: 'Motivo do Encerramento',
        type: 'select',
        required: true,
        options: [
          { value: 'cumprimento', label: 'Cumprimento do Objeto Contratual' },
          { value: 'rescisao_consensual', label: 'Rescisão Consensual' },
          { value: 'rescisao_unilateral', label: 'Rescisão Unilateral pela Administração' },
        ],
      },
      { name: 'observacoes', label: 'Observações (opcional)', type: 'textarea', required: false, placeholder: 'Informações adicionais sobre o encerramento...' },
    ],
  },
]

interface Contrato {
  id: string
  numero_contrato: string
  empresa: string
  objeto: string
  status: string
  fiscal_titular_id: string
  fiscal_substituto_id: string
}

export default function DocumentosPage() {
  const router = useRouter()
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedContratos, setSelectedContratos] = useState<string[]>([])
  const [selectedTipo, setSelectedTipo] = useState('')
  const [campos, setCampos] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: perfil } = await supabase
        .from('users')
        .select('perfil')
        .eq('id', user.id)
        .single()

      if (perfil?.perfil === 'ADMIN') {
        router.push('/dashboard')
        return
      }

      const { data } = await supabase
        .from('contratos')
        .select('id, numero_contrato, empresa, objeto, status, fiscal_titular_id, fiscal_substituto_id')
        .or(`fiscal_titular_id.eq.${user.id},fiscal_substituto_id.eq.${user.id}`)
        .neq('status', 'ENCERRADO')
        .order('numero_contrato')

      setContratos(data || [])
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tipoAtual = TIPOS_DOCUMENTO.find(t => t.slug === selectedTipo) as typeof TIPOS_DOCUMENTO[0] & { multiContrato?: boolean }

  function handleCampoChange(name: string, value: string) {
    setCampos(prev => ({ ...prev, [name]: value }))
  }

  function handleTipoSelect(slug: string) {
    const tipo = TIPOS_DOCUMENTO.find(t => t.slug === slug) as typeof TIPOS_DOCUMENTO[0] & { multiContrato?: boolean }
    setSelectedTipo(slug)
    setCampos({})
    
    // Se mudar para um tipo que não é multiContrato e houver mais de um selecionado, manter apenas o primeiro
    if (!tipo?.multiContrato && selectedContratos.length > 1) {
      setSelectedContratos([selectedContratos[0]])
    }
  }

  function handleContratoSelect(id: string) {
    if (tipoAtual?.multiContrato) {
      setSelectedContratos(prev => 
        prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
      )
    } else {
      setSelectedContratos([id])
    }
  }

  function handleGerar() {
    if (selectedContratos.length === 0 || !selectedTipo) return
    const params = new URLSearchParams(campos)
    const url = `/dashboard/documentos/${selectedContratos.join(',')}/${selectedTipo}/imprimir?${params.toString()}`
    router.push(url)
  }

  const camposValidos = tipoAtual
    ? tipoAtual.campos.filter(c => c.required).every(c => campos[c.name]?.trim())
    : false

  const podeGerar = selectedContratos.length > 0 && selectedTipo && camposValidos

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Carregando contratos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Cabeçalho */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#133215] via-[#1B3B22] to-[#133215]/80 p-6 sm:p-8 border border-yellow-500/20 shadow-xl">
        <div className="absolute top-[-50%] right-[-10%] h-[300px] w-[300px] rounded-full bg-yellow-500/5 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-5%] h-[200px] w-[200px] rounded-full bg-emerald-500/5 blur-[60px] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10 border border-yellow-500/30 shadow-inner">
            <FileSignature className="h-7 w-7 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Geração de Documentos
            </h1>
            <p className="text-gray-300 text-sm font-medium mt-1">
              Gere ofícios e termos militares formais vinculados aos seus contratos.
            </p>
          </div>
        </div>
      </div>

      {contratos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <FileText className="h-8 w-8 text-yellow-500/60" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-300">Nenhum contrato ativo vinculado</p>
            <p className="text-sm text-gray-500 mt-1">Você não possui contratos ativos para gerar documentos.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Coluna Esquerda: Seleção */}
          <div className="xl:col-span-1 space-y-5">

            {/* Passo 1 — Selecionar Contrato */}
            <div className="rounded-2xl border border-[#2a3441] bg-[#1b2331] overflow-hidden shadow-lg">
              <div className="bg-[#131924] px-5 py-3.5 border-b border-[#2a3441] flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-black">1</span>
                <span className="text-xs font-black text-white uppercase tracking-widest">Selecione o Contrato</span>
              </div>
              <div className="p-4 space-y-2">
                {contratos.map(c => {
                  const isSelected = selectedContratos.includes(c.id)
                  const papel = c.fiscal_titular_id === userId ? 'Titular' : 'Substituto'
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleContratoSelect(c.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 group relative ${
                        isSelected
                          ? 'bg-yellow-500/10 border-yellow-500/60 shadow-sm'
                          : 'border-[#2a3441] hover:border-yellow-500/30 hover:bg-[#202a3a]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-black uppercase tracking-wider truncate ${isSelected ? 'text-yellow-400' : 'text-white'}`}>
                            {c.numero_contrato}
                          </p>
                          <p className="text-[0.65rem] text-gray-400 font-medium truncate mt-0.5">{c.empresa}</p>
                        </div>
                        <span className={`shrink-0 text-[0.55rem] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          papel === 'Titular'
                            ? 'border-green-500/40 text-green-400 bg-green-500/10'
                            : 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10'
                        }`}>
                          {papel}
                        </span>
                      </div>
                      <p className="text-[0.6rem] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{c.objeto}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Passo 2 — Selecionar Tipo */}
            <div className="rounded-2xl border border-[#2a3441] bg-[#1b2331] overflow-hidden shadow-lg">
              <div className="bg-[#131924] px-5 py-3.5 border-b border-[#2a3441] flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-black">2</span>
                <span className="text-xs font-black text-white uppercase tracking-widest">Tipo de Documento</span>
              </div>
              <div className="p-4 space-y-2">
                {TIPOS_DOCUMENTO.map(tipo => {
                  const isSelected = selectedTipo === tipo.slug
                  const Icon = tipo.icon
                  return (
                    <button
                      key={tipo.slug}
                      onClick={() => handleTipoSelect(tipo.slug)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? `${tipo.corBg} ${tipo.corBorder} shadow-sm`
                          : 'border-[#2a3441] hover:border-white/10 hover:bg-[#202a3a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? tipo.corBg : 'bg-white/5'}`}>
                          <Icon className={`h-4 w-4 ${isSelected ? tipo.corText : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[0.65rem] font-black leading-tight ${isSelected ? tipo.corText : 'text-gray-300'}`}>
                            {tipo.titulo}
                          </p>
                        </div>
                        {isSelected && <ChevronRight className={`h-4 w-4 shrink-0 ${tipo.corText}`} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Coluna Direita: Formulário + Gerar */}
          <div className="xl:col-span-2 space-y-5">

            {!selectedTipo ? (
              <div className="rounded-2xl border border-dashed border-[#2a3441] bg-[#1b2331]/50 flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-yellow-500/30" />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-400">Selecione um contrato e tipo de documento</p>
                  <p className="text-xs text-gray-600 mt-1">Os campos específicos aparecerão aqui.</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#2a3441] bg-[#1b2331] overflow-hidden shadow-lg">
                {/* Header */}
                <div className={`px-6 py-5 border-b border-[#2a3441] bg-gradient-to-r ${tipoAtual?.cor} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 flex items-center gap-3">
                    {tipoAtual && <tipoAtual.icon className="h-6 w-6 text-white/90 shrink-0" />}
                    <div>
                      <p className="text-[0.6rem] font-black text-white/60 uppercase tracking-widest">Passo 3 — Dados do Documento</p>
                      <h2 className="text-sm font-black text-white mt-0.5 leading-tight">{tipoAtual?.titulo}</h2>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Descrição */}
                  <p className="text-xs text-gray-400 font-medium bg-[#131924] rounded-xl px-4 py-3 border border-[#2a3441]">
                    {tipoAtual?.descricao}
                  </p>

                  {/* Campos dinâmicos */}
                  <div className="space-y-4">
                    {tipoAtual?.campos.map(campo => (
                      <div key={campo.name} className="space-y-1.5">
                        <label className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest block">
                          {campo.label} {campo.required && <span className="text-red-400">*</span>}
                        </label>
                        {'options' in campo && campo.options ? (
                          <select
                            value={campos[campo.name] || ''}
                            onChange={e => handleCampoChange(campo.name, e.target.value)}
                            className="w-full bg-[#131924] text-gray-200 text-sm px-4 py-2.5 rounded-xl border border-[#2a3441] focus:border-yellow-500/60 outline-none transition-all"
                          >
                            <option value="">Selecione...</option>
                            {campo.options.map((opt: { value: string; label: string }) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : campo.type === 'textarea' ? (
                          <textarea
                            value={campos[campo.name] || ''}
                            onChange={e => handleCampoChange(campo.name, e.target.value)}
                            placeholder={'placeholder' in campo ? campo.placeholder : ''}
                            rows={4}
                            className="w-full bg-[#131924] text-gray-200 text-sm px-4 py-2.5 rounded-xl border border-[#2a3441] focus:border-yellow-500/60 outline-none transition-all resize-none placeholder-gray-600"
                          />
                        ) : (
                          <input
                            type={campo.type}
                            value={campos[campo.name] || ''}
                            onChange={e => handleCampoChange(campo.name, e.target.value)}
                            placeholder={'placeholder' in campo ? campo.placeholder : ''}
                            className="w-full bg-[#131924] text-gray-200 text-sm px-4 py-2.5 rounded-xl border border-[#2a3441] focus:border-yellow-500/60 outline-none transition-all placeholder-gray-600"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Validação */}
                  {selectedContratos.length === 0 && (
                    <div className="flex items-center gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                      <p className="text-xs font-medium text-yellow-400">Selecione um contrato antes de gerar.</p>
                    </div>
                  )}

                  {tipoAtual?.multiContrato && selectedContratos.length > 0 && (
                    <p className="text-xs text-blue-400 font-bold mb-2">
                      {selectedContratos.length} contrato(s) selecionado(s) para este documento.
                    </p>
                  )}

                  {/* Botão Gerar */}
                  <button
                    onClick={handleGerar}
                    disabled={!podeGerar}
                    className="w-full flex items-center justify-center gap-2.5 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black text-sm py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-yellow-600/20 uppercase tracking-wider cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    Gerar Documento para Impressão
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {podeGerar && (
                    <p className="text-center text-[0.65rem] text-gray-500">
                      O documento será exibido nesta aba para impressão ou salvamento em PDF.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
