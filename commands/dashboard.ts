import chalk from "chalk";
import { fetchStatuses } from "../lib/fetch.js";
import { getFormat } from "../lib/format.js";
import { boxTop, boxBottom, boxDivider, boxLine, statusBar, uptimeLabel, stripAnsi } from "../lib/box.js";
import { createSpinner } from "../lib/spinner.js";

const CATEGORY_LABELS: Record<string, string> = {
  ecommerce: "Ecommerce",
  cloud: "Cloud",
  devtools: "Dev Tools",
  communication: "Comms",
  social: "Social",
  productivity: "Productivity",
  security: "Security",
  "cdn-dns": "CDN / DNS",
  monitoring: "Monitoring",
  payments: "Payments",
  ai: "AI",
};

const WIDTH = Math.min(process.stdout.columns || 80, 56);

export async function dashboardCommand() {
  const spinner = createSpinner("loading dashboard...");
  const { services, updatedAt } = await fetchStatuses();
  spinner.stop();

  const entries = Object.values(services).sort((a, b) => {
    const aOp = a.status === "operational" ? 1 : 0;
    const bOp = b.status === "operational" ? 1 : 0;
    if (aOp !== bOp) return aOp - bOp;
    return a.id.localeCompare(b.id);
  });

  const operational = entries.filter((s) => s.status === "operational").length;
  const issues = entries.length - operational;

  // Group by category
  const groups = new Map<string, typeof entries>();
  for (const svc of entries) {
    const cat = svc.category || "other";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(svc);
  }

  // ── Header ──
  console.log();
  console.log(boxTop(WIDTH));
  console.log(boxLine(
    chalk.bold("netbeep") + chalk.dim("  ·  status dashboard"),
    WIDTH,
  ));
  console.log(boxLine("", WIDTH));

  // Summary line
  const summary =
    chalk.dim(`${entries.length} services  `) +
    chalk.green(`${operational} up`) +
    (issues > 0 ? chalk.red(`  ${issues} issues`) : chalk.dim("  0 issues"));
  console.log(boxLine(summary, WIDTH));

  // ── Categories ──
  for (const [cat, svcs] of groups) {
    console.log(boxDivider(WIDTH));
    const label = CATEGORY_LABELS[cat] ?? cat.toUpperCase();
    console.log(boxLine(chalk.bold.white(label), WIDTH));
    console.log(boxLine("", WIDTH));

    for (const svc of svcs) {
      const fmt = getFormat(svc.status);
      const name = (svc.name || svc.id).padEnd(18).slice(0, 18);
      const bar = statusBar(svc.status);
      const pct = uptimeLabel(svc.status);
      const line = `${fmt.color(fmt.symbol)} ${chalk.white(name)} ${bar} ${chalk.dim(pct)}`;
      console.log(boxLine(line, WIDTH));
    }
  }

  // ── Footer ──
  console.log(boxDivider(WIDTH));
  const ts = new Date(updatedAt).toLocaleTimeString();
  console.log(boxLine(chalk.dim(`Updated ${ts}`), WIDTH));
  console.log(boxBottom(WIDTH));
  console.log();
}
