"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Tag } from "@/types/RecipeTypes"

interface MultiSelectTagDropdownProps {
  readonly allTags: Tag[]
  readonly selectedTags: Tag[]
  readonly onTagSelect: (tag: Tag) => void
  readonly loading?: boolean
  readonly error?: string | null
  readonly placeholder?: string
  readonly className?: string
}

export function MultiSelectTagDropdown({
  allTags,
  selectedTags,
  onTagSelect,
  loading = false,
  error,
  placeholder = "Sélectionner des tags...",
  className
}: MultiSelectTagDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const filteredTags = React.useMemo(() => {
    if (!searchValue) return allTags
    return allTags.filter(tag => 
      tag.name.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [allTags, searchValue])

  const handleTagToggle = (tag: Tag) => {
    onTagSelect(tag)
  }

  const isSelected = (tag: Tag) => {
    return selectedTags.some(t => 
      t.id === tag.id || (t.id === undefined && t.name === tag.name)
    )
  }

  const handleRemoveTag = (tagToRemove: Tag, e: React.MouseEvent) => {
    e.stopPropagation()
    onTagSelect(tagToRemove)
  }

  const getDisplayText = () => {
    if (selectedTags.length === 0) {
      return placeholder
    }
    if (selectedTags.length === 1) {
      return selectedTags[0].name
    }
    return `${selectedTags.length} tags sélectionnés`
  }

  if (loading) {
    return (
      <Button variant="outline" disabled className={`w-full justify-between ${className}`}>
        Chargement des tags...
        <ChevronsUpDown className="opacity-50" />
      </Button>
    )
  }

  if (error) {
    return (
      <Button variant="outline" disabled className={`w-full justify-between ${className}`}>
        Erreur: {error}
        <ChevronsUpDown className="opacity-50" />
      </Button>
    )
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-10"
          >
            <div className="flex items-center gap-1 flex-wrap overflow-hidden">
              {selectedTags.length <= 2 ? (
                selectedTags.map((tag) => (
                  <Badge
                    key={tag.id ?? tag.name}
                    variant="secondary"
                    className="text-xs"
                  >
                    {tag.name}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={(e) => handleRemoveTag(tag, e)}
                    />
                  </Badge>
                ))
              ) : (
                <span className="text-sm">{getDisplayText()}</span>
              )}
              {selectedTags.length === 0 && (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Rechercher des tags..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>Aucun tag trouvé.</CommandEmpty>
              <CommandGroup>
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag.id ?? tag.name}
                    value={tag.name}
                    onSelect={() => handleTagToggle(tag)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected(tag) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected tags display below dropdown for better visibility */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id ?? tag.name}
              variant="default"
              className="text-sm"
            >
              {tag.name}
              <X
                className="ml-2 h-3 w-3 cursor-pointer"
                onClick={(e) => handleRemoveTag(tag, e)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}