'use client'

import { useState, useTransition } from 'react'
import { homologarReabertura, revogarReabertura } from '@/app/dashboard/prazos/actions'
import { toast } from 'sonner'
import { AlertTriangle, Lock, Unlock, Trash2, Calendar } from 'lucide-react'

interface Contrato {
  id: string
  numero_contrato: string
  empresa: string
}

interface Excecao {
  id: string
  titulo: string
  conteudo: string // Contrato ID
  autor: string    // Mês/Ano (ex: "6/2026")
  created_at: string
}

interface FormPrazosProps {
  contratos: Contrato[]
  excecoes: Excecao[]
}

export function FormPrazos({ contratos, excecoes }: FormPrazosProps) {
  const [isPending, startTransition] = useTransition()
  const [contratoId, setContratoId] = useState('')
  const [mes, setMes] = useState('')
  const [ano, setAno] = useState('2026')

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!contratoId || !mes || !ano) {
      toast.error('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    startTransition(async () => {
      const res = await homologarReabertura(contratoId, Number(mes), Number(ano))
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Reabertura de prazo homologada com sucesso!')
        setContratoId('')
        setMes('')
      }
    })
  }

  function handleRevoke(id: string) {
    startTransition(async () => {
      const res = await revogarReabertura(id)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Reabertura de prazo revogada com sucesso!')
      }
    })
  }

  // Obter detalhes do contrato para exibição amigável
  const getContratoInfo = (id: string) => {
    const cont = contratos.find(c => c.id === id)
    return cont ? `Contrato Nº ${cont.numero_contrato} (${cont.empresa})` : `ID: ${id.substring(0, 8)}...`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
      
      {/* Coluna 1: Autorizar Nova Exceção */}
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-full">
        <div className="bg-slate-50 dark:bg-gray-900/40 px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Unlock className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Autorizar Nova Exceção</h3>
        </div>
        
        <form onSubmit={handleCreate} className="p-5 flex-1 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Contrato Administrativo *</label>
            <select 
              value={contratoId}
              onChange={(e) => setContratoId(e.target.value)}
              required
              className="bg-slate-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm px-4 py-2.5 rounded-lg outline-none w-full appearance-none shadow-inner cursor-pointer"
            >
              <option value="">-- Escolher Contrato Ativo --</option>
              {contratos?.map(c => (
                <option key={c.id} value={c.id}>Contrato Nº {c.numero_contrato} - {c.empresa}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Mês de Referência *</label>
            <select 
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              required
              className="bg-slate-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm px-4 py-2.5 rounded-lg outline-none w-full appearance-none shadow-inner cursor-pointer"
            >
              <option value="">-- Escolher Competência --</option>
              <option value="1">Janeiro</option>
              <option value="2">Fevereiro</option>
              <option value="3">Março</option>
              <option value="4">Abril</option>
              <option value="5">Maio</option>
              <option value="6">Junho</option>
              <option value="7">Julho</option>
              <option value="8">Agosto</option>
              <option value="9">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Exercício Ano *</label>
            <input 
              type="number" 
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              required
              className="bg-slate-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm px-4 py-2.5 rounded-lg outline-none w-full shadow-inner"
            />
          </div>

          <div className="mt-auto pt-4">
            <div className="flex gap-3 items-start bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mb-6">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-[0.7rem] text-yellow-700 dark:text-yellow-500/90 font-medium leading-relaxed">
                Esta ação desvia a validação ordinária de bloqueio do 5º dia útil para esta competência específica.
              </p>
            </div>

            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-[#1b5e20] hover:bg-[#2e7d32] text-white font-bold text-sm py-3 rounded-lg transition-colors shadow-md uppercase tracking-wide cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending ? 'Homologando...' : 'Homologar Reabertura'}
            </button>
          </div>
        </form>
      </div>

      {/* Coluna 2: Exceções Vigentes */}
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-full">
        <div className="bg-slate-50 dark:bg-gray-900/40 px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Lock className="h-4 w-4 text-green-600 dark:text-green-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Exceções Vigentes Homologadas</h3>
        </div>
        
        <div className="p-5 flex-1 flex flex-col overflow-y-auto max-h-[450px]">
          {(!excecoes || excecoes.length === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-center">
              <Lock className="h-12 w-12 text-gray-300 dark:text-[#2a3441] mb-4" strokeWidth={1} />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Nenhuma exceção de prazo vigente no momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {excecoes.map((exc) => (
                <div 
                  key={exc.id} 
                  className="p-4 rounded-lg bg-slate-50 dark:bg-[#131924] border border-gray-100 dark:border-[#2a3441] flex justify-between items-start gap-4 hover:border-yellow-500/20 transition-all"
                >
                  <div className="space-y-1.5 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.6rem] font-extrabold text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 uppercase tracking-wider">
                        Reabertura Ativa
                      </span>
                      <span className="text-[0.6rem] text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(exc.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {getContratoInfo(exc.conteudo)}
                    </h4>
                    <p className="text-[0.7rem] font-extrabold text-yellow-600 dark:text-yellow-500">
                      Competência reaberta: {exc.autor}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleRevoke(exc.id)}
                    disabled={isPending}
                    className="p-2 rounded-lg border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    title="Revogar reabertura"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
