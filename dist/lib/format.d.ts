export declare function getFormat(status: string): {
    symbol: string;
    color: (s: string) => string;
    exit: number;
};
export declare function formatServiceLine(id: string, status: string, description?: string): string;
