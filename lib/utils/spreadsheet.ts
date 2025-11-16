/**
 * Spreadsheet Export Utilities
 * Export appointments and call logs to CSV/Excel
 */

import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { VAPICall } from '@/lib/types/vapi'
import { Appointment } from '@/lib/types/appointments'

/**
 * Export appointments to CSV
 */
export function exportAppointmentsToCSV(appointments: Appointment[]): void {
  const data = appointments.map((apt) => ({
    'Date': format(new Date(apt.scheduledDate), 'MM/dd/yyyy'),
    'Time': apt.scheduledTime,
    'Customer': apt.customerName || 'N/A',
    'Phone': apt.customerPhone || 'N/A',
    'Email': apt.customerEmail || 'N/A',
    'Service': apt.serviceType,
    'Address': `${apt.location.street}, ${apt.location.city}, ${apt.location.state} ${apt.location.zipCode}`,
    'Duration (min)': apt.duration,
    'Status': apt.status,
    'Assigned To': apt.assignedToName || 'Unassigned',
    'Priority': apt.priority,
    'Estimated Cost': apt.estimatedCost ? `$${apt.estimatedCost.toFixed(2)}` : 'N/A',
    'Actual Cost': apt.actualCost ? `$${apt.actualCost.toFixed(2)}` : 'N/A',
    'Source': apt.source,
    'Notes': apt.notes,
    'Created': format(new Date(apt.createdAt), 'MM/dd/yyyy HH:mm')
  }))

  downloadCSV(data, `appointments_${format(new Date(), 'yyyy-MM-dd')}.csv`)
}

/**
 * Export call logs to CSV
 */
export function exportCallLogsToCSV(calls: VAPICall[]): void {
  const data = calls.map((call) => ({
    'Date': format(new Date(call.createdAt), 'MM/dd/yyyy'),
    'Time': format(new Date(call.createdAt), 'HH:mm'),
    'Caller': call.callerName || 'Unknown',
    'Phone': call.callerPhone,
    'Duration (sec)': call.duration,
    'Status': call.status,
    'Customer Name': call.extractedData.customerName || 'N/A',
    'Customer Phone': call.extractedData.customerPhone || 'N/A',
    'Email': call.extractedData.customerEmail || 'N/A',
    'Service Requested': call.extractedData.serviceRequested || 'N/A',
    'Address': call.extractedData.address || 'N/A',
    'Preferred Date': call.extractedData.preferredDate || 'N/A',
    'Preferred Time': call.extractedData.preferredTime || 'N/A',
    'Urgency': call.extractedData.urgency || 'N/A',
    'Budget': call.extractedData.budget ? `$${call.extractedData.budget.toFixed(2)}` : 'N/A',
    'Appointment Created': call.appointmentCreated ? 'Yes' : 'No',
    'Notes': call.extractedData.notes || ''
  }))

  downloadCSV(data, `call_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`)
}

/**
 * Export appointments to Excel
 */
