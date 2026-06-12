import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileSignature, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Buscar usuário atual para definir se é admin ou fiscal
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabaseAdmin.from('users').select('perfil').eq('id', user?.id).single()

  const isAdmin = userData?.perfil === 'ADMIN'

  // TODO: Implementar chamadas reais ao banco para popular esses números.
  // Por agora, exibimos a estrutura com placeholders visuais.

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] h-[300px] w-[300px] rounded-full bg-accent/20 blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Painel de Controle</h1>
          <p className="text-muted-foreground mt-2 text-base sm:text-lg max-w-2xl">
            Bem-vindo ao Sistema de Fiscalização de Contratos do <strong className="text-primary">71º Batalhão de Infantaria Motorizado</strong>.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contratos Ativos</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileSignature className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">--</div>
            <p className="text-xs text-muted-foreground mt-1">Total de contratos em vigor</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Relatórios Pendentes</CardTitle>
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">--</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando envio ou análise</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {isAdmin ? 'Relatórios Aprovados' : 'Meus Enviados'}
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">--</div>
            <p className="text-xs text-muted-foreground mt-1">Status de entregas deste mês</p>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="shadow-md border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total de Fiscais</CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">--</div>
              <p className="text-xs text-muted-foreground mt-1">Usuários ativos cadastrados</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-4 shadow-md border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle>Visão Geral de Contratos</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex justify-center items-center h-[300px] text-muted-foreground">
            Gráfico de barras entrará aqui
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-md border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle>Avisos Recentes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px] flex justify-center items-center text-muted-foreground">
            Nenhuma notificação recente
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
