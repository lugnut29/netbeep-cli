export interface ServiceStatus {
    id: string;
    name: string;
    category: string;
    status: string;
    description?: string;
    lastChecked: number;
    components?: {
        name: string;
        status: string;
    }[];
    incidents?: {
        title: string;
        status: string;
        timestamp: number;
    }[];
}
export interface StatusBlob {
    updatedAt: number;
    services: Record<string, ServiceStatus>;
}
export declare function fetchStatuses(serviceIds?: string[]): Promise<StatusBlob>;
