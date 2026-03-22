# netbeep

Check live service status from the terminal. Powered by [netbeep.com](https://netbeep.com).

```
netbeep  ·  status dashboard
113 services  96 up  17 issues

Cloud
────────────────────────────────────────────
⚠ AWS                ███████░░░  98%
✓ Microsoft Azure    ██████████ 100%
✓ Google Cloud       ██████████ 100%
✓ Vercel             ██████████ 100%
```

Monitors 100+ services across 11 categories: cloud, devtools, ecommerce, payments, AI, comms, social, productivity, security, CDN/DNS, and monitoring.

## Install

```bash
npm install -g netbeep
```

Requires Node.js 18+.

## Usage

### Dashboard

```bash
netbeep
```

Full dashboard of all tracked services grouped by category. Services with issues are sorted to the top.

### Check specific services

```bash
netbeep aws datadog stripe
```

### Detailed view

```bash
netbeep aws --detail
```

```
✓ AWS  operational
  Uptime  ██████████ 99.9%  7d:99.8%
  Resp 86ms  ·  Checked 1m ago

  24h ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ now

  Components
    ✓ EC2
    ✓ S3
    ✓ Lambda

  Recent Incidents
    › Elevated API error rates in us-east-1
      monitoring · 45m ago
```

Shows real-time uptime (24h/7d), response time, component status, 24-hour timeline, and recent incidents. Fields render when the API provides them.

### Filter components

```bash
netbeep cloudflare --filter "api,dash"           # just API and Dashboard components
netbeep aws --filter "us-east,lambda,s3"         # match multiple patterns
netbeep aws --filter lambda --exit-code          # gate deploys on specific components
```

Filter components within a service using substring matching. Automatically enables `--detail`. Multiple patterns can be comma-separated — a component matches if its name contains any of the patterns (case-insensitive).

When your filtered components are healthy but the service has issues elsewhere, the CLI surfaces the affected components so you get the full picture:

```
⚠ Cloudflare  degraded
  Minor Service Outage
  Uptime  ███████░░░  98%
  Checked 15m ago

  Components (6/471 matching)
    ✓ API
    ✓ API Shield
    ✓ Area 1 - API
    ✓ Area 1 - Dash
    ✓ Dashboard
    ✓ Zero Trust Dashboard
  ✓ All 6 matched components operational

  ⚠ 59 other components have issues:
    ⚠ Africa  partial outage
    ⚠ Arica, Chile - (ARI)  partial outage
    ⚠ Algiers, Algeria - (ALG)  partial outage
    ⚠ Asia  partial outage
    ⚠ Europe  partial outage
    Run: netbeep cloudflare --detail
```

### Filter by category

```bash
netbeep --category cloud             # just cloud services
netbeep -c cloud,payments            # multiple categories
netbeep -c ai --json                 # filtered JSON output
netbeep -c cloud --watch 10          # filtered watch mode
```

Filter the dashboard to one or more categories. Valid categories: `cloud`, `devtools`, `ecommerce`, `payments`, `ai`, `communication`, `social`, `productivity`, `security`, `cdn-dns`, `monitoring`.

### Watch mode

```bash
netbeep --watch           # refresh every 30s
netbeep --watch 10        # refresh every 10s
netbeep aws slack --watch # watch specific services
```

Live-updating view. Press `ctrl+c` to quit.

### JSON output

```bash
netbeep --json
netbeep aws stripe --json
```

Pipe-friendly raw JSON for scripting.

### CI/CD exit codes

```bash
netbeep aws azure salesforce --exit-code
```

Returns a non-zero exit code if any service is degraded or down:

| Code | Meaning |
|------|---------|
| 0 | All operational |
| 1 | Degraded / maintenance |
| 2 | Major outage |
| 3 | Unknown / not found |

Useful in CI pipelines to gate deploys on upstream dependency health.

## Options

| Flag | Description |
|------|-------------|
| `-c, --category <categories>` | Filter by category (comma-separated) |
| `-f, --filter <pattern>` | Filter components within a service (substring match, comma-separated) |
| `-d, --detail` | Show detailed card with uptime, response time, components, timeline, and incidents |
| `-j, --json` | Output raw JSON |
| `-w, --watch [seconds]` | Poll and refresh (default: 30s) |
| `--exit-code` | Exit with non-zero if any service has issues |
| `-V, --version` | Show version |
| `-h, --help` | Show help |

## API

The CLI reads from `GET https://netbeep.com/api/status`. No auth required. Supports `?service=aws,stripe` for filtering. Responses may be up to 1 minute old due to edge caching.

## License

MIT
