const API_BASE = "https://netbeep.com/api/status";
const TIMEOUT = 8000;
export async function fetchStatuses(serviceIds) {
    let url = API_BASE;
    if (serviceIds && serviceIds.length > 0) {
        url += `?service=${serviceIds.join(",")}`;
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!res.ok) {
        if (res.status >= 500)
            throw new Error("Netbeep is temporarily unavailable");
        throw new Error(`Unexpected response: ${res.status}`);
    }
    return (await res.json());
}
