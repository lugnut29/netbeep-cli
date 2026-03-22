import chalk from "chalk";

// ── Box-drawing characters ──

export const BOX = {
  tl: "╭", tr: "╮", bl: "╰", br: "╯",
  h: "─", v: "│",
  lT: "├", rT: "┤",
} as const;

export function boxLine(content: string, width: number): string {
  const visWidth = displayWidth(content);
  const maxContent = width - 2;

  if (visWidth <= maxContent) {
    const pad = maxContent - visWidth;
    return `${chalk.dim(BOX.v)} ${content}${" ".repeat(pad)}${chalk.dim(BOX.v)}`;
  }

  // Word-wrap on visible text, then re-style each line
  const visible = stripAnsi(content);
  const indent = visible.length - visible.trimStart().length;
  const prefix = visible.slice(0, indent);
  const words = visible.trimStart().split(" ");
  const wrapped: string[] = [];
  let cur = prefix;

  for (const word of words) {
    const test = cur.length === 0 ? word : cur + " " + word;
    if (displayWidth(test) > maxContent && displayWidth(cur) > displayWidth(prefix)) {
      wrapped.push(cur);
      cur = prefix + word;
    } else {
      cur = test;
    }
  }
  if (cur.length > 0) wrapped.push(cur);

  // Find the style (ANSI codes) at the start of the content and apply to each wrapped line
  const ansiPrefix = content.match(/^(\x1b\[[0-9;]*m)*/)?.[0] ?? "";
  const ansiReset = ansiPrefix ? "\x1b[0m" : "";

  return wrapped.map((line) => {
    const pad = Math.max(0, maxContent - displayWidth(line));
    const styled = ansiPrefix + line + ansiReset;
    return `${chalk.dim(BOX.v)} ${styled}${" ".repeat(pad)}${chalk.dim(BOX.v)}`;
  }).join("\n");
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

// ── Display width ──
// Measures how many terminal columns a string occupies.
// Handles double-width characters (emoji, CJK, misc symbols).

function isDoubleWidth(code: number): boolean {
  // Emoticons / Misc Symbols & Pictographs (actual emoji)
  if (code >= 0x1F300 && code <= 0x1F9FF) return true;
  // CJK Unified Ideographs
  if (code >= 0x4E00 && code <= 0x9FFF) return true;
  // CJK Compatibility Ideographs
  if (code >= 0xF900 && code <= 0xFAFF) return true;
  // Fullwidth Forms
  if (code >= 0xFF01 && code <= 0xFF60) return true;
  return false;
}

export function displayWidth(str: string): number {
  const clean = stripAnsi(str);
  let width = 0;
  for (const ch of clean) {
    const code = ch.codePointAt(0)!;
    width += isDoubleWidth(code) ? 2 : 1;
  }
  return width;
}

// ── Status bar ──

const BAR_LENGTH = 10;

const STATUS_FILLS: Record<string, number> = {
  operational: 10,
  degraded: 7,
  partial_outage: 5,
  major_outage: 1,
  maintenance: 10,
  unknown: 0,
};

const STATUS_COLORS: Record<string, (s: string) => string> = {
  operational: chalk.green,
  degraded: chalk.yellow,
  partial_outage: chalk.yellow,
  major_outage: chalk.red,
  maintenance: chalk.blue,
  unknown: chalk.gray,
};

export function statusBar(status: string, uptime?: { day: number; week: number }): string {
  const fill = uptime != null
    ? Math.round((uptime.day / 100) * BAR_LENGTH)
    : (STATUS_FILLS[status] ?? 0);
  const empty = BAR_LENGTH - fill;
  const color = STATUS_COLORS[status] ?? chalk.gray;

  return color("█".repeat(fill)) + chalk.dim("░".repeat(empty));
}

// ── Uptime percentage ──

const STATUS_UPTIME_FALLBACK: Record<string, string> = {
  operational: "100%",
  degraded: " 98%",
  partial_outage: " 72%",
  major_outage: "down",
  maintenance: " mnt",
  unknown: "  ? ",
};

function uptimeColor(pct: number): (s: string) => string {
  if (pct >= 99.9) return chalk.green;
  if (pct >= 99) return chalk.yellow;
  return chalk.red;
}

export function uptimeLabel(status: string, uptime?: { day: number; week: number }): string {
  if (uptime != null) {
    const color = uptimeColor(uptime.day);
    return color(`${uptime.day.toFixed(1)}%`);
  }
  return STATUS_UPTIME_FALLBACK[status] ?? "  ? ";
}

export function uptimeWeekLabel(uptime?: { day: number; week: number }): string {
  if (uptime == null) return "";
  const color = uptimeColor(uptime.week);
  return chalk.dim("7d:") + color(`${uptime.week.toFixed(1)}%`);
}

// ── Response time ──

export function responseMsLabel(ms?: number): string {
  if (ms == null) return "";
  const color = ms < 200 ? chalk.green : ms < 400 ? chalk.yellow : chalk.red;
  return chalk.dim("Resp: ") + color(`${ms}ms`);
}

// ── Timeline bar (24h, 48 × 30-min buckets) ──

export function timelineBar(timeline?: { status: string; timestamp: number }[]): string {
  if (!timeline || timeline.length === 0) return "";

  const blocks = timeline.map((bucket) => {
    const color = STATUS_COLORS[bucket.status] ?? chalk.gray;
    return color("▓");
  });

  return chalk.dim("24h ") + blocks.join("") + chalk.dim(" now");
}
