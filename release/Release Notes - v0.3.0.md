# LogXP v0.3.0 Release Notes

This release focuses on **enhanced usability** with clipboard support, improved sidebar functionality, and a redesigned help system for a more intuitive log viewing experience.

## 🚀 Highlights

- **Clipboard Integration**: Copy selected logs to system clipboard with a single keystroke
- **Fullscreen Details View**: Expand log details to use the entire terminal width
- **Improved Help System**: Redesigned, scrollable help overlay with better organization
- **Enhanced Search UX**: Clearer search behavior with improved navigation feedback

## ✨ New Features

### Clipboard Support
- Press `c` to copy the currently selected log to your system clipboard
- Cross-platform support for macOS (pbcopy), Linux (xclip/xsel), Windows (clip), and WSL (clip.exe)
- Automatic fallback between xclip and xsel on Linux systems
- Visual feedback when copy succeeds or fails

### Fullscreen Details View
- Press `f` to toggle fullscreen mode for the log details sidebar
- Utilizes full terminal width for better readability of long log entries
- Press `f` or `ESC` to exit fullscreen mode
- Distinct visual styling with double borders and magenta color

### Sidebar Improvements
- Better text wrapping for long metadata values
- Improved truncation with ellipsis (`...`) for fields that exceed width
- Raw log content now wraps properly instead of being truncated
- Enhanced visual feedback when sidebar is focused

## 🎨 UI/UX Improvements

### Redesigned Help Overlay
- Reorganized into logical sections: General, Navigation, Sidebar, Search, and Commands
- Cleaner, more scannable layout with better grouping
- Scrollable content that adapts to terminal height
- Improved keyboard shortcut descriptions
- Removed redundant information for better clarity

### Search Enhancements
- Updated search command description to clarify it highlights matches (doesn't filter)
- Improved navigation instructions: use `,`/`.` or `n`/`p` to move between matches
- Clearer feedback messages when initiating searches
- Better user guidance for search workflow

### Command Bar Improvements
- Enhanced command input handling
- Better visual feedback for command execution
- Improved error messaging

## 🐛 Bug Fixes

- **Sidebar Focus**: Fixed Tab key navigation between logs and details pane
- **Text Rendering**: Resolved issues with long metadata values overflowing
- **Search Navigation**: Fixed search match navigation with proper keyboard shortcuts
- **Layout Responsiveness**: Improved terminal resize handling for sidebar and fullscreen views

## 📊 Changes

**1 commit** | **17 files changed** | **+612 / -274 lines**

### Files Added
- `src/utils/clipboard.ts` - Cross-platform clipboard utility

### Files Modified
- `src/components/help/HelpOverlay.tsx` - Redesigned help system
- `src/components/log-display/LogDetailSidebar.tsx` - Fullscreen mode and text wrapping
- `src/components/log-display/LogTable.tsx` - Copy functionality integration
- `src/components/command/CommandBar.tsx` - Enhanced command handling
- `src/components/command/CommandInput.tsx` - Improved input processing
- `src/components/layout/LogViewerLayout.tsx` - Fullscreen layout support
- `src/components/layout/StatusBar.tsx` - Updated status indicators
- `src/context/LogViewerContext.tsx` - State management for new features
- `src/core/commands/handlers/search-commands.ts` - Improved search messaging
- `src/core/commands/handlers/display-commands.ts` - Display command updates
- `src/core/commands/handlers/filter-commands.ts` - Filter refinements
- `src/core/database/log-database.ts` - Database query optimizations
- `src/types/state.ts` - New state types for fullscreen and clipboard
- `src/views/InteractivePrompt.tsx` - Enhanced prompt interactions
- `src/views/LogViewerView.tsx` - Integrated new features into main view
- `CLAUDE.md` - Updated documentation

## 🎯 What's Next

Future releases will focus on:
- Advanced filtering capabilities
- Performance optimizations for large log files
- Custom color themes and configuration
- Export functionality for filtered logs
