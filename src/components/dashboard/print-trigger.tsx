'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintTrigger() {
  return (
    <Button 
      onClick={() => window.print()} 
      className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold"
    >
      <Printer className="mr-2 h-4 w-4" />
      Imprimir / Salvar PDF
    </Button>
  )
}
