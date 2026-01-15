# LogXP

A rich CLI log navigator built with Bun and Ink. View, search, and filter logs from any command in a beautiful terminal UI.

```
█████                         █████ █████ ███████████
░░███                         ░░███ ░░███ ░░███░░░░░███
░███         ██████   ███████ ░░███ ███   ░███    ░███
░███        ███░░███ ███░░███  ░░█████    ░██████████
░███       ░███ ░███░███ ░███   ███░███   ░███░░░░░░
░███      █░███ ░███░███ ░███  ███ ░░███  ░███
███████████░░██████ ░░███████ █████ █████ █████
░░░░░░░░░░░  ░░░░░░   ░░░░░███░░░░░ ░░░░░ ░░░░░
                      ███ ░███
                    ░░██████
                      ░░░░░░
```

## Features

- **Real-time log streaming** - Watch logs as they come in with follow mode
- **Powerful search & filtering** - Filter logs by level, keyword, or regex
- **JSON log parsing** - Automatic detection and pretty-printing of JSON logs
- **Keyboard-driven UI** - Vim-style navigation (j/k, g/G, etc.)
- **Command history** - Recall previous commands with up/down arrows
- **Detail panel** - View full log details in a side panel
- **Environment variables viewer** - Inspect env vars with Ctrl+E, loads `.env` files
- **SQLite-backed storage** - Efficient handling of large log volumes
- **Cross-platform** - Works on Linux, macOS, and Windows

## Installation

### Quick Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/Shashank-H/logxp/main/install.sh | sh
```


### From Source

Requires [Bun](https://bun.sh) v1.0 or later.

```bash
git clone https://github.com/Shashank-H/logxp.git
cd logxp
bun install
bun run build
./dist/latest/logxp
```

## Usage

### Interactive Mode

Simply run `logxp` without arguments to enter interactive mode:

```bash
logxp
```

You'll be prompted to enter a command. Use up/down arrows to recall previous commands.

### Command Mode

Pass the command directly as an argument:

```bash
logxp "tail -f /var/log/app.log"
logxp "docker logs -f my-container"
logxp "kubectl logs -f pod-name"
logxp "npm run dev"
```

### Piped Mode

Pipe logs directly into logxp:

```bash
tail -f /var/log/syslog | logxp
docker logs -f container | logxp
kubectl logs -f pod | logxp
```

## Keyboard Shortcuts

### Navigation

| Key | Action |
|-----|--------|
| `j` / `↓` | Move down |
| `k` / `↑` | Move up |
| `g` | Go to top |
| `G` | Go to bottom |
| `Page Up` | Scroll up one page |
| `Page Down` | Scroll down one page |
| `Tab` | Switch focus between logs and details pane |

### Commands & Views

| Key | Action |
|-----|--------|
| `/` | Open command palette |
| `?` | Show help |
| `Space` | Toggle follow mode |
| `Ctrl+E` | Open environment variables viewer |
| `Ctrl+H` | Toggle help screen |
| `Esc` | Go back to home / Close overlay |
| `q` | Quit application |

### Search Navigation

| Key | Action |
|-----|--------|
| `n` | Next search match |
| `N` / `p` | Previous search match |

## Commands

Type `/` to open the command palette, then enter a command:

| Command | Description |
|---------|-------------|
| `/search <term>` | Search logs for a term |
| `/filter <keyword>` | Filter logs by keyword |
| `/filter level:<level>` | Filter by log level (error, warn, info, debug) |
| `/clear` | Clear all logs |
| `/clearfilter` | Clear all filters |
| `/clearsearch` | Clear search |
| `/follow` | Enable follow mode |
| `/nofollow` | Disable follow mode |
| `/sort <field>` | Sort by timestamp or level |
| `/help` | Show help |
| `/quit` | Quit application |

## Examples

### Watching Application Logs

```bash
logxp "tail -f /var/log/app.log"
```

### Docker Container Logs

```bash
logxp "docker logs -f my-app --tail 1000"
```

### Kubernetes Pod Logs

```bash
logxp "kubectl logs -f deployment/my-app -n production"
```

### Development Server

```bash
logxp "npm run dev"
# or
logxp "bun run dev"
```

### Filtering JSON Logs

LogXP automatically detects and parses JSON logs, extracting fields like `level`, `message`, `timestamp`, etc.

```bash
logxp "docker logs -f my-app"
# Then use: /filter level:error
```

## User Guide

### Getting Started

1. **Launch LogXP** - Run `logxp` in your terminal
2. **Enter a command** - Type the command you want to monitor (e.g., `docker logs -f my-app`)
3. **Navigate logs** - Use `j`/`k` to move up/down, `g`/`G` to jump to top/bottom
4. **Search** - Press `/` and type `search <term>` to find specific logs
5. **Filter** - Use `/filter level:error` to show only errors

### Working with the Log Viewer

**Follow Mode**: Press `Space` to toggle follow mode. When enabled, the view automatically scrolls to show new logs as they arrive.

**Detail Panel**: Press `Tab` to switch focus to the detail panel on the right. This shows the full content of the selected log entry, including all JSON fields.

**Search Navigation**: After searching, use `n` to jump to the next match and `N` or `p` to go to the previous match. Matches are highlighted in the log list.

### Environment Variables Viewer

Press `Ctrl+E` to open the environment variables viewer. This displays:
- All current shell environment variables
- Variables loaded from `.env` file in the current directory

Use `j`/`k` to navigate and `Esc` to return to the main view.

### Tips & Tricks

- **Large log volumes**: LogXP uses SQLite for storage, so it handles large volumes efficiently without consuming excessive memory
- **JSON logs**: If your application outputs JSON logs, LogXP automatically parses and formats them for easy reading
- **Command history**: Use `↑`/`↓` arrows on the home screen to recall previous commands
- **Quick exit**: Press `Esc` to go back to the home screen, then `q` to quit

## Configuration

LogXP stores configuration and history in `~/.logxp/`:

```
~/.logxp/
├── shell_history    # Command history
└── config.yaml      # Configuration (optional)
```

## Building from Source

```bash
# Install dependencies
bun install

# Build for current platform
bun run build

# Build for all platforms (release)
bun run release
# or
./build.sh --release --all
```

## Project Structure

```
src/
├── cli.tsx                    # Entry point
├── types/                     # TypeScript types
├── config/                    # Configuration
├── core/
│   ├── commands/              # Command system
│   ├── database/              # SQLite storage
│   ├── history/               # Command history
│   ├── parser/                # Log parsing
│   └── buffer/                # Circular buffer
├── hooks/                     # React hooks
├── context/                   # React contexts
├── components/
│   ├── layout/                # Layout components
│   ├── log-display/           # Log table, sidebar
│   ├── command/               # Command bar, input
│   └── help/                  # Help overlay
└── views/                     # Main views
```

## Requirements

- **Runtime**: None (standalone binary)
- **Build**: [Bun](https://bun.sh) v1.0+
- **OS**: Linux, macOS, Windows
- **Terminal**: Any terminal with ANSI support

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
