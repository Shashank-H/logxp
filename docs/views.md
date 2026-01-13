# Views

Screen-level components located in `src/views/`. Views compose multiple components and may contain navigation logic.

## HomeView

**File**: `src/views/HomeView.tsx`  
**Route**: `"home"`

Main landing screen showing welcome message and available navigation options.

**Navigation**:
- Press `i` → Input Mode
- Press `s` → Settings
- Press `q` → Quit

**Features**: Welcome message, navigation instructions, color-coded shortcuts, emoji icons

## WelcomeView (Input Mode)

**File**: `src/views/WelcomeView.tsx`  
**Route**: `"input"`

Explains how to use piped input mode with usage examples.

**Navigation**: Press `h` → Home

**Features**: Explanation of piped input, usage examples, navigation hint

## SettingsView

**File**: `src/views/SettingsView.tsx`  
**Route**: `"settings"`

Displays configuration options (currently static demo).

**Navigation**: Press `h` → Home

**Features**: Settings display, indented list, color-coded values, navigation hint

## InteractiveView

**File**: `src/views/InteractiveView.tsx`

Root view for interactive mode. Sets up routing and keyboard navigation.

**Keyboard Shortcuts**:
- `h` - Home
- `i` - Input Mode
- `s` - Settings
- `q` or `ESC` - Quit

**Features**: Router provider setup, keyboard input handling, route configuration, global navigation

## PipedInputView

**File**: `src/views/PipedInputView.tsx`

Handles display when data is piped into the CLI.

**Props**:
- `isReading` (boolean): Whether still reading stdin
- `inputData` (string[]): Processed lines
- `totalBytes` (number): Total bytes read

**States**:
1. **Reading**: Shows LoadingIndicator with byte count
2. **Done**: Shows OutputDisplay with formatted lines

**Features**: Conditional rendering, loading indicator, formatted output, automatic exit

## View Patterns

1. **Composition**: Views compose components together
2. **Navigation**: Use router hook for navigation
3. **Layout**: Use Box for layout structure
4. **Keyboard Input**: Use useInput hook for interactivity

## Adding New Views

1. Create file in `src/views/`
2. Define the view component
3. Add route to Route type in `useRouter.tsx`
4. Add route to InteractiveView router config
5. Add keyboard shortcut in InteractiveView
6. Update navigation hints in other views
