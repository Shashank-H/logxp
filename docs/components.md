# Components

Reusable UI components located in `src/components/`. All components are stateless or have minimal local state, focused on presentation, and type-safe.

## Header

**File**: `src/components/Header.tsx`

Displays the application branding with green bold text and emoji. Used across all views for consistent branding.

**Props**: None

## LoadingIndicator

**File**: `src/components/LoadingIndicator.tsx`

Shows loading state while reading from stdin with real-time byte count.

**Props**:
- `bytes` (number): Number of bytes read so far

**Features**:
- Yellow text for visibility
- Real-time byte count display
- Dimmed byte count for visual hierarchy

## OutputDisplay

**File**: `src/components/OutputDisplay.tsx`

Displays formatted output with line numbers, borders, and metadata.

**Props**:
- `lines` (string[]): Array of lines to display
- `totalBytes` (number): Total bytes processed

**Features**:
- Metadata header (line count, byte count)
- Rounded border box
- Line numbers with padding
- Gray separator character
- Scrollable content

## Router

**File**: `src/components/Router.tsx`

Renders the active route component based on current navigation state.

**Props**:
- `routes` (RouteConfig[]): Array of route configurations

**Features**:
- Declarative route configuration
- Automatic route matching
- Type-safe route definitions
- Null safety (returns null if no match)

**How It Works**: Gets current route from router context, finds matching route in configuration, renders the associated component.

## Component Best Practices

1. **Type Safety**: All components have TypeScript interfaces for props
2. **Single Responsibility**: Each component does one thing well
3. **Composition**: Components composed together in views
4. **Ink Components**: Uses Ink's built-in Box and Text components
5. **Styling**: Done through props, not CSS

## Adding New Components

1. Create file in `src/components/`
2. Define TypeScript interface for props
3. Export the component function
4. Use Ink components for UI
5. Import and use in views
