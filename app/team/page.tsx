'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TeamMember } from '@/lib/types/team'
import { TeamList } from '@/components/team/team-list'
import { TeamForm } from '@/components/team/team-form'
import { TeamDetail } from '@/components/team/team-detail'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export default function TeamPage() {
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member)
    setIsDetailSheetOpen(true)
  }

  const handleCreateMember = () => {
    setIsCreateDialogOpen(true)
  }

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member)
    setIsDetailSheetOpen(false)
    setIsEditDialogOpen(true)
  }

  const handleSaveMember = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setSelectedMember(null)
  }

  const handleCancelForm = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setSelectedMember(null)
  }

  return (
    <div className="container mx-auto py-6">
      <TeamList
        onMemberClick={handleMemberClick}
        onCreateMember={handleCreateMember}
        onEditMember={handleEditMember}
      />

      {/* Create Member Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
            <DialogDescription>
              Create a new team member with their information, permissions, and availability.
            </DialogDescription>
          </DialogHeader>
          <TeamForm onSave={handleSaveMember} onCancel={handleCancelForm} />
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update team member information, permissions, and availability.
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <TeamForm member={selectedMember} onSave={handleSaveMember} onCancel={handleCancelForm} />
          )}
        </DialogContent>
      </Dialog>

      {/* Member Detail Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Team Member Details</SheetTitle>
            <SheetDescription>
              View detailed information about this team member
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {selectedMember && (
              <TeamDetail member={selectedMember} onEdit={handleEditMember} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
