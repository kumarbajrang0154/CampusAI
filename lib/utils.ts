// lib/utils.ts — Shared Utility Functions
// TODO: Add more utility functions as needed

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names using clsx and tailwind-merge.
 * Used throughout the app for conditional and merged Tailwind class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
