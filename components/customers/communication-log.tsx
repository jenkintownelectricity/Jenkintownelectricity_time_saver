'use client'

import { useState } from 'react'
import { Communication, COMMUNICATION_TYPE_LABELS } from '@/lib/types/customers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Plus,
  Edit,
  Trash,
  Filter,
} from 'lucide-react'
import { format } from 'date-fns'

interface CommunicationLogProps {
  communications: Communication[]
  onAdd?: (communication: Omit<Communication, 'id'>) => void
  onEdit?: (id: string, communication: Partial<Communication>) => void
  onDelete?: (id: string) => void
  currentUserName?: string
}

export function CommunicationLog({
  communications,
  onAdd,
  onEdit,
  onDelete,
  currentUserName = 'Current User',
}: CommunicationLogProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<Communication['type'] | 'all'>('all')
  const [newComm, setNewComm] = useState<Omit<Communication, 'id'>>({
    type: 'note',
    subject: '',
    notes: '',
    date: new Date(),
    createdBy: currentUserName,
  })

  const iconMap = {
    call: Phone,
    email: Mail,
    text: MessageSquare,
    meeting: Calendar,
    note: FileText,
  }

  const colorMap = {
    call: 'bg-green-500/10 text-green-700 border-green-500/20',
    email: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    text: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    meeting: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    note: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
  }

  const filteredCommunications = filterType === 'all'
    ? communications
    : communications.filter((c) => c.type === filterType)

  const sortedCommunications = [...filteredCommunications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const handleAdd = () => {
    if (!newComm.subject.trim()) return
    onAdd?.(newComm)
    setNewComm({
      type: 'note',
      subject: '',
      notes: '',
      date: new Date(),
      createdBy: currentUserName,
    })
    setIsAddDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Communication History</CardTitle>
            <CardDescription>
              Timeline of all interactions with this customer
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Communication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Communication</DialogTitle>
                <DialogDescription>
                  Record a new interaction with this customer
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newComm.type}
                    onValueChange={(value) =>
                      setNewComm({ ...newComm, type: value as Communication['type'] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={newComm.subject}
                    onChange={(e) =>
                      setNewComm({ ...newComm, subject: e.target.value })
                    }
                    placeholder="Brief subject line"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newComm.notes}
                    onChange={(e) =>
                      setNewComm({ ...newComm, notes: e.target.value })
                    }
                    placeholder="Detailed notes about the communication..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd}>Add Communication</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="call">Phone Calls</SelectItem>
              <SelectItem value="email">Emails</SelectItem>
              <SelectItem value="text">Text Messages</SelectItem>
              <SelectItem value="meeting">Meetings</SelectItem>
              <SelectItem value="note">Notes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {sortedCommunications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No communications recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCommunications.map((comm) => {
              const Icon = iconMap[comm.type]
              return (
                <div
                  key={comm.id}
                  className="flex gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full ${colorMap[comm.type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={colorMap[comm.type]}>
                            {COMMUNICATION_TYPE_LABELS[comm.type]}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(comm.date), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <h4 className="font-medium">{comm.subject}</h4>
                        {comm.notes && (
                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                            {comm.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          By {comm.createdBy}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit?.(comm.id, comm)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => onDelete?.(comm.id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
