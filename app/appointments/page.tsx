'use client'

/**
 * Appointments Page
 * Main page for managing appointments and scheduling
 */

import React, { useState } from 'react'
import { useAppointmentStore } from '@/lib/stores/appointment-store'
import { AppointmentCalendar } from '@/components/appointments/appointment-calendar'
import { AppointmentList } from '@/components/appointments/appointment-list'
import { AppointmentForm } from '@/components/appointments/appointment-form'
import { AppointmentDetail } from '@/components/appointments/appointment-detail'
import { AvailabilityManager } from '@/components/appointments/availability-manager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { exportAppointmentsToCSV, exportAppointmentsToExcel } from '@/lib/utils/spreadsheet'

export default function AppointmentsPage() {
  const { selectedAppointment, setSelectedAppointment, appointments, getAppointmentStats } =
    useAppointmentStore()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('calendar')
  const stats = getAppointmentStats()

  const handleExportCSV = () => {
    exportAppointmentsToCSV(appointments)
  }

  const handleExportExcel = () => {
    exportAppointmentsToExcel(appointments)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Appointment Scheduler</h1>
            <p className="text-gray-600">
              Manage your appointments, view calendar, and track schedules
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Appointment</DialogTitle>
                </DialogHeader>
                <AppointmentForm
                  onClose={() => setIsFormOpen(false)}
                  onSuccess={() => setIsFormOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">Completion Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.completionRate.toFixed(1)}%
            </p>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <AppointmentCalendar />
        </TabsContent>

        <TabsContent value="list">
          <AppointmentList />
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityManager />
        </TabsContent>
      </Tabs>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onEdit={() => {
            setSelectedAppointment(null)
            setIsFormOpen(true)
          }}
        />
      )}

      {/* Help Card */}
      <Card className="p-6 mt-8 bg-green-50 border-green-200">
        <h3 className="font-semibold mb-2 text-green-900">Appointment Management Tips</h3>
        <ul className="space-y-2 text-sm text-green-800">
          <li>• Click on any day in the calendar to view appointments for that date</li>
          <li>• Use the availability manager to set your business hours and team schedules</li>
          <li>
            • Appointments from VAPI calls are automatically marked with{' '}
            <Badge variant="outline" className="text-xs">
              Source: vapi
            </Badge>
          </li>
          <li>• Export your appointments to CSV or Excel for reporting and analysis</li>
          <li>• Set reminders to automatically notify customers before appointments</li>
        </ul>
      </Card>
    </div>
  )
}
