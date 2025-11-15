import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store-new'
import { needsDemoData, seedDemoData } from '@/lib/database/seed-demo-data'

/**
 * Hook to automatically seed demo data on first login
 * Call this in your root layout or main app component
 */
export function useDemoDataSeeder() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { userProfile, loadUserProfile, refreshAll } = useAppStore()

  useEffect(() => {
    async function checkAndSeed() {
      // Only run once user profile is loaded
      if (!userProfile || isSeeding) return

      try {
        // Check if user needs demo data
        const needs = await needsDemoData()

        if (needs) {
          console.log('🌱 First login detected - seeding demo data...')
          setIsSeeding(true)

          const result = await seedDemoData()

          if (result.success) {
            console.log('✅ Demo data seeded successfully!')

            // Refresh all data to show the new demo data
            await refreshAll()
          } else {
            console.error('❌ Failed to seed demo data:', result.error)
            setError(result.error || 'Failed to seed demo data')
          }

          setIsSeeding(false)
        }
      } catch (err) {
        console.error('Error in demo data seeder:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsSeeding(false)
      }
    }

    checkAndSeed()
  }, [userProfile, isSeeding, refreshAll])

  return { isSeeding, error }
}

/**
 * Hook to manually trigger demo data creation
 * Useful for "Reset to Demo Data" buttons
 */
export function useManualDemoDataSeeder() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { refreshAll } = useAppStore()

  const seedDemo = async () => {
    setIsSeeding(true)
    setError(null)

    try {
      const result = await seedDemoData()

      if (result.success) {
        await refreshAll()
        return true
      } else {
        setError(result.error || 'Failed to seed demo data')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setIsSeeding(false)
    }
  }

  return { seedDemo, isSeeding, error }
}
