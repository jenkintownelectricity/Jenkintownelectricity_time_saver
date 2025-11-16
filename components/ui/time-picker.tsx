"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export interface TimePickerProps {
  time?: string
  onSelect?: (time: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TimePicker({
  time,
  onSelect,
  placeholder = "Pick a time",
  className,
  disabled = false,
}: TimePickerProps) {
  const [hours, setHours] = React.useState(time?.split(":")[0] || "12")
  const [minutes, setMinutes] = React.useState(time?.split(":")[1] || "00")

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
      setHours(value)
      if (onSelect && value !== "") {
        onSelect(`${value.padStart(2, "0")}:${minutes}`)
      }
    }
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
      setMinutes(value)
      if (onSelect && value !== "") {
        onSelect(`${hours}:${value.padStart(2, "0")}`)
      }
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !time && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {time ? time : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex items-center gap-2">
          <div className="grid gap-1">
            <label htmlFor="hours" className="text-xs text-muted-foreground">
              Hours
            </label>
            <Input
              id="hours"
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={handleHoursChange}
              className="w-16 text-center"
            />
          </div>
          <span className="text-2xl font-bold">:</span>
          <div className="grid gap-1">
            <label htmlFor="minutes" className="text-xs text-muted-foreground">
              Minutes
            </label>
            <Input
              id="minutes"
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={handleMinutesChange}
              className="w-16 text-center"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
