# LogXP v0.1.0 Release Notes

We are excited to announce the first release of **LogXP**, a modern, high-performance CLI log navigator built with [Bun](https://bun.sh) and [Ink](https://github.com/vadimdemedes/ink).

## 🚀 Highlights

- **Dual-Mode Operation**: Seamlessly switch between Interactive Mode (keyboard navigation) and Piped Input Mode.
- **High Performance**: Powered by Bun and a localized SQLite backend for efficient log storage and querying.
- **Rich Visualization**: Beautiful ANSI color support, JSON syntax highlighting, and responsive table views.

## ✨ Key Features

### Log Viewing & Navigation
- **Universal Input**: Pipe data from any source (`docker logs`, `tail -f`, `cat`, etc.) or run commands directly.
- **Vim-style Navigation**: Navigate logs using `j`/`k` (lines), `g`/`G` (top/bottom), `Ctrl+u`/`Ctrl+d` (pages).
- **Smart Parsing**: Automatic detection and formatting for JSON logs and standard text log levels.
- **Follow Mode**: Auto-scroll to the latest logs (toggle with `Space` or `/follow`).

### Search & Filtering
- **Powerful Filtering**: Filter by log level (`/filter level:error`) or text content (`/filter text`).
- **Deep Search**: Interactive search with highlighting (`/search query`) and navigation (`n`/`N`).
- **Slash Commands**: Control the interface using intuitive commands like `/sort`, `/clear`, and `/help`.

### Architecture & Performance
- **SQLite Engine**: Logs are persisted in a temporary, session-scoped SQLite database, ensuring low memory footprint even with large log volumes.
- **Optimized Rendering**: Ink-based UI renders only changes, maintaining high frame rates.
- **Structured Data**: JSON logs are parsed into structured objects, enabling field-specific display and querying.

### Configuration
- **Customizable**: Full control over colors, log patterns, and keybindings via `.logxp.yaml`.
- **Defaults**: Sensible out-of-the-box defaults for immediate productivity.
