# Architecture

## High-Level Architecture

The application follows a component-based architecture with clear separation between entry point, views, components, and hooks.

**Flow**: Entry Point → Mode Detection → Interactive View (with Router) OR Piped Input View

## Directory Structure

```
src/
├── cli.tsx                 # Entry point - mode detection & rendering
├── components/             # Reusable UI components
│   ├── Header.tsx
│   ├── LoadingIndicator.tsx
│   ├── OutputDisplay.tsx
│   └── Router.tsx
├── views/                  # Screen-level components
│   ├── HomeView.tsx
│   ├── InteractiveView.tsx
│   ├── PipedInputView.tsx
│   ├── SettingsView.tsx
│   └── WelcomeView.tsx
└── hooks/                  # Custom React hooks
    ├── useRouter.tsx
    └── useStdinReader.ts
```

## Component Hierarchy

### Interactive Mode
```
CliApp
└── InteractiveView
    └── RouterProvider
        └── InteractiveContent
            ├── Header
            └── Router
                ├── HomeView
                ├── WelcomeView
                └── SettingsView
```

### Piped Input Mode
```
CliApp
└── PipedInputView
    ├── Header
    ├── LoadingIndicator (while reading)
    └── OutputDisplay (after reading)
```

## Data Flow

### Interactive Mode
1. User runs CLI
2. Detects TTY (interactive mode)
3. Renders InteractiveView with RouterProvider
4. Captures keyboard input via useInput hook
5. Navigate function updates route state
6. Router re-renders with new view

### Piped Input Mode
1. Data piped to CLI
2. Detects non-TTY (piped mode)
3. Renders PipedInputView
4. useStdinReader hook activates
5. Accumulates data in buffer
6. Processes buffer into lines on end
7. Renders OutputDisplay
8. Exits after rendering

## State Management

### Router State
- Managed by RouterProvider context
- Current route and navigate function

### Stdin Reader State
- Managed by useStdinReader hook
- Input data, reading status, byte count

## Key Design Decisions

### 1. Separation of Concerns
- **Components**: Pure UI, no business logic
- **Views**: Compose components, minimal logic
- **Hooks**: Encapsulate business logic and state

### 2. Context-Based Routing
- Lightweight and simple
- Full control over navigation
- Type-safe with TypeScript

### 3. Conditional Rendering
- Mode determined at startup
- Different component trees for each mode
- Clear separation between modes

### 4. Hook-Based Logic
- Business logic in custom hooks
- Keeps components clean and testable

## Performance Considerations

1. **Buffering**: Stdin data buffered before processing
2. **Efficient Rendering**: Ink only re-renders changed components
3. **Exit Timing**: Short delay allows final render
4. **Event Cleanup**: All listeners properly cleaned up

## Extensibility

Easy to:
- Add new views (create component, add to router)
- Add new components (create in /components)
- Add new hooks (create in /hooks)
- Add new routes (update Route type, router config)
