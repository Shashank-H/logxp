# LogXP v0.2.0 Release Notes

This release brings an **Environment Variables Viewer**, **installation scripts** for easy setup, and several bug fixes for a smoother experience.

## 🚀 Highlights

- **Environment Variables View**: Quickly inspect all environment variables with `Ctrl+E`
- **One-Line Installation**: Install LogXP with a single curl command
- **Improved Reliability**: Bug fixes for follow mode, shell environment, and bundled builds

## ✨ New Features

### Environment Variables View
- Press `Ctrl+E` to open the environment variables viewer
- Displays all environment variables in a navigable list
- Loads `.env` file from current working directory (if present)
- Standard navigation (j/k, g/G) and search support
- Press `Esc` or `q` to return to main view

### Installation Script
- Quick install via curl:
  ```bash
  curl -fsSL https://raw.githubusercontent.com/Shashank-H/logxp/main/install.sh | sh
  ```
- Automatic platform detection (Linux/macOS/Windows)
- Adds LogXP to PATH automatically
- Supports custom installation directory

### Build Script Improvements
- New `build.sh` script for creating distributable binaries
- Cross-platform build support
- Bundled executable with inlined assets

## 🐛 Bug Fixes

- **Follow Mode**: Fixed scroll not jumping to bottom when follow mode is toggled on
- **Shell Environment**: Commands now properly inherit shell environment variables
- **Bundled Executable**: ASCII art is now inlined for compatibility with compiled binaries
- **Home Screen**: Now displays current working directory in bottom left

## 📝 Documentation

- Comprehensive README with installation instructions
- Usage examples for Docker, Kubernetes, and development servers
- Full keyboard shortcuts reference
- Configuration documentation

## 📊 Changes

**5 commits** | **11 files changed** | **+1,061 / -71 lines**

### Files Added
- `install.sh` - Installation script
- `build.sh` - Build script
- `src/views/EnvView.tsx` - Environment variables view
- `src/core/env-loader.ts` - Environment file loader

### Files Modified
- `src/cli.tsx` - Added Ctrl+E shortcut routing
- `src/views/InteractivePrompt.tsx` - Show cwd, improved navigation
- `src/views/LogViewerView.tsx` - Follow mode fix
- `src/context/LogViewerContext.tsx` - Follow mode scroll fix
- `src/hooks/useCommandStream.ts` - Shell environment inheritance
