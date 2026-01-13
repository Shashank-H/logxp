# Router System

The routing system enables navigation between different views in interactive mode using React Context.

## Overview

Built using React Context, provides a simple, type-safe API for navigation.

## Core Components

### 1. Route Type Definition
Union type defining all available routes: "home" | "input" | "settings"

### 2. RouterProvider
Context provider that wraps the application and manages routing state.

**Props**:
- `children`: React components
- `initialRoute`: Starting route (default: "home")

### 3. useRouter Hook
Hook to access routing functionality.

**Returns**:
- `currentRoute`: Current active route
- `navigate(route)`: Function to change routes

### 4. Router Component
Renders the component for the active route based on route configuration.

**Props**:
- `routes`: Array of route configurations (path + component)

## How It Works

1. Wrap app in RouterProvider
2. Define routes in Router component
3. Use navigate() from useRouter to change routes
4. Keyboard input triggers navigation

## Data Flow

```
User presses key
    ↓
useInput captures input
    ↓
navigate(route) called
    ↓
RouterProvider updates state
    ↓
Router re-renders
    ↓
Renders new view component
```

## Keyboard Navigation

Navigation triggered by keyboard shortcuts:
- `h` → Home
- `i` → Input Mode
- `s` → Settings
- `q` → Quit

## Adding New Routes

1. Update Route type in `useRouter.tsx`
2. Create view component in `src/views/`
3. Add to router config in InteractiveView
4. Add keyboard shortcut in useInput handler
5. Update navigation hints in other views

## Router Features

### Type Safety
TypeScript ensures only defined routes can be navigated to.

### Error Handling
Throws error if useRouter used outside RouterProvider.

### Null Safety
Router returns null if no matching route found.

## Best Practices

1. **Centralize Routes**: Keep all routes in Route type
2. **Consistent Naming**: Use lowercase, descriptive names
3. **Single Router**: One Router component per app
4. **Navigation Hints**: Always show users how to navigate
5. **Initial Route**: Set sensible default

## Comparison with Web Routers

**Similarities**:
- Route-based navigation
- Declarative configuration
- Context-based state

**Differences**:
- No URL/history (CLI has no URLs)
- Keyboard-based instead of links
- Simpler (no nested routes, params)
- Synchronous navigation

## Advanced Usage

- Programmatic navigation based on conditions
- Current route checking for conditional rendering
- Navigation guards to prevent navigation under certain conditions
