
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { User, Shield, Home } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface AnonymousLoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AnonymousLoginModal: React.FC<AnonymousLoginModalProps> = ({ open, onOpenChange }) => {
  const { signInAnonymously } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleAnonymousLogin = async (userType: 'admin' | 'owner' | 'user') => {
    setLoading(true)
    try {
      await signInAnonymously(userType)
      toast.success(`Signed in as demo ${userType}`)
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to sign in anonymously')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Try OnlyIfYouKnow Demo</DialogTitle>
          <DialogDescription>
            Explore the platform with different user roles. No registration required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            onClick={() => handleAnonymousLogin('admin')}
            disabled={loading}
            className="w-full justify-start"
            variant="outline"
          >
            <Shield className="mr-3 h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Demo Admin</div>
              <div className="text-sm text-gray-500">Full platform access</div>
            </div>
          </Button>

          <Button
            onClick={() => handleAnonymousLogin('owner')}
            disabled={loading}
            className="w-full justify-start"
            variant="outline"
          >
            <Home className="mr-3 h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Demo Property Owner</div>
              <div className="text-sm text-gray-500">Manage properties & bookings</div>
            </div>
          </Button>

          <Button
            onClick={() => handleAnonymousLogin('user')}
            disabled={loading}
            className="w-full justify-start"
            variant="outline"
          >
            <User className="mr-3 h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Demo User</div>
              <div className="text-sm text-gray-500">Browse & book properties</div>
            </div>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
