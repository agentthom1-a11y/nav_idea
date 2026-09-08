"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { GlassCard } from "@/components/glass/glass-card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"

export interface StatItem {
  icon: LucideIcon
  label: string
  value: string | number
  subStats?: { label: string; value: string | number }[]
}

interface AnimatedStatsProps {
  stats: StatItem[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
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

export function AnimatedStats({ stats }: AnimatedStatsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-6"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div key={index} variants={itemVariants}>
            <GlassCard className="relative overflow-hidden group h-full">
              <Button
                variant="glass-circle"
                size="icon-sm"
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[var(--text-tertiary)] hover:text-white transition-all duration-300 group-hover:scale-110"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>

              <div className="flex items-center gap-2 sm:gap-2.5 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full glass flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 text-[var(--text-tertiary)]" />
                </div>
                <p className="text-[var(--text-tertiary)] text-[11px] sm:text-xs lg:text-sm">{stat.label}</p>
              </div>

              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 ml-0.5">{stat.value}</p>

              {stat.subStats && (
                <div className="flex gap-3 sm:gap-4 lg:gap-6 pt-2 sm:pt-3 border-t border-[rgba(255,255,255,var(--glass-border-opacity))]">
                  {stat.subStats.map((subStat, subIndex) => (
                    <div key={subIndex}>
                      <p className="text-[var(--text-muted)] text-[10px] sm:text-[10px] lg:text-[11px] mb-0.5">{subStat.label}</p>
                      <p className="text-white font-semibold text-xs sm:text-sm lg:text-base">{subStat.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
