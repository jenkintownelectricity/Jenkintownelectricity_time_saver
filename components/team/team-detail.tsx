'use client'

import { useState } from 'react'
import { TeamMember, ROLE_LABELS, TYPE_LABELS, DAY_LABELS, getTotalWeeklyHours, DAYS_OF_WEEK } from '@/lib/types/team'
import { AvailabilityScheduler } from './availability-scheduler'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Mail,
  Phone,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Edit,
  Award,
  Briefcase,
} from 'lucide-react'

interface TeamDetailProps {
  member: TeamMember
  onEdit?: (member: TeamMember) => void
}

export function TeamDetail({ member, onEdit }: TeamDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const weeklyHours = getTotalWeeklyHours(member.availability)
  const availableDays = DAYS_OF_WEEK.filter((day) => member.availability[day].length > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{member.name}</h2>
            {member.isActive ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
            <Badge variant="outline">{TYPE_LABELS[member.type]}</Badge>
          </div>
        </div>
        {onEdit && (
          <Button onClick={() => onEdit(member)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${member.email}`} className="text-sm hover:underline">
                  {member.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${member.phone}`} className="text-sm hover:underline">
                  {member.phone}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Role</div>
                  <div className="text-sm">{ROLE_LABELS[member.role]}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Type</div>
                  <div className="text-sm">{TYPE_LABELS[member.type]}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Hire Date</div>
                  <div className="text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(member.hireDate).toLocaleDateString()}
                  </div>
                </div>
                {member.hourlyRate && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Hourly Rate</div>
                    <div className="text-sm flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {member.hourlyRate.toFixed(2)}/hr
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>What this team member can do in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  {member.canScheduleAppointments ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">Schedule Appointments</span>
                </div>
                <div className="flex items-center gap-2">
                  {member.canViewEstimates ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">View Estimates</span>
                </div>
                <div className="flex items-center gap-2">
                  {member.canApproveEstimates ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">Approve Estimates</span>
                </div>
                <div className="flex items-center gap-2">
                  {member.canViewInvoices ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">View Invoices</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                {member.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills added</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {member.certifications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {member.certifications.map((cert) => (
                      <Badge key={cert} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No certifications added</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Availability Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Availability Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Weekly Hours</div>
                  <div className="text-2xl font-bold">{weeklyHours.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Available Days</div>
                  <div className="text-2xl font-bold">{availableDays.length}</div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                {availableDays.map((day) => {
                  const slots = member.availability[day]
                  return (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{DAY_LABELS[day]}</span>
                      <span className="text-muted-foreground">
                        {slots.map((slot) => `${slot.start} - ${slot.end}`).join(', ')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {member.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{member.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability">
          <AvailabilityScheduler availability={member.availability} onChange={() => {}} readOnly />
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Jobs</CardTitle>
              <CardDescription>Jobs and appointments assigned to this team member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p>No assigned jobs</p>
                <p className="text-sm mt-2">
                  Jobs assigned to this team member will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
