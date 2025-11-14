'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import EntityList from '@/components/entity-list'
import EntityForm from '@/components/entity-form'
import {
  ArrowLeft,
  Briefcase,
  Users,
  FileText,
  DollarSign,
  ClipboardCheck,
  Truck,
  UserCheck,
  Shield,
  Plus,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react'

export default function JobsBusiness() {
  const {
    setCurrentSection,
    entityTypes,
    entities,
    getEntitiesByType,
    currentEntityView,
    currentEntityId,
    setCurrentEntityView
  } = useAppStore()

  // If viewing/editing an entity
  if (currentEntityView && currentEntityId) {
    return <EntityForm entityTypeId={currentEntityView} entityId={currentEntityId} />
  }

  // If viewing an entity list
  if (currentEntityView) {
    return <EntityList entityTypeId={currentEntityView} />
  }

  // Get counts for each entity type
  const getCounts = (entityTypeId: string) => {
    return getEntitiesByType(entityTypeId).length
  }

  // Get entity type config
  const getEntityType = (id: string) => entityTypes[id]

  // Calculate stats
  const stats = {
    totalJobs: getCounts('job'),
    activeJobs: getEntitiesByType('job').filter(j => j.data.status === 'In Progress').length,
    totalCustomers: getCounts('customer'),
    pendingInvoices: getEntitiesByType('invoice').filter(i => i.data.status === 'Sent' || i.data.status === 'Overdue').length,
    totalEstimates: getCounts('estimate'),
    pendingEstimates: getEntitiesByType('estimate').filter(e => e.data.status === 'Sent').length,
  }

  // Entity cards configuration
  const entityCards = [
    {
      id: 'customer',
      title: 'Customers',
      description: 'Manage your customer relationships',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      count: getCounts('customer'),
      enabled: getEntityType('customer')?.enabled
    },
    {
      id: 'job',
      title: 'Jobs',
      description: 'Track projects and work orders',
      icon: Briefcase,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      count: getCounts('job'),
      active: stats.activeJobs,
      enabled: getEntityType('job')?.enabled
    },
    {
      id: 'estimate',
      title: 'Estimates',
      description: 'Create and manage quotes',
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      count: getCounts('estimate'),
      pending: stats.pendingEstimates,
      enabled: getEntityType('estimate')?.enabled
    },
    {
      id: 'workOrder',
      title: 'Work Orders',
      description: 'Assign and track tasks',
      icon: ClipboardCheck,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      count: getCounts('workOrder'),
      enabled: getEntityType('workOrder')?.enabled
    },
    {
      id: 'invoice',
      title: 'Invoices',
      description: 'Billing and payment tracking',
      icon: DollarSign,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      count: getCounts('invoice'),
      pending: stats.pendingInvoices,
      enabled: getEntityType('invoice')?.enabled
    },
    {
      id: 'vendor',
      title: 'Vendors',
      description: 'Supplier management',
      icon: Truck,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      count: getCounts('vendor'),
      enabled: getEntityType('vendor')?.enabled
    },
    {
      id: 'subcontractor',
      title: 'Subcontractors',
      description: 'Manage subs and performance',
      icon: UserCheck,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      count: getCounts('subcontractor'),
      enabled: getEntityType('subcontractor')?.enabled
    },
    {
      id: 'official',
      title: 'Officials & Inspectors',
      description: 'Inspectors, permits, officials',
      icon: Shield,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      count: getCounts('official'),
      enabled: getEntityType('official')?.enabled
    },
  ]

  const handleEntityClick = (entityId: string) => {
    setCurrentEntityView(entityId, null)
  }

  const handleNewEntity = (entityId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    setCurrentEntityView(entityId, 'new')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentSection('home')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Jobs & Business</h1>
              <p className="text-xs text-muted-foreground">Manage your construction business</p>
            </div>

            {/* Emergency On-Call Indicator */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">On Call</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Jobs</p>
                    <p className="text-3xl font-bold text-foreground">{stats.activeJobs}</p>
                  </div>
                  <Briefcase className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Customers</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalCustomers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Invoices</p>
                    <p className="text-3xl font-bold text-foreground">{stats.pendingInvoices}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Estimates</p>
                    <p className="text-3xl font-bold text-foreground">{stats.pendingEstimates}</p>
                  </div>
                  <FileText className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Alerts Section */}
          <Card className="bg-orange-500/5 border-orange-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                <div className="flex-1">
                  <CardTitle>Emergency Alert System</CardTitle>
                  <CardDescription>Configure on-call schedules and emergency routing</CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Configure On-Call
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">You</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Primary On-Call</p>
                    <p className="text-xs text-muted-foreground">Available 24/7</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Backup Tech</p>
                    <p className="text-xs text-muted-foreground">Not assigned</p>
                  </div>
                  <Button size="sm" variant="outline">Assign</Button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Response Time</p>
                    <p className="text-xs text-muted-foreground">Avg: 8 min</p>
                  </div>
                  <Badge variant="outline">Good</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entity Grid */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Business Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entityCards.filter(card => card.enabled).map((card) => {
                const Icon = card.icon
                return (
                  <Card
                    key={card.id}
                    className="hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handleEntityClick(card.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">{card.count}</p>
                          {card.active !== undefined && (
                            <p className="text-xs text-muted-foreground">{card.active} active</p>
                          )}
                          {card.pending !== undefined && card.pending > 0 && (
                            <Badge variant="outline" className="mt-1">
                              {card.pending} pending
                            </Badge>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{card.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                        onClick={(e) => handleNewEntity(card.id, e)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New {card.title.slice(0, -1)}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Getting Started Guide */}
          {entities.length === 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Getting Started</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your business management system is ready! Start by adding your first customer or creating a new job.
                      All your data is stored securely in your browser and syncs across your devices.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEntityClick('customer')}>
                        <Users className="w-4 h-4 mr-2" />
                        Add Customer
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEntityClick('job')}>
                        <Briefcase className="w-4 h-4 mr-2" />
                        Create Job
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
