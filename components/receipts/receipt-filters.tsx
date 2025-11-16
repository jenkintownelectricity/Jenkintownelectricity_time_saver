"use client"

import * as React from "react"
import { format } from "date-fns"
import { Search, X, Filter, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useReceiptStore } from "@/lib/stores/receipt-store"
import {
  ReceiptCategory,
  PaymentMethod,
  CATEGORY_CONFIGS,
} from "@/lib/types/receipts"

interface ReceiptFiltersProps {
  className?: string
}

export function ReceiptFilters({ className }: ReceiptFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [showDateFromCalendar, setShowDateFromCalendar] = React.useState(false)
  const [showDateToCalendar, setShowDateToCalendar] = React.useState(false)

  const { filters, setFilters, clearFilters, getAllVendors, getAllTags } =
    useReceiptStore()

  const vendors = getAllVendors()
  const tags = getAllTags()

  const activeFilterCount = Object.keys(filters).filter((key) => {
    const value = filters[key as keyof typeof filters]
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== null && value !== ''
  }).length

  const handleCategoryToggle = (category: ReceiptCategory) => {
    const currentCategories = filters.categories || []
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category]

    setFilters({ categories: newCategories.length > 0 ? newCategories : undefined })
  }

  const handlePaymentMethodToggle = (method: PaymentMethod) => {
    const currentMethods = filters.paymentMethods || []
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter((m) => m !== method)
      : [...currentMethods, method]

    setFilters({
      paymentMethods: newMethods.length > 0 ? newMethods : undefined,
    })
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]

    setFilters({ tags: newTags.length > 0 ? newTags : undefined })
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search receipts..."
          value={filters.search || ''}
          onChange={(e) => setFilters({ search: e.target.value || undefined })}
          className="pl-10 pr-10"
        />
        {filters.search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setFilters({ search: undefined })}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <Card className="p-4 space-y-6">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Date Range</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-2 block">From</Label>
                <Popover
                  open={showDateFromCalendar}
                  onOpenChange={setShowDateFromCalendar}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom
                        ? format(filters.dateFrom, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => {
                        setFilters({ dateFrom: date })
                        setShowDateFromCalendar(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-sm mb-2 block">To</Label>
                <Popover
                  open={showDateToCalendar}
                  onOpenChange={setShowDateToCalendar}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo
                        ? format(filters.dateTo, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => {
                        setFilters({ dateTo: date })
                        setShowDateToCalendar(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Amount Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Amount Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-2 block">Min</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.amountMin || ''}
                  onChange={(e) =>
                    setFilters({
                      amountMin: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Max</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.amountMax || ''}
                  onChange={(e) =>
                    setFilters({
                      amountMax: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Categories</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.values(ReceiptCategory).map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories?.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm cursor-pointer"
                  >
                    {CATEGORY_CONFIGS[category]?.label || category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Payment Methods</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.values(PaymentMethod).map((method) => (
                <div key={method} className="flex items-center space-x-2">
                  <Checkbox
                    id={`payment-${method}`}
                    checked={filters.paymentMethods?.includes(method)}
                    onCheckedChange={() => handlePaymentMethodToggle(method)}
                  />
                  <Label
                    htmlFor={`payment-${method}`}
                    className="text-sm cursor-pointer capitalize"
                  >
                    {method.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Vendors */}
          {vendors.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Vendors</Label>
              <Select
                value={filters.vendors?.[0] || ''}
                onValueChange={(value) =>
                  setFilters({
                    vendors: value ? [value] : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Vendors</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor} value={vendor}>
                      {vendor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags?.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tax Filters */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tax Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tax-deductible"
                  checked={filters.isTaxDeductible === true}
                  onCheckedChange={(checked) =>
                    setFilters({
                      isTaxDeductible: checked ? true : undefined,
                      isPersonal: undefined,
                    })
                  }
                />
                <Label htmlFor="tax-deductible" className="cursor-pointer">
                  Tax Deductible Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="personal"
                  checked={filters.isPersonal === true}
                  onCheckedChange={(checked) =>
                    setFilters({
                      isPersonal: checked ? true : undefined,
                      isTaxDeductible: undefined,
                    })
                  }
                />
                <Label htmlFor="personal" className="cursor-pointer">
                  Personal Expenses Only
                </Label>
              </div>
            </div>
          </div>

          {/* Tax Year/Quarter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tax Period</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-2 block">Year</Label>
                <Input
                  type="number"
                  placeholder="2024"
                  value={filters.taxYear || ''}
                  onChange={(e) =>
                    setFilters({
                      taxYear: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Quarter</Label>
                <Select
                  value={filters.taxQuarter?.toString() || ''}
                  onValueChange={(value) =>
                    setFilters({
                      taxQuarter: value
                        ? (parseInt(value) as 1 | 2 | 3 | 4)
                        : undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Quarters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Quarters</SelectItem>
                    <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                    <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                    <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                    <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
