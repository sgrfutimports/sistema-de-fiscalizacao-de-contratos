'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/app/login/actions'

// Tempo de inatividade em milissegundos (10 minutos)
const INACTIVITY_TIME_MS = 10 * 60 * 1000 

export function AutoLogout() {
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      // Quando o tempo esgota, executa o logout e redireciona
      await logout()
      router.push('/login?inativo=true')
    }, INACTIVITY_TIME_MS)
  }

  useEffect(() => {
    // Inicializa o contador na primeira montagem
    resetTimeout()

    // Lista de eventos que representam "atividade" do usuário
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

    const handleActivity = () => {
      resetTimeout()
    }

    // Adiciona os listeners na janela
    events.forEach(event => {
      window.addEventListener(event, handleActivity)
    })

    // Limpa os listeners e o timeout quando o componente for desmontado
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [router])

  // Componente invisível
  return null
}
