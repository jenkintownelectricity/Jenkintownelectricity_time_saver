import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  TeamMember,
  TeamMemberFilters,
  TeamMemberSort,
  TeamMemberStats,
  TimeSlot,
  Availability,
  DayOfWeek,
  getDefaultAvailability,
  getTotalWeeklyHours,
} from '@/lib/types/team'

interface TeamState {
  teamMembers: TeamMember[]
  filters: TeamMemberFilters
  sort: TeamMemberSort
  selectedMembers: string[]

  // CRUD operations
  addTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void
  deleteTeamMember: (id: string) => void
  deleteTeamMembers: (ids: string[]) => void
  getTeamMember: (id: string) => TeamMember | undefined
  duplicateTeamMember: (id: string) => string | null

  // Availability management
  addTimeSlot: (memberId: string, day: DayOfWeek, slot: Omit<TimeSlot, 'id'>) => void
  updateTimeSlot: (memberId: string, day: DayOfWeek, slotId: string, slot: Partial<TimeSlot>) => void
  deleteTimeSlot: (memberId: string, day: DayOfWeek, slotId: string) => void
  copyAvailabilityToAllDays: (memberId: string, sourceDay: DayOfWeek) => void
  clearDayAvailability: (memberId: string, day: DayOfWeek) => void

  // Permission management
  updatePermissions: (
    memberId: string,
    permissions: {
      canScheduleAppointments?: boolean
      canViewEstimates?: boolean
      canApproveEstimates?: boolean
      canViewInvoices?: boolean
    }
  ) => void

  // Skills and certifications
  addSkill: (memberId: string, skill: string) => void
  removeSkill: (memberId: string, skill: string) => void
  addCertification: (memberId: string, certification: string) => void
  removeCertification: (memberId: string, certification: string) => void

  // Filter and search
  setFilters: (filters: Partial<TeamMemberFilters>) => void
  clearFilters: () => void
  setSort: (sort: TeamMemberSort) => void

  // Selection
  selectMember: (id: string) => void
  unselectMember: (id: string) => void
  selectAllMembers: () => void
  clearSelection: () => void

  // Computed getters
  getFilteredMembers: () => TeamMember[]
  getActiveMembers: () => TeamMember[]
  getTeamStats: () => TeamMemberStats
  getAllSkills: () => string[]
  getAllCertifications: () => string[]
  getMembersByRole: (role: TeamMember['role']) => TeamMember[]
  getAvailableMembers: (day: DayOfWeek) => TeamMember[]

  // Bulk operations
  bulkUpdateStatus: (ids: string[], isActive: boolean) => void
  bulkUpdateRole: (ids: string[], role: TeamMember['role']) => void
}

