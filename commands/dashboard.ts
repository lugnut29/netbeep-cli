import chalk from "chalk";
import { fetchStatuses } from "../lib/fetch.js";
import { getFormat } from "../lib/format.js";
import { statusBar, uptimeLabel } from "../lib/box.js";
import { createSpinner } from "../lib/spinner.js";
import { CATEGORY_LABELS, filterByCategories } from "../lib/categories.js";

export async function dashboardCommand(categoryFilter?: string[]) {
  const spinner = createSpinner("loading dashboard...");
  const { services: allServices, updatedAt } = await fetchStatuses();
  spinner.stop();

  const services = categoryFilter ? filterByCategories(allServices, categoryFilter) : allServices;

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
  console.log(chalk.bold("netbeep") + chalk.dim("  ·  status dashboard"));
  console.log(
    chalk.dim(`${entries.length} services  `) +
    chalk.green(`${operational} up`) +
    (issues > 0 ? chalk.red(`  ${issues} issues`) : chalk.dim("  0 issues")),
  );

  // ── Categories ──
  for (const [cat, svcs] of groups) {
    console.log();
    const label = CATEGORY_LABELS[cat] ?? cat.toUpperCase();
    console.log(chalk.bold.white(label));
    console.log(chalk.dim("─".repeat(44)));

    for (const svc of svcs) {
      const fmt = getFormat(svc.status);
      const name = (svc.name || svc.id).padEnd(18).slice(0, 18);
      const bar = statusBar(svc.status, svc.uptime);
      const pct = uptimeLabel(svc.status, svc.uptime);
      console.log(`${fmt.color(fmt.symbol)} ${chalk.white(name)} ${bar} ${pct}`);
    }
  }

  // ── Footer ──
  console.log();
  const ts = new Date(updatedAt).toLocaleTimeString();
  console.log(chalk.dim(`Updated ${ts}`));
  console.log();
}
