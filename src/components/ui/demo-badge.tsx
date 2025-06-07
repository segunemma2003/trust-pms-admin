import React from 'react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'

export const DemoBadge = () => {
  const { isAnonymous } = useAuth()
  
  if (!isAnonymous) return null
  
  return (
    <Badge variant="secondary" className="fixed top-4 right-4 z-50">
      Demo Mode
    </Badge>
  )
}
