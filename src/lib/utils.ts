import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, isYesterday, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function formatFriendlyDate(dateString?: string) {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  if (isToday(date)) return `Today, ${format(date, 'HH:mm')}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, 'HH:mm')}`;
  return format(date, 'MMM d, HH:mm');
}

export function formatTimeAgo(dateString: string) {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function formatNumber(num?: number) {
  if (num === undefined) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "text-pink-500 bg-pink-50",
  TikTok: "text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800",
  YouTube: "text-red-500 bg-red-50",
  LinkedIn: "text-blue-600 bg-blue-50",
  X: "text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800",
  Facebook: "text-blue-700 bg-blue-50",
};

export const STATUS_COLORS: Record<string, string> = {
  IDEA: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  RESEARCH: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  BRIEF: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  DRAFT: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  DESIGN: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  EDITING: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400",
  REVIEW: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  CHANGES_REQUESTED: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  APPROVED: "bg-lime-50 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400",
  SCHEDULED: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  PUBLISHING: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  PUBLISHED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  FAILED: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  ARCHIVED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};
