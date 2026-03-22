import chalk from "chalk";
import { fetchStatuses, type ServiceStatus } from "../lib/fetch.js";
import { getFormat } from "../lib/format.js";
import { statusBar, uptimeLabel, uptimeWeekLabel, responseMsLabel, timelineBar } from "../lib/box.js";
import { createSpinner } from "../lib/spinner.js";

export async function serviceCommand(serviceIds: string[], useExitCode: boolean, detail: boolean, componentFilter?: string[]) {
  const label = serviceIds.length === 1
    ? `checking ${serviceIds[0]}...`
    : `checking ${serviceIds.length} services...`;
  const spinner = createSpinner(label);
  const { services } = await fetchStatuses(serviceIds);
  spinner.stop();

  let worstExit = 0;

  for (const id of serviceIds) {
    const svc = services[id];
    if (!svc) {
      console.error(chalk.red(`✗ Service not found: ${id}`));
      worstExit = Math.max(worstExit, 3);
      continue;
    }

    const fmt = getFormat(svc.status);

    if (detail) {
      printDetailCard(svc, fmt, componentFilter);
    } else {
      printCompactLine(svc, fmt);
    }

    if (useExitCode) {
      worstExit = Math.max(worstExit, fmt.exit);
    }
  }

  if (useExitCode) process.exit(worstExit);
}

function printCompactLine(
  svc: ServiceStatus,
  fmt: { symbol: string; color: (s: string) => string },
) {
  const name = (svc.name || svc.id).padEnd(20);
  const bar = statusBar(svc.status, svc.uptime);
  const label = svc.status.replace(/_/g, " ");
  console.log(`${fmt.color(fmt.symbol)} ${name} ${bar}  ${fmt.color(label)}`);
}

function printDetailCard(
  svc: ServiceStatus,
  fmt: { symbol: string; color: (s: string) => string },
  componentFilter?: string[],
) {
  const label = svc.status.replace(/_/g, " ");

  console.log();
  console.log(`${fmt.color(fmt.symbol)} ${chalk.bold(svc.name || svc.id)}  ${fmt.color(label)}`);

  if (svc.description) {
    console.log(chalk.dim(`  ${svc.description}`));
  }

  // Uptime bar + percentages
  const weekLabel = uptimeWeekLabel(svc.uptime);
  const uptimeLine = `  ${chalk.dim("Uptime")}  ${statusBar(svc.status, svc.uptime)} ${uptimeLabel(svc.status, svc.uptime)}` +
    (weekLabel ? `  ${weekLabel}` : "");
  console.log(uptimeLine);

  // Response time + last checked on one line
  const parts: string[] = [];
  const respLabel = responseMsLabel(svc.responseMs);
  if (respLabel) parts.push(respLabel);
  if (svc.lastChecked) parts.push(chalk.dim("Checked " + timeSince(svc.lastChecked)));
  if (parts.length > 0) console.log(`  ${parts.join(chalk.dim("  ·  "))}`);

  // Timeline
  const tlBar = timelineBar(svc.timeline);
  if (tlBar) {
    console.log();
    console.log(`  ${tlBar}`);
  }

  if (svc.components && svc.components.length > 0) {
    const comps = componentFilter
      ? svc.components.filter((c) => componentFilter.some((f) => c.name.toLowerCase().includes(f)))
      : svc.components;

    if (comps.length > 0) {
      console.log();
      const heading = componentFilter
        ? chalk.dim(`Components (${comps.length}/${svc.components.length} matching)`)
        : chalk.dim("Components");
      console.log(`  ${heading}`);
      for (const comp of comps) {
        const cfmt = getFormat(comp.status);
        console.log(`    ${cfmt.color(cfmt.symbol)} ${comp.name}`);
      }

      // Summary + show affected components outside the filter
      if (componentFilter) {
        const matchedIssues = comps.filter((c) => c.status !== "operational");
        if (matchedIssues.length === 0) {
          console.log(`  ${chalk.green("✓")} All ${comps.length} matched components operational`);
        } else {
          console.log(`  ${chalk.yellow("⚠")} ${matchedIssues.length} of ${comps.length} matched components have issues`);
        }

        const otherIssues = svc.components.filter(
          (c) => c.status !== "operational" && !comps.includes(c),
        );
        if (otherIssues.length > 0) {
          const MAX_SHOWN = 5;
          console.log();
          console.log(`  ${chalk.yellow("⚠")} ${chalk.dim(`${otherIssues.length} other component${otherIssues.length === 1 ? " has" : "s have"} issues:`)}`);
          for (const comp of otherIssues.slice(0, MAX_SHOWN)) {
            const cfmt = getFormat(comp.status);
            const clabel = comp.status.replace(/_/g, " ");
            console.log(`    ${cfmt.color(cfmt.symbol)} ${comp.name}  ${cfmt.color(clabel)}`);
          }
          if (otherIssues.length > MAX_SHOWN) {
            console.log(chalk.dim(`    Run: netbeep ${svc.id} --detail`));
          }
        }
      }
    } else if (componentFilter) {
      console.log();
      console.log(`  ${chalk.dim("Components")}`);
      console.log(chalk.yellow(`    No components matching: ${componentFilter.join(", ")}`));
    }
  }

  if (svc.incidents && svc.incidents.length > 0) {
    console.log();
    console.log(`  ${chalk.dim("Recent Incidents")}`);
    for (const inc of svc.incidents.slice(0, 3)) {
      const age = timeSince(inc.timestamp);
      console.log(`    ${chalk.yellow("›")} ${inc.title}`);
      console.log(`      ${chalk.dim(inc.status)} ${chalk.dim("·")} ${chalk.dim(age)}`);
    }
  }

  console.log();
}

function timeSince(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
