# LogXP CLI

A CLI application built with Bun and Ink.

## Must Follow
- use .agents to make notes, todos, save requirements etc anything that can provide any future context to different agents
- look at .agents folder to get an idea of what can be done or what is being done.

## Best Practices
- You must create different files and folders for different components and views 
- You must follow standards as per react when creating components and views 
- You must use typescript for type safety 
- You must use bun for running the application
- You must update the docs folder whenever makes sense.

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
# Interactive mode
bun run cli

# Piped input
echo "hello" | bun run cli
```
