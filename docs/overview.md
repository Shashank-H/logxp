# Overview

LogXP CLI is a modern command-line interface demonstrating best practices for building interactive terminal applications using Bun and Ink.

## What is LogXP CLI?

A dual-mode terminal application that can:

1. **Interactive Mode**: Navigate between multiple views using keyboard shortcuts
2. **Piped Input Mode**: Process and display data piped from other commands

## Technology Stack

- **Bun**: JavaScript runtime with built-in TypeScript support and hot reload
- **Ink**: React for interactive command-line apps
- **React**: UI component library (v19)
- **TypeScript**: Type-safe JavaScript with strict mode

## Key Features

### Dual Mode Operation
Automatically detects interactive vs piped input mode based on stdin.

### Client-Side Routing
Navigate between views using keyboard shortcuts (h, i, s, q).

### Rich Terminal UI
- Colored text and emojis
- Bordered boxes with rounded corners
- Line numbers for output
- Loading indicators
- Responsive layouts

### Modular Architecture
- Separation of concerns (components, views, hooks)
- Reusable components
- Custom hooks for business logic
- Type-safe routing system

## Design Principles

1. **Modularity**: Single responsibility per component
2. **Type Safety**: Full TypeScript coverage with strict mode
3. **Reusability**: Components easily reused across views
4. **Performance**: Efficient stdin processing and rendering
5. **User Experience**: Clear navigation and helpful feedback

## Use Cases

- Template for building CLI applications
- Learning resource for Ink and Bun
- Foundation for data processing tools
- Example of React-based terminal UIs
