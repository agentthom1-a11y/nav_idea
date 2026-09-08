"use client"

import { motion } from "framer-motion"
import { Search, Filter, Plus } from "lucide-react"
import { GlassCard } from "@/components/glass/glass-card"
import { GlassInput } from "@/components/glass/glass-input"
import { GlassButton } from "@/components/glass/glass-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface FilterGroup {
  label: string
  options: string[]
}

interface ActionBarProps {
  searchPlaceholder: string
  searchValue: string
  onSearchChange: (value: string) => void
  filterGroups: FilterGroup[]
  onFilterSelect?: (value: string) => void
  addButtonLabel?: string
  onAddClick?: () => void
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
}

export function ActionBar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filterGroups,
  onFilterSelect,
  addButtonLabel,
  onAddClick
}: ActionBarProps) {
  return (
    <motion.div variants={itemVariants}>
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <GlassInput
                placeholder={searchPlaceholder}
                className="pl-10"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg glass-button text-[var(--text-secondary)] hover:text-white transition-colors flex-shrink-0">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-dropdown border-[rgba(255,255,255,var(--glass-border-opacity))]">
                {filterGroups.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {groupIndex > 0 && <DropdownMenuSeparator className="bg-[rgba(255,255,255,var(--ui-opacity-10))]" />}
                    <DropdownMenuLabel className="text-[var(--text-tertiary)]">{group.label}</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[rgba(255,255,255,var(--ui-opacity-10))]" />
                    {group.options.map((option, optionIndex) => (
                      <DropdownMenuItem
                        key={optionIndex}
                        className="text-[var(--text-secondary)] focus:bg-[rgba(255,255,255,var(--ui-opacity-10))] focus:text-white cursor-pointer"
                        onClick={() => onFilterSelect?.(option)}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {addButtonLabel && onAddClick && (
            <GlassButton variant="primary" onClick={onAddClick} className="self-end sm:self-auto">
              <Plus className="w-4 h-4" />
              {addButtonLabel}
            </GlassButton>
          )}
        </div>
      </GlassCard>
    </motion.div>
  )
}
