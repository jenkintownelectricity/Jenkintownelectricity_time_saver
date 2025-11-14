import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { InvoiceDocument } from '@/lib/line-items'
import { CompanyProfile } from '@/lib/company-profiles'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: '2 solid #333',
    paddingBottom: 15,
  },
  logo: {
    width: 80,
    height: 80,
  },
  companyInfo: {
    fontSize: 9,
    color: '#555',
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#dc2626',
  },
  documentNumber: {
    fontSize: 12,
    color: '#555',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    backgroundColor: '#f3f4f6',
    padding: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: '30%',
  },
  value: {
    width: '70%',
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#dc2626',
    color: '#fff',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #ddd',
    padding: 8,
    fontSize: 9,
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderBottom: '1 solid #ddd',
    padding: 8,
    fontSize: 9,
  },
  col1: { width: '40%' },
  col2: { width: '15%', textAlign: 'right' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'center' },
  col5: { width: '15%', textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #dc2626',
    fontWeight: 'bold',
    fontSize: 14,
    paddingHorizontal: 10,
    color: '#dc2626',
  },
  amountDue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 4,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#dc2626',
  },
  paymentInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f0f9ff',
    border: '1 solid #bae6fd',
    borderRadius: 4,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1 solid #ddd',
    fontSize: 8,
    color: '#666',
  },
  statusBadge: {
    padding: '4 8',
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#fffbeb',
    border: '1 solid #fcd34d',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
})

interface InvoicePDFProps {
  invoice: InvoiceDocument
  company: CompanyProfile
}

