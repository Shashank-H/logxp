# LogXP Usage Guide

LogXP is a rich CLI log navigator that accepts continuous stdout streams and presents them in a formatted, color-coded interface with interactive filtering, searching, and sorting.

## Installation

Navigate to project and run: `bun install`

## Quick Start

```bash
# Pipe any log output to logxp
your-app | bun run cli

# Tail a log file
tail -f /var/log/app.log | bun run cli

# Docker container logs
docker logs -f container_name | bun run cli

# Using the binary directly
echo '{"level":"info","message":"hello"}' | logxp
```

## Log Format Support

### JSON Logs
LogXP automatically detects and parses JSON logs:

```json
{"level": "info", "message": "Server started", "port": 3000}
{"severity": "error", "msg": "Connection failed", "retry": 3}
```

Supported level fields: `level`, `severity`, `loglevel`, `log_level`, `lvl`
Supported message fields: `message`, `msg`, `text`, `content`, `body`
Supported timestamp fields: `timestamp`, `time`, `ts`, `datetime`, `date`

### Plain Text Logs
Plain text logs are color-coded based on keyword detection:

```
[ERROR] Something went wrong
WARN: Configuration missing
INFO: Application started
DEBUG: Processing request
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` / `k` | Scroll up one line |
| `↓` / `j` | Scroll down one line |
| `PgUp` | Scroll up one page |
| `PgDn` | Scroll down one page |
| `g` | Jump to top |
| `G` | Jump to bottom |
| `Space` | Toggle follow mode |
| `n` | Next search match |
| `N` / `p` | Previous search match |
| `/` | Enter command mode |
| `q` / `Esc` | Quit |

## Slash Commands

### Filtering
```
/filter error           # Filter logs containing "error"
/filter level:error     # Filter by log level
/filter level:warn      # Show only warnings
/clear-filter           # Remove all filters
```

Multiple filters can be applied (AND logic).

### Searching
```
/search timeout         # Search and highlight "timeout"
/n                      # Jump to next match
/p                      # Jump to previous match
/clear-search           # Clear search highlighting
```

### Sorting
```
/sort timestamp         # Sort by timestamp
/sort level            # Sort by severity (errors first)
/sort default          # Return to chronological order
```

### Display Control
```
/follow                # Enable auto-scroll
/nofollow              # Disable auto-scroll
/clear                 # Clear log buffer
/help                  # Show available commands
/quit                  # Exit application
```

## Color Scheme

| Level | Color |
|-------|-------|
| ERROR/FATAL | Red |
| WARN/WARNING | Yellow |
| INFO | Blue |
| DEBUG | Gray |
| TRACE | Dim Gray |

JSON syntax highlighting:
- Keys: Cyan
- Strings: Green
- Numbers: Magenta
- Booleans: Yellow
- Null: Gray

## Configuration

Create a `.logxp.yaml` file in your project directory or `~/.config/logxp/config.yaml`:

```yaml
colors:
  error: red
  warn: yellow
  info: blue
  debug: gray

patterns:
  error:
    - error
    - fatal
    - exception
  warn:
    - warn
    - warning

defaults:
  followMode: true
  bufferSize: 10000
```

See `.logxp.example.yaml` for a complete configuration template.

## Status Bar

The status bar at the bottom shows:
- Active filters (if any)
- Active search term and match count
- Total log count (filtered/total if filtered)
- Current scroll position
- FOLLOW mode indicator
- STREAMING indicator (when receiving input)

## Common Use Cases

1. **Application Logs**: `node app.js | bun run cli`
2. **Docker Logs**: `docker logs -f my-container | bun run cli`
3. **System Logs**: `tail -f /var/log/syslog | bun run cli`
4. **Combined Logs**: `cat access.log error.log | bun run cli`
5. **Filtered Logs**: `grep -v DEBUG app.log | bun run cli`

## Tips

1. **Large log volumes**: The buffer is limited to 10,000 logs by default. Oldest logs are automatically removed.

2. **Finding errors**: Use `/filter level:error` to quickly isolate errors.

3. **Continuous monitoring**: Leave follow mode on (`Space` to toggle) to see new logs as they arrive.

4. **Searching patterns**: Use `/search` to highlight and navigate between occurrences.

5. **Performance**: The app batches log processing for smooth rendering even with high-volume input.

## Troubleshooting

**No input displayed**: Ensure data is being piped correctly (`echo "test" | bun run cli`)

**Keyboard not working**: Keyboard input is disabled in piped mode (this is normal)

**Colors not showing**: Ensure your terminal supports ANSI colors

**Performance issues**: Try increasing buffer size or filtering unwanted logs

## Scripts

- `bun run cli` - Run the log viewer
- `bun run dev` - Run with hot reload
- `bun start` - Alias for 'cli'

## Requirements

- Bun (latest version)
- Modern terminal with ANSI color support
- Linux, macOS, or Windows with proper terminal

## Terminal Compatibility

**Works with**: iTerm2, Terminal.app, GNOME Terminal, Windows Terminal, VS Code terminal

**May have issues**: Very old terminals, terminals with limited color support
