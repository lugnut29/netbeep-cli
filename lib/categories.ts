import type { ServiceStatus } from "./fetch.js";

export const CATEGORY_LABELS: Record<string, string> = {
  ecommerce: "Ecommerce",
  cloud: "Cloud",
  devtools: "Dev Tools",
  communication: "Comms",
  social: "Social",
  productivity: "Productivity",
  security: "Security",
  "cdn-dns": "CDN / DNS",
  monitoring: "Monitoring",
  payments: "Payments",
  ai: "AI",
};

export const VALID_CATEGORIES = Object.keys(CATEGORY_LABELS);

export function parseCategories(input: string): string[] {
  return input.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

export function validateCategories(categories: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const cat of categories) {
    if (cat in CATEGORY_LABELS) valid.push(cat);
    else invalid.push(cat);
  }
  return { valid, invalid };
}

export function filterByCategories(
  services: Record<string, ServiceStatus>,
  categories: string[],
): Record<string, ServiceStatus> {
  const result: Record<string, ServiceStatus> = {};
  for (const [id, svc] of Object.entries(services)) {
    if (categories.includes(svc.category)) {
      result[id] = svc;
    }
  }
  return result;
}
