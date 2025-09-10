import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  const year = d.getFullYear().toString().slice(-2); // Get last 2 digits of year
  return `${day}-${capitalizedMonth}-${year}`;
}
