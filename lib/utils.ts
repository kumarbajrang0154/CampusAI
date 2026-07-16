import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function setRoleCookie(role: string) {
  if (typeof window !== 'undefined') {
    window.document.cookie = `campusai-role=${role}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  }
}

