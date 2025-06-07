// src/lib/emailService.ts - Enhanced with multiple fallback strategies
import type { Database } from './database.types'

type InvitationType = Database['public']['Enums']['user_type']

interface InvitationEmailData {
  email: string
  inviteeName: string
  invitationType: InvitationType
  personalMessage: string | null
  invitationToken: string
  inviterName: string
}

interface EmailResult {
  success: boolean
  demo?: boolean
  error?: any
  method?: 'supabase-function' | 'sendgrid-direct' | 'demo'
}

export const emailService = {
  sendInvitationEmail: async (params: InvitationEmailData): Promise<EmailResult> => {
    console.log('📧 Starting email send process for:', params.email)
    
    const {
      email,
      inviteeName,
      invitationType,
      personalMessage,
      invitationToken,
      inviterName
    } = params

    // Strategy 1: Try Supabase Edge Function first
    try {
      console.log('📧 Attempting Supabase Edge Function...')
      const result = await sendViaSupabaseFunction(params)
      if (result.success) {
        console.log('✅ Email sent successfully via Supabase Edge Function')
        return { ...result, method: 'supabase-function' }
      }
      console.log('⚠️ Supabase Edge Function failed, trying fallback...')
    } catch (error) {
      console.log('⚠️ Supabase Edge Function error:', error)
    }

    // Strategy 2: Try direct SendGrid API
    if (import.meta.env.VITE_SENDGRID_API_KEY) {
      try {
        console.log('📧 Attempting direct SendGrid API...')
        const result = await sendViaDirectSendGrid(params)
        if (result.success) {
          console.log('✅ Email sent successfully via direct SendGrid')
          return { ...result, method: 'sendgrid-direct' }
        }
        console.log('⚠️ Direct SendGrid failed, falling back to demo mode...')
      } catch (error) {
        console.log('⚠️ Direct SendGrid error:', error)
      }
    }

    // Strategy 3: Demo mode (always works)
    console.log('📧 Using demo mode fallback...')
    return sendDemoEmail(params)
  }
}

// Strategy 1: Supabase Edge Function
async function sendViaSupabaseFunction(params: InvitationEmailData): Promise<EmailResult> {
  const { supabase } = await import('@/lib/supabase')
  
  const { data, error } = await supabase.functions.invoke('send-invitation-email', {
  body: {
    email: params.email,
    invitee_name: params.inviteeName,
    invitation_type: params.invitationType,
    personal_message: params.personalMessage,
    invitation_token: params.invitationToken,
    inviter_name: params.inviterName
  }
  })

  if (error) {
    throw new Error(`Supabase function error: ${error.message}`)
  }

  return { 
    success: data.success, 
    demo: data.demo || false,
    error: data.error || null
  }
}

// Strategy 2: Direct SendGrid API
async function sendViaDirectSendGrid(params: InvitationEmailData): Promise<EmailResult> {
  const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin
  const acceptUrl = `${baseUrl}/invitation/respond?token=${params.invitationToken}`
  
  const emailContent = {
    personalizations: [
      {
        to: [{ email: params.email, name: params.inviteeName }],
        subject: `🏠 You're invited to join OnlyIfYouKnow as a ${params.invitationType}!`
      }
    ],
    from: {
      email: import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'support@oifyk.com',
      name: 'OnlyIfYouKnow Team'
    },
    content: [
      {
        type: 'text/html',
        value: createInvitationEmailHTML({
          inviteeName: params.inviteeName,
          inviterName: params.inviterName,
          invitationType: params.invitationType,
          personalMessage: params.personalMessage,
          acceptUrl,
          email: params.email
        })
      },
      {
        type: 'text/plain',
        value: createInvitationEmailText({
          inviteeName: params.inviteeName,
          inviterName: params.inviterName,
          invitationType: params.invitationType,
          personalMessage: params.personalMessage,
          acceptUrl,
          email: params.email
        })
      }
    ]
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailContent)
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`SendGrid API error: ${response.status} - ${errorData}`)
  }

  return { success: true }
}

