import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { invoice, company, accessToken, realmId } = await request.json()

    if (!invoice || !company || !accessToken || !realmId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Map invoice to QuickBooks Invoice format
    // Using simplified line items that work without pre-existing items
    const qbInvoice = {
      Line: invoice.lineItems.map((item: any, index: number) => ({
        DetailType: 'DescriptionOnly',
        Description: `${item.description} - Qty: ${item.quantity} @ $${item.rate}`,
        Amount: item.total,
        LineNum: index + 1
      })),
      CustomerRef: {
        name: invoice.customerName
      },
      TxnDate: new Date(invoice.date).toISOString().split('T')[0],
      DueDate: invoice.dueDate
        ? new Date(invoice.dueDate).toISOString().split('T')[0]
        : undefined,
      DocNumber: invoice.number,
      PrivateNote: invoice.notes || '',
      CustomerMemo: {
        value: invoice.notes || ''
      }
    }

    // Send to QuickBooks API
    const response = await fetch(
      `https://quickbooks.api.intuit.com/v3/company/${realmId}/invoice?minorversion=65`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(qbInvoice)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('QuickBooks API error:', errorText)

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { message: errorText }
      }

      return NextResponse.json(
        {
          error: 'Failed to sync to QuickBooks',
          details: errorData,
          statusCode: response.status,
          rawError: errorText.substring(0, 500)
        },
        { status: response.status }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      qbInvoiceId: result.Invoice?.Id,
      message: 'Invoice synced to QuickBooks successfully'
    })
  } catch (error) {
    console.error('Error syncing invoice to QuickBooks:', error)
    return NextResponse.json(
      { error: 'Failed to sync invoice' },
      { status: 500 }
    )
  }
}
