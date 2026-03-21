#!/usr/bin/env node
import { Command } from "commander";
import { dashboardCommand } from "./commands/dashboard.js";
import { serviceCommand } from "./commands/service.js";
import { watchCommand } from "./commands/watch.js";
const program = new Command();
program
    .name("netbeep")
    .description("Check live service status from the terminal")
    .version("1.1.5")
    .argument("[services...]", "Service IDs to check (e.g. shopify github)")
    .option("--exit-code", "Exit with non-zero code if any service is degraded or down")
    .option("-d, --detail", "Show detailed card with components and incidents")
    .option("-j, --json", "Output raw JSON")
    .option("-w, --watch [seconds]", "Poll and refresh every N seconds (default: 30)")
    .action(async (services, opts) => {
    try {
        if (opts.json) {
            const { jsonCommand } = await import("./commands/json.js");
            await jsonCommand(services);
        }
        else if (opts.watch !== undefined) {
            const interval = typeof opts.watch === "string" ? parseInt(opts.watch, 10) : 30;
            await watchCommand(services, isNaN(interval) ? 30 : interval);
        }
        else if (services.length === 0) {
            await dashboardCommand();
        }
        else {
            await serviceCommand(services, !!opts.exitCode, !!opts.detail);
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Could not reach netbeep.com";
        console.error(msg);
        process.exit(3);
    }
});
program.parse();
