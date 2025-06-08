// src/lib/emailService.ts - Enhanced with multiple fallback strategies and reminder emails
import type { Database } from './database.types'

type InvitationType = Database['public']['Enums']['user_type']

interface BaseEmailData {
  email: string
  inviteeName: string
  invitationType: InvitationType
  personalMessage: string | null
  invitationToken: string
  inviterName: string
}

interface FirstTimeInvitationEmailData extends BaseEmailData {}

interface ReminderInvitationEmailData extends BaseEmailData {
  attemptCount: number
}

interface EmailResult {
  success: boolean
  demo?: boolean
  error?: any
  method?: 'supabase-function' | 'sendgrid-direct' | 'demo'
}

export const emailService = {
  // Send first-time invitation email
  sendFirstTimeInvitationEmail: async (params: FirstTimeInvitationEmailData): Promise<EmailResult> => {
    console.log('📧 Starting FIRST-TIME email send process for:', params.email)
    return await sendEmailWithFallbacks(params, 'first-time')
  },

  // Send reminder invitation email
  sendReminderInvitationEmail: async (params: ReminderInvitationEmailData): Promise<EmailResult> => {
    console.log('📧 Starting REMINDER email send process for:', params.email, `(attempt #${params.attemptCount})`)
    return await sendEmailWithFallbacks(params, 'reminder')
  },

  // Generic invitation email (for backward compatibility)
  sendInvitationEmail: async (params: BaseEmailData): Promise<EmailResult> => {
    console.log('📧 Starting GENERIC email send process for:', params.email)
    return await sendEmailWithFallbacks(params, 'generic')
  }
}

