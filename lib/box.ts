import chalk from "chalk";

// ── Box-drawing characters ──

export const BOX = {
  tl: "╭", tr: "╮", bl: "╰", br: "╯",
  h: "─", v: "│",
  lT: "├", rT: "┤",
} as const;

export function boxLine(content: string, width: number): string {
  // Strip ANSI to measure visible length
  const visible = stripAnsi(content);
  const pad = Math.max(0, width - 2 - visible.length);
  return `${chalk.dim(BOX.v)} ${content}${" ".repeat(pad)}${chalk.dim(BOX.v)}`;
}

export function boxTop(width: number): string {
  return chalk.dim(`${BOX.tl}${BOX.h.repeat(width - 2)}${BOX.tr}`);
}

export function boxBottom(width: number): string {
  return chalk.dim(`${BOX.bl}${BOX.h.repeat(width - 2)}${BOX.br}`);
}

export function boxDivider(width: number): string {
  return chalk.dim(`${BOX.lT}${BOX.h.repeat(width - 2)}${BOX.rT}`);
}

export function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

// ── Status bar ──

const BAR_LENGTH = 10;

export function statusBar(status: string): string {
  const fills: Record<string, number> = {
    operational: 10,
    degraded: 7,
    partial_outage: 5,
    major_outage: 1,
    maintenance: 10,
    unknown: 0,
  };
  const fill = fills[status] ?? 0;
  const empty = BAR_LENGTH - fill;

  const colorFn: Record<string, (s: string) => string> = {
    operational: chalk.green,
    degraded: chalk.yellow,
    partial_outage: chalk.yellow,
    major_outage: chalk.red,
    maintenance: chalk.blue,
    unknown: chalk.gray,
  };
  const color = colorFn[status] ?? chalk.gray;

  return color("█".repeat(fill)) + chalk.dim("░".repeat(empty));
}

// ── Uptime percentage ──

export function uptimeLabel(status: string): string {
  const map: Record<string, string> = {
    operational: "100%",
    degraded: " 98%",
    partial_outage: " 72%",
    major_outage: "down",
    maintenance: " mnt",
    unknown: "  ? ",
  };
  return map[status] ?? "  ? ";
}
