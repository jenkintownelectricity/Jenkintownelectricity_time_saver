'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Trash2, Phone, Mail, AlertCircle, Check, Zap, Filter, X, ArrowLeft, Link as LinkIcon, ExternalLink } from 'lucide-react'

type FilterType = 'all' | 'employee' | '1099' | 'subcontractor' | 'contractor_for' | 'on-call-available'

export default function TeamManagement() {
  const { teamMembers, addTeamMember, updateTeamMember, removeTeamMember, toggleOnCallAvailable, setOnCall, onCallStatus, setCurrentEntityView, getEntity, entities } = useAppStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'employee' as 'employee' | '1099' | 'subcontractor' | 'contractor_for',
    onCallAvailable: false,
    notes: '',
    syncToEntity: true // Default to syncing
  })

  const handleAddMember = () => {
    if (newMember.name.trim() && newMember.phone.trim()) {
      addTeamMember({
        name: newMember.name.trim(),
        phone: newMember.phone.trim(),
        email: newMember.email.trim() || undefined,
        type: newMember.type,
        onCallAvailable: newMember.onCallAvailable,
        notes: newMember.notes.trim() || undefined,
        syncToEntity: newMember.syncToEntity
      })
      setNewMember({
        name: '',
        phone: '',
        email: '',
        type: 'employee',
        onCallAvailable: false,
        notes: '',
        syncToEntity: true
      })
      setShowAddModal(false)
    }
  }

  const handleSetOnCall = (name: string) => {
    setOnCall(name)
  }

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        member.name.toLowerCase().includes(searchLower) ||
        member.phone.includes(searchLower) ||
        (member.email && member.email.toLowerCase().includes(searchLower))
      if (!matchesSearch) return false
    }

    // Type filter
    if (filter === 'all') return true
    if (filter === 'on-call-available') return member.onCallAvailable
    return member.type === filter
  })

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'employee': return 'Employee'
      case '1099': return '1099'
      case 'subcontractor': return 'Subcontractor'
      case 'contractor_for': return 'Work For'
      default: return type
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'employee': return 'bg-blue-500 text-white'
      case '1099': return 'bg-purple-500 text-white'
      case 'subcontractor': return 'bg-orange-500 text-white'
      case 'contractor_for': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getEntityTypeName = (type: string) => {
    switch (type) {
      case 'subcontractor': return 'Subcontractors'
      case 'contractor_for': return 'Vendors'
      case '1099': return 'Subcontractors'
      case 'employee': return 'Customers'
      default: return 'Entities'
    }
  }

  const onCallAvailableCount = teamMembers.filter(m => m.onCallAvailable).length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentEntityView(null, null)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-6 h-6 text-teal-500" />
                Your Squad
              </h1>
              <p className="text-xs text-muted-foreground">
                {teamMembers.length} team members • {onCallAvailableCount} available for on-call
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-4">

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({teamMembers.length})
            </Button>
            <Button
              variant={filter === 'on-call-available' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('on-call-available')}
              className={filter === 'on-call-available' ? 'bg-green-600' : ''}
            >
              <Zap className="w-3 h-3 mr-1" />
              On-Call Ready ({onCallAvailableCount})
            </Button>
            <Button
              variant={filter === 'employee' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('employee')}
            >
              Employees ({teamMembers.filter(m => m.type === 'employee').length})
            </Button>
            <Button
              variant={filter === '1099' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('1099')}
            >
              1099 ({teamMembers.filter(m => m.type === '1099').length})
            </Button>
            <Button
              variant={filter === 'subcontractor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('subcontractor')}
            >
              Subs ({teamMembers.filter(m => m.type === 'subcontractor').length})
            </Button>
            <Button
              variant={filter === 'contractor_for' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('contractor_for')}
            >
              Work For ({teamMembers.filter(m => m.type === 'contractor_for').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchTerm ? `No members found matching "${searchTerm}"` : 'No team members yet'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Your First Team Member
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredMembers.map(member => (
            <Card key={member.id} className={member.onCallAvailable ? 'border-green-500 border-2' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <Badge className={getTypeBadgeColor(member.type)}>
                        {getTypeLabel(member.type)}
                      </Badge>
                      {member.onCallAvailable && (
                        <Badge className="bg-green-600 text-white">
                          <Zap className="w-3 h-3 mr-1" />
                          On-Call Ready
                        </Badge>
                      )}
                      {onCallStatus.isOnCall && onCallStatus.personName === member.name && (
                        <Badge className="bg-yellow-600 text-white animate-pulse">
                          Currently On-Call
                        </Badge>
                      )}
                      {member.entityId && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          Linked to {getEntityTypeName(member.type)}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${member.phone}`} className="hover:text-foreground">
                          {member.phone}
                        </a>
                      </div>
                      {member.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${member.email}`} className="hover:text-foreground">
                            {member.email}
                          </a>
                        </div>
                      )}
                      {member.notes && (
                        <p className="text-muted-foreground text-xs mt-2">{member.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant={member.onCallAvailable ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleOnCallAvailable(member.id)}
                      className={member.onCallAvailable ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {member.onCallAvailable ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Available
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Unavailable
                        </>
                      )}
                    </Button>
                    {member.onCallAvailable && !onCallStatus.isOnCall && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetOnCall(member.name)}
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Set On-Call
                      </Button>
                    )}
                    {member.entityId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const entity = getEntity(member.entityId!)
                          if (entity) {
                            alert(`Linked Entity:\nType: ${entity.entityType}\nName: ${entity.data.name || 'N/A'}\nPhone: ${entity.data.phone || 'N/A'}\nEmail: ${entity.data.email || 'N/A'}`)
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Entity
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeamMember(member.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </div>
      </main>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                Add Team Member
              </CardTitle>
              <CardDescription>Add someone to your squad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name *</label>
                <Input
                  placeholder="Full name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Phone *</label>
                <Input
                  placeholder="(555) 123-4567"
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  placeholder="email@example.com"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type *</label>
                <select
                  value={newMember.type}
                  onChange={(e) => setNewMember({ ...newMember, type: e.target.value as any })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="employee">Employee</option>
                  <option value="1099">1099 Contractor</option>
                  <option value="subcontractor">Subcontractor</option>
                  <option value="contractor_for">Contractor I Work For</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <textarea
                  placeholder="Any additional information..."
                  value={newMember.notes}
                  onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Available for On-Call?</p>
                  <p className="text-xs text-muted-foreground">Can this person respond to emergencies?</p>
                </div>
                <Button
                  type="button"
                  variant={newMember.onCallAvailable ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewMember({ ...newMember, onCallAvailable: !newMember.onCallAvailable })}
                  className={newMember.onCallAvailable ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {newMember.onCallAvailable ? 'YES' : 'NO'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Link to Entity Card?</p>
                  <p className="text-xs text-muted-foreground">
                    Also add to {newMember.type === 'subcontractor' ? 'Subcontractors' : newMember.type === 'contractor_for' ? 'Vendors' : newMember.type === '1099' ? 'Subcontractors' : 'Customers'} section
                  </p>
                </div>
                <Button
                  type="button"
                  variant={newMember.syncToEntity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewMember({ ...newMember, syncToEntity: !newMember.syncToEntity })}
                  className={newMember.syncToEntity ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {newMember.syncToEntity ? 'YES' : 'NO'}
                </Button>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewMember({
                      name: '',
                      phone: '',
                      email: '',
                      type: 'employee',
                      onCallAvailable: false,
                      notes: '',
                      syncToEntity: true
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMember}
                  disabled={!newMember.name.trim() || !newMember.phone.trim()}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
