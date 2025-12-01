import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { WorkOrderDocument } from '@/lib/line-items'
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
  statusBadge: {
    padding: '4 8',
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    border: '1 solid #bae6fd',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
})

interface WorkOrderPDFProps {
  workOrder: WorkOrderDocument
  company: CompanyProfile
}

const getStatusColor = (status: WorkOrderDocument['status']) => {
  switch (status) {
    case 'Completed':
      return { backgroundColor: '#dcfce7', color: '#166534' }
    case 'In Progress':
      return { backgroundColor: '#dbeafe', color: '#1e40af' }
    case 'Scheduled':
      return { backgroundColor: '#fef3c7', color: '#92400e' }
    case 'On Hold':
      return { backgroundColor: '#fed7aa', color: '#9a3412' }
    case 'Cancelled':
      return { backgroundColor: '#f3f4f6', color: '#4b5563' }
  }
}

export const WorkOrderPDF: React.FC<WorkOrderPDFProps> = ({ workOrder, company }) => {
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
            {company.licenseNumber && (
              <Text style={styles.companyInfo}>
                License: {company.licenseNumber}
                {company.licenseState && ` (${company.licenseState})`}
              </Text>
            )}
          </View>

          <View style={{ width: '40%', alignItems: 'flex-end' }}>
            <Text style={styles.documentTitle}>WORK ORDER</Text>
            <Text style={styles.documentNumber}>{workOrder.number}</Text>
            <Text style={{ ...styles.statusBadge, ...getStatusColor(workOrder.status), marginTop: 10 }}>
              {workOrder.status}
            </Text>
          </View>
        </View>

        {/* Customer & Job Information */}
        <View style={styles.infoBox}>
          <Text style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 5 }}>
            Customer: {workOrder.customerName}
          </Text>
          {workOrder.jobName && (
            <Text style={{ fontSize: 9, color: '#555' }}>
              Job: {workOrder.jobName}
            </Text>
          )}
        </View>

        {/* Work Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Order Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>WO Date:</Text>
            <Text style={styles.value}>{new Date(workOrder.date).toLocaleDateString()}</Text>
          </View>
          {workOrder.scheduledDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Scheduled:</Text>
              <Text style={styles.value}>
                {new Date(workOrder.scheduledDate).toLocaleDateString()}
              </Text>
            </View>
          )}
          {workOrder.assignedTo && (
            <View style={styles.row}>
              <Text style={styles.label}>Assigned To:</Text>
              <Text style={styles.value}>{workOrder.assignedTo}</Text>
            </View>
          )}
          {workOrder.estimateId && (
            <View style={styles.row}>
              <Text style={styles.label}>Estimate Ref:</Text>
              <Text style={styles.value}>{workOrder.estimateId}</Text>
            </View>
          )}
        </View>

        {/* Scope of Work */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Scope of Work</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Qty</Text>
            <Text style={styles.col3}>Rate</Text>
            <Text style={styles.col4}>Tax</Text>
            <Text style={styles.col5}>Amount</Text>
          </View>

          {workOrder.lineItems.map((item, index) => {
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
            <Text>${workOrder.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax ({workOrder.taxRate}%):</Text>
            <Text>${workOrder.taxAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>TOTAL:</Text>
            <Text>${workOrder.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Internal Notes */}
        {workOrder.internalNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Internal Notes</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4, fontStyle: 'italic', color: '#666' }}>
              {workOrder.internalNotes}
            </Text>
          </View>
        )}

        {/* Notes */}
        {workOrder.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{workOrder.notes}</Text>
          </View>
        )}

        {/* Signature Section */}
        <View style={{ marginTop: 40, borderTop: '1 solid #ddd', paddingTop: 20 }}>
          <View style={styles.row}>
            <View style={{ width: '45%' }}>
              <Text style={{ fontSize: 9, marginBottom: 30 }}>Customer Signature:</Text>
              <View style={{ borderBottom: '1 solid #333', marginBottom: 5 }} />
              <Text style={{ fontSize: 8, color: '#666' }}>Signature</Text>
            </View>
            <View style={{ width: '45%' }}>
              <Text style={{ fontSize: 9, marginBottom: 30 }}>Date:</Text>
              <View style={{ borderBottom: '1 solid #333', marginBottom: 5 }} />
              <Text style={{ fontSize: 8, color: '#666' }}>Date</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ textAlign: 'center' }}>
            {company.dbaName || company.name} • {company.phone} • {company.email}
          </Text>
          {company.licenseNumber && (
            <Text style={{ textAlign: 'center', marginTop: 3 }}>
              License #{company.licenseNumber}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  )
}
