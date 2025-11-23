import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { estimate, company, recipientEmail } = await request.json()

    if (!recipientEmail || !estimate || !company) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare email content
    const emailSubject = `Estimate ${estimate.number} from ${company.dbaName || company.name}`
    const emailBody = `
Dear ${estimate.customerName},

Please find attached estimate ${estimate.number} for your review.

Estimate Details:
- Date: ${new Date(estimate.date).toLocaleDateString()}
- Valid Until: ${new Date(estimate.expiryDate || estimate.date).toLocaleDateString()}
- Total Amount: $${estimate.total.toFixed(2)}

${estimate.notes ? `\nNotes:\n${estimate.notes}\n` : ''}

If you have any questions or would like to proceed, please don't hesitate to contact us.

Best regards,
${company.dbaName || company.name}
${company.phone}
${company.email}
`

    // Return mailto link for now (full SMTP integration coming soon)
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

    return NextResponse.json({
      success: true,
      mailtoLink,
      message: 'Email draft created. Opening your email client...'
    })
  } catch (error) {
    console.error('Error creating email:', error)
    return NextResponse.json(
      { error: 'Failed to create email' },
      { status: 500 }
    )
  }
}
