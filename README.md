# netbeep

Check live service status from the terminal. Powered by [netbeep.com](https://netbeep.com).

```
╭──────────────────────────────────────────────────────╮
│ netbeep  ·  status dashboard                          │
│                                                       │
│ 100+ services  95 up  3 issues                        │
├──────────────────────────────────────────────────────┤
│ Cloud                                                 │
│                                                       │
│ ✓ AWS                ██████████ 100%                  │
│ ✓ Azure              ██████████ 100%                  │
│ ⚠ Google Cloud       ███████░░░  98%                  │
╰──────────────────────────────────────────────────────╯
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
╭────────────────────────────────────────────────────────╮
│ ✓ AWS  operational                                      │
│   ██████████ 99.9%  7d:99.8%                            │
│   Resp: 86ms                                            │
│   Checked: 1m ago                                       │
│                                                         │
│   24h ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ now  │
├────────────────────────────────────────────────────────┤
│ Components                                              │
│   ✓ EC2                                                 │
│   ✓ S3                                                  │
│   ✓ Lambda                                              │
├────────────────────────────────────────────────────────┤
│ Recent Incidents                                        │
│   › Elevated API error rates in us-east-1               │
│     monitoring · 45m ago                                │
╰────────────────────────────────────────────────────────╯
```

Shows real-time uptime (24h/7d), response time, component status, 24-hour timeline, and recent incidents. Fields render when the API provides them.

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
