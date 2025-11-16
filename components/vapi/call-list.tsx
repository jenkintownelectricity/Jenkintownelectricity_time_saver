'use client'

/**
 * VAPI Call List Component
 * Display list of all VAPI calls with filtering and search
 */

import React, { useState, useMemo } from 'react'
import { useVAPIStore } from '@/lib/stores/vapi-store'
import { CallStatus, CallUrgency } from '@/lib/types/vapi'
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
  const { calls, setSelectedCall, searchCalls, getCallsByStatus, getCallsByUrgency } = useVAPIStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CallStatus | 'all'>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<CallUrgency | 'all'>('all')

  // Filter and search calls
  const filteredCalls = useMemo(() => {
    let result = calls

    // Apply status filter
    if (statusFilter !== 'all') {
      result = getCallsByStatus(statusFilter)
    }

    // Apply urgency filter
    if (urgencyFilter !== 'all') {
      result = getCallsByUrgency(urgencyFilter)
    }

    // Apply search
    if (searchQuery) {
      result = searchCalls(searchQuery)
    }

    return result
  }, [calls, statusFilter, urgencyFilter, searchQuery, getCallsByStatus, getCallsByUrgency, searchCalls])

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
        {filteredCalls.length === 0 ? (
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
