import { fetchStatuses } from "../lib/fetch.js";
export async function jsonCommand(serviceIds) {
    const data = await fetchStatuses(serviceIds.length > 0 ? serviceIds : undefined);
    console.log(JSON.stringify(data, null, 2));
}
