'use client'

import { Customer, formatPhoneNumber, formatAddress, CUSTOMER_STATUS_LABELS, CUSTOMER_TYPE_LABELS, CUSTOMER_SOURCE_LABELS, ADDRESS_TYPE_LABELS } from '@/lib/types/customers'
import { useCustomerStore } from '@/lib/stores/customer-store'
import { CommunicationLog } from './communication-log'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  Calendar,
  FileText,
  DollarSign,
  Briefcase,
  Edit,
  Trash,
  Copy,
  MessageSquare,
  Tag,
  Clock,
} from 'lucide-react'
import { getCustomerInitials } from '@/lib/types/customers'
import { format } from 'date-fns'

interface CustomerDetailProps {
  customer: Customer
  onEdit?: () => void
  onDelete?: () => void
  onCreateEstimate?: () => void
  onCreateWorkOrder?: () => void
  onCreateInvoice?: () => void
  onScheduleAppointment?: () => void
}

export function CustomerDetail({
  customer,
  onEdit,
  onDelete,
  onCreateEstimate,
  onCreateWorkOrder,
  onCreateInvoice,
  onScheduleAppointment,
}: CustomerDetailProps) {
  const addCommunication = useCustomerStore((state) => state.addCommunication)
  const updateCommunication = useCustomerStore((state) => state.updateCommunication)
  const deleteCommunication = useCustomerStore((state) => state.deleteCommunication)

  const statusColors = {
    active: 'bg-green-500/10 text-green-700 border-green-500/20',
    inactive: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    potential: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  }

  const typeColors = {
    residential: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    commercial: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {getCustomerInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{customer.name}</h1>
            {customer.company && (
              <p className="text-lg text-muted-foreground flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4" />
                {customer.company}
              </p>
            )}
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className={statusColors[customer.status]}>
                {CUSTOMER_STATUS_LABELS[customer.status]}
              </Badge>
              <Badge variant="outline" className={typeColors[customer.type]}>
                {CUSTOMER_TYPE_LABELS[customer.type]}
              </Badge>
              <Badge variant="outline">
                {CUSTOMER_SOURCE_LABELS[customer.source]}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={onDelete} className="text-red-600">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button variant="outline" onClick={() => window.open(`tel:${customer.phone}`)}>
          <Phone className="h-4 w-4 mr-2" />
          Call
        </Button>
        <Button variant="outline" onClick={() => window.open(`mailto:${customer.email}`)}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
        <Button variant="outline" onClick={onCreateEstimate}>
          <FileText className="h-4 w-4 mr-2" />
          New Estimate
        </Button>
        <Button variant="outline" onClick={onScheduleAppointment}>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{formatPhoneNumber(customer.phone)}</span>
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                </div>
              </div>
              {customer.company && (
                <div>
                  <Label>Company</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.company}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.addresses.length > 0 ? (
                <div className="space-y-4">
                  {customer.addresses.map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {ADDRESS_TYPE_LABELS[address.type]}
                          </Badge>
                          {address.isPrimary && (
                            <Badge variant="secondary">Primary</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm">{formatAddress(address)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No addresses added</p>
              )}
            </CardContent>
          </Card>

          {/* Additional Contacts */}
          {customer.contacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Additional Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customer.contacts.map((contact) => (
                    <div key={contact.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{contact.name}</h4>
                          <p className="text-sm text-muted-foreground">{contact.role}</p>
                        </div>
                        {contact.isPrimary && (
                          <Badge variant="secondary">Primary</Badge>
                        )}
                      </div>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {formatPhoneNumber(contact.phone)}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {contact.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Communication History */}
          <CommunicationLog
            communications={customer.communicationHistory}
            onAdd={(comm) => addCommunication(customer.id, comm)}
            onEdit={(id, comm) => updateCommunication(customer.id, id, comm)}
            onDelete={(id) => deleteCommunication(customer.id, id)}
          />
        </div>

        {/* Right Column - Meta & Related */}
        <div className="space-y-6">
          {/* Tags */}
          {customer.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Created</Label>
                <p className="text-sm">{format(customer.createdAt, 'PPP')}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Last Updated</Label>
                <p className="text-sm">{format(customer.updatedAt, 'PPP')}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Source</Label>
                <p className="text-sm">{CUSTOMER_SOURCE_LABELS[customer.source]}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Create Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={onCreateEstimate}>
                <FileText className="h-4 w-4 mr-2" />
                Create Estimate
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={onCreateWorkOrder}>
                <Briefcase className="h-4 w-4 mr-2" />
                Create Work Order
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={onCreateInvoice}>
                <DollarSign className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={onScheduleAppointment}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </CardContent>
          </Card>

          {/* Related Records Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Related Records</CardTitle>
              <CardDescription>
                Estimates, work orders, invoices, and appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                No related records yet
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium ${className}`}>{children}</label>
}
