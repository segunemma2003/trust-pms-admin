// 1. First, update your environment variables (.env file)
// Add these to your .env file:

// VITE_SENDGRID_API_KEY=your_sendgrid_api_key_here
// VITE_SENDGRID_FROM_EMAIL=noreply@yourdomain.com
// VITE_BASE_URL=http://localhost:8080  // or your production URL

// 2. Install SendGrid (run this in your terminal):
// npm install @sendgrid/mail

// 3. Updated Email Service (services/email.ts)
import sgMail from '@sendgrid/mail'

// Set your SendGrid API key
if (import.meta.env.VITE_SENDGRID_API_KEY) {
  sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY)
}

interface InvitationEmailData {
  recipientEmail: string
  recipientName: string
  inviterName: string
  personalMessage?: string
  invitationToken: string
  invitationType: 'owner' | 'user' | 'admin'
}

export const emailService = {
  sendInvitationEmail: async (data: InvitationEmailData) => {
    // For demo mode, just return success
    if (!import.meta.env.VITE_SENDGRID_API_KEY) {
      console.log('Demo mode: Would send email to', data.recipientEmail)
      return { success: true, demo: true }
    }

    const {
      recipientEmail,
      recipientName,
      inviterName,
      personalMessage,
      invitationToken,
      invitationType
    } = data

    // Create invitation accept/reject links
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8080'
    const acceptUrl = `${baseUrl}/invitation/respond?token=${invitationToken}&action=accept`
    const rejectUrl = `${baseUrl}/invitation/respond?token=${invitationToken}&action=reject`

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're Invited to Join OnlyIfYouKnow</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background-color: #FF5A5F; color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; background-color: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 15px 30px; 
            margin: 10px 10px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold;
            text-align: center;
            font-size: 16px;
          }
          .accept-btn { background-color: #28a745; color: white; }
          .reject-btn { background-color: #dc3545; color: white; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
          .highlight { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏠 Welcome to OnlyIfYouKnow</h1>
          <p>Your Trusted Property Rental Platform</p>
        </div>
        
        <div class="content">
          <h2>Hi ${recipientName},</h2>
          
          <p>Great news! You've been invited by <strong>${inviterName}</strong> to join OnlyIfYouKnow as a property ${invitationType}.</p>
          
          ${personalMessage ? `<div class="highlight"><strong>Personal message:</strong><br>"${personalMessage}"</div>` : ''}
          
          <p><strong>What is OnlyIfYouKnow?</strong></p>
          <p>OnlyIfYouKnow is a trusted property rental platform that connects property owners with guests through verified networks and relationship-based connections.</p>
          
          <p><strong>As a property ${invitationType}, you'll be able to:</strong></p>
          <ul>
            <li>Access exclusive properties through trusted networks</li>
            <li>Connect with verified property owners and guests</li>
            <li>Enjoy authentic, relationship-based travel experiences</li>
            <li>Be part of a curated, invitation-only community</li>
          </ul>
          
          <div style="text-align: center; margin: 40px 0;">
            <p><strong>Ready to get started?</strong></p>
            <a href="${acceptUrl}" class="button accept-btn">✅ Accept Invitation</a>
            <a href="${rejectUrl}" class="button reject-btn">❌ Decline Invitation</a>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Click "Accept Invitation" above</li>
            <li>Complete your registration</li>
            <li>Explore our trusted network</li>
            <li>Start your journey with OnlyIfYouKnow!</li>
          </ol>
          
          <div class="highlight">
            <strong>⏰ Important:</strong> This invitation will expire in <strong>7 days</strong>, so don't wait too long!
          </div>
          
          <p>If you have any questions, feel free to contact our support team at support@onlyifyouknow.com</p>
          
          <p>Best regards,<br><strong>The OnlyIfYouKnow Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This invitation was sent to ${recipientEmail}</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          <p>© 2025 OnlyIfYouKnow. All rights reserved.</p>
        </div>
      </body>
      </html>
    `

    const msg = {
      to: recipientEmail,
      from: {
        email: import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@onlyifyouknow.com',
        name: 'OnlyIfYouKnow Team'
      },
      subject: `🏠 You're invited to join OnlyIfYouKnow as a property ${invitationType}!`,
      html: emailHtml,
      text: `Hi ${recipientName},

You've been invited by ${inviterName} to join OnlyIfYouKnow as a property ${invitationType}!

${personalMessage ? `Personal message: "${personalMessage}"` : ''}

OnlyIfYouKnow is a trusted property rental platform that connects property owners with guests through verified networks.

To accept this invitation, visit: ${acceptUrl}
To decline this invitation, visit: ${rejectUrl}

This invitation will expire in 7 days.

Best regards,
The OnlyIfYouKnow Team`
    }

    try {
      await sgMail.send(msg)
      return { success: true }
    } catch (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }
  }
}
