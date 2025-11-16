"use client"

import * as React from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useReceiptStore } from "@/lib/stores/receipt-store"
import {
  ReceiptCategory,
  CATEGORY_CONFIGS,
  getCategoryLabel,
  formatCurrency,
} from "@/lib/types/receipts"

interface CategoryManagerProps {
  className?: string
}

export function CategoryManager({ className }: CategoryManagerProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<ReceiptCategory | ''>('')
  const { selectedReceipts, bulkUpdateCategory, getFilteredReceipts, getReceiptStats } =
    useReceiptStore()

  const receipts = getFilteredReceipts()
  const stats = getReceiptStats()

  const handleBulkCategorize = () => {
    if (selectedCategory && selectedReceipts.length > 0) {
      bulkUpdateCategory(selectedReceipts, selectedCategory as ReceiptCategory)
      setSelectedCategory('')
    }
  }

  const categoryStats = Object.entries(stats.categoryBreakdown)
    .map(([category, amount]) => ({
      category: category as ReceiptCategory,
      amount,
      count: receipts.filter((r) => r.category === category).length,
      config: CATEGORY_CONFIGS[category as ReceiptCategory],
    }))
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Bulk Categorize */}
      {selectedReceipts.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">
                Bulk Categorize ({selectedReceipts.length} selected)
              </h3>
              <p className="text-sm text-muted-foreground">
                Change the category for all selected receipts
              </p>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as ReceiptCategory | '')}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select category...</SelectItem>
                  {Object.values(ReceiptCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleBulkCategorize}
                disabled={!selectedCategory}
              >
                Apply
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Category List */}
      <div>
        <h2 className="text-xl font-bold mb-4">Expense Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map(({ category, amount, count, config }) => (
            <Card key={category} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{config.label}</h3>
                  <Badge variant="outline" className="mt-1">
                    {count} {count === 1 ? 'receipt' : 'receipts'}
                  </Badge>
                </div>
                {config.isTaxDeductible ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {formatCurrency(amount)}
                  </span>
                  {stats.totalExpenses > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({((amount / stats.totalExpenses) * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{
                      width: stats.totalExpenses > 0
                        ? `${(amount / stats.totalExpenses) * 100}%`
                        : '0%',
                    }}
                  />
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs">
                  {config.isTaxDeductible ? (
                    <Badge variant="secondary" className="text-xs">
                      Tax Deductible
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Not Deductible
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tax Deductibility Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tax Deductibility Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tax Deductible</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.taxDeductibleTotal)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalExpenses > 0
                ? ((stats.taxDeductibleTotal / stats.totalExpenses) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Non-Deductible</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {formatCurrency(stats.totalExpenses - stats.taxDeductibleTotal)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalExpenses > 0
                ? (((stats.totalExpenses - stats.taxDeductibleTotal) / stats.totalExpenses) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </div>
        </div>
      </Card>

      {/* Category Guidelines */}
      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-3">Category Guidelines</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium mb-1">Tax Deductible Categories</p>
            <p className="text-muted-foreground">
              Categories marked with a green checkmark are typically tax-deductible for
              contractor businesses. Always consult with a tax professional for specific
              guidance.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Common Deductible Expenses</p>
            <p className="text-muted-foreground">
              Materials, tools, equipment, vehicle expenses, fuel, insurance, licenses,
              permits, education, marketing, phone, internet, rent, and utilities used
              for business purposes.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Important Notes</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Keep all receipts for at least 7 years</li>
              <li>Separate business and personal expenses</li>
              <li>Document the business purpose of each expense</li>
              <li>Track vehicle mileage separately using a mileage log</li>
              <li>Meals are typically 50% deductible</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
