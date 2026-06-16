'use client'

import React from 'react'
import { useVisibility } from './visibility-context'

interface VisibilityTextProps {
  value: React.ReactNode
  fallback?: string
}

export function VisibilityText({ value, fallback = '•••••' }: VisibilityTextProps) {
  const { visible } = useVisibility()
  
  if (!visible) {
    return <span className="font-mono tracking-tight">{fallback}</span>
  }
  
  return <>{value}</>
}
