export const CATEGORY_LABELS = {
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
export function parseCategories(input) {
    return input.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}
export function validateCategories(categories) {
    const valid = [];
    const invalid = [];
    for (const cat of categories) {
        if (cat in CATEGORY_LABELS)
            valid.push(cat);
        else
            invalid.push(cat);
    }
    return { valid, invalid };
}
export function filterByCategories(services, categories) {
    const result = {};
    for (const [id, svc] of Object.entries(services)) {
        if (categories.includes(svc.category)) {
            result[id] = svc;
        }
    }
    return result;
}
