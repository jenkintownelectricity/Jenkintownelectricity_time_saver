'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CompanyProfile } from '@/lib/types/company'
import { CompanyList } from '@/components/company/company-list'
import { CompanyForm } from '@/components/company/company-form'
import { CompanyDetail } from '@/components/company/company-detail'
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

export default function CompanyPage() {
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null)

  const handleCompanyClick = (company: CompanyProfile) => {
    setSelectedCompany(company)
    setIsDetailSheetOpen(true)
  }

  const handleCreateCompany = () => {
    setIsCreateDialogOpen(true)
  }

  const handleEditCompany = (company: CompanyProfile) => {
    setSelectedCompany(company)
    setIsDetailSheetOpen(false)
    setIsEditDialogOpen(true)
  }

  const handleSaveCompany = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setSelectedCompany(null)
  }

  const handleCancelForm = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setSelectedCompany(null)
  }

  return (
    <div className="container mx-auto py-6">
      <CompanyList
        onCompanyClick={handleCompanyClick}
        onCreateCompany={handleCreateCompany}
        onEditCompany={handleEditCompany}
      />

      {/* Create Company Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Create a new company profile with business information, branding, and settings.
            </DialogDescription>
          </DialogHeader>
          <CompanyForm onSave={handleSaveCompany} onCancel={handleCancelForm} />
        </DialogContent>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update company information, branding, and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <CompanyForm
              company={selectedCompany}
              onSave={handleSaveCompany}
              onCancel={handleCancelForm}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Company Detail Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Company Details</SheetTitle>
            <SheetDescription>
              View detailed information about this company
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {selectedCompany && (
              <CompanyDetail company={selectedCompany} onEdit={handleEditCompany} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