const getStatusColor = (status: InvoiceDocument['status']) => {
  switch (status) {
    case 'Paid':
      return { backgroundColor: '#dcfce7', color: '#166534' }
    case 'Partial':
      return { backgroundColor: '#dbeafe', color: '#1e40af' }
    case 'Sent':
      return { backgroundColor: '#f3e8ff', color: '#6b21a8' }
    case 'Viewed':
      return { backgroundColor: '#cffafe', color: '#155e75' }
    case 'Overdue':
      return { backgroundColor: '#fee2e2', color: '#991b1b' }
    case 'Cancelled':
      return { backgroundColor: '#f3f4f6', color: '#4b5563' }
    default:
      return { backgroundColor: '#fef3c7', color: '#92400e' }
  }
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, company }) => {
  const isOverdue = invoice.dueDate && invoice.dueDate < Date.now() && invoice.balance > 0
  const isPaid = invoice.balance === 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: '60%' }}>
            {company.logo && (
              <Image style={styles.logo} src={company.logo} />
            )}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 10 }}>
              {company.dbaName || company.name}
            </Text>
            <Text style={styles.companyInfo}>{company.address.street1}</Text>
            {company.address.street2 && (
              <Text style={styles.companyInfo}>{company.address.street2}</Text>
            )}
            <Text style={styles.companyInfo}>
              {company.address.city}, {company.address.state} {company.address.zip}
            </Text>
            <Text style={styles.companyInfo}>{company.phone}</Text>
            <Text style={styles.companyInfo}>{company.email}</Text>
            {company.website && (
              <Text style={styles.companyInfo}>{company.website}</Text>
            )}
            {company.taxId && (
              <Text style={styles.companyInfo}>Tax ID: {company.taxId}</Text>
            )}
            {company.licenseNumber && (
              <Text style={styles.companyInfo}>
                License: {company.licenseNumber}
                {company.licenseState && ` (${company.licenseState})`}
              </Text>
            )}
          </View>

          <View style={{ width: '40%', alignItems: 'flex-end' }}>
            <Text style={styles.documentTitle}>INVOICE</Text>
            <Text style={styles.documentNumber}>{invoice.number}</Text>
            <Text style={{ ...styles.statusBadge, ...getStatusColor(invoice.status), marginTop: 10 }}>
              {invoice.status}
            </Text>
          </View>
        </View>

        {/* Overdue Warning */}
        {isOverdue && (
          <View style={{ ...styles.infoBox, backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 11, color: '#991b1b' }}>
              ⚠️ PAYMENT OVERDUE
            </Text>
            <Text style={{ fontSize: 9, color: '#7f1d1d', marginTop: 3 }}>
              This invoice was due on {new Date(invoice.dueDate!).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Customer Information */}
        <View style={styles.infoBox}>
          <Text style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 5 }}>
            Bill To: {invoice.customerName}
          </Text>
          {invoice.jobName && (
            <Text style={{ fontSize: 9, color: '#555' }}>
              Job: {invoice.jobName}
            </Text>
          )}
        </View>

        {/* Invoice Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Date:</Text>
            <Text style={styles.value}>{new Date(invoice.date).toLocaleDateString()}</Text>
          </View>
          {invoice.dueDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={{ ...styles.value, fontWeight: 'bold', color: isOverdue ? '#dc2626' : '#000' }}>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </Text>
            </View>
          )}
          {invoice.paymentTerms && (
            <View style={styles.row}>
              <Text style={styles.label}>Payment Terms:</Text>
              <Text style={styles.value}>{invoice.paymentTerms}</Text>
            </View>
          )}
          {invoice.workOrderId && (
            <View style={styles.row}>
              <Text style={styles.label}>Work Order:</Text>
              <Text style={styles.value}>{invoice.workOrderId}</Text>
            </View>
          )}
          {invoice.estimateId && (
            <View style={styles.row}>
              <Text style={styles.label}>Estimate:</Text>
              <Text style={styles.value}>{invoice.estimateId}</Text>
            </View>
          )}
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Items & Services</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Qty</Text>
            <Text style={styles.col3}>Rate</Text>
            <Text style={styles.col4}>Tax</Text>
            <Text style={styles.col5}>Amount</Text>
          </View>

          {invoice.lineItems.map((item, index) => {
            const amount = item.quantity * item.unitPrice
            return (
              <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <View style={styles.col1}>
                  <Text style={{ fontWeight: 'bold' }}>{item.description}</Text>
                  {item.notes && (
                    <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>
                      {item.notes}
                    </Text>
                  )}
                  <Text style={{ fontSize: 8, color: '#999', marginTop: 2 }}>
                    {item.type === 'material' && '📦 Material'}
                    {item.type === 'labor' && '👷 Labor'}
                    {item.type === 'subcontractor' && '🤝 Subcontractor'}
                  </Text>
                </View>
                <Text style={styles.col2}>{item.quantity}</Text>
                <Text style={styles.col3}>${item.unitPrice.toFixed(2)}</Text>
                <Text style={styles.col4}>{item.taxable ? '✓' : '-'}</Text>
                <Text style={styles.col5}>${amount.toFixed(2)}</Text>
              </View>
            )
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>${invoice.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax ({invoice.taxRate}%):</Text>
            <Text>${invoice.taxAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>TOTAL:</Text>
            <Text>${invoice.total.toFixed(2)}</Text>
          </View>
          {invoice.amountPaid > 0 && (
            <View style={{ ...styles.totalRow, color: '#059669', marginTop: 10 }}>
              <Text>Amount Paid:</Text>
              <Text>-${invoice.amountPaid.toFixed(2)}</Text>
            </View>
          )}
          {invoice.balance > 0 && (
            <View style={styles.amountDue}>
              <Text>AMOUNT DUE:</Text>
              <Text>${invoice.balance.toFixed(2)}</Text>
            </View>
          )}
          {isPaid && (
            <View style={{ ...styles.amountDue, backgroundColor: '#d1fae5', color: '#065f46' }}>
              <Text>✓ PAID IN FULL</Text>
              <Text>$0.00</Text>
            </View>
          )}
        </View>

        {/* Payment Information */}
        {invoice.balance > 0 && company.paymentMethods && (
          <View style={styles.paymentInfo}>
            <Text style={{ fontWeight: 'bold', fontSize: 10, marginBottom: 8 }}>
              Payment Options:
            </Text>
            {company.paymentMethods.venmo && (
              <Text style={{ fontSize: 9, marginBottom: 3 }}>
                💸 Venmo: {company.paymentMethods.venmo}
              </Text>
            )}
            {company.paymentMethods.cashapp && (
              <Text style={{ fontSize: 9, marginBottom: 3 }}>
                💵 Cash App: {company.paymentMethods.cashapp}
              </Text>
            )}
            {company.paymentMethods.zelle && (
              <Text style={{ fontSize: 9, marginBottom: 3 }}>
                💰 Zelle: {company.paymentMethods.zelle}
              </Text>
            )}
            {company.bankName && (
              <Text style={{ fontSize: 9, marginTop: 5 }}>
                🏦 Bank Transfer: {company.bankName}
              </Text>
            )}
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{invoice.notes}</Text>
          </View>
        )}

        {/* Terms and Conditions */}
        {invoice.includeTerms && invoice.termsAndConditions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Conditions:</Text>
            <Text style={{ fontSize: 8, lineHeight: 1.4, color: '#555' }}>
              {invoice.termsAndConditions}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 5 }}>
            Thank you for your business!
          </Text>
          <Text style={{ textAlign: 'center' }}>
            {company.dbaName || company.name} • {company.phone} • {company.email}
          </Text>
          {company.licenseNumber && (
            <Text style={{ textAlign: 'center', marginTop: 3 }}>
              License #{company.licenseNumber}
              {company.licenseState && ` (${company.licenseState})`}
            </Text>
          )}
          {invoice.balance > 0 && (
            <Text style={{ textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
              Please remit payment by {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'due date'}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  )
}
