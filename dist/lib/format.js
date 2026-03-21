import chalk from "chalk";
const STATUS_MAP = {
    operational: { symbol: "✓", color: chalk.green, exit: 0 },
    degraded: { symbol: "⚠", color: chalk.yellow, exit: 1 },
    partial_outage: { symbol: "⚠", color: chalk.yellow, exit: 1 },
    major_outage: { symbol: "✗", color: chalk.red, exit: 2 },
    maintenance: { symbol: "⚙", color: chalk.blue, exit: 1 },
    unknown: { symbol: "?", color: chalk.gray, exit: 3 },
};
export function getFormat(status) {
    return STATUS_MAP[status] ?? STATUS_MAP.unknown;
}
export function formatServiceLine(id, status, description) {
    const fmt = getFormat(status);
    const label = status.replace(/_/g, " ");
    const desc = description ? ` — ${description}` : "";
    return `${fmt.color(fmt.symbol)} ${chalk.bold(id.padEnd(20))} ${fmt.color(label)}${chalk.dim(desc)}`;
}
