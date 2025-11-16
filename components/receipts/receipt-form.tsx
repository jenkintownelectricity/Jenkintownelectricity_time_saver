"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover } from "@/components/ui/popover"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import {
  Receipt,
  ReceiptCategory,
  PaymentMethod,
  CATEGORY_CONFIGS,
} from "@/lib/types/receipts"
import { cn } from "@/lib/utils"

const receiptFormSchema = z.object({
  vendor: z.string().min(1, "Vendor is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.date(),
  category: z.nativeEnum(ReceiptCategory),
  paymentMethod: z.nativeEnum(PaymentMethod),
  description: z.string().min(1, "Description is required"),
  notes: z.string().default(""),
  tags: z.array(z.string()).default([]),
  jobId: z.string().default(""),
  isTaxDeductible: z.boolean().default(true),
  isPersonal: z.boolean().default(false),
})

type ReceiptFormValues = z.infer<typeof receiptFormSchema>

interface ReceiptFormProps {
  receipt?: Partial<Receipt>
  onSubmit: (data: ReceiptFormValues) => void
  onCancel?: () => void
  submitLabel?: string
  className?: string
}

export function ReceiptForm({
  receipt,
  onSubmit,
  onCancel,
  submitLabel = "Save Receipt",
  className,
}: ReceiptFormProps) {
  const [showCalendar, setShowCalendar] = React.useState(false)
  const [tagInput, setTagInput] = React.useState("")

  const form = useForm({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      vendor: receipt?.vendor || "",
      amount: receipt?.amount || 0,
      date: receipt?.date || new Date(),
      category: receipt?.category || ReceiptCategory.OTHER,
      paymentMethod: receipt?.paymentMethod || PaymentMethod.CREDIT_CARD,
      description: receipt?.description || "",
      notes: receipt?.notes || "",
      tags: receipt?.tags || [],
      jobId: receipt?.jobId || "",
      isTaxDeductible: receipt?.isTaxDeductible ?? true,
      isPersonal: receipt?.isPersonal ?? false,
    },
  })

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues("tags") || []
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues("tags") || []
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag)
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-6", className)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor</FormLabel>
                <FormControl>
                  <Input placeholder="Home Depot" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      onClick={() => setShowCalendar(true)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                    <div className="absolute z-50 mt-2">
                      <Card>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date: Date | undefined) => {
                            if (date) field.onChange(date)
                            setShowCalendar(false)
                          }}
                        />
                      </Card>
                    </div>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select {...field}>
                    {Object.values(ReceiptCategory).map((category) => (
                      <option key={category} value={category}>
                        {CATEGORY_CONFIGS[category]?.label || category}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <Select {...field}>
                    <option value={PaymentMethod.CASH}>Cash</option>
                    <option value={PaymentMethod.CREDIT_CARD}>
                      Credit Card
                    </option>
                    <option value={PaymentMethod.DEBIT_CARD}>
                      Debit Card
                    </option>
                    <option value={PaymentMethod.CHECK}>Check</option>
                    <option value={PaymentMethod.BANK_TRANSFER}>
                      Bank Transfer
                    </option>
                    <option value={PaymentMethod.MOBILE_PAYMENT}>
                      Mobile Payment
                    </option>
                    <option value={PaymentMethod.OTHER}>Other</option>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job ID (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Link to job" {...field} />
                </FormControl>
                <FormDescription>
                  Associate this receipt with a specific job
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="What was purchased?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add tag and press Enter"
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                {field.value && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((tag) => (
                      <div
                        key={tag}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isTaxDeductible"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">Tax Deductible</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPersonal"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">Personal Expense</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  )
}
