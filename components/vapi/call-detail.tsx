'use client'

/**
 * VAPI Call Detail Component
 * View and edit call details, transcript, and extracted data
 */

import React, { useState } from 'react'
import { useVAPIStore } from '@/lib/stores/vapi-store'
import { useAppointmentStore } from '@/lib/stores/appointment-store'
import { VAPICall, ExtractedData } from '@/lib/types/vapi'
import { AppointmentSource } from '@/lib/types/appointments'
import { format } from 'date-fns'
import { X, Phone, Clock, User, MapPin, Calendar, DollarSign, FileText, Edit2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface CallDetailProps {
  call: VAPICall
  onClose: () => void
}

export function CallDetail({ call, onClose }: CallDetailProps) {
  const { updateCall, updateExtractedData, markAsConverted } = useVAPIStore()
  const { addAppointment } = useAppointmentStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<ExtractedData>(call.extractedData)

  const handleSave = () => {
    updateExtractedData(call.id, editedData)
    setIsEditing(false)
  }

  const handleCreateAppointment = () => {
    if (!editedData.customerName && !call.callerName) {
      alert('Customer name is required to create an appointment')
      return
    }

    // Create appointment from call data
    const appointment = addAppointment({
      customerId: call.customerId || 'temp-' + crypto.randomUUID(),
      title: `${editedData.serviceRequested || 'Service Call'} - ${editedData.customerName || call.callerName}`,
      description: editedData.notes || '',
      serviceType: editedData.serviceRequested || 'General Service',
      location: {
        street: editedData.address || '',
        city: '',
        state: '',
        zipCode: ''
      },
      scheduledDate: new Date(),
      scheduledTime: editedData.preferredTime || '09:00',
      duration: 60,
      notes: `Created from call on ${format(new Date(call.createdAt), 'MMM dd, yyyy HH:mm')}\n\n${call.transcript}`,
      source: AppointmentSource.VAPI,
      vapiCallId: call.id,
      priority: editedData.urgency === 'emergency' ? 'urgent' : 'medium',
      estimatedCost: editedData.budget
    })

    // Mark call as converted
    markAsConverted(call.id, appointment.id)

    alert('Appointment created successfully!')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Call Details</h2>
              <p className="text-gray-500">
                {format(new Date(call.createdAt), 'MMMM dd, yyyy HH:mm')}
              </p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Call Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Caller</p>
              <p className="font-semibold">{call.callerName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-semibold">{call.callerPhone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold">{call.duration} seconds</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge>{call.status}</Badge>
            </div>
          </div>

          {/* Extracted Data */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">Extracted Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">
                  <User className="h-4 w-4 inline mr-2" />
                  Customer Name
                </Label>
                {isEditing ? (
                  <Input
                    id="customerName"
                    value={editedData.customerName || ''}
                    onChange={(e) => setEditedData({ ...editedData, customerName: e.target.value })}
                  />
                ) : (
                  <p className="mt-1">{editedData.customerName || 'Not provided'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="customerPhone">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Customer Phone
                </Label>
                {isEditing ? (
                  <Input
                    id="customerPhone"
                    value={editedData.customerPhone || ''}
                    onChange={(e) => setEditedData({ ...editedData, customerPhone: e.target.value })}
                  />
                ) : (
                  <p className="mt-1">{editedData.customerPhone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="customerEmail">Email</Label>
                {isEditing ? (
                  <Input
                    id="customerEmail"
                    type="email"
                    value={editedData.customerEmail || ''}
                    onChange={(e) => setEditedData({ ...editedData, customerEmail: e.target.value })}
                  />
                ) : (
                  <p className="mt-1">{editedData.customerEmail || 'Not provided'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="serviceRequested">Service Requested</Label>
                {isEditing ? (
                  <Input
                    id="serviceRequested"
                    value={editedData.serviceRequested || ''}
                    onChange={(e) => setEditedData({ ...editedData, serviceRequested: e.target.value })}
                  />
                ) : (
                  <p className="mt-1">{editedData.serviceRequested || 'Not specified'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Address
                </Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={editedData.address || ''}
                    onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                  />
                ) : (
                  <p className="mt-1">{editedData.address || 'Not provided'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="preferredDate">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Preferred Date
                </Label>
                {isEditing ? (
                  <Input
                    id="preferredDate"
                    value={editedData.preferredDate || ''}
                    onChange={(e) => setEditedData({ ...editedData, preferredDate: e.target.value })}
                  />
                ) : (
                  <p className="mt-1">{editedData.preferredDate || 'Not specified'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="preferredTime">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Preferred Time
                </Label>
                {isEditing ? (
                  <Input
                    id="preferredTime"
                    value={editedData.preferredTime || ''}
                    onChange={(e) => setEditedData({ ...editedData, preferredTime: e.target.value })}
                  />
                ) : (
                  <p className="mt-1">{editedData.preferredTime || 'Not specified'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="urgency">Urgency</Label>
                {isEditing ? (
                  <Input
                    id="urgency"
                    value={editedData.urgency || ''}
                    onChange={(e) => setEditedData({ ...editedData, urgency: e.target.value as any })}
                  />
                ) : (
                  <p className="mt-1">
                    <Badge>{editedData.urgency || 'Unknown'}</Badge>
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="budget">
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Budget
                </Label>
                {isEditing ? (
                  <Input
                    id="budget"
                    type="number"
                    value={editedData.budget || ''}
                    onChange={(e) => setEditedData({ ...editedData, budget: parseFloat(e.target.value) })}
                  />
                ) : (
                  <p className="mt-1">{editedData.budget ? `$${editedData.budget}` : 'Not specified'}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">
                <FileText className="h-4 w-4 inline mr-2" />
                Notes
              </Label>
              {isEditing ? (
                <Textarea
                  id="notes"
                  value={editedData.notes || ''}
                  onChange={(e) => setEditedData({ ...editedData, notes: e.target.value })}
                  rows={3}
                />
              ) : (
                <p className="mt-1">{editedData.notes || 'No additional notes'}</p>
              )}
            </div>
          </div>

          {/* Transcript */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Transcript</h3>
            <Card className="p-4 bg-gray-50">
              <p className="text-sm whitespace-pre-wrap">
                {call.transcript || 'No transcript available'}
              </p>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!call.appointmentCreated && (
              <Button onClick={handleCreateAppointment}>
                <Calendar className="h-4 w-4 mr-2" />
                Create Appointment
              </Button>
            )}
            {call.appointmentCreated && (
              <Badge variant="default" className="py-2 px-4">
                Appointment Already Created
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