const STORAGE_KEY = 'team-storage'

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teamMembers: [],
      filters: {},
      sort: { field: 'name', direction: 'asc' },
      selectedMembers: [],

      addTeamMember: (memberData) => {
        const id = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()

        const member: TeamMember = {
          ...memberData,
          id,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          teamMembers: [...state.teamMembers, member],
        }))

        return id
      },

      updateTeamMember: (id, updates) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === id
              ? {
                  ...member,
                  ...updates,
                  updatedAt: new Date(),
                }
              : member
          ),
        }))
      },

      deleteTeamMember: (id) => {
        set((state) => ({
          teamMembers: state.teamMembers.filter((member) => member.id !== id),
          selectedMembers: state.selectedMembers.filter((selectedId) => selectedId !== id),
        }))
      },

      deleteTeamMembers: (ids) => {
        set((state) => ({
          teamMembers: state.teamMembers.filter((member) => !ids.includes(member.id)),
          selectedMembers: state.selectedMembers.filter((id) => !ids.includes(id)),
        }))
      },

      getTeamMember: (id) => {
        return get().teamMembers.find((member) => member.id === id)
      },

      duplicateTeamMember: (id) => {
        const member = get().getTeamMember(id)
        if (!member) return null

        const newId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()

        const duplicated: TeamMember = {
          ...member,
          id: newId,
          name: `${member.name} (Copy)`,
          email: '', // Clear email for duplicate
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          teamMembers: [...state.teamMembers, duplicated],
        }))

        return newId
      },

      // Availability management
      addTimeSlot: (memberId, day, slotData) => {
        const slotId = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const slot: TimeSlot = { ...slotData, id: slotId }

        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  availability: {
                    ...member.availability,
                    [day]: [...member.availability[day], slot],
                  },
                  updatedAt: new Date(),
                }
              : member
          ),
        }))
      },

      updateTimeSlot: (memberId, day, slotId, updates) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  availability: {
                    ...member.availability,
                    [day]: member.availability[day].map((slot) =>
                      slot.id === slotId ? { ...slot, ...updates } : slot
                    ),
                  },
                  updatedAt: new Date(),
                }
              : member
          ),
        }))
      },

      deleteTimeSlot: (memberId, day, slotId) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  availability: {
                    ...member.availability,
                    [day]: member.availability[day].filter((slot) => slot.id !== slotId),
                  },
                  updatedAt: new Date(),
                }
              : member
          ),
        }))
      },

      copyAvailabilityToAllDays: (memberId, sourceDay) => {
        const member = get().getTeamMember(memberId)
        if (!member) return

        const sourceSlots = member.availability[sourceDay]
        const newAvailability: Availability = {
          monday: [...sourceSlots.map(s => ({ ...s, id: `mon_${s.id}` }))],
          tuesday: [...sourceSlots.map(s => ({ ...s, id: `tue_${s.id}` }))],
          wednesday: [...sourceSlots.map(s => ({ ...s, id: `wed_${s.id}` }))],
          thursday: [...sourceSlots.map(s => ({ ...s, id: `thu_${s.id}` }))],
          friday: [...sourceSlots.map(s => ({ ...s, id: `fri_${s.id}` }))],
          saturday: [...sourceSlots.map(s => ({ ...s, id: `sat_${s.id}` }))],
          sunday: [...sourceSlots.map(s => ({ ...s, id: `sun_${s.id}` }))],
        }

        set((state) => ({
          teamMembers: state.teamMembers.map((m) =>
            m.id === memberId
              ? { ...m, availability: newAvailability, updatedAt: new Date() }
              : m
          ),
        }))
      },

      clearDayAvailability: (memberId, day) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  availability: {
                    ...member.availability,
                    [day]: [],
                  },
                  updatedAt: new Date(),
                }
              : member
          ),
        }))
      },

      // Permission management
      updatePermissions: (memberId, permissions) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === memberId
              ? { ...member, ...permissions, updatedAt: new Date() }
              : member
          ),
        }))
      },

      // Skills and certifications
      addSkill: (memberId, skill) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === memberId && !member.skills.includes(skill)
              ? {
                  ...member,
                  skills: [...member.skills, skill],
                  updatedAt: new Date(),
                }
              : member
          ),
        }))
      },

      removeSkill: (memberId, skill) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  skills: member.skills.filter((s) => s !== skill),
                  updatedAt: new Date(),
                }
              : member
          ),
        }))
      },

      addCertification: (memberId, certification) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === memberId && !member.certifications.includes(certification)
              ? {
                  ...member,
                  certifications: [...member.certifications, certification],
                  updatedAt: new Date(),
                }
              : member
          ),
        }))
      },

      removeCertification: (memberId, certification) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  certifications: member.certifications.filter((c) => c !== certification),
                  updatedAt: new Date(),
                }
              : member
          ),
        }))
      },

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }))
      },

      clearFilters: () => {
        set({ filters: {} })
      },

      setSort: (sort) => {
        set({ sort })
      },

      selectMember: (id) => {
        set((state) => ({
          selectedMembers: state.selectedMembers.includes(id)
            ? state.selectedMembers
            : [...state.selectedMembers, id],
        }))
      },

      unselectMember: (id) => {
        set((state) => ({
          selectedMembers: state.selectedMembers.filter((selectedId) => selectedId !== id),
        }))
      },

      selectAllMembers: () => {
        const filtered = get().getFilteredMembers()
        set({ selectedMembers: filtered.map((m) => m.id) })
      },

      clearSelection: () => {
        set({ selectedMembers: [] })
      },

      getFilteredMembers: () => {
        const { teamMembers, filters, sort } = get()

        let filtered = [...teamMembers]

        // Apply filters
        if (filters.search) {
          const search = filters.search.toLowerCase()
          filtered = filtered.filter(
            (member) =>
              member.name.toLowerCase().includes(search) ||
              member.email.toLowerCase().includes(search) ||
              member.phone.toLowerCase().includes(search) ||
              member.skills.some((skill) => skill.toLowerCase().includes(search)) ||
              member.certifications.some((cert) => cert.toLowerCase().includes(search))
          )
        }

        if (filters.roles && filters.roles.length > 0) {
          filtered = filtered.filter((member) => filters.roles!.includes(member.role))
        }

        if (filters.types && filters.types.length > 0) {
          filtered = filtered.filter((member) => filters.types!.includes(member.type))
        }

        if (filters.isActive !== undefined) {
          filtered = filtered.filter((member) => member.isActive === filters.isActive)
        }

        if (filters.skills && filters.skills.length > 0) {
          filtered = filtered.filter((member) =>
            filters.skills!.some((skill) => member.skills.includes(skill))
          )
        }

        if (filters.certifications && filters.certifications.length > 0) {
          filtered = filtered.filter((member) =>
            filters.certifications!.some((cert) => member.certifications.includes(cert))
          )
        }

        // Apply sorting
        filtered.sort((a, b) => {
          let aValue: any = a[sort.field]
          let bValue: any = b[sort.field]

          if (sort.field === 'createdAt' || sort.field === 'hireDate') {
            aValue = new Date(aValue).getTime()
            bValue = new Date(bValue).getTime()
          }

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
          }

          if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
          if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
          return 0
        })

        return filtered
      },

      getActiveMembers: () => {
        return get().teamMembers.filter((member) => member.isActive)
      },

      getTeamStats: () => {
        const members = get().teamMembers

        const totalMembers = members.length
        const activeMembers = members.filter((m) => m.isActive).length
        const inactiveMembers = totalMembers - activeMembers

        const employeeCount = members.filter((m) => m.type === 'employee').length
        const contractorCount = members.filter((m) => m.type === 'contractor_1099').length
        const subcontractorCount = members.filter((m) => m.type === 'subcontractor').length

        const roleBreakdown = members.reduce(
          (acc, member) => {
            acc[member.role] = (acc[member.role] || 0) + 1
            return acc
          },
          {} as Record<TeamMember['role'], number>
        )

        const membersWithRate = members.filter((m) => m.hourlyRate && m.hourlyRate > 0)
        const averageHourlyRate =
          membersWithRate.length > 0
            ? membersWithRate.reduce((sum, m) => sum + (m.hourlyRate || 0), 0) /
              membersWithRate.length
            : 0

        return {
          totalMembers,
          activeMembers,
          inactiveMembers,
          employeeCount,
          contractorCount,
          subcontractorCount,
          roleBreakdown,
          averageHourlyRate,
        }
      },

      getAllSkills: () => {
        const skills = new Set(get().teamMembers.flatMap((m) => m.skills))
        return Array.from(skills).sort()
      },

      getAllCertifications: () => {
        const certs = new Set(get().teamMembers.flatMap((m) => m.certifications))
        return Array.from(certs).sort()
      },

      getMembersByRole: (role) => {
        return get().teamMembers.filter((member) => member.role === role)
      },

      getAvailableMembers: (day) => {
        return get().teamMembers.filter(
          (member) => member.isActive && member.availability[day].length > 0
        )
      },

      bulkUpdateStatus: (ids, isActive) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            ids.includes(member.id) ? { ...member, isActive, updatedAt: new Date() } : member
          ),
        }))
      },

      bulkUpdateRole: (ids, role) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            ids.includes(member.id) ? { ...member, role, updatedAt: new Date() } : member
          ),
        }))
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        teamMembers: state.teamMembers.map((m) => ({
          ...m,
          hireDate: m.hireDate.toISOString(),
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        })),
        filters: state.filters,
        sort: state.sort,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.teamMembers = state.teamMembers.map((m: any) => ({
            ...m,
            hireDate: new Date(m.hireDate),
            createdAt: new Date(m.createdAt),
            updatedAt: new Date(m.updatedAt),
          }))
        }
      },
    }
  )
)
