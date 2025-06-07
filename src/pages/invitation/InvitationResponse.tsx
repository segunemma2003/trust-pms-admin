import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { invitationService } from '@/services/invitations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

const InvitationResponse = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [invitationData, setInvitationData] = useState<any>(null)

  const token = searchParams.get('token')
  const action = searchParams.get('action') as 'accept' | 'reject'

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    // Load invitation details for display
    loadInvitationDetails()
  }, [token])

  const loadInvitationDetails = async () => {
    if (!token) return

    const { data, error } = await invitationService.getInvitationByToken(token)
    if (!error && data) {
      setInvitationData(data)
    }
  }

  const handleResponse = async (responseAction: 'accept' | 'reject') => {
    if (!token) return

    setLoading(true)
    try {
      const response = await invitationService.respondToInvitation(token, responseAction)
      setResult(response)

      if (response.success && responseAction === 'accept') {
        // Redirect to onboarding after a short delay
        setTimeout(() => {
          const userType = response.tokenInfo?.user_type || 'owner'
          navigate(`/onboarding/${userType}?token=${token}`)
        }, 2000)
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'An error occurred while processing your response'
      })
    } finally {
      setLoading(false)
    }
  }

  // If URL has action parameter, handle it automatically
  useEffect(() => {
    if (action && token && !result && !loading) {
      handleResponse(action)
    }
  }, [action, token])

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Invalid Link</h2>
              <p className="text-gray-600">This invitation link is not valid.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-16 w-16 mx-auto text-blue-500 mb-4 animate-spin" />
              <h2 className="text-xl font-semibold mb-2">Processing...</h2>
              <p className="text-gray-600">Please wait while we process your response.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              {result.success ? (
                <>
                  {result.action === 'accepted' ? (
                    <>
                      <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                      <h2 className="text-xl font-semibold mb-2">Invitation Accepted!</h2>
                      <p className="text-gray-600 mb-4">{result.message}</p>
                      <p className="text-sm text-gray-500">Redirecting you to complete registration...</p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                      <h2 className="text-xl font-semibold mb-2">Thank You</h2>
                      <p className="text-gray-600 mb-4">{result.message}</p>
                      <Button onClick={() => navigate('/')}>
                        Back to Home
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Error</h2>
                  <p className="text-gray-600 mb-4">{result.error}</p>
                  <Button onClick={() => navigate('/')}>
                    Back to Home
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show invitation details and response options
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Invitation to Join OIFYK</CardTitle>
        </CardHeader>
        <CardContent>
          {invitationData?.invitation && (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                You've been invited by{' '}
                <strong>{invitationData.invitation.inviter?.full_name}</strong>{' '}
                to join OIFYK as a property {invitationData.invitation.invitation_type}.
              </p>

              {invitationData.invitation.personal_message && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm italic">
                    "{invitationData.invitation.personal_message}"
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => handleResponse('accept')}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  Accept Invitation
                </Button>
                
                <Button
                  onClick={() => handleResponse('reject')}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Decline Invitation
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                This invitation will expire in a few days.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InvitationResponse