'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

interface FiltrosContratosProps {
  initialFilters: {
    status?: string
    search?: string
  }
}

export function FiltrosContratos({ initialFilters }: FiltrosContratosProps) {
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
  }, [searchValue, initialFilters.search])

  function updateQueryParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'TODOS') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const activeStatus = initialFilters.status || 'TODOS'

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-card shadow-sm w-full">
      <div className="relative w-full md:w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input 
          type="text" 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Buscar por Nº Contrato, Empresa, Objeto ou Fiscal..."
          className="w-full pl-10 pr-4 py-2 border-none outline-none text-sm text-gray-700 dark:text-white bg-transparent placeholder-gray-400"
        />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">FILTRO DE STATUS:</span>
        <div className="flex items-center gap-2">
          {['TODOS', 'ATIVO', 'SUSPENSO', 'ENCERRADO'].map((status) => {
            const isSelected = activeStatus === status
            return (
              <button
                key={status}
                onClick={() => updateQueryParam('status', status)}
                className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-[#133215] text-white font-bold' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {status}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
