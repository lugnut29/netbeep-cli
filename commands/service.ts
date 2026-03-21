import chalk from "chalk";
import { fetchStatuses } from "../lib/fetch.js";
import { getFormat } from "../lib/format.js";
import { boxTop, boxBottom, boxDivider, boxLine, statusBar } from "../lib/box.js";
import { createSpinner } from "../lib/spinner.js";

const WIDTH = Math.min(process.stdout.columns || 80, 52);

export async function serviceCommand(serviceIds: string[], useExitCode: boolean, detail: boolean) {
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
      printDetailCard(svc, fmt);
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
  svc: { id: string; name: string; status: string },
  fmt: { symbol: string; color: (s: string) => string },
) {
  const name = (svc.name || svc.id).padEnd(20);
  const bar = statusBar(svc.status);
  const label = svc.status.replace(/_/g, " ");
  console.log(`${fmt.color(fmt.symbol)} ${name} ${bar}  ${fmt.color(label)}`);
}

function printDetailCard(
  svc: {
    id: string;
    name: string;
    status: string;
    description?: string;
    components?: { name: string; status: string }[];
    incidents?: { title: string; status: string; timestamp: number }[];
  },
  fmt: { symbol: string; color: (s: string) => string },
) {
  const label = svc.status.replace(/_/g, " ");

  console.log();
  console.log(boxTop(WIDTH));
  console.log(boxLine(
    `${fmt.color(fmt.symbol)} ${chalk.bold(svc.name || svc.id)}  ${fmt.color(label)}`,
    WIDTH,
  ));

  if (svc.description) {
    console.log(boxLine(chalk.dim(svc.description), WIDTH));
  }

  console.log(boxLine(`  ${statusBar(svc.status)}`, WIDTH));

  if (svc.components && svc.components.length > 0) {
    console.log(boxDivider(WIDTH));
    console.log(boxLine(chalk.dim("Components"), WIDTH));
    for (const comp of svc.components) {
      const cfmt = getFormat(comp.status);
      console.log(boxLine(
        `  ${cfmt.color(cfmt.symbol)} ${comp.name}`,
        WIDTH,
      ));
    }
  }

  if (svc.incidents && svc.incidents.length > 0) {
    console.log(boxDivider(WIDTH));
    console.log(boxLine(chalk.dim("Recent Incidents"), WIDTH));
    for (const inc of svc.incidents.slice(0, 3)) {
      const age = timeSince(inc.timestamp);
      console.log(boxLine(
        `  ${chalk.yellow("›")} ${inc.title}`,
        WIDTH,
      ));
      console.log(boxLine(
        `    ${chalk.dim(inc.status)} ${chalk.dim("·")} ${chalk.dim(age)}`,
        WIDTH,
      ));
    }
  }

  console.log(boxBottom(WIDTH));
}

function timeSince(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
