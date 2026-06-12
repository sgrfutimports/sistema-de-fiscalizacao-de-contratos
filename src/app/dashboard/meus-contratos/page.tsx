import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FileSignature, PlusCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default async function MeusContratosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca apenas contratos onde o usuário é titular ou substituto
  // Usando .or() para a condição
  const { data: contratos } = await supabase
    .from('contratos')
    .select('*')
    .or(`fiscal_titular_id.eq.${user.id},fiscal_substituto_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  function getStatusColor(status: string) {
    switch (status) {
      case 'ATIVO': return 'bg-green-600 hover:bg-green-700'
      case 'SUSPENSO': return 'bg-yellow-600 hover:bg-yellow-700'
      case 'ENCERRADO': return 'bg-gray-600 hover:bg-gray-700'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Contratos</h1>
          <p className="text-muted-foreground mt-1">
            Contratos em que você está vinculado como Titular ou Substituto.
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            Contratos Vinculados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Contrato</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Seu Papel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!contratos || contratos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Nenhum contrato vinculado a você no momento.
                  </TableCell>
                </TableRow>
              ) : (
                contratos.map((cont) => {
                  const papel = cont.fiscal_titular_id === user.id ? 'Titular' : 'Substituto'
                  
                  return (
                    <TableRow key={cont.id}>
                      <TableCell className="font-medium">{cont.numero_contrato}</TableCell>
                      <TableCell>{cont.empresa}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={papel === 'Titular' ? 'border-primary text-primary' : 'border-muted-foreground text-muted-foreground'}>
                          {papel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(cont.status)}>
                          {cont.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link 
                          href={`/dashboard/relatorios/novo/${cont.id}`} 
                          className={buttonVariants({ variant: "default", size: "sm" })}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Emitir Relatório
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
