'use client'

import { useState } from 'react'
import { useTeamStore } from '@/lib/stores/team-store'
import { TeamMember, ROLE_LABELS, TYPE_LABELS } from '@/lib/types/team'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Filter,
  X,
} from 'lucide-react'

interface TeamListProps {
  onMemberClick?: (member: TeamMember) => void
  onCreateMember?: () => void
  onEditMember?: (member: TeamMember) => void
  onDeleteMember?: (member: TeamMember) => void
}

export function TeamList({
  onMemberClick,
  onCreateMember,
  onEditMember,
  onDeleteMember,
}: TeamListProps) {
  const {
    getFilteredMembers,
    filters,
    setFilters,
    clearFilters,
    deleteTeamMember,
    duplicateTeamMember,
  } = useTeamStore()

  const [searchQuery, setSearchQuery] = useState(filters.search || '')
  const filteredMembers = getFilteredMembers()

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setFilters({ search: value })
  }

  const handleDelete = (member: TeamMember) => {
    if (onDeleteMember) {
      onDeleteMember(member)
    } else {
      if (
        confirm(
          `Are you sure you want to delete ${member.name}? This action cannot be undone.`
        )
      ) {
        deleteTeamMember(member.id)
      }
    }
  }

  const handleDuplicate = (member: TeamMember) => {
    const newId = duplicateTeamMember(member.id)
    if (newId) {
      // Optionally open the edit dialog for the duplicated member
      console.log('Member duplicated:', newId)
    }
  }

  const hasActiveFilters =
    filters.search ||
    (filters.roles && filters.roles.length > 0) ||
    (filters.types && filters.types.length > 0) ||
    filters.isActive !== undefined

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>
          <p className="text-muted-foreground">
            Manage your team members and their permissions
          </p>
        </div>
        <Button onClick={onCreateMember}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  clearFilters()
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <Select
                value={filters.roles?.[0] || 'all'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setFilters({ roles: undefined })
                  } else {
                    setFilters({ roles: [value as TeamMember['role']] })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Select
                value={
                  filters.isActive === undefined
                    ? 'all'
                    : filters.isActive
                    ? 'active'
                    : 'inactive'
                }
                onValueChange={(value) => {
                  if (value === 'all') {
                    setFilters({ isActive: undefined })
                  } else {
                    setFilters({ isActive: value === 'active' })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
          <CardDescription>
            {filteredMembers.length === 0
              ? 'No team members found'
              : `Showing ${filteredMembers.length} member${
                  filteredMembers.length === 1 ? '' : 's'
                }`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No team members found. Add your first team member to get started.
              </p>
              <Button onClick={onCreateMember}>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow
                      key={member.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onMemberClick?.(member)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          {member.skills.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {member.skills.slice(0, 2).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {member.skills.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{member.skills.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {TYPE_LABELS[member.type]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <span className="text-muted-foreground">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span className="text-muted-foreground">{member.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.isActive ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">Inactive</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditMember?.(member)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDuplicate(member)
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(member)
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
