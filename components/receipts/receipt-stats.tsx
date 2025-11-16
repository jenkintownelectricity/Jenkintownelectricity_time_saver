"use client"

import * as React from "react"
import {
  DollarSign,
  TrendingUp,
  Receipt,
  PieChart as PieChartIcon,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"
import { useReceiptStore } from "@/lib/stores/receipt-store"
import {
  formatCurrency,
  getCategoryLabel,
  ReceiptCategory,
} from "@/lib/types/receipts"

interface ReceiptStatsProps {
  className?: string
}

const COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#6366f1',
  '#84cc16',
  '#f97316',
  '#14b8a6',
]

export function ReceiptStats({ className }: ReceiptStatsProps) {
  const { getReceiptStats, getFilteredReceipts } = useReceiptStore()
  const stats = getReceiptStats()
  const receipts = getFilteredReceipts()

  // Prepare category breakdown data for pie chart
  const categoryData = Object.entries(stats.categoryBreakdown)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount], index) => ({
      name: getCategoryLabel(category as ReceiptCategory),
      value: amount,
      percentage: ((amount / stats.totalExpenses) * 100).toFixed(1),
      color: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)

  // Prepare quarterly data
  const quarterlyData = [
    {
      quarter: 'Q1',
      amount: stats.quarterlyTotals[1] || 0,
    },
    {
      quarter: 'Q2',
      amount: stats.quarterlyTotals[2] || 0,
    },
    {
      quarter: 'Q3',
      amount: stats.quarterlyTotals[3] || 0,
    },
    {
      quarter: 'Q4',
      amount: stats.quarterlyTotals[4] || 0,
    },
  ]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalExpenses)}
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tax Deductible</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.taxDeductibleTotal)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalExpenses > 0
                  ? ((stats.taxDeductibleTotal / stats.totalExpenses) * 100).toFixed(1)
                  : 0}
                % of total
              </p>
            </div>
            <div className="rounded-full bg-green-500/10 p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Personal</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.personalTotal)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalExpenses > 0
                  ? ((stats.personalTotal / stats.totalExpenses) * 100).toFixed(1)
                  : 0}
                % of total
              </p>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Receipts</p>
              <p className="text-2xl font-bold">{receipts.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: {receipts.length > 0 ? formatCurrency(stats.totalExpenses / receipts.length) : '$0.00'}
              </p>
            </div>
            <div className="rounded-full bg-purple-500/10 p-3">
              <PieChartIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name} (${entry.percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.slice(0, 5).map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No category data available
            </div>
          )}
        </Card>

        {/* Quarterly Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quarterly Expenses</h3>
          {quarterlyData.some((q) => q.amount > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quarterlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No quarterly data available
            </div>
          )}
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Trend (Last 12 Months)</h3>
        {stats.monthlyTrend.some((m) => m.amount > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No monthly trend data available
          </div>
        )}
      </Card>

      {/* Top Categories */}
      {categoryData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Spending Categories</h3>
          <div className="space-y-4">
            {categoryData.slice(0, 5).map((item, index) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(item.value)}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.percentage}% of total
                    </p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
