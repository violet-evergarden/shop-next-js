import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** 合并 className(Tailwind class 冲突由 tailwind-merge 解决) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
