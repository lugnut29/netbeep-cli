import chalk from "chalk";
// ── Box-drawing characters ──
export const BOX = {
    tl: "╭", tr: "╮", bl: "╰", br: "╯",
    h: "─", v: "│",
    lT: "├", rT: "┤",
};
export function boxLine(content, width) {
    // Strip ANSI to measure visible length
    const visible = stripAnsi(content);
    const pad = Math.max(0, width - 2 - visible.length);
    return `${chalk.dim(BOX.v)} ${content}${" ".repeat(pad)}${chalk.dim(BOX.v)}`;
}
export function boxTop(width) {
    return chalk.dim(`${BOX.tl}${BOX.h.repeat(width - 2)}${BOX.tr}`);
}
export function boxBottom(width) {
    return chalk.dim(`${BOX.bl}${BOX.h.repeat(width - 2)}${BOX.br}`);
}
export function boxDivider(width) {
    return chalk.dim(`${BOX.lT}${BOX.h.repeat(width - 2)}${BOX.rT}`);
}
export function stripAnsi(str) {
    return str.replace(/\x1b\[[0-9;]*m/g, "");
}
// ── Status bar ──
const BAR_LENGTH = 10;
const STATUS_FILLS = {
    operational: 10,
    degraded: 7,
    partial_outage: 5,
    major_outage: 1,
    maintenance: 10,
    unknown: 0,
};
const STATUS_COLORS = {
    operational: chalk.green,
    degraded: chalk.yellow,
    partial_outage: chalk.yellow,
    major_outage: chalk.red,
    maintenance: chalk.blue,
    unknown: chalk.gray,
};
export function statusBar(status, uptime) {
    const fill = uptime != null
        ? Math.round((uptime.day / 100) * BAR_LENGTH)
        : (STATUS_FILLS[status] ?? 0);
    const empty = BAR_LENGTH - fill;
    const color = STATUS_COLORS[status] ?? chalk.gray;
    return color("█".repeat(fill)) + chalk.dim("░".repeat(empty));
}
// ── Uptime percentage ──
const STATUS_UPTIME_FALLBACK = {
    operational: "100%",
    degraded: " 98%",
    partial_outage: " 72%",
    major_outage: "down",
    maintenance: " mnt",
    unknown: "  ? ",
};
function uptimeColor(pct) {
    if (pct >= 99.9)
        return chalk.green;
    if (pct >= 99)
        return chalk.yellow;
    return chalk.red;
}
export function uptimeLabel(status, uptime) {
    if (uptime != null) {
        const color = uptimeColor(uptime.day);
        return color(`${uptime.day.toFixed(1)}%`);
    }
    return STATUS_UPTIME_FALLBACK[status] ?? "  ? ";
}
export function uptimeWeekLabel(uptime) {
    if (uptime == null)
        return "";
    const color = uptimeColor(uptime.week);
    return chalk.dim("7d:") + color(`${uptime.week.toFixed(1)}%`);
}
// ── Response time ──
export function responseMsLabel(ms) {
    if (ms == null)
        return "";
    const color = ms < 200 ? chalk.green : ms < 400 ? chalk.yellow : chalk.red;
    return chalk.dim("Resp: ") + color(`${ms}ms`);
}
// ── Timeline bar (24h, 48 × 30-min buckets) ──
export function timelineBar(timeline) {
    if (!timeline || timeline.length === 0)
        return "";
    const blocks = timeline.map((bucket) => {
        const color = STATUS_COLORS[bucket.status] ?? chalk.gray;
        return color("▓");
    });
    return chalk.dim("24h ") + blocks.join("") + chalk.dim(" now");
}
