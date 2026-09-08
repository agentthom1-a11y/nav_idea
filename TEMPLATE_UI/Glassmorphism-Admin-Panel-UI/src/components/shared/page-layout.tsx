"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { AnimatedStats, StatItem } from "./animated-stats"
import { ActionBar, FilterGroup } from "./action-bar"

interface PageLayoutProps {
  stats: StatItem[]
  searchPlaceholder: string
  searchValue: string
  onSearchChange: (value: string) => void
  filterGroups: FilterGroup[]
  onFilterSelect?: (value: string) => void
  addButtonLabel?: string
  onAddClick?: () => void
  children: ReactNode
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

const childVariants = {
  hidden: {
    opacity: 0,
    y: -20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
}

export function PageLayout({
  stats,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filterGroups,
  onFilterSelect,
  addButtonLabel,
  onAddClick,
  children
}: PageLayoutProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6"
    >
      {/* Stats Cards */}
      <AnimatedStats stats={stats} />

      {/* Action Bar */}
      <ActionBar
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        filterGroups={filterGroups}
        onFilterSelect={onFilterSelect}
        addButtonLabel={addButtonLabel}
        onAddClick={onAddClick}
      />

      {/* Table Content */}
      <motion.div variants={childVariants}>
        {children}
      </motion.div>
    </motion.div>
  )
}
