import chalk from "chalk";
import { fetchStatuses } from "../lib/fetch.js";
import { getFormat } from "../lib/format.js";
import { statusBar } from "../lib/box.js";

export async function watchCommand(serviceIds: string[], intervalSec: number) {
  const specific = serviceIds.length > 0;

  const render = async () => {
    try {
      const { services, updatedAt } = await fetchStatuses(specific ? serviceIds : undefined);
      const entries = Object.values(services).sort((a, b) => {
        const aOp = a.status === "operational" ? 1 : 0;
        const bOp = b.status === "operational" ? 1 : 0;
        if (aOp !== bOp) return aOp - bOp;
        return a.id.localeCompare(b.id);
      });

      // Clear screen and move cursor to top
      process.stdout.write("\x1b[2J\x1b[H");

      const operational = entries.filter((s) => s.status === "operational").length;
      const issues = entries.length - operational;

      console.log(
        chalk.bold("netbeep") +
        chalk.dim("  ·  watch mode") +
        chalk.dim(`  ·  every ${intervalSec}s`) +
        chalk.dim("  ·  ctrl+c to quit")
      );
      console.log(
        chalk.dim(`${entries.length} services  `) +
        chalk.green(`${operational} up`) +
        (issues > 0 ? chalk.red(`  ${issues} issues`) : chalk.dim("  0 issues"))
      );
      console.log(chalk.dim("─".repeat(52)));

      for (const svc of entries) {
        const fmt = getFormat(svc.status);
        const name = (svc.name || svc.id).padEnd(20);
        const bar = statusBar(svc.status);
        const label = svc.status.replace(/_/g, " ");
        console.log(`${fmt.color(fmt.symbol)} ${name} ${bar}  ${fmt.color(label)}`);
      }

      console.log();
      console.log(chalk.dim(`Updated ${new Date(updatedAt).toLocaleTimeString()}`));
    } catch {
      process.stdout.write("\x1b[2J\x1b[H");
      console.log(chalk.red("Failed to fetch — retrying..."));
    }
  };

  await render();
  setInterval(render, intervalSec * 1000);
}
