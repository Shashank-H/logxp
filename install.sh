#!/bin/sh
# LogXP CLI Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/Shashank-H/logxp/main/install.sh | sh
#
# This script installs the latest version of logxp CLI.
# It detects your OS and architecture, downloads the appropriate binary,
# and installs it to /usr/local/bin (or ~/.local/bin if no sudo access).

set -e

# Configuration
REPO="Shashank-H/logxp"
BINARY_NAME="logxp"
GITHUB_API="https://api.github.com/repos/${REPO}/releases/latest"
GITHUB_RELEASES="https://github.com/${REPO}/releases/download"

# Colors (disabled if not a terminal)
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  CYAN='\033[0;36m'
  BOLD='\033[1m'
  NC='\033[0m' # No Color
else
  RED=''
  GREEN=''
  YELLOW=''
  CYAN=''
  BOLD=''
  NC=''
fi

# Helper functions
info() {
  printf "${CYAN}==>${NC} ${BOLD}%s${NC}\n" "$1"
}

success() {
  printf "${GREEN}✓${NC} %s\n" "$1"
}

warn() {
  printf "${YELLOW}⚠${NC} %s\n" "$1"
}

error() {
  printf "${RED}✗${NC} %s\n" "$1" >&2
  exit 1
}

# Detect OS
detect_os() {
  OS="$(uname -s)"
  case "$OS" in
    Linux*)  OS="linux" ;;
    Darwin*) OS="darwin" ;;
    MINGW*|MSYS*|CYGWIN*) OS="windows" ;;
    *)       error "Unsupported operating system: $OS" ;;
  esac
  echo "$OS"
}

# Detect architecture
detect_arch() {
  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64|amd64)  ARCH="x64" ;;
    aarch64|arm64) ARCH="arm64" ;;
    armv7l)        ARCH="arm" ;;
    *)             error "Unsupported architecture: $ARCH" ;;
  esac
  echo "$ARCH"
}

# Compare versions (returns 0 if $1 >= $2)
version_gte() {
  # Remove 'v' prefix if present
  v1=$(echo "$1" | sed 's/^v//')
  v2=$(echo "$2" | sed 's/^v//')

  # Compare using sort -V if available, otherwise simple string compare
  if command -v sort >/dev/null 2>&1 && sort --version-sort /dev/null 2>/dev/null; then
    [ "$(printf '%s\n%s' "$v1" "$v2" | sort -V | tail -n1)" = "$v1" ]
  else
    # Fallback: split and compare parts
    IFS='.' read -r v1_major v1_minor v1_patch <<EOF
$v1
EOF
    IFS='.' read -r v2_major v2_minor v2_patch <<EOF
$v2
EOF
    v1_major=${v1_major:-0}
    v1_minor=${v1_minor:-0}
    v1_patch=${v1_patch:-0}
    v2_major=${v2_major:-0}
    v2_minor=${v2_minor:-0}
    v2_patch=${v2_patch:-0}

    [ "$v1_major" -gt "$v2_major" ] || \
    { [ "$v1_major" -eq "$v2_major" ] && [ "$v1_minor" -gt "$v2_minor" ]; } || \
    { [ "$v1_major" -eq "$v2_major" ] && [ "$v1_minor" -eq "$v2_minor" ] && [ "$v1_patch" -ge "$v2_patch" ]; }
  fi
}

# Get installed version
get_installed_version() {
  if command -v "$BINARY_NAME" >/dev/null 2>&1; then
    # Try to get version from the binary
    installed_version=$("$BINARY_NAME" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1) || true
    echo "$installed_version"
  fi
}

