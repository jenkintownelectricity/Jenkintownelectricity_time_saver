'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Users, Phone, Briefcase, Sparkles } from 'lucide-react'
import { useAppStore } from '@/lib/store-new'
import { createClient } from '@/lib/supabase/client'

export function WelcomeDialog() {
  const [open, setOpen] = useState(false)
  const { userProfile } = useAppStore()

  useEffect(() => {
    async function checkOnboarding() {
      if (!userProfile) return

      // Check if user has completed onboarding
      if (!userProfile.onboarding_completed) {
        setOpen(true)
      }
    }

    checkOnboarding()
  }, [userProfile])

  const handleComplete = async () => {
    if (!userProfile) return

    const supabase = createClient()

    // Mark onboarding as completed
    await supabase
      .from('user_profiles')
      .update({ onboarding_completed: true })
      .eq('id', userProfile.id)

    setOpen(false)

    // Reload user profile
    const { loadUserProfile } = useAppStore.getState()
    await loadUserProfile()
  }

  if (!userProfile) return null

  const firstName = userProfile.full_name.split(' ')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Welcome to AppIo, {firstName}!
          </DialogTitle>
          <DialogDescription className="text-base">
            We've set up a demo workspace with sample data to help you get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Demo Company */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              Your Demo Company
            </h3>
            <p className="text-sm text-muted-foreground">
              We've created a demo company for you with realistic settings for the work call bidding system.
              You can customize everything in Settings.
            </p>
          </div>

          {/* Sample Contacts */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              8 Sample Contacts
            </h3>
            <p className="text-sm text-muted-foreground">
              Explore the universal contact system with examples of:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span><strong>Clients</strong> - Residential and commercial customers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span><strong>Vendors & Suppliers</strong> - Material suppliers with payment terms</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span><strong>1099 Contractors</strong> - Licensed subcontractors</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span><strong>Employees</strong> - Team members with certifications</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span><strong>Leads</strong> - Potential customers to follow up with</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span><strong>Partners</strong> - Other companies you collaborate with</span>
              </li>
            </ul>
          </div>

          {/* Work Calls */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Phone className="h-5 w-5 text-orange-500" />
              5 Demo Work Calls
            </h3>
            <p className="text-sm text-muted-foreground">
              See the Uber-style work call system in action with emergency, daytime, and scheduled calls.
              Try claiming a call to see how bonuses work!
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
              💡 What's Next?
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Explore the <strong>Work Calls</strong> section to see the bidding system</li>
              <li>• Check out <strong>Contacts</strong> to see the flexible permission flags</li>
              <li>• Visit <strong>Settings</strong> to customize your company and API keys</li>
              <li>• Add your own contacts and start creating real work calls!</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={handleComplete} className="w-full sm:w-auto">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
