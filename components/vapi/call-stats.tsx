'use client'

/**
 * VAPI Call Stats Component
 * Display statistics and charts for call data
 */

import React from 'react'
import { useVAPIStore } from '@/lib/stores/vapi-store'
import { Phone, PhoneIncoming, PhoneMissed, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function CallStats() {
  const { getCallStats } = useVAPIStore()
  const stats = getCallStats()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Call Statistics</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Calls */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Calls</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Completed Calls */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-3xl font-bold mt-2">{stats.completed}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}% of total
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Missed Calls */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Missed</p>
              <p className="text-3xl font-bold mt-2">{stats.missed}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.total > 0 ? ((stats.missed / stats.total) * 100).toFixed(1) : 0}% of total
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <PhoneMissed className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        {/* Converted to Appointments */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Converted</p>
              <p className="text-3xl font-bold mt-2">{stats.converted}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.conversionRate.toFixed(1)}% conversion rate
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Average Duration */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Duration</p>
              <p className="text-3xl font-bold mt-2">
                {formatDuration(Math.round(stats.averageDuration))}
              </p>
              <p className="text-sm text-gray-500 mt-1">Per call</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        {/* Total Duration */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Duration</p>
              <p className="text-3xl font-bold mt-2">
                {formatDuration(stats.totalDuration)}
              </p>
              <p className="text-sm text-gray-500 mt-1">All calls</p>
            </div>
            <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center">
              <PhoneIncoming className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Conversion Rate Progress */}
      <Card className="p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Conversion Rate</p>
            <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-purple-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">
            {stats.converted} out of {stats.total} calls converted to appointments
          </p>
        </div>
      </Card>

      {/* Quick Insights */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Quick Insights</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Calls answered</span>
            <span className="font-semibold">
              {stats.completed} ({stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Calls missed</span>
            <span className="font-semibold">
              {stats.missed} ({stats.total > 0 ? ((stats.missed / stats.total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Successful conversions</span>
            <span className="font-semibold">
              {stats.converted} ({stats.conversionRate.toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Total talk time</span>
            <span className="font-semibold">{formatDuration(stats.totalDuration)}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}