// Core email sending logic with fallback strategies
async function sendEmailWithFallbacks(
  params: BaseEmailData | ReminderInvitationEmailData, 
  emailType: 'first-time' | 'reminder' | 'generic'
): Promise<EmailResult> {
  const {
    email,
    inviteeName,
    invitationType,
    personalMessage,
    invitationToken,
    inviterName
  } = params

  const attemptCount = 'attemptCount' in params ? params.attemptCount : 1

  // Strategy 1: Try Supabase Edge Function first
  try {
    console.log('📧 Attempting Supabase Edge Function...')
    const result = await sendViaSupabaseFunction({
      email,
      inviteeName,
      invitationType,
      personalMessage,
      invitationToken,
      inviterName,
      emailType,
      attemptCount
    })
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
      const result = await sendViaDirectSendGrid({
        email,
        inviteeName,
        invitationType,
        personalMessage,
        invitationToken,
        inviterName,
        emailType,
        attemptCount
      })
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
  return sendDemoEmail({
    email,
    inviteeName,
    invitationType,
    personalMessage,
    invitationToken,
    inviterName,
    emailType,
    attemptCount
  })
}

// Strategy 1: Supabase Edge Function
async function sendViaSupabaseFunction(params: {
  email: string
  inviteeName: string
  invitationType: InvitationType
  personalMessage: string | null
  invitationToken: string
  inviterName: string
  emailType: string
  attemptCount: number
}): Promise<EmailResult> {
  const { supabase } = await import('@/lib/supabase')
  
  const { data, error } = await supabase.functions.invoke('send-invitation-email', {
    body: {
      email: params.email,
      invitee_name: params.inviteeName,
      invitation_type: params.invitationType,
      personal_message: params.personalMessage,
      invitation_token: params.invitationToken,
      inviter_name: params.inviterName,
      email_type: params.emailType,
      attempt_count: params.attemptCount
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
async function sendViaDirectSendGrid(params: {
  email: string
  inviteeName: string
  invitationType: InvitationType
  personalMessage: string | null
  invitationToken: string
  inviterName: string
  emailType: string
  attemptCount: number
}): Promise<EmailResult> {
  const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin
  const acceptUrl = `${baseUrl}/invitation/respond?token=${params.invitationToken}`
  
  // Generate subject based on email type
  const subject = params.emailType === 'reminder' 
    ? `🔔 Reminder: You're invited to join OnlyIfYouKnow as a ${params.invitationType}!`
    : `🏠 You're invited to join OnlyIfYouKnow as a ${params.invitationType}!`

  const emailContent = {
    personalizations: [
      {
        to: [{ email: params.email, name: params.inviteeName }],
        subject: subject
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
          email: params.email,
          emailType: params.emailType,
          attemptCount: params.attemptCount
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
          email: params.email,
          emailType: params.emailType,
          attemptCount: params.attemptCount
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
function sendDemoEmail(params: {
  email: string
  inviteeName: string
  invitationType: InvitationType
  personalMessage: string | null
  invitationToken: string
  inviterName: string
  emailType: string
  attemptCount: number
}): EmailResult {
  const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin
  const invitationUrl = `${baseUrl}/invitation/respond?token=${params.invitationToken}`
  
  const emailTypeLabel = params.emailType === 'reminder' 
    ? `📨 REMINDER EMAIL (Attempt #${params.attemptCount})`
    : '📧 FIRST-TIME INVITATION EMAIL'
  
  const subject = params.emailType === 'reminder' 
    ? `🔔 Reminder: You're invited to join OnlyIfYouKnow as a ${params.invitationType}!`
    : `🏠 You're invited to join OnlyIfYouKnow as a ${params.invitationType}!`

  console.log(`
${emailTypeLabel} SIMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${params.email}
Subject: ${subject}

Hi ${params.inviteeName},

${params.emailType === 'reminder' 
  ? `This is a friendly reminder that you've been invited by ${params.inviterName} to join OnlyIfYouKnow!
  
We haven't heard back from you yet, so we wanted to reach out one more time.`
  : `You've been invited by ${params.inviterName} to join OnlyIfYouKnow!`
}

${params.personalMessage ? `Personal message: "${params.personalMessage}"` : ''}

🔗 Accept invitation: ${invitationUrl}

⏰ Expires in 7 days

${params.emailType === 'reminder' 
  ? `If you're not interested, you can simply ignore this email. We won't send any more reminders.`
  : 'Looking forward to welcoming you to our trusted community!'
}

Best regards,
The OnlyIfYouKnow Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)
  
  return { success: true, demo: true, method: 'demo' }
}

// HTML email template with reminder support
function createInvitationEmailHTML({
  inviteeName,
  inviterName,
  invitationType,
  personalMessage,
  acceptUrl,
  email,
  emailType,
  attemptCount
}: {
  inviteeName: string
  inviterName: string
  invitationType: string
  personalMessage: string | null
  acceptUrl: string
  email: string
  emailType: string
  attemptCount: number
}) {
  const isReminder = emailType === 'reminder'
  const headerText = isReminder 
    ? '🔔 Friendly Reminder'
    : '🏠 Welcome to OnlyIfYouKnow'
  
  const introText = isReminder
    ? `This is a friendly reminder that you've been personally invited by <strong>${inviterName}</strong> to join OnlyIfYouKnow as a <strong>${invitationType}</strong>.`
    : `Great news! You've been personally invited by <strong>${inviterName}</strong> to join OnlyIfYouKnow as a <strong>${invitationType}</strong>.`

  const reminderSection = isReminder ? `
    <div style="background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <strong>📅 This is attempt #${attemptCount}</strong><br>
      We sent your original invitation a few days ago, but haven't heard back from you yet. We wanted to give you another chance to join our trusted community!
    </div>
  ` : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isReminder ? 'Reminder: ' : ''}You're Invited to Join OnlyIfYouKnow</title>
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
      background: linear-gradient(135deg, ${isReminder ? '#FF9800 0%, #FFB74D 100%' : '#FF5A5F 0%, #FF8A80 100%'}); 
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
      background: ${isReminder ? '#FF9800' : '#FF5A5F'}; 
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
      background: ${isReminder ? '#F57C00' : '#E53E3E'}; 
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
      background-color: ${isReminder ? '#FFF3E0' : '#FED7D7'};
      border: 1px solid ${isReminder ? '#FFB74D' : '#FC8181'};
      color: ${isReminder ? '#E65100' : '#C53030'};
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
      <h1>${headerText}</h1>
      <p>Your Trusted Property Network</p>
    </div>
    
    <div class="content">
      <h2>Hi ${inviteeName},</h2>
      
      <p>${introText}</p>
      
      ${reminderSection}
      
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
        <p><strong>${isReminder ? 'Still interested?' : 'Ready to join our trusted community?'}</strong></p>
        <a href="${acceptUrl}" class="cta-button">✨ Accept Your Invitation</a>
      </div>
      
      <div class="expiry-notice">
        ⏰ <strong>Important:</strong> This invitation expires in 7 days
        ${isReminder ? '<br>⚠️ This is a reminder - we won\'t send any more emails after this.' : ''}
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
        <a href="mailto:support@oifyk.com" style="color: ${isReminder ? '#FF9800' : '#FF5A5F'};">support@oifyk.com</a>
      </p>
      
      <p>
        Best regards,<br>
        <strong>The OnlyIfYouKnow Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>This ${isReminder ? 'reminder ' : ''}invitation was sent to <strong>${email}</strong></p>
      <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
      ${isReminder ? '<p><em>This is a final reminder - you won\'t receive any more emails about this invitation.</em></p>' : ''}
      <p style="margin-top: 20px;">© 2025 OnlyIfYouKnow. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `
}

// Plain text email template with reminder support
function createInvitationEmailText({
  inviteeName,
  inviterName,
  invitationType,
  personalMessage,
  acceptUrl,
  email,
  emailType,
  attemptCount
}: {
  inviteeName: string
  inviterName: string
  invitationType: string
  personalMessage: string | null
  acceptUrl: string
  email: string
  emailType: string
  attemptCount: number
}) {
  const isReminder = emailType === 'reminder'
  const headerText = isReminder 
    ? '🔔 Friendly Reminder - OnlyIfYouKnow Invitation'
    : '🏠 Welcome to OnlyIfYouKnow - Your Trusted Property Network'

  const introText = isReminder
    ? `This is a friendly reminder that you've been personally invited by ${inviterName} to join OnlyIfYouKnow as a ${invitationType}!`
    : `You've been personally invited by ${inviterName} to join OnlyIfYouKnow as a ${invitationType}!`

  const reminderSection = isReminder ? `

📅 This is attempt #${attemptCount}
We sent your original invitation a few days ago, but haven't heard back from you yet. We wanted to give you another chance to join our trusted community!
` : ''

  return `
${headerText}

Hi ${inviteeName},

${introText}${reminderSection}

${personalMessage ? `Personal message from ${inviterName}: "${personalMessage}"` : ''}

What is OnlyIfYouKnow?
OnlyIfYouKnow is an invitation-only property network built on trust and relationships. Unlike traditional platforms, we connect property owners and guests through verified personal networks.

As a ${invitationType}, you'll enjoy:
• Exclusive access to properties only available to trusted network members
• Verified connections - all members are personally invited and vouched for
• Premium experience with higher quality properties and more personal service
• Enhanced trust through relationship-based trust levels
• A curated community of like-minded individuals

${isReminder ? 'Still interested?' : 'Ready to join?'} Click here: ${acceptUrl}

⏰ IMPORTANT: This invitation expires in 7 days.${isReminder ? '\n⚠️ This is a reminder - we won\'t send any more emails after this.' : ''}

What happens next?
1. Click the invitation link above
2. Complete your secure registration
3. Verify your profile information
4. Start exploring our exclusive property network!

Questions? Contact us at support@oifyk.com

Best regards,
The OnlyIfYouKnow Team

---
This ${isReminder ? 'reminder ' : ''}invitation was sent to ${email}
If you weren't expecting this invitation, you can safely ignore this email.${isReminder ? '\nThis is a final reminder - you won\'t receive any more emails about this invitation.' : ''}
© 2025 OnlyIfYouKnow. All rights reserved.
  `
}