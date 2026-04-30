import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combine Tailwind class names with conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Slugify a Portuguese string into a URL-safe identifier. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

/** Initials helper for donor avatars (e.g., "Maria Júlia Costa" → "MJ"). */
export function initials(name: string | null | undefined, max = 2): string {
  if (!name) return '?';
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((s) => s.length > 0);
  return parts
    .slice(0, max)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