export function exportAppointmentsToExcel(appointments: Appointment[]): void {
  const data = appointments.map((apt) => ({
    'Date': format(new Date(apt.scheduledDate), 'MM/dd/yyyy'),
    'Time': apt.scheduledTime,
    'Customer': apt.customerName || 'N/A',
    'Phone': apt.customerPhone || 'N/A',
    'Email': apt.customerEmail || 'N/A',
    'Service': apt.serviceType,
    'Street': apt.location.street,
    'City': apt.location.city,
    'State': apt.location.state,
    'Zip': apt.location.zipCode,
    'Duration': apt.duration,
    'Status': apt.status,
    'Assigned To': apt.assignedToName || 'Unassigned',
    'Priority': apt.priority,
    'Estimated Cost': apt.estimatedCost || 0,
    'Actual Cost': apt.actualCost || 0,
    'Source': apt.source,
    'Notes': apt.notes,
    'Created': format(new Date(apt.createdAt), 'MM/dd/yyyy HH:mm')
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments')

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Date
    { wch: 8 },  // Time
    { wch: 20 }, // Customer
    { wch: 15 }, // Phone
    { wch: 25 }, // Email
    { wch: 20 }, // Service
    { wch: 30 }, // Street
    { wch: 15 }, // City
    { wch: 5 },  // State
    { wch: 10 }, // Zip
    { wch: 10 }, // Duration
    { wch: 12 }, // Status
    { wch: 15 }, // Assigned To
    { wch: 10 }, // Priority
    { wch: 12 }, // Estimated Cost
    { wch: 12 }, // Actual Cost
    { wch: 12 }, // Source
    { wch: 40 }, // Notes
    { wch: 18 }  // Created
  ]
  worksheet['!cols'] = columnWidths

  XLSX.writeFile(workbook, `appointments_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}

/**
 * Export call logs to Excel
 */
export function exportCallLogsToExcel(calls: VAPICall[]): void {
  const data = calls.map((call) => ({
    'Date': format(new Date(call.createdAt), 'MM/dd/yyyy'),
    'Time': format(new Date(call.createdAt), 'HH:mm'),
    'Caller': call.callerName || 'Unknown',
    'Phone': call.callerPhone,
    'Duration (sec)': call.duration,
    'Status': call.status,
    'Customer Name': call.extractedData.customerName || 'N/A',
    'Customer Phone': call.extractedData.customerPhone || 'N/A',
    'Email': call.extractedData.customerEmail || 'N/A',
    'Service': call.extractedData.serviceRequested || 'N/A',
    'Address': call.extractedData.address || 'N/A',
    'Preferred Date': call.extractedData.preferredDate || 'N/A',
    'Preferred Time': call.extractedData.preferredTime || 'N/A',
    'Urgency': call.extractedData.urgency || 'N/A',
    'Budget': call.extractedData.budget || 0,
    'Appointment Created': call.appointmentCreated ? 'Yes' : 'No',
    'Notes': call.extractedData.notes || ''
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Call Logs')

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Date
    { wch: 8 },  // Time
    { wch: 20 }, // Caller
    { wch: 15 }, // Phone
    { wch: 10 }, // Duration
    { wch: 12 }, // Status
    { wch: 20 }, // Customer Name
    { wch: 15 }, // Customer Phone
    { wch: 25 }, // Email
    { wch: 20 }, // Service
    { wch: 30 }, // Address
    { wch: 15 }, // Preferred Date
    { wch: 12 }, // Preferred Time
    { wch: 10 }, // Urgency
    { wch: 10 }, // Budget
    { wch: 15 }, // Appointment Created
    { wch: 40 }  // Notes
  ]
  worksheet['!cols'] = columnWidths

  XLSX.writeFile(workbook, `call_logs_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}

/**
 * Export combined report (calls and appointments)
 */
export function exportCombinedReport(
  calls: VAPICall[],
  appointments: Appointment[]
): void {
  const workbook = XLSX.utils.book_new()

  // Calls sheet
  const callData = calls.map((call) => ({
    'Date': format(new Date(call.createdAt), 'MM/dd/yyyy'),
    'Time': format(new Date(call.createdAt), 'HH:mm'),
    'Caller': call.callerName || 'Unknown',
    'Phone': call.callerPhone,
    'Duration': call.duration,
    'Status': call.status,
    'Service': call.extractedData.serviceRequested || 'N/A',
    'Urgency': call.extractedData.urgency || 'N/A',
    'Converted': call.appointmentCreated ? 'Yes' : 'No'
  }))
  const callSheet = XLSX.utils.json_to_sheet(callData)
  XLSX.utils.book_append_sheet(workbook, callSheet, 'Calls')

  // Appointments sheet
  const aptData = appointments.map((apt) => ({
    'Date': format(new Date(apt.scheduledDate), 'MM/dd/yyyy'),
    'Time': apt.scheduledTime,
    'Customer': apt.customerName || 'N/A',
    'Service': apt.serviceType,
    'Status': apt.status,
    'Duration': apt.duration,
    'Estimated': apt.estimatedCost || 0,
    'Actual': apt.actualCost || 0,
    'Source': apt.source
  }))
  const aptSheet = XLSX.utils.json_to_sheet(aptData)
  XLSX.utils.book_append_sheet(workbook, aptSheet, 'Appointments')

  // Summary sheet
  const summary = [
    { Metric: 'Total Calls', Value: calls.length },
    { Metric: 'Total Appointments', Value: appointments.length },
    { Metric: 'Conversion Rate', Value: `${calls.length > 0 ? ((calls.filter(c => c.appointmentCreated).length / calls.length) * 100).toFixed(2) : 0}%` },
    { Metric: 'Completed Appointments', Value: appointments.filter(a => a.status === 'completed').length },
    { Metric: 'Cancelled Appointments', Value: appointments.filter(a => a.status === 'cancelled').length },
    { Metric: 'Total Revenue', Value: appointments.reduce((sum, a) => sum + (a.actualCost || 0), 0).toFixed(2) }
  ]
  const summarySheet = XLSX.utils.json_to_sheet(summary)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  XLSX.writeFile(workbook, `report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}

/**
 * Helper: Download CSV file
 */
function downloadCSV(data: Record<string, string | number>[], filename: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Google Sheets Integration (Placeholder)
 * Requires Google Sheets API setup
 */
export async function exportToGoogleSheets(
  spreadsheetId: string,
  sheetName: string,
  data: Record<string, unknown>[]
): Promise<void> {
  // TODO: Implement Google Sheets API integration
  // 1. Setup Google Cloud project
  // 2. Enable Google Sheets API
  // 3. Create OAuth2 credentials
  // 4. Use googleapis library to write data

  console.log('Google Sheets export not yet implemented')
  console.log('Data to export:', data)

  throw new Error('Google Sheets integration not yet implemented. Please use CSV/Excel export.')
}

/**
 * Format duration in seconds to readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}
