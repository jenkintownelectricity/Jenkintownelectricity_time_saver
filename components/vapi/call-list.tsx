'use client'

/**
 * VAPI Call List Component
 * Display list of all VAPI calls with filtering and search
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useVAPIStore } from '@/lib/stores/vapi-store'
import { CallStatus, CallUrgency } from '@/lib/types/vapi'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Search, Phone, Clock, Filter, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { exportCallLogsToCSV, exportCallLogsToExcel } from '@/lib/utils/spreadsheet'

export function CallList() {
  const { calls, setSelectedCall, searchCalls, getCallsByStatus, getCallsByUrgency, setLoading } = useVAPIStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CallStatus | 'all'>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<CallUrgency | 'all'>('all')
  const [dbCalls, setDbCalls] = useState<any[]>([])
  const [loading, setLocalLoading] = useState(true)

  // Load calls from database on mount
  useEffect(() => {
    loadCallsFromDatabase()
  }, [])

  async function loadCallsFromDatabase() {
    try {
      setLocalLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('vapi_calls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error loading calls:', error)
      } else {
        setDbCalls(data || [])
      }
    } catch (error) {
      console.error('Failed to load calls:', error)
    } finally {
      setLocalLoading(false)
    }
  }

  // Combine database calls with Zustand calls (for backwards compatibility)
  const allCalls = useMemo(() => {
    // Convert DB calls to match VAPICall format
    const formattedDbCalls = dbCalls.map((dbCall) => ({
      id: dbCall.id,
      userId: '',
      companyId: '',
      callId: dbCall.vapi_call_id,
      callerPhone: dbCall.caller_phone || '',
      callerName: dbCall.caller_name,
      duration: dbCall.duration || 0,
      transcript: dbCall.transcript || '',
      recording: dbCall.recording_url,
      extractedData: dbCall.extracted_data || {},
      appointmentCreated: dbCall.appointment_created || false,
      appointmentId: dbCall.appointment_id,
      status: dbCall.status as CallStatus,
      tags: Array.isArray(dbCall.tags) ? dbCall.tags : [],
      createdAt: new Date(dbCall.created_at),
      updatedAt: new Date(dbCall.updated_at || dbCall.created_at)
    }))

    return [...formattedDbCalls, ...calls]
  }, [dbCalls, calls])

  // Filter and search calls
  const filteredCalls = useMemo(() => {
    let result = allCalls

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((call) => call.status === statusFilter)
    }

    // Apply urgency filter
    if (urgencyFilter !== 'all') {
      result = result.filter((call) => call.extractedData?.urgency === urgencyFilter)
    }

    // Apply search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase()
      result = result.filter(
        (call) =>
          call.callerName?.toLowerCase().includes(lowerQuery) ||
          call.callerPhone.includes(searchQuery) ||
          call.transcript.toLowerCase().includes(lowerQuery) ||
          call.extractedData?.customerName?.toLowerCase().includes(lowerQuery) ||
          call.extractedData?.serviceRequested?.toLowerCase().includes(lowerQuery)
      )
    }

    return result
  }, [allCalls, statusFilter, urgencyFilter, searchQuery])

  const handleExportCSV = () => {
    exportCallLogsToCSV(filteredCalls)
  }

  const handleExportExcel = () => {
    exportCallLogsToExcel(filteredCalls)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">VAPI Calls</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search calls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CallStatus | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={CallStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={CallStatus.MISSED}>Missed</SelectItem>
              <SelectItem value={CallStatus.IN_PROGRESS}>In Progress</SelectItem>
              <SelectItem value={CallStatus.FOLLOWUP_NEEDED}>Follow-up Needed</SelectItem>
              <SelectItem value={CallStatus.CONVERTED}>Converted</SelectItem>
            </SelectContent>
          </Select>

          {/* Urgency Filter */}
          <Select value={urgencyFilter} onValueChange={(value) => setUrgencyFilter(value as CallUrgency | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgencies</SelectItem>
              <SelectItem value={CallUrgency.EMERGENCY}>Emergency</SelectItem>
              <SelectItem value={CallUrgency.ROUTINE}>Routine</SelectItem>
              <SelectItem value={CallUrgency.SCHEDULED}>Scheduled</SelectItem>
              <SelectItem value={CallUrgency.UNKNOWN}>Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Call List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-gray-500">Loading calls...</p>
            </div>
          </Card>
        ) : filteredCalls.length === 0 ? (
          <Card className="p-8 text-center">
            <Phone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No calls found</p>
          </Card>
        ) : (
          filteredCalls.map((call) => (
            <Card
              key={call.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCall(call)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">
                        {call.callerName || call.extractedData.customerName || 'Unknown Caller'}
                      </p>
                      <p className="text-sm text-gray-500">{call.callerPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(call.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <div>Duration: {call.duration}s</div>
                  </div>

                  {call.extractedData.serviceRequested && (
                    <p className="text-sm text-gray-700">
                      Service: {call.extractedData.serviceRequested}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge variant={getStatusVariant(call.status)}>
                    {call.status}
                  </Badge>
                  {call.extractedData.urgency && (
                    <Badge variant={getUrgencyVariant(call.extractedData.urgency)}>
                      {call.extractedData.urgency}
                    </Badge>
                  )}
                  {call.appointmentCreated && (
                    <Badge variant="default">Appointment Created</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function getStatusVariant(status: CallStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case CallStatus.COMPLETED:
      return 'default'
    case CallStatus.CONVERTED:
      return 'default'
    case CallStatus.IN_PROGRESS:
      return 'secondary'
    case CallStatus.MISSED:
      return 'destructive'
    case CallStatus.FOLLOWUP_NEEDED:
      return 'outline'
    default:
      return 'secondary'
  }
}

function getUrgencyVariant(urgency: CallUrgency): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (urgency) {
    case CallUrgency.EMERGENCY:
      return 'destructive'
    case CallUrgency.ROUTINE:
      return 'secondary'
    case CallUrgency.SCHEDULED:
      return 'default'
    default:
      return 'outline'
  }
}
