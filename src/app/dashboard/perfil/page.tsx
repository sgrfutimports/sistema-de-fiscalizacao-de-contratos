'use client'

import { useState, useTransition } from 'react'
import { alterarSenha } from './actions'
import { toast } from 'sonner'
import { KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function PerfilPage() {
  const [isPending, startTransition] = useTransition()
  const [showSenhaAtual, setShowSenhaAtual] = useState(false)
  const [showNovaSenha, setShowNovaSenha] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(false)
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await alterarSenha(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        toast.success('Senha alterada com sucesso!')
        ;(event.target as HTMLFormElement).reset()
      }
    })
  }

  const inputBase =
    'w-full bg-slate-50 dark:bg-[#131924] text-gray-800 dark:text-gray-200 text-sm px-4 py-2.5 pr-11 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-yellow-500/60 outline-none transition-all shadow-inner placeholder-gray-400 dark:placeholder-gray-600'

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-[#133215] via-[#1B3B22] to-[#133215]/80 p-6 sm:p-8 rounded-2xl border border-[#133215]/20 dark:border-yellow-500/20 shadow-lg relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] h-[300px] w-[300px] rounded-full bg-[#133215]/40 blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1 flex items-center gap-3">
            <KeyRound className="h-7 w-7 text-yellow-400" />
            Alterar Senha
          </h1>
          <p className="text-gray-300 text-sm font-medium">
            Atualize sua senha de acesso ao sistema. Mantenha-a segura e não compartilhe.
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Cabeçalho do card */}
          <div className="bg-slate-50 dark:bg-gray-900/40 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-yellow-650 dark:text-yellow-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Segurança da Conta</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left">

            {/* Alerta de erro */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            {/* Alerta de sucesso */}
            {success && (
              <div className="flex items-start gap-3 rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">Senha alterada com sucesso! Sua nova senha já está ativa.</p>
              </div>
            )}

            {/* Senha Atual */}
            <div className="space-y-1.5">
              <label className="text-[0.65rem] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Senha Atual *
              </label>
              <div className="relative">
                <input
                  type={showSenhaAtual ? 'text' : 'password'}
                  name="senhaAtual"
                  required
                  autoComplete="current-password"
                  placeholder="Digite sua senha atual"
                  disabled={isPending}
                  className={inputBase}
                />
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setShowSenhaAtual(v => !v); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer z-10 p-2"
                  tabIndex={-1}
                >
                  {showSenhaAtual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-5 space-y-5">
              {/* Nova Senha */}
              <div className="space-y-1.5">
                <label className="text-[0.65rem] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Nova Senha *
                </label>
                <div className="relative">
                  <input
                    type={showNovaSenha ? 'text' : 'password'}
                    name="novaSenha"
                    required
                    autoComplete="new-password"
                    placeholder="Mínimo de 6 caracteres"
                    disabled={isPending}
                    className={inputBase}
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setShowNovaSenha(v => !v); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer z-10 p-2"
                    tabIndex={-1}
                  >
                    {showNovaSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-1.5">
                <label className="text-[0.65rem] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Confirmar Nova Senha *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmar ? 'text' : 'password'}
                    name="confirmarNovaSenha"
                    required
                    autoComplete="new-password"
                    placeholder="Repita a nova senha"
                    disabled={isPending}
                    className={inputBase}
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setShowConfirmar(v => !v); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer z-10 p-2"
                    tabIndex={-1}
                  >
                    {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Dica de segurança */}
            <div className="flex items-start gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3.5 text-yellow-700 dark:text-yellow-500/90">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-[0.68rem] font-medium leading-relaxed">
                Use uma senha forte com letras, números e símbolos. Nunca compartilhe sua senha com outras pessoas.
              </p>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm py-3 px-6 rounded-xl transition-all shadow-lg shadow-yellow-600/20 uppercase tracking-wider cursor-pointer"
            >
              <KeyRound className="h-4 w-4" />
              {isPending ? 'Atualizando Senha...' : 'Confirmar Alteração de Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
