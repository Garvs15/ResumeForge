import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning!";
  if (hour < 17) return "Good Afternoon!";
  return "Good Evening!";
}

export function sanitizeUnknownStrings<T>(data: T): T {
  if (typeof data === 'string') {
    return (data === '<UNKNOWN>' ? '' : data) as T;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeUnknownStrings(item)) as T;
  }
  if (typeof data === 'object' && data != null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, sanitizeUnknownStrings(value)])
    ) as T;
  }
  return data;
}

const BASEPATH_PLACEHOLDER = '/__NEXT_BASEPATH_PLACEHOLDER__';

export function getBasePath(): string {
  const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH;
  if (envBasePath && envBasePath !== BASEPATH_PLACEHOLDER) {
    return envBasePath;
  }

  if (typeof window !== 'undefined') {
    const nextData = window.__NEXT_DATA__ as {
      basePath?: string;
    } | undefined;

    if (nextData?.basePath && nextData.basePath !== BASEPATH_PLACEHOLDER) {
      return nextData.basePath;
    }
  }

  return '';
}

export function withBasePath(path: string): string {
  const basePath = getBasePath();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}