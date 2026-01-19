# LogXP CLI

A rich CLI log navigator application built with Bun and Ink.

## Must Follow
- use .agents to make notes, todos, save requirements etc anything that can provide any future context to different agents
- look at .agents folder to get an idea of what can be done or what is being done.

## Best Practices
- You must create different files and folders for different components and views
- You must follow standards as per react when creating components and views
- You must use typescript for type safety
- You must use bun for running the application
- You must update the docs folder whenever makes sense.

## IMPORTANT: Help Page Maintenance

**When you create or modify any commands, shortcuts, or features, you MUST update the HelpOverlay component.**

The help page is located at: `src/components/help/HelpOverlay.tsx`

### What to update:
1. **Keyboard shortcuts** - Update the `KEYBOARD SHORTCUTS` section in the `sections` array
2. **Commands** - Commands are auto-loaded from `getAllCommands()`, but ensure your command has:
   - `name`: Command name
   - `description`: Short description
   - `usage`: Usage syntax
   - `examples`: Array of example usages
   - `aliases`: Array of alias names
3. **New features** - Add any new navigation or interaction patterns

### Command definition location:
Commands are defined in `src/core/commands/handlers/` and registered in `src/core/commands/command-registry.ts`

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `Ctrl+H` or `?` | Open help page |
| `q` or `Esc` | Quit / Close overlay |
| `/` | Open command palette |
| `Tab` | Switch focus between logs and details pane |
| `Space` | Toggle follow mode |
| `j` / `Down` | Move down |
| `k` / `Up` | Move up |
| `g` | Go to top |
| `G` | Go to bottom |
| `n` / `.` | Next search match |
| `N` / `p` / `,` | Previous search match |
| `Page Up/Down` | Scroll by page |

## Limitations
- you may not be able to test the application properly as it requires a terminal to run in interactive mode.

### CLI Development with Bun + Ink

1. **Stdin Detection**
   - Check `!process.stdin.isTTY` to detect piped input
   - Use `process.stdin.setEncoding('utf8')` for text input

2. **Ink Rendering**
   - Use `Box` components for layout
   - Use `borderStyle="round"` for bordered boxes
   - Apply colors with the `color` prop on `Text` components

3. **Performance**
   - Buffer stdin data before processing
   - Exit gracefully after processing piped input
   - Use `setTimeout` to allow Ink to render before exiting

4. **User Experience**
   - Show progress indicators for long operations
   - Display metadata (line count, byte size)
   - Use emojis and colors for scannable output

5. **Error Handling**
   - Clean up event listeners in `useEffect` cleanup
   - Handle edge cases (empty input, large files)

## Usage

```bash
# Interactive mode (prompts for command)
bun run src/cli.tsx

# Run with command
bun run src/cli.tsx "tail -f /var/log/app.log"

# Piped input (limited interactivity)
echo "hello" | bun run src/cli.tsx
```

## Project Structure

```
src/
├── cli.tsx                    # Entry point
├── types/                     # TypeScript types
├── config/                    # Configuration
├── core/
│   ├── commands/              # Command system
│   │   ├── handlers/          # Command implementations
│   │   └── command-registry.ts
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
