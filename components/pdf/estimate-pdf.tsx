import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { EstimateDocument } from '@/lib/line-items'
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
    backgroundColor: '#333',
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
    borderTop: '2 solid #333',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 10,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1 solid #ddd',
    fontSize: 8,
    color: '#666',
  },
  badge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },
})

interface EstimatePDFProps {
  estimate: EstimateDocument
  company: CompanyProfile
}

export const EstimatePDF: React.FC<EstimatePDFProps> = ({ estimate, company }) => {
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
            {company.licenseNumber && (
              <Text style={styles.companyInfo}>
                License: {company.licenseNumber}
                {company.licenseState && ` (${company.licenseState})`}
              </Text>
            )}
          </View>

          <View style={{ width: '40%', alignItems: 'flex-end' }}>
            <Text style={styles.documentTitle}>ESTIMATE</Text>
            <Text style={styles.documentNumber}>{estimate.number}</Text>
            <Text style={{ ...styles.badge, marginTop: 10 }}>{estimate.status}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{estimate.customerName}</Text>
          {estimate.jobName && (
            <Text style={{ fontSize: 9, color: '#555', marginTop: 3 }}>
              Job: {estimate.jobName}
            </Text>
          )}
        </View>

        {/* Estimate Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{new Date(estimate.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Valid Until:</Text>
            <Text style={styles.value}>{new Date(estimate.expiryDate || estimate.date).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Qty</Text>
            <Text style={styles.col3}>Rate</Text>
            <Text style={styles.col4}>Tax</Text>
            <Text style={styles.col5}>Amount</Text>
          </View>

          {estimate.lineItems.map((item, index) => {
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
            <Text>${estimate.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax ({estimate.taxRate}%):</Text>
            <Text>${estimate.taxAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>TOTAL:</Text>
            <Text>${estimate.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Notes */}
        {estimate.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{estimate.notes}</Text>
          </View>
        )}

        {/* Terms and Conditions */}
        {estimate.includeTerms && estimate.termsAndConditions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Conditions:</Text>
            <Text style={{ fontSize: 8, lineHeight: 1.4, color: '#555' }}>
              {estimate.termsAndConditions}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ textAlign: 'center' }}>
            Thank you for your business!
          </Text>
          <Text style={{ textAlign: 'center', marginTop: 5 }}>
            This estimate is valid until {new Date(estimate.expiryDate || estimate.date).toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
