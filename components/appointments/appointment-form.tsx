'use client'

/**
 * Appointment Form Component
 * Create and edit appointments
 */

import React, { useState } from 'react'
import { useAppointmentStore } from '@/lib/stores/appointment-store'
import { AppointmentCreateInput } from '@/lib/types/appointments'
import { format } from 'date-fns'
import { Calendar, Clock, MapPin, User, Briefcase, DollarSign, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AppointmentFormProps {
  onClose?: () => void
  onSuccess?: () => void
  initialData?: Partial<AppointmentCreateInput>
}

export function AppointmentForm({ onClose, onSuccess, initialData }: AppointmentFormProps) {
  const { addAppointment } = useAppointmentStore()
  const [formData, setFormData] = useState<Partial<AppointmentCreateInput>>({
    customerId: initialData?.customerId || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    serviceType: initialData?.serviceType || '',
    location: initialData?.location || {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    scheduledDate: initialData?.scheduledDate || new Date(),
    scheduledTime: initialData?.scheduledTime || '09:00',
    duration: initialData?.duration || 60,
    assignedTo: initialData?.assignedTo,
    notes: initialData?.notes || '',
    priority: initialData?.priority || 'medium',
    estimatedCost: initialData?.estimatedCost
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required'
    }
    if (!formData.title) {
      newErrors.title = 'Title is required'
    }
    if (!formData.serviceType) {
      newErrors.serviceType = 'Service type is required'
    }
    if (!formData.location?.street) {
      newErrors.street = 'Street address is required'
    }
    if (!formData.location?.city) {
      newErrors.city = 'City is required'
    }
    if (!formData.location?.state) {
      newErrors.state = 'State is required'
    }
    if (!formData.location?.zipCode) {
      newErrors.zipCode = 'Zip code is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      addAppointment(formData as AppointmentCreateInput)
      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error('Error creating appointment:', error)
      setErrors({ submit: 'Failed to create appointment' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Customer Information
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerId">Customer *</Label>
            <Select
              value={formData.customerId}
              onValueChange={(value) => setFormData({ ...formData, customerId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer-1">John Doe</SelectItem>
                <SelectItem value="customer-2">Jane Smith</SelectItem>
                <SelectItem value="customer-3">Bob Johnson</SelectItem>
              </SelectContent>
            </Select>
            {errors.customerId && (
              <p className="text-sm text-red-500 mt-1">{errors.customerId}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Appointment Details */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Appointment Details
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Panel Upgrade - Main Residence"
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="serviceType">Service Type *</Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Panel Upgrade">Panel Upgrade</SelectItem>
                <SelectItem value="Outlet Installation">Outlet Installation</SelectItem>
                <SelectItem value="Wiring">Wiring</SelectItem>
                <SelectItem value="Light Fixture">Light Fixture</SelectItem>
                <SelectItem value="Circuit Breaker">Circuit Breaker</SelectItem>
                <SelectItem value="GFCI Installation">GFCI Installation</SelectItem>
                <SelectItem value="Generator Installation">Generator Installation</SelectItem>
                <SelectItem value="EV Charger">EV Charger Installation</SelectItem>
                <SelectItem value="Ceiling Fan">Ceiling Fan Installation</SelectItem>
                <SelectItem value="Inspection">Electrical Inspection</SelectItem>
                <SelectItem value="Emergency Repair">Emergency Repair</SelectItem>
                <SelectItem value="General Electrical">General Electrical</SelectItem>
              </SelectContent>
            </Select>
            {errors.serviceType && (
              <p className="text-sm text-red-500 mt-1">{errors.serviceType}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about the service..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Location */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={formData.location?.street || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location!, street: e.target.value }
                })
              }
              placeholder="123 Main St"
            />
            {errors.street && <p className="text-sm text-red-500 mt-1">{errors.street}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.location?.city || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location!, city: e.target.value }
                  })
                }
                placeholder="City"
              />
              {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.location?.state || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location!, state: e.target.value }
                  })
                }
                placeholder="State"
              />
              {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="zipCode">Zip Code *</Label>
            <Input
              id="zipCode"
              value={formData.location?.zipCode || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location!, zipCode: e.target.value }
                })
              }
              placeholder="12345"
            />
            {errors.zipCode && <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>}
          </div>
        </div>
      </Card>

      {/* Date & Time */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Date & Time
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="scheduledDate">Date *</Label>
            <Input
              id="scheduledDate"
              type="date"
              value={format(formData.scheduledDate || new Date(), 'yyyy-MM-dd')}
              onChange={(e) =>
                setFormData({ ...formData, scheduledDate: new Date(e.target.value) })
              }
            />
          </div>

          <div>
            <Label htmlFor="scheduledTime">Time *</Label>
            <Input
              id="scheduledTime"
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })
              }
              min="15"
              step="15"
            />
          </div>
        </div>
      </Card>

      {/* Additional Info */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Additional Information
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="assignedTo">Assign To</Label>
            <Select
              value={formData.assignedTo}
              onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team-1">Mike Johnson</SelectItem>
                <SelectItem value="team-2">Sarah Williams</SelectItem>
                <SelectItem value="team-3">Tom Anderson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estimatedCost">Estimated Cost</Label>
            <Input
              id="estimatedCost"
              type="number"
              value={formData.estimatedCost || ''}
              onChange={(e) =>
                setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) })
              }
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal notes..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit">Create Appointment</Button>
      </div>
    </form>
  )
}
