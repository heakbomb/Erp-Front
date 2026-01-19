// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn/ui 공용 className 유틸
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}