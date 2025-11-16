'use client'

/**
 * Appointment Detail Component
 * View detailed appointment information
 */

import React from 'react'
import { useAppointmentStore } from '@/lib/stores/appointment-store'
import { Appointment, AppointmentStatus } from '@/lib/types/appointments'
import { format } from 'date-fns'
import { X, Calendar, Clock, MapPin, User, Briefcase, DollarSign, FileText, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface AppointmentDetailProps {
  appointment: Appointment
  onClose: () => void
  onEdit?: () => void
}

export function AppointmentDetail({ appointment, onClose, onEdit }: AppointmentDetailProps) {
  const { confirmAppointment, startAppointment, completeAppointment, cancelAppointment } =
    useAppointmentStore()

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    switch (newStatus) {
      case AppointmentStatus.CONFIRMED:
        confirmAppointment(appointment.id)
        break
      case AppointmentStatus.IN_PROGRESS:
        startAppointment(appointment.id)
        break
      case AppointmentStatus.COMPLETED:
        completeAppointment(appointment.id)
        break
      case AppointmentStatus.CANCELLED:
        if (confirm('Are you sure you want to cancel this appointment?')) {
          cancelAppointment(appointment.id, 'Cancelled by user')
        }
        break
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{appointment.title}</h2>
              <Badge variant={getStatusVariant(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button onClick={onEdit} variant="outline" size="sm">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Date & Time */}
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Date & Time</p>
                  <p className="text-gray-700">
                    {format(new Date(appointment.scheduledDate), 'MMMM dd, yyyy')}
                  </p>
                  <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4" />
                    {appointment.scheduledTime} ({appointment.duration} minutes)
                  </p>
                </div>
              </div>
            </Card>

            {/* Customer */}
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Customer</p>
                  <p className="text-gray-700">{appointment.customerName || 'Not specified'}</p>
                  <p className="text-gray-600 text-sm">{appointment.customerPhone}</p>
                  {appointment.customerEmail && (
                    <p className="text-gray-600 text-sm">{appointment.customerEmail}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Service */}
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Service</p>
                  <p className="text-gray-700">{appointment.serviceType}</p>
                  <p className="text-gray-600 text-sm">Priority: {appointment.priority}</p>
                  {appointment.source && (
                    <Badge variant="outline" className="mt-1">
                      Source: {appointment.source}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Location */}
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-red-600 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Location</p>
                  <p className="text-gray-700">{appointment.location.street}</p>
                  <p className="text-gray-600 text-sm">
                    {appointment.location.city}, {appointment.location.state}{' '}
                    {appointment.location.zipCode}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Description */}
          {appointment.description && (
            <Card className="p-4 mb-6">
              <p className="font-semibold mb-2">Description</p>
              <p className="text-gray-700 whitespace-pre-wrap">{appointment.description}</p>
            </Card>
          )}

          {/* Costs */}
          {(appointment.estimatedCost || appointment.actualCost) && (
            <Card className="p-4 mb-6">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-green-600 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold mb-2">Cost Information</p>
                  <div className="grid grid-cols-2 gap-4">
                    {appointment.estimatedCost && (
                      <div>
                        <p className="text-sm text-gray-500">Estimated Cost</p>
                        <p className="text-lg font-semibold text-green-600">
                          ${appointment.estimatedCost.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {appointment.actualCost && (
                      <div>
                        <p className="text-sm text-gray-500">Actual Cost</p>
                        <p className="text-lg font-semibold text-green-600">
                          ${appointment.actualCost.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Team Assignment */}
          {appointment.assignedTo && (
            <Card className="p-4 mb-6">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Assigned To</p>
                  <p className="text-gray-700">{appointment.assignedToName || 'Team Member'}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Notes */}
          {appointment.notes && (
            <Card className="p-4 mb-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-600 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold mb-2">Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{appointment.notes}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Metadata */}
          <div className="text-sm text-gray-500 mb-6">
            <p>Created: {format(new Date(appointment.createdAt), 'MMM dd, yyyy HH:mm')}</p>
            <p>Last updated: {format(new Date(appointment.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {appointment.status === AppointmentStatus.SCHEDULED && (
              <Button onClick={() => handleStatusChange(AppointmentStatus.CONFIRMED)}>
                Confirm Appointment
              </Button>
            )}
            {appointment.status === AppointmentStatus.CONFIRMED && (
              <Button onClick={() => handleStatusChange(AppointmentStatus.IN_PROGRESS)}>
                Start Appointment
              </Button>
            )}
            {appointment.status === AppointmentStatus.IN_PROGRESS && (
              <Button onClick={() => handleStatusChange(AppointmentStatus.COMPLETED)}>
                Complete Appointment
              </Button>
            )}
            {appointment.status !== AppointmentStatus.CANCELLED &&
              appointment.status !== AppointmentStatus.COMPLETED && (
                <Button
                  variant="destructive"
                  onClick={() => handleStatusChange(AppointmentStatus.CANCELLED)}
                >
                  Cancel Appointment
                </Button>
              )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function getStatusVariant(status: AppointmentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case AppointmentStatus.SCHEDULED:
      return 'secondary'
    case AppointmentStatus.CONFIRMED:
      return 'default'
    case AppointmentStatus.IN_PROGRESS:
      return 'default'
    case AppointmentStatus.COMPLETED:
      return 'outline'
    case AppointmentStatus.CANCELLED:
      return 'destructive'
    default:
      return 'secondary'
  }
}
