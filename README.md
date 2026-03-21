# netbeep

Check live service status from the terminal. Powered by [netbeep.com](https://netbeep.com).

```
╭──────────────────────────────────────────────────────╮
│ netbeep  ·  status dashboard                         │
│                                                      │
│ 45 services  42 up  3 issues                         │
├──────────────────────────────────────────────────────┤
│ Cloud                                                │
│                                                      │
│ ✓ AWS                ██████████ 100%                 │
│ ✓ Azure              ██████████ 100%                 │
│ ⚠ Google Cloud       ███████░░░  98%                 │
╰──────────────────────────────────────────────────────╯
```

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

Shows a full dashboard of all tracked services grouped by category.

### Check specific services

```bash
netbeep github shopify aws
```

### Detailed view

```bash
netbeep github --detail
```

Shows components and recent incidents for a service.

### Watch mode

```bash
netbeep --watch           # refresh every 30s
netbeep --watch 10        # refresh every 10s
netbeep github --watch    # watch specific services
```

Live-updating view. Press `ctrl+c` to quit.

### JSON output

```bash
netbeep --json
netbeep github shopify --json
```

Pipe-friendly raw JSON for scripting.

### CI/CD exit codes

```bash
netbeep github aws --exit-code
```

Returns a non-zero exit code if any service is degraded or down:

| Code | Meaning |
|------|---------|
| 0 | All operational |
| 1 | Degraded / maintenance |
| 2 | Major outage |
| 3 | Unknown / not found |

## Options

| Flag | Description |
|------|-------------|
| `-d, --detail` | Show detailed card with components and incidents |
| `-j, --json` | Output raw JSON |
| `-w, --watch [seconds]` | Poll and refresh (default: 30s) |
| `--exit-code` | Exit with non-zero if any service has issues |
| `-V, --version` | Show version |
| `-h, --help` | Show help |

## License

MIT
