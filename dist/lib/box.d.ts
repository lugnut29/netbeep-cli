export declare const BOX: {
    readonly tl: "╭";
    readonly tr: "╮";
    readonly bl: "╰";
    readonly br: "╯";
    readonly h: "─";
    readonly v: "│";
    readonly lT: "├";
    readonly rT: "┤";
};
export declare function boxLine(content: string, width: number): string;
export declare function boxTop(width: number): string;
export declare function boxBottom(width: number): string;
export declare function boxDivider(width: number): string;
export declare function stripAnsi(str: string): string;
export declare function statusBar(status: string): string;
export declare function uptimeLabel(status: string): string;
