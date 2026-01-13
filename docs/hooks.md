# Hooks

Custom React hooks located in `src/hooks/`. Hooks encapsulate business logic and state management.

## useStdinReader

**File**: `src/hooks/useStdinReader.ts`

Handles reading and processing data from stdin when input is piped to the CLI.

**Parameters**:
- `isPiped` (boolean): Whether stdin is being piped

**Returns**:
- `inputData` (string[]): Processed lines from stdin
- `isReading` (boolean): Whether still reading
- `totalBytes` (number): Total bytes read

**How It Works**:
1. Sets stdin encoding to UTF-8
2. Accumulates data in a buffer
3. Tracks byte count in real-time
4. On end, processes buffer (split by newlines, trim, filter empty)
5. Updates state with processed lines
6. Exits after short delay (100ms)

**Features**:
- Real-time byte counting
- Efficient buffering
- Automatic line processing
- Proper event cleanup
- Graceful exit timing

**Edge Cases Handled**:
- Empty input
- Lines with only whitespace
- Large files
- Rapid data streams

## useRouter

**File**: `src/hooks/useRouter.tsx`

Provides routing functionality for navigating between views in interactive mode.

### RouterProvider

Context provider that manages routing state.

**Props**:
- `children` (ReactNode): Components to render
- `initialRoute` (Route): Starting route (default: "home")

### useRouter Hook

Hook to access routing functionality.

**Returns**:
- `currentRoute` (Route): Current active route
- `navigate` (route: Route): Function to change routes

**Route Type**: Union of "home" | "input" | "settings"

**Features**:
- Type-safe route definitions
- Simple navigation API
- Context-based state sharing
- Error handling for misuse
- Configurable initial route

**How It Works**:
1. RouterProvider wraps app with context
2. Components use useRouter hook to access state
3. Call navigate() to change routes
4. Router component re-renders with new view

## Hook Best Practices

1. **Type Safety**: All hooks have full TypeScript types
2. **Cleanup**: Hooks clean up side effects in useEffect return
3. **Conditional Execution**: Hooks can conditionally execute logic
4. **Error Handling**: Hooks validate their usage
5. **Single Responsibility**: Each hook has one clear purpose

## Adding New Routes

1. Update Route type in `useRouter.tsx`
2. Create view component
3. Add to router config in InteractiveView
4. Add keyboard shortcut

## Creating Custom Hooks

1. Create file in `src/hooks/`
2. Define TypeScript interfaces
3. Implement hook logic
4. Export hook function
5. Add cleanup if needed
