'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Filter, RotateCcw } from 'lucide-react'

interface ContratoOption {
  id: string
  numero_contrato: string
  empresa: string
}

interface FiltrosAuditoriaProps {
  contratos: ContratoOption[]
  anos: number[]
  initialFilters: {
    status?: string
    contratoId?: string
    mes?: string
    ano?: string
    search?: string
  }
}

export function FiltrosAuditoria({ contratos, anos, initialFilters }: FiltrosAuditoriaProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchValue, setSearchValue] = useState(initialFilters.search || '')

  // Debounce para a busca livre
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchValue !== (initialFilters.search || '')) {
        updateQueryParam('q', searchValue)
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [searchValue])

  function updateQueryParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== '-- Todos --') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleClearFilters() {
    setSearchValue('')
    router.push(pathname)
  }

  const meses = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ]

  const statusOptions = [
    { value: 'ENVIADO', label: 'Aguardando' },
    { value: 'EM_ANALISE', label: 'Em Análise' },
    { value: 'APROVADO', label: 'Aprovado' },
    { value: 'DEVOLVIDO', label: 'Devolvido' },
    { value: 'ARQUIVADO', label: 'Arquivado' }
  ]

  return (
    <div className="bg-white dark:bg-card rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
        <h3 className="text-sm font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider">Filtros de Auditoria</h3>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Situação do Relato */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center block w-full">Situação do Relato</label>
            <select 
              value={initialFilters.status || '-- Todos --'}
              onChange={(e) => updateQueryParam('status', e.target.value)}
              className="bg-slate-50 dark:bg-[#131924] text-gray-700 dark:text-gray-300 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2a3441]/60 outline-none w-full text-center cursor-pointer"
            >
              <option value="-- Todos --">-- Todos --</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          {/* Contrato Específico */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center block w-full">Contrato Específico</label>
            <select 
              value={initialFilters.contratoId || '-- Todos --'}
              onChange={(e) => updateQueryParam('contratoId', e.target.value)}
              className="bg-slate-50 dark:bg-[#131924] text-gray-700 dark:text-gray-300 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2a3441]/60 outline-none w-full text-center cursor-pointer"
            >
              <option value="-- Todos --">-- Todos --</option>
              {contratos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numero_contrato} - {c.empresa.substring(0, 15)}{c.empresa.length > 15 ? '...' : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Competência Mês */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center block w-full">Competência Mês</label>
            <select 
              value={initialFilters.mes || '-- Todos --'}
              onChange={(e) => updateQueryParam('mes', e.target.value)}
              className="bg-slate-50 dark:bg-[#131924] text-gray-700 dark:text-gray-300 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2a3441]/60 outline-none w-full text-center cursor-pointer"
            >
              <option value="-- Todos --">-- Todos --</option>
              {meses.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          
          {/* Exercício Ano */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center block w-full">Exercício Ano</label>
            <select 
              value={initialFilters.ano || '-- Todos --'}
              onChange={(e) => updateQueryParam('ano', e.target.value)}
              className="bg-slate-50 dark:bg-[#131924] text-gray-700 dark:text-gray-300 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2a3441]/60 outline-none w-full text-center cursor-pointer"
            >
              <option value="-- Todos --">-- Todos --</option>
              {anos.map((a) => (
                <option key={a} value={String(a)}>{a}</option>
              ))}
            </select>
          </div>
          
          {/* Busca Livre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center block w-full">Busca Livre</label>
            <input 
              type="text" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Empresa, militar, objeto..." 
              className="bg-slate-50 dark:bg-[#131924] text-gray-700 dark:text-gray-300 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2a3441]/60 outline-none w-full placeholder-gray-400 dark:placeholder-gray-500 text-center"
            />
          </div>

        </div>
        
        {/* Limpar Filtros */}
        <button 
          onClick={handleClearFilters}
          className="flex items-center gap-2 px-4 py-2 text-[0.65rem] font-bold text-yellow-600 dark:text-yellow-500 border border-yellow-500/50 rounded-lg hover:bg-yellow-500/10 transition-colors uppercase tracking-wider whitespace-nowrap mt-4 lg:mt-0 cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          Limpar Filtros
        </button>
      </div>
    </div>
  )
}
