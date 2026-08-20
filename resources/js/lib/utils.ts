import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for conditionally joining TailwindCSS class names.
 * Merges conflicting Tailwind classes intelligently.
 *
 * @example
 * cn('px-4 py-2', 'px-6') // => 'py-2 px-6'
 * cn('text-red-500', isActive && 'text-blue-500') // conditional
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
