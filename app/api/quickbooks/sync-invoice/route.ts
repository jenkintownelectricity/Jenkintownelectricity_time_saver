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
    const qbInvoice = {
      Line: invoice.lineItems.map((item: any, index: number) => ({
        Id: (index + 1).toString(),
        LineNum: index + 1,
        Description: item.description,
        Amount: item.total,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          Qty: item.quantity,
          UnitPrice: item.rate,
          ItemRef: {
            name: item.description.substring(0, 100) // QuickBooks has 100 char limit
          }
        }
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
      },
      TxnTaxDetail: {
        TotalTax: invoice.taxAmount
      },
      BillEmail: {
        Address: company.email
      },
      Balance: invoice.balance,
      Deposit: invoice.amountPaid > 0 ? invoice.amountPaid : undefined
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
      const errorData = await response.json()
      console.error('QuickBooks API error:', errorData)
      return NextResponse.json(
        {
          error: 'Failed to sync to QuickBooks',
          details: errorData
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
