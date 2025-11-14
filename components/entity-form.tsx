'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, X } from 'lucide-react'
import { EntityField } from '@/lib/entities'

interface EntityFormProps {
  entityTypeId: string
  entityId?: string | null
}

export default function EntityForm({ entityTypeId, entityId }: EntityFormProps) {
  const {
    setCurrentSection,
    entityTypes,
    getEntity,
    createEntity,
    updateEntity,
    setCurrentEntityView
  } = useAppStore()

  const entityType = entityTypes[entityTypeId]
  const existingEntity = entityId ? getEntity(entityId) : null

  // Initialize form data
  const [formData, setFormData] = useState<{ [key: string]: any }>({})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (existingEntity) {
      setFormData(existingEntity.data)
    } else {
      // Set default values
      const defaults: { [key: string]: any } = {}
      entityType.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          defaults[field.name] = field.defaultValue
        }
      })
      setFormData(defaults)
    }
  }, [existingEntity, entityType])

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    entityType.fields.forEach((field) => {
      if (field.required && field.enabled && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`
      }

      // Additional validation
      if (field.validation && formData[field.name]) {
        const value = formData[field.name]

        if (field.validation.min !== undefined && Number(value) < field.validation.min) {
          newErrors[field.name] = `${field.label} must be at least ${field.validation.min}`
        }

        if (field.validation.max !== undefined && Number(value) > field.validation.max) {
          newErrors[field.name] = `${field.label} must be at most ${field.validation.max}`
        }

        if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
          newErrors[field.name] = field.validation.message || `Invalid ${field.label}`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (existingEntity) {
      updateEntity(existingEntity.id, formData)
    } else {
      createEntity(entityTypeId, formData)
    }

    // Navigate back to list
    setCurrentEntityView(null)
    setCurrentSection('jobs')
  }

  const handleCancel = () => {
    setCurrentEntityView(null)
    // Go back to jobs dashboard
    setCurrentSection('jobs')
  }

  const renderField = (field: EntityField) => {
    const value = formData[field.name] || ''
    const error = errors[field.name]

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id}>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        )

      case 'number':
      case 'currency':
      case 'percentage':
        return (
          <div key={field.id}>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              {field.type === 'currency' && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
              )}
              <Input
                type="number"
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className={`${field.type === 'currency' ? 'pl-7' : ''} ${error ? 'border-red-500' : ''}`}
                step={field.type === 'currency' ? '0.01' : '1'}
              />
              {field.type === 'percentage' && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        )

      case 'date':
        return (
          <div key={field.id}>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="date"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.id}>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full h-10 px-3 rounded-md border ${
                error ? 'border-red-500' : 'border-input'
              } bg-background text-foreground`}
            >
              <option value="">Select {field.label.toLowerCase()}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id}>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              rows={4}
              className={`w-full px-3 py-2 rounded-md border ${
                error ? 'border-red-500' : 'border-input'
              } bg-background text-foreground`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        )

      case 'reference':
        // TODO: Implement entity reference selector
        return (
          <div key={field.id}>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={`Select ${field.label.toLowerCase()}`}
              className={error ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Reference to {field.referenceEntity}
            </p>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  if (!entityType) {
    return <div>Entity type not found</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                {existingEntity ? 'Edit' : 'New'} {entityType.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {existingEntity ? 'Update details below' : 'Fill in the details below'}
              </p>
            </div>
            <Button type="submit" form="entity-form">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form id="entity-form" onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Fields marked with <span className="text-red-500">*</span> are required
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {entityType.fields
                .filter((f) => f.enabled)
                .map((field) => renderField(field))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {existingEntity ? 'Update' : 'Create'} {entityType.name}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