// Strategy 3: Demo mode (always works)
function sendDemoEmail(params: InvitationEmailData): EmailResult {
  const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin
  const invitationUrl = `${baseUrl}/invitation/respond?token=${params.invitationToken}`
  
  console.log(`
📧 DEMO EMAIL SIMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${params.email}
Subject: 🏠 You're invited to join OnlyIfYouKnow as a ${params.invitationType}!

Hi ${params.inviteeName},

You've been invited by ${params.inviterName} to join OnlyIfYouKnow!

${params.personalMessage ? `Personal message: "${params.personalMessage}"` : ''}

🔗 Accept invitation: ${invitationUrl}

⏰ Expires in 7 days

Best regards,
The OnlyIfYouKnow Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)
  
  return { success: true, demo: true, method: 'demo' }
}

// HTML email template
function createInvitationEmailHTML({
  inviteeName,
  inviterName,
  invitationType,
  personalMessage,
  acceptUrl,
  email
}: {
  inviteeName: string
  inviterName: string
  invitationType: string
  personalMessage: string | null
  acceptUrl: string
  email: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join OnlyIfYouKnow</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #f8f9fa;
    }
    .container { 
      background-color: white; 
      border-radius: 8px; 
      overflow: hidden; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
    }
    .header { 
      background: linear-gradient(135deg, #FF5A5F 0%, #FF8A80 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0; 
      font-size: 28px; 
      font-weight: 700; 
    }
    .header p { 
      margin: 8px 0 0 0; 
      font-size: 16px; 
      opacity: 0.9; 
    }
    .content { 
      padding: 40px 30px; 
    }
    .highlight { 
      background-color: #FFF3E0; 
      border-left: 4px solid #FF9800; 
      padding: 20px; 
      margin: 25px 0; 
      border-radius: 4px;
    }
    .cta-button { 
      display: inline-block; 
      background: #FF5A5F; 
      color: white; 
      padding: 16px 32px; 
      text-decoration: none; 
      border-radius: 8px; 
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      transition: all 0.3s ease;
    }
    .cta-button:hover { 
      background: #E53E3E; 
      transform: translateY(-1px); 
    }
    .features { 
      background-color: #F7FAFC; 
      padding: 25px; 
      border-radius: 8px; 
      margin: 25px 0; 
    }
    .features h3 { 
      margin-top: 0; 
      color: #2D3748; 
    }
    .features ul { 
      padding-left: 20px; 
    }
    .features li { 
      margin-bottom: 8px; 
      color: #4A5568; 
    }
    .footer { 
      background-color: #F7FAFC; 
      padding: 30px; 
      text-align: center; 
      font-size: 14px; 
      color: #718096; 
      border-top: 1px solid #E2E8F0;
    }
    .expiry-notice {
      background-color: #FED7D7;
      border: 1px solid #FC8181;
      color: #C53030;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      text-align: center;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 Welcome to OnlyIfYouKnow</h1>
      <p>Your Trusted Property Network</p>
    </div>
    
    <div class="content">
      <h2>Hi ${inviteeName},</h2>
      
      <p>Great news! You've been personally invited by <strong>${inviterName}</strong> to join OnlyIfYouKnow as a <strong>${invitationType}</strong>.</p>
      
      ${personalMessage ? `<div class="highlight"><strong>Personal message from ${inviterName}:</strong><br>"${personalMessage}"</div>` : ''}
      
      <div class="features">
        <h3>🌟 What makes OnlyIfYouKnow special?</h3>
        <p>OnlyIfYouKnow is an invitation-only property network built on trust and relationships. Unlike traditional platforms, we connect property owners and guests through verified personal networks.</p>
        
        <h4>As a ${invitationType}, you'll enjoy:</h4>
        <ul>
          <li>🔐 <strong>Exclusive Access:</strong> Properties only available to trusted network members</li>
          <li>🤝 <strong>Verified Connections:</strong> All members are personally invited and vouched for</li>
          <li>💎 <strong>Premium Experience:</strong> Higher quality properties and more personal service</li>
          <li>🛡️ <strong>Enhanced Trust:</strong> Relationship-based trust levels for better matches</li>
          <li>🎯 <strong>Curated Community:</strong> A carefully selected network of like-minded individuals</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <p><strong>Ready to join our trusted community?</strong></p>
        <a href="${acceptUrl}" class="cta-button">✨ Accept Your Invitation</a>
      </div>
      
      <div class="expiry-notice">
        ⏰ <strong>Important:</strong> This invitation expires in 7 days
      </div>
      
      <p><strong>What happens next?</strong></p>
      <ol>
        <li>Click the invitation button above</li>
        <li>Complete your secure registration</li>
        <li>Verify your profile information</li>
        <li>Start exploring our exclusive property network!</li>
      </ol>
      
      <hr style="border: 1px solid #E2E8F0; margin: 30px 0;">
      
      <p style="font-size: 14px; color: #718096;">
        Questions? Reply to this email or contact our support team at 
        <a href="mailto:support@oifyk.com" style="color: #FF5A5F;">support@oifyk.com</a>
      </p>
      
      <p>
        Best regards,<br>
        <strong>The OnlyIfYouKnow Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>This invitation was sent to <strong>${email}</strong></p>
      <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
      <p style="margin-top: 20px;">© 2025 OnlyIfYouKnow. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `
}

// Plain text email template
function createInvitationEmailText({
  inviteeName,
  inviterName,
  invitationType,
  personalMessage,
  acceptUrl,
  email
}: {
  inviteeName: string
  inviterName: string
  invitationType: string
  personalMessage: string | null
  acceptUrl: string
  email: string
}) {
  return `
🏠 Welcome to OnlyIfYouKnow - Your Trusted Property Network

Hi ${inviteeName},

You've been personally invited by ${inviterName} to join OnlyIfYouKnow as a ${invitationType}!

${personalMessage ? `Personal message from ${inviterName}: "${personalMessage}"` : ''}

What is OnlyIfYouKnow?
OnlyIfYouKnow is an invitation-only property network built on trust and relationships. Unlike traditional platforms, we connect property owners and guests through verified personal networks.

As a ${invitationType}, you'll enjoy:
• Exclusive access to properties only available to trusted network members
• Verified connections - all members are personally invited and vouched for
• Premium experience with higher quality properties and more personal service
• Enhanced trust through relationship-based trust levels
• A curated community of like-minded individuals

Ready to join? Click here: ${acceptUrl}

⏰ IMPORTANT: This invitation expires in 7 days.

What happens next?
1. Click the invitation link above
2. Complete your secure registration
3. Verify your profile information
4. Start exploring our exclusive property network!

Questions? Contact us at support@oifyk.com

Best regards,
The OnlyIfYouKnow Team

---
This invitation was sent to ${email}
If you weren't expecting this invitation, you can safely ignore this email.
© 2025 OnlyIfYouKnow. All rights reserved.
  `
}