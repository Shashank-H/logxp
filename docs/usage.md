# Usage Guide

## Installation

Navigate to project and run: `bun install`

## Running the CLI

### Interactive Mode
`bun run cli` - Opens interactive mode with navigation

### Piped Input Mode
Pipe data from another command:
- `echo "text" | bun run cli`
- `cat file.txt | bun run cli`
- `ls -la | bun run cli`

### Development Mode
`bun dev` - Runs with hot reload

## Interactive Mode Navigation

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `h` | Home |
| `i` | Input Mode info |
| `s` | Settings |
| `q` or `ESC` | Quit |

### Views

**Home**: Default screen with navigation options  
**Input Mode**: Explains piped input with examples  
**Settings**: Shows configuration options (demo)

## Piped Input Mode

### Process Flow
1. Data piped to CLI
2. Loading indicator while reading
3. Data processed line-by-line
4. Output displayed with formatting
5. Automatic exit

### Output Features
- Line numbers for each line
- Rounded border box
- Metadata (line count, byte size)
- Empty lines filtered out

## Common Use Cases

1. **Log File Viewer**: `cat /var/log/app.log | bun run cli`
2. **Command Output**: `ps aux | bun run cli`
3. **Text Processing**: `grep "error" logs.txt | bun run cli`
4. **Data Preview**: `head -n 20 data.csv | bun run cli`
5. **Interactive**: `bun run cli` then navigate with keys

## Tips

### Combine with Other Tools
Chain commands: `cat file.txt | grep "pattern" | bun run cli`

### Use Aliases
Add to shell config: `alias logxp="bun run /path/to/logxp/src/cli.tsx"`

### Direct Execution
Make executable: `chmod +x src/cli.tsx` then `./src/cli.tsx`

## Troubleshooting

**CLI exits immediately**: Fixed in latest version (stdin properly configured)

**No output in piped mode**: Ensure data is being piped correctly

**Keyboard not responding**: Make sure running in proper terminal (not piped)

**TypeScript errors**: Bun handles TypeScript automatically

## Requirements

- Bun (latest version)
- Modern terminal with ANSI color support
- Linux, macOS, or Windows with proper terminal

## Terminal Compatibility

**Works with**: iTerm2, Terminal.app, GNOME Terminal, Windows Terminal, VS Code terminal

**May have issues**: Very old terminals, terminals with limited color support

## Scripts

- `bun run cli` - Run the CLI
- `bun dev` - Run with hot reload
- `bun start` - Alias for 'cli'
