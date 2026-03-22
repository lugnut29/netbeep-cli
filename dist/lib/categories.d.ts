import type { ServiceStatus } from "./fetch.js";
export declare const CATEGORY_LABELS: Record<string, string>;
export declare const VALID_CATEGORIES: string[];
export declare function parseCategories(input: string): string[];
export declare function validateCategories(categories: string[]): {
    valid: string[];
    invalid: string[];
};
export declare function filterByCategories(services: Record<string, ServiceStatus>, categories: string[]): Record<string, ServiceStatus>;
