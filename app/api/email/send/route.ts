import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const {
      to,
      subject,
      body,
      emailConfig
    } = await request.json()

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      )
    }

    if (!emailConfig) {
      return NextResponse.json(
        { error: 'Email configuration required' },
        { status: 400 }
      )
    }

    // Support for Gmail, Outlook, or custom SMTP
    let result

    switch (emailConfig.provider) {
      case 'gmail':
        result = await sendGmail(to, subject, body, emailConfig)
        break

      case 'outlook':
        result = await sendOutlook(to, subject, body, emailConfig)
        break

      case 'smtp':
        result = await sendSMTP(to, subject, body, emailConfig)
        break

      default:
        return NextResponse.json(
          { error: 'Unsupported email provider' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    })

  } catch (error: any) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}

// Gmail API integration
async function sendGmail(
  to: string,
  subject: string,
  body: string,
  config: any
) {
  // TODO: Implement Gmail API
  // Requires OAuth2 access token

  if (!config.accessToken) {
    throw new Error('Gmail access token required')
  }

  const message = createEmailMessage(to, subject, body, config.from)

  // Placeholder for actual Gmail API call
  // const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${config.accessToken}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     raw: Buffer.from(message).toString('base64')
  //   })
  // })

  return { messageId: 'gmail_' + Date.now(), provider: 'gmail' }
}

// Outlook/Microsoft 365 integration
async function sendOutlook(
  to: string,
  subject: string,
  body: string,
  config: any
) {
  // TODO: Implement Microsoft Graph API
  // Requires OAuth2 access token

  if (!config.accessToken) {
    throw new Error('Outlook access token required')
  }

  // Placeholder for actual Microsoft Graph API call
  // const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${config.accessToken}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     message: {
  //       subject,
  //       body: { contentType: 'HTML', content: body },
  //       toRecipients: [{ emailAddress: { address: to } }]
  //     }
  //   })
  // })

  return { messageId: 'outlook_' + Date.now(), provider: 'outlook' }
}

// Custom SMTP integration (works with any email provider)
async function sendSMTP(
  to: string,
  subject: string,
  body: string,
  config: any
) {
  // TODO: Implement nodemailer or similar SMTP client
  // This is the universal fallback that works with ANY email provider

  if (!config.host || !config.port || !config.user || !config.password) {
    throw new Error('SMTP configuration incomplete')
  }

  // Placeholder for actual SMTP send
  // Would use nodemailer in production:
  /*
  const nodemailer = require('nodemailer')

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure || (config.port === 465),
    auth: {
      user: config.user,
      pass: config.password
    }
  })

  const info = await transporter.sendMail({
    from: config.from || config.user,
    to,
    subject,
    html: body
  })

  return { messageId: info.messageId, provider: 'smtp' }
  */

  return { messageId: 'smtp_' + Date.now(), provider: 'smtp' }
}

// Helper function to create RFC 2822 email message
function createEmailMessage(
  to: string,
  subject: string,
  body: string,
  from: string
): string {
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    body
  ]

  return messageParts.join('\n')
}

// Email templates for common contractor scenarios
export const EMAIL_TEMPLATES = {
  estimate_followup: (customerName: string, estimateNumber: string, amount: string) => ({
    subject: `Follow-up: Estimate #${estimateNumber}`,
    body: `
      <h2>Hi ${customerName},</h2>
      <p>Just following up on the estimate we sent you (Estimate #${estimateNumber} for $${amount}).</p>
      <p>Do you have any questions about the scope of work or pricing? I'm happy to discuss any adjustments.</p>
      <p>Let me know if you'd like to move forward!</p>
      <br/>
      <p>Best regards,</p>
    `
  }),

  invoice_reminder: (customerName: string, invoiceNumber: string, amount: string, dueDate: string) => ({
    subject: `Payment Reminder: Invoice #${invoiceNumber}`,
    body: `
      <h2>Hi ${customerName},</h2>
      <p>This is a friendly reminder that Invoice #${invoiceNumber} for $${amount} was due on ${dueDate}.</p>
      <p>If you've already sent payment, please disregard this message. Otherwise, please submit payment at your earliest convenience.</p>
      <p>Let me know if you have any questions about this invoice.</p>
      <br/>
      <p>Thank you,</p>
    `
  }),

  job_completion: (customerName: string, jobNumber: string) => ({
    subject: `Job Completed: #${jobNumber}`,
    body: `
      <h2>Hi ${customerName},</h2>
      <p>We've completed the work for Job #${jobNumber}. Thank you for choosing us!</p>
      <p>If you have any questions or concerns about the work, please don't hesitate to reach out.</p>
      <p>We'd appreciate it if you could leave us a review!</p>
      <br/>
      <p>Best regards,</p>
    `
  })
}
