// In your Supabase Edge Function (not the client code)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    const requestBody = await req.json()
    const { email, invitee_name, invitation_type, personal_message, invitation_token, inviter_name } = requestBody

    // Get environment variables correctly for Edge Functions
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
    const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL')

    console.log('Environment check:', {
      hasApiKey: !!SENDGRID_API_KEY,
      hasFromEmail: !!SENDGRID_FROM_EMAIL,
      fromEmail: SENDGRID_FROM_EMAIL // Remove this in production for security
    })

    if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'Missing required environment variables',
          success: false 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create your email content
    const baseUrl = Deno.env.get('BASE_URL') || 'http://localhost:8080' // Set your actual domain
    const acceptUrl = `${baseUrl}/invitation/respond?token=${invitation_token}`
    
    const emailContent = {
      personalizations: [
        {
          to: [{ email: email, name: invitee_name }],
          subject: `🏠 You're invited to join OnlyIfYouKnow as a ${invitation_type}!`
        }
      ],
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: 'OnlyIfYouKnow Team'
      },
      content: [
        {
          type: 'text/html',
          value: createEmailHTML(invitee_name, inviter_name, invitation_type, personal_message, acceptUrl)
        }
      ]
    }

    // Send email via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailContent)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid API error:', response.status, errorText)
      throw new Error(`SendGrid API error: ${response.status}`)
    }

    console.log('Email sent successfully to:', email)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email sent successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function createEmailHTML(inviteeName, inviterName, invitationType, personalMessage, acceptUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to OnlyIfYouKnow</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #FF5A5F; color: white; padding: 30px; text-align: center;">
        <h1>🏠 Welcome to OnlyIfYouKnow</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2>Hi ${inviteeName},</h2>
        
        <p>You've been invited by <strong>${inviterName}</strong> to join OnlyIfYouKnow as a <strong>${invitationType}</strong>.</p>
        
        ${personalMessage ? `<div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;"><strong>Personal message:</strong><br>"${personalMessage}"</div>` : ''}
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${acceptUrl}" style="display: inline-block; background-color: #FF5A5F; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            ✨ Accept Your Invitation
          </a>
        </div>
        
        <p>This invitation expires in 7 days.</p>
        
        <p>Best regards,<br><strong>The OnlyIfYouKnow Team</strong></p>
      </div>
    </body>
    </html>
  `
}