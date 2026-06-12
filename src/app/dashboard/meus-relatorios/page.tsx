import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FileText, Eye } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default async function MeusRelatoriosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca relatórios emitidos por este fiscal
  const { data: relatorios } = await supabase
    .from('relatorios')
    .select(`
      *,
      contrato:contratos!contrato_id(numero_contrato, empresa)
    `)
    .eq('fiscal_id', user.id)
    .order('created_at', { ascending: false })

  function getStatusColor(status: string) {
    switch (status) {
      case 'APROVADO': return 'bg-green-600'
      case 'EM_ANALISE': return 'bg-blue-600'
      case 'ENVIADO': return 'bg-yellow-600 text-yellow-950'
      case 'DEVOLVIDO': return 'bg-red-600'
      case 'ARQUIVADO': return 'bg-gray-600'
      default: return ''
    }
  }

  function formatCompetencia(mes: number, ano: number) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${meses[mes - 1]}/${ano}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o status de aprovação dos seus relatórios mensais.
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Meus Envios Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Contrato</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead>Data de Envio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Visualizar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!relatorios || relatorios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Você ainda não enviou nenhum relatório.
                  </TableCell>
                </TableRow>
              ) : (
                relatorios.map((rel) => (
                  <TableRow key={rel.id}>
                    <TableCell>
                      <div className="font-medium">{(rel.contrato as any)?.numero_contrato}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {(rel.contrato as any)?.empresa}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCompetencia(rel.competencia_mes, rel.competencia_ano)}
                    </TableCell>
                    <TableCell>
                      {new Date(rel.data_envio).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(rel.status)}>
                        {rel.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Por enquanto, o link usa a mesma tela de detalhes ou uma exclusiva, vamos usar a mesma, mas se RLS bloquear, o AdminClient ajudou */}
                      <Link href={`/dashboard/relatorios/${rel.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })} title="Ver Parecer">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
