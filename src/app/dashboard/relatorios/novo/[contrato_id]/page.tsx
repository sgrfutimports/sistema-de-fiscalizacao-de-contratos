import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NovoRelatorioForm } from '@/components/dashboard/novo-relatorio-form'
import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NovoRelatorioPage({ params }: { params: { contrato_id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verifica se o contrato existe e se o usuário tem permissão
  const { data: contrato } = await supabase
    .from('contratos')
    .select('*, titular:users!fiscal_titular_id(nome), substituto:users!fiscal_substituto_id(nome)')
    .eq('id', params.contrato_id)
    .single()

  if (!contrato) {
    redirect('/dashboard/meus-contratos')
  }

  // Define qual o papel do usuário logado neste contrato
  let papel = ''
  if (contrato.fiscal_titular_id === user.id) papel = 'Titular'
  else if (contrato.fiscal_substituto_id === user.id) papel = 'Substituto'
  else redirect('/dashboard/meus-contratos')

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <Link href="/dashboard/meus-contratos" className={buttonVariants({ variant: "ghost", className: "w-fit -ml-4" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Meus Contratos
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emitir Relatório de Fiscalização</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Contrato <strong>{contrato.numero_contrato}</strong> - {contrato.empresa}
          </p>
        </div>
      </div>

      <NovoRelatorioForm contratoId={contrato.id} papel={papel} />
    </div>
  )
}