# Get latest version from GitHub
get_latest_version() {
  if command -v curl >/dev/null 2>&1; then
    version=$(curl -fsSL "$GITHUB_API" 2>/dev/null | grep '"tag_name"' | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/')
  elif command -v wget >/dev/null 2>&1; then
    version=$(wget -qO- "$GITHUB_API" 2>/dev/null | grep '"tag_name"' | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/')
  else
    error "Neither curl nor wget found. Please install one of them."
  fi

  if [ -z "$version" ]; then
    error "Failed to fetch latest version from GitHub"
  fi

  echo "$version"
}

# Download file
download() {
  url="$1"
  output="$2"

  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$output"
  elif command -v wget >/dev/null 2>&1; then
    wget -q "$url" -O "$output"
  else
    error "Neither curl nor wget found. Please install one of them."
  fi
}

# Determine install directory
get_install_dir() {
  # Check if we have write access to /usr/local/bin
  if [ -w "/usr/local/bin" ]; then
    echo "/usr/local/bin"
  elif [ -n "$SUDO_USER" ] || command -v sudo >/dev/null 2>&1; then
    # We can try sudo
    echo "/usr/local/bin"
  else
    # Fall back to user directory
    mkdir -p "$HOME/.local/bin"
    echo "$HOME/.local/bin"
  fi
}

# Main installation function
main() {
  printf "\n"
  printf "${CYAN}╔═══════════════════════════════════════╗${NC}\n"
  printf "${CYAN}║${NC}   ${BOLD}LogXP CLI Installer${NC}                 ${CYAN}║${NC}\n"
  printf "${CYAN}║${NC}   Rich CLI Log Navigator              ${CYAN}║${NC}\n"
  printf "${CYAN}╚═══════════════════════════════════════╝${NC}\n"
  printf "\n"

  # Detect system
  info "Detecting system..."
  OS=$(detect_os)
  ARCH=$(detect_arch)
  success "OS: $OS, Arch: $ARCH"

  # Get versions
  info "Checking versions..."
  LATEST_VERSION=$(get_latest_version)
  INSTALLED_VERSION=$(get_installed_version)

  success "Latest version: $LATEST_VERSION"

  if [ -n "$INSTALLED_VERSION" ]; then
    info "Installed version: $INSTALLED_VERSION"

    if version_gte "$INSTALLED_VERSION" "$LATEST_VERSION"; then
      success "You already have the latest version installed!"
      printf "\n"
      exit 0
    else
      warn "Newer version available, upgrading..."
    fi
  else
    info "No existing installation found"
  fi

  # Determine install location
  INSTALL_DIR=$(get_install_dir)
  INSTALL_PATH="${INSTALL_DIR}/${BINARY_NAME}"

  # Build download URL
  # Expected format: logxp-{os}-{arch}
  ASSET_NAME="${BINARY_NAME}-${OS}-${ARCH}"
  if [ "$OS" = "windows" ]; then
    ASSET_NAME="${ASSET_NAME}.exe"
  fi
  DOWNLOAD_URL="${GITHUB_RELEASES}/${LATEST_VERSION}/${ASSET_NAME}"

  # Create temp directory
  TMP_DIR=$(mktemp -d)
  TMP_FILE="${TMP_DIR}/${BINARY_NAME}"
  trap 'rm -rf "$TMP_DIR"' EXIT

  # Download
  info "Downloading ${ASSET_NAME}..."
  if ! download "$DOWNLOAD_URL" "$TMP_FILE" 2>/dev/null; then
    error "Failed to download from: $DOWNLOAD_URL

Make sure the release exists and includes binaries for your platform.
You may need to build from source: https://github.com/${REPO}"
  fi
  success "Downloaded successfully"

  # Make executable
  chmod +x "$TMP_FILE"

  # Install
  info "Installing to ${INSTALL_PATH}..."
  if [ "$INSTALL_DIR" = "/usr/local/bin" ] && [ ! -w "$INSTALL_DIR" ]; then
    sudo mv "$TMP_FILE" "$INSTALL_PATH"
    sudo chmod +x "$INSTALL_PATH"
  else
    mv "$TMP_FILE" "$INSTALL_PATH"
    chmod +x "$INSTALL_PATH"
  fi
  success "Installed successfully"

  # Verify installation
  if command -v "$BINARY_NAME" >/dev/null 2>&1; then
    success "logxp is ready to use!"
  else
    warn "logxp installed but may not be in your PATH"
    if [ "$INSTALL_DIR" = "$HOME/.local/bin" ]; then
      printf "\n"
      printf "Add this to your shell profile (.bashrc, .zshrc, etc.):\n"
      printf "  ${CYAN}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}\n"
    fi
  fi

  printf "\n"
  printf "${GREEN}Installation complete!${NC}\n"
  printf "\n"
  printf "Run ${CYAN}logxp${NC} to get started, or ${CYAN}logxp --help${NC} for usage.\n"
  printf "\n"
}

# Run main
main "$@"
