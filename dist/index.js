#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import chalk from "chalk";
import { dashboardCommand } from "./commands/dashboard.js";
import { serviceCommand } from "./commands/service.js";
import { watchCommand } from "./commands/watch.js";
import { parseCategories, validateCategories, VALID_CATEGORIES } from "./lib/categories.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf8"));
const program = new Command();
program
    .name("netbeep")
    .description("Check live service status from the terminal")
    .version(pkg.version)
    .argument("[services...]", "Service IDs to check (e.g. shopify github)")
    .option("--exit-code", "Exit with non-zero code if any service is degraded or down")
    .option("-d, --detail", "Show detailed card with components and incidents")
    .option("-j, --json", "Output raw JSON")
    .option("-w, --watch [seconds]", "Poll and refresh every N seconds (default: 30)")
    .option("-c, --category <categories>", "Filter by category (comma-separated: cloud,payments,ai)")
    .option("-f, --filter <pattern>", "Filter components within a service (substring match, comma-separated)")
    .addHelpText("after", `
Examples:
  netbeep                                   Full status dashboard
  netbeep aws stripe                        Check specific services
  netbeep aws --detail                      Detailed view with components
  netbeep cloudflare --filter "api,dash"    Filter components within a service
  netbeep -c cloud,payments                 Filter dashboard by category
  netbeep --watch 10                        Live updates every 10s
  netbeep aws --filter lambda --exit-code   Gate deploys on component health
`)
    .action(async (services, opts) => {
    try {
        let categoryFilter;
        if (opts.category) {
            const cats = parseCategories(opts.category);
            const { valid, invalid } = validateCategories(cats);
            if (invalid.length > 0) {
                console.error(chalk.red(`Unknown categories: ${invalid.join(", ")}`));
                console.error(chalk.dim(`Valid categories: ${VALID_CATEGORIES.join(", ")}`));
                process.exit(1);
            }
            if (services.length > 0) {
                console.error(chalk.red("Cannot use --category with explicit service IDs"));
                process.exit(1);
            }
            categoryFilter = valid;
        }
        let componentFilter;
        if (opts.filter) {
            if (services.length === 0) {
                console.error(chalk.red("--filter requires a service ID (e.g. netbeep aws --filter lambda,s3)"));
                process.exit(1);
            }
            componentFilter = opts.filter.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
        }
        if (opts.json) {
            const { jsonCommand } = await import("./commands/json.js");
            await jsonCommand(services, categoryFilter);
        }
        else if (opts.watch !== undefined) {
            const interval = typeof opts.watch === "string" ? parseInt(opts.watch, 10) : 30;
            await watchCommand(services, isNaN(interval) ? 30 : interval, categoryFilter);
        }
        else if (services.length === 0) {
            await dashboardCommand(categoryFilter);
        }
        else {
            await serviceCommand(services, !!opts.exitCode, !!opts.detail || !!componentFilter, componentFilter);
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Could not reach netbeep.com";
        console.error(msg);
        process.exit(3);
    }
});
program.parse();
