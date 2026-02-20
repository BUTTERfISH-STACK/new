import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return '-'
  const now = new Date()
  const target = new Date(date)
  const diffInMs = target.getTime() - now.getTime()
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Tomorrow'
  if (diffInDays === -1) return 'Yesterday'
  if (diffInDays > 0 && diffInDays <= 7) return `In ${diffInDays} days`
  if (diffInDays < 0 && diffInDays >= -7) return `${Math.abs(diffInDays)} days ago`
  
  return formatDate(date)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function calculateWinRate(deals: { stage: string }[]): number {
  const closedWon = deals.filter(d => d.stage === 'CLOSED_WON').length
  const closed = deals.filter(d => d.stage === 'CLOSED_WON' || d.stage === 'CLOSED_LOST').length
  return closed > 0 ? Math.round((closedWon / closed) * 100) : 0
}

export function calculateForecast(deals: { stage: string; value: number; probability: number }[]): number {
  return deals.reduce((sum, deal) => {
    if (deal.stage === 'CLOSED_WON') return sum + deal.value
    if (deal.stage === 'CLOSED_LOST') return sum
    return sum + (deal.value * (deal.probability / 100))
  }, 0)
}
