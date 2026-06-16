'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const VisibilityContext = createContext({
  visible: true,
  toggle: () => {}
})

export function VisibilityProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true)

  // Carrega a preferência salva
  useEffect(() => {
    const saved = localStorage.getItem('sgr_values_visible')
    if (saved !== null) {
      setVisible(saved === 'true')
    }
  }, [])

  const toggle = () => {
    setVisible(prev => {
      const newVal = !prev
      localStorage.setItem('sgr_values_visible', String(newVal))
      return newVal
    })
  }

  return (
    <VisibilityContext.Provider value={{ visible, toggle }}>
      {children}
    </VisibilityContext.Provider>
  )
}

export const useVisibility = () => useContext(VisibilityContext)
