'use client'

import { useState, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import ShareMenu from '@/components/share-menu'
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  Share2,
  X
} from 'lucide-react'
import { EntityType } from '@/lib/entities'

interface EntityListProps {
  entityTypeId: string
}

export default function EntityList({ entityTypeId }: EntityListProps) {
  const {
    setCurrentSection,
    entityTypes,
    entities,
    getEntitiesByType,
    deleteEntity,
    setCurrentEntityView,
    createEntity
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const entityType = entityTypes[entityTypeId]
  const entityList = getEntitiesByType(entityTypeId)

  // Filter entities based on search and status filter
  const filteredEntities = entityList.filter((entity) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = Object.values(entity.data).some((value) =>
        String(value).toLowerCase().includes(searchLower)
      )
      if (!matchesSearch) return false
    }

    // Status filter
    if (filterStatus && entity.data.status !== filterStatus) {
      return false
    }

    return true
  })

  const handleExport = () => {
    // Export all filtered entities as JSON
    const dataStr = JSON.stringify(filteredEntities, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${entityType.namePlural.toLowerCase()}-export-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        if (Array.isArray(imported)) {
          imported.forEach((entity) => {
            createEntity(entityTypeId, entity.data)
          })
          alert(`Successfully imported ${imported.length} ${entityType.namePlural.toLowerCase()}`)
        }
      } catch (error) {
        alert('Error importing file. Please ensure it\'s a valid JSON export.')
      }
    }
    reader.readAsText(file)
  }

  const handleBackToJobs = () => {
    setCurrentEntityView(null, null)
    setCurrentSection('jobs')
  }

  // Get unique status values for filter
  const statusOptions = Array.from(
    new Set(entityList.map(e => e.data.status).filter(Boolean))
  )

  const handleDelete = (id: string) => {
    deleteEntity(id)
    setShowDeleteConfirm(null)
  }

  const handleEdit = (entityId: string) => {
    setCurrentEntityView(entityTypeId, entityId)
    // TODO: Navigate to edit form
  }

  const handleCreate = () => {
    setCurrentEntityView(entityTypeId, 'new')
  }

  const getFieldValue = (entity: any, fieldName: string) => {
    const value = entity.data[fieldName]
    if (!value) return '-'

    // Format based on field type
    const field = entityType.fields.find(f => f.name === fieldName)
    if (!field) return value

    switch (field.type) {
      case 'currency':
        return `$${Number(value).toLocaleString()}`
      case 'date':
        return new Date(value).toLocaleDateString()
      case 'percentage':
        return `${value}%`
      default:
        return value
    }
  }

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Active': 'bg-green-500',
      'In Progress': 'bg-blue-500',
      'Completed': 'bg-gray-500',
      'Cancelled': 'bg-red-500',
      'Pending': 'bg-yellow-500',
      'Sent': 'bg-blue-500',
      'Accepted': 'bg-green-500',
      'Rejected': 'bg-red-500',
      'Paid': 'bg-green-500',
      'Overdue': 'bg-red-500',
      'Draft': 'bg-gray-500',
    }
    return statusColors[status] || 'bg-gray-500'
  }

  if (!entityType) {
    return <div>Entity type not found</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToJobs}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{entityType.namePlural}</h1>
              <p className="text-xs text-muted-foreground">
                {filteredEntities.length} of {entityList.length} total
                {filterStatus && <Badge className="ml-2" variant="outline">{filterStatus}</Badge>}
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              New {entityType.name}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${entityType.namePlural.toLowerCase()}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilterModal(!showFilterModal)}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                  {showFilterModal && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border rounded-lg shadow-lg z-20">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-foreground">Filter by Status</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setShowFilterModal(false)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              setFilterStatus('')
                              setShowFilterModal(false)
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm ${
                              filterStatus === '' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                            }`}
                          >
                            All
                          </button>
                          {statusOptions.map((status) => (
                            <button
                              key={String(status)}
                              onClick={() => {
                                setFilterStatus(String(status))
                                setShowFilterModal(false)
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm ${
                                filterStatus === status ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                              }`}
                            >
                              {String(status)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button variant="outline" size="icon" onClick={handleExport}>
                  <Download className="w-4 h-4" />
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Entity List */}
          {filteredEntities.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? `No ${entityType.namePlural.toLowerCase()} found matching "${searchQuery}"`
                    : `No ${entityType.namePlural.toLowerCase()} yet`}
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First {entityType.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEntities.map((entity) => {
                // Get key fields to display
                const nameField = entityType.fields.find(f =>
                  f.name === 'name' || f.name === 'title' || f.name === 'jobNumber'
                )
                const statusField = entityType.fields.find(f => f.name === 'status')

                return (
                  <Card key={entity.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {nameField ? getFieldValue(entity, nameField.name) : entity.id}
                            </h3>
                            {statusField && entity.data[statusField.name] && (
                              <Badge
                                className={`${getStatusColor(String(entity.data[statusField.name]))} text-white`}
                              >
                                {String(entity.data[statusField.name])}
                              </Badge>
                            )}
                          </div>

                          {/* Display key fields */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {entityType.fields
                              .filter(f => f.enabled && f.name !== 'name' && f.name !== 'title' && f.name !== 'status')
                              .slice(0, 6)
                              .map((field) => (
                                <div key={field.id}>
                                  <p className="text-muted-foreground text-xs">{field.label}</p>
                                  <p className="text-foreground font-medium">
                                    {getFieldValue(entity, field.name)}
                                  </p>
                                </div>
                              ))}
                          </div>

                          <p className="text-xs text-muted-foreground mt-4">
                            Created {new Date(entity.createdAt).toLocaleDateString()}
                            {entity.updatedAt !== entity.createdAt &&
                              ` • Updated ${new Date(entity.updatedAt).toLocaleDateString()}`
                            }
                          </p>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(entity.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(entity.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowShareMenu(entity)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowDeleteConfirm(entity.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Delete {entityType.name}?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this {entityType.name.toLowerCase()}? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Menu Modal */}
      {showShareMenu && (
        <ShareMenu
          entityType={entityType.name}
          entityData={showShareMenu}
          onClose={() => setShowShareMenu(null)}
        />
      )}
    </div>
  )
}
