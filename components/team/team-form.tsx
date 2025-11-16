'use client'

import { useState, useEffect } from 'react'
import { useTeamStore } from '@/lib/stores/team-store'
import { useCompanyStore } from '@/lib/stores/company-store'
import {
  TeamMember,
  ROLE_LABELS,
  TYPE_LABELS,
  getDefaultAvailability,
} from '@/lib/types/team'
import { AvailabilityScheduler } from './availability-scheduler'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X } from 'lucide-react'

interface TeamFormProps {
  member?: TeamMember
  onSave?: (member: TeamMember) => void
  onCancel?: () => void
}

export function TeamForm({ member, onSave, onCancel }: TeamFormProps) {
  const { addTeamMember, updateTeamMember, getTeamMember } = useTeamStore()
  const { getActiveCompany } = useCompanyStore()
  const activeCompany = getActiveCompany()

  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    name: member?.name || '',
    email: member?.email || '',
    phone: member?.phone || '',
    role: member?.role || ('electrician' as TeamMember['role']),
    type: member?.type || ('employee' as TeamMember['type']),
    hourlyRate: member?.hourlyRate?.toString() || '',
    isActive: member?.isActive ?? true,
    canScheduleAppointments: member?.canScheduleAppointments ?? true,
    canViewEstimates: member?.canViewEstimates ?? true,
    canApproveEstimates: member?.canApproveEstimates ?? false,
    canViewInvoices: member?.canViewInvoices ?? true,
    skills: member?.skills || [],
    certifications: member?.certifications || [],
    availability: member?.availability || getDefaultAvailability(),
    notes: member?.notes || '',
    hireDate: member?.hireDate
      ? new Date(member.hireDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  })

  const [newSkill, setNewSkill] = useState('')
  const [newCertification, setNewCertification] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    }

    if (formData.hourlyRate && isNaN(Number(formData.hourlyRate))) {
      newErrors.hourlyRate = 'Hourly rate must be a number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!activeCompany) {
      alert('Please create a company profile first')
      return
    }

    const memberData = {
      companyId: activeCompany.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      type: formData.type,
      hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
      isActive: formData.isActive,
      canScheduleAppointments: formData.canScheduleAppointments,
      canViewEstimates: formData.canViewEstimates,
      canApproveEstimates: formData.canApproveEstimates,
      canViewInvoices: formData.canViewInvoices,
      skills: formData.skills,
      certifications: formData.certifications,
      availability: formData.availability,
      notes: formData.notes,
      hireDate: new Date(formData.hireDate),
    }

    if (member) {
      // Update existing member
      updateTeamMember(member.id, memberData)
      const updatedMember = getTeamMember(member.id)
      if (updatedMember && onSave) {
        onSave(updatedMember)
      }
    } else {
      // Create new member
      const id = addTeamMember(memberData)
      const newMember = getTeamMember(id)
      if (newMember && onSave) {
        onSave(newMember)
      }
    }
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      })
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    })
  }

  const handleAddCertification = () => {
    if (
      newCertification.trim() &&
      !formData.certifications.includes(newCertification.trim())
    ) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()],
      })
      setNewCertification('')
    }
  }

  const handleRemoveCertification = (certification: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((c) => c !== certification),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the team member's basic contact and employment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value as TeamMember['role'] })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Employment Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as TeamMember['type'] })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="25.00"
                  />
                  {errors.hourlyRate && (
                    <p className="text-sm text-destructive">{errors.hourlyRate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this team member..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Configure what this team member can view and do in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canScheduleAppointments"
                    checked={formData.canScheduleAppointments}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canScheduleAppointments: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="canScheduleAppointments"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Can Schedule Appointments
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canViewEstimates"
                    checked={formData.canViewEstimates}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canViewEstimates: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="canViewEstimates"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Can View Estimates
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canApproveEstimates"
                    checked={formData.canApproveEstimates}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canApproveEstimates: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="canApproveEstimates"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Can Approve Estimates
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canViewInvoices"
                    checked={formData.canViewInvoices}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canViewInvoices: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="canViewInvoices"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Can View Invoices
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills & Certifications Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add skills and qualifications for this team member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g., Residential Wiring"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSkill}>
                    Add
                  </Button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="e.g., Master Electrician"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCertification()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddCertification}>
                    Add
                  </Button>
                </div>
                {formData.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.certifications.map((cert) => (
                      <Badge key={cert} variant="secondary">
                        {cert}
                        <button
                          type="button"
                          onClick={() => handleRemoveCertification(cert)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability">
          <AvailabilityScheduler
            availability={formData.availability}
            onChange={(availability) => setFormData({ ...formData, availability })}
          />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{member ? 'Update' : 'Create'} Team Member</Button>
      </div>
    </form>
  )
}
