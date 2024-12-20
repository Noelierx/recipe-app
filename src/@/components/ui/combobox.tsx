"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Option = {
  value: string
  label: string
}

interface ComboboxProps {
  readonly items: Option[]
  readonly onSelect: (value: string) => void
  readonly placeholder: string
  readonly renderItem: (item: Option) => React.ReactNode
  readonly className?: string
}

export function Combobox({ items, onSelect, placeholder, renderItem, className }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [inputValue, setInputValue] = React.useState("")

  const handleSelect = (currentValue: string) => {
    setValue(currentValue)
    setInputValue(currentValue)
    onSelect(currentValue)
    setOpen(false)
  }

  const handleAddNew = () => {
    if (inputValue) {
      handleSelect(inputValue)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${className}`}
        >
          {inputValue || placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0 w-auto min-w-[var(--radix-popover-trigger-width)]")}>
        <Command>
          <CommandInput
            placeholder={placeholder}
            className="h-9"
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={handleSelect}
                >
                  {renderItem(item)}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
              {inputValue && !items.some(item => item.value === inputValue) && (
                <CommandItem
                  value={inputValue}
                  onSelect={handleAddNew}
                >
                  <Plus className="mr-2" />
                  Ajouter "{inputValue}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}