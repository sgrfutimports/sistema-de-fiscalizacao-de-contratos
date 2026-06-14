'use client'

import { useEffect } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintTrigger() {
  // Dispara o print do navegador automaticamente 500ms após o carregamento da página
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

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
