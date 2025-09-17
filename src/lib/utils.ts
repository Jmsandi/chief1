import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Sierra Leone Leones currency
 * @param amount - The amount to format
 * @returns Formatted currency string with "Le" prefix
 */
export function formatLeones(amount: number): string {
  return `Le ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}
