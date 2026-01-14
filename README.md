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

### Commands

| Key | Action |
|-----|--------|
| `/` | Open command palette |
| `?` | Show help |
| `Space` | Toggle follow mode |
| `Esc` | Go back to home / Clear search |
| `q` | Quit application |
| `Ctrl+H` | Toggle help screen |

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
