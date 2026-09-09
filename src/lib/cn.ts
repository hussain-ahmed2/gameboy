/**
 * @file cn.ts
 * @description Utility for conditionally joining class names.
 *   Filters out falsy values and joins the rest with spaces.
 */

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}