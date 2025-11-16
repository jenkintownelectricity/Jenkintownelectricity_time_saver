'use client'

import { useCustomerStore } from '@/lib/stores/customer-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Home,
  Building2,
  TrendingUp,
  Phone,
  Globe,
  MessageSquare,
  Tag
} from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CUSTOMER_SOURCE_LABELS } from '@/lib/types/customers'

export function CustomerStats() {
  const stats = useCustomerStore((state) => state.getCustomerStats())

  const statusData = [
    { name: 'Active', value: stats.activeCustomers, color: '#10b981' },
    { name: 'Inactive', value: stats.inactiveCustomers, color: '#6b7280' },
    { name: 'Potential', value: stats.potentialCustomers, color: '#3b82f6' },
  ]

  const typeData = [
    { name: 'Residential', value: stats.residentialCount, color: '#8b5cf6' },
    { name: 'Commercial', value: stats.commercialCount, color: '#f97316' },
  ]

  const sourceData = Object.entries(stats.sourceBreakdown).map(([source, count]) => ({
    name: CUSTOMER_SOURCE_LABELS[source as keyof typeof CUSTOMER_SOURCE_LABELS] || source,
    count,
  }))

  const topTags = Object.entries(stats.tagBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalCustomers > 0
                ? `${Math.round((stats.activeCustomers / stats.totalCustomers) * 100)}% of total`
                : 'No customers yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Customers</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.potentialCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads to convert
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Customers</CardTitle>
            <UserX className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactiveCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Need re-engagement
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Type Distribution</CardTitle>
            <CardDescription>Residential vs Commercial breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Home className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.residentialCount}</p>
                  <p className="text-xs text-muted-foreground">Residential</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.commercialCount}</p>
                  <p className="text-xs text-muted-foreground">Commercial</p>
                </div>
              </div>
            </div>
            {stats.totalCustomers > 0 && (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Customer Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Status</CardTitle>
            <CardDescription>Active, Inactive, and Potential</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Active</span>
                </div>
                <span className="text-sm font-medium">{stats.activeCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-gray-500 rounded-full" />
                  <span className="text-sm">Inactive</span>
                </div>
                <span className="text-sm font-medium">{stats.inactiveCustomers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Potential</span>
                </div>
                <span className="text-sm font-medium">{stats.potentialCustomers}</span>
              </div>
            </div>
            {stats.totalCustomers > 0 && (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Customer Acquisition Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Sources</CardTitle>
            <CardDescription>Where your customers come from</CardDescription>
          </CardHeader>
          <CardContent>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No customer data yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Popular Tags
            </CardTitle>
            <CardDescription>Most used customer tags</CardDescription>
          </CardHeader>
          <CardContent>
            {topTags.length > 0 ? (
              <div className="space-y-3">
                {topTags.map(([tag, count]) => (
                  <div key={tag} className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                    <span className="text-sm font-medium">{count} customer{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tags used yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Additions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Additions</CardTitle>
          <CardDescription>Latest customers added to the system</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentAdditions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentAdditions.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                      {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{customer.type}</Badge>
                    <Badge variant="outline">{customer.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No customers added yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
