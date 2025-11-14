import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { estimate, company, accessToken, realmId } = await request.json()

    if (!estimate || !company || !accessToken || !realmId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Map estimate to QuickBooks Estimate format
    const qbEstimate = {
      Line: estimate.lineItems.map((item: any, index: number) => ({
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
        name: estimate.customerName
      },
      TxnDate: new Date(estimate.date).toISOString().split('T')[0],
      ExpirationDate: estimate.expiryDate
        ? new Date(estimate.expiryDate).toISOString().split('T')[0]
        : undefined,
      DocNumber: estimate.number,
      PrivateNote: estimate.notes || '',
      CustomerMemo: {
        value: estimate.notes || ''
      },
      TxnTaxDetail: {
        TotalTax: estimate.taxAmount
      },
      BillEmail: {
        Address: company.email
      }
    }

    // Send to QuickBooks API
    const response = await fetch(
      `https://quickbooks.api.intuit.com/v3/company/${realmId}/estimate?minorversion=65`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(qbEstimate)
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
      qbEstimateId: result.Estimate?.Id,
      message: 'Estimate synced to QuickBooks successfully'
    })
  } catch (error) {
    console.error('Error syncing estimate to QuickBooks:', error)
    return NextResponse.json(
      { error: 'Failed to sync estimate' },
      { status: 500 }
    )
  }
}
