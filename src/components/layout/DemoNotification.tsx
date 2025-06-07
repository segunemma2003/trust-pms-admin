import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export const DemoNotification = () => {
  const { isAnonymous } = useAuth()
  
  if (!isAnonymous) return null
  
  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4" />
      <AlertDescription>
        You're in demo mode. Some features like email sending are simulated. 
        Data changes won't be saved permanently.
      </AlertDescription>
    </Alert>
  )
}