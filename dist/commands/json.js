import { fetchStatuses } from "../lib/fetch.js";
import { filterByCategories } from "../lib/categories.js";
export async function jsonCommand(serviceIds, categoryFilter) {
    const data = await fetchStatuses(serviceIds.length > 0 ? serviceIds : undefined);
    if (categoryFilter) {
        data.services = filterByCategories(data.services, categoryFilter);
    }
    console.log(JSON.stringify(data, null, 2));
}
