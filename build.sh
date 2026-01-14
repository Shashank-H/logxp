#!/bin/bash

# Exit on error
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Parse arguments
RELEASE_MODE=false
TARGETS=""

while [ $# -gt 0 ]; do
  case "$1" in
    --release)
      RELEASE_MODE=true
      shift
      ;;
    --target)
      TARGETS="$2"
      shift 2
      ;;
    --all)
      TARGETS="linux-x64 linux-arm64 darwin-x64 darwin-arm64"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Set base directory
if [ "$RELEASE_MODE" = true ]; then
  BASE_DIR="release"
else
  BASE_DIR="dist"
fi

# Read version from package.json
VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)

if [ -z "$VERSION" ]; then
  echo -e "${RED}Error:${NC} Could not read version from package.json"
  exit 1
fi

echo -e "${CYAN}╔═══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}   ${BOLD}LogXP Build System${NC}                   ${CYAN}║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}==>${NC} Building logxp v${VERSION}..."
echo ""

# Create versioned build directory
BUILD_DIR="${BASE_DIR}/v${VERSION}"
mkdir -p "$BUILD_DIR"

# Function to build for a specific target
build_target() {
  local target="$1"
  local outfile="${BUILD_DIR}/logxp-${target}"

  echo -e "${CYAN}==>${NC} Building for ${BOLD}${target}${NC}..."

  if bun build src/cli.tsx --compile --target="bun-${target}" --outfile "$outfile" 2>/dev/null; then
    chmod +x "$outfile"
    echo -e "${GREEN}✓${NC} Built: ${outfile}"
  else
    echo -e "${RED}✗${NC} Failed to build for ${target}"
    return 1
  fi
}

# Build targets
if [ -n "$TARGETS" ]; then
  # Build for specified targets
  for target in $TARGETS; do
    build_target "$target" || true
  done
else
  # Build for current platform only
  echo -e "${CYAN}==>${NC} Compiling for current platform..."
  bun build src/cli.tsx --compile --outfile "${BUILD_DIR}/logxp"
  chmod +x "${BUILD_DIR}/logxp"
  echo -e "${GREEN}✓${NC} Built: ${BUILD_DIR}/logxp"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}   ${BOLD}Build Successful!${NC}                    ${GREEN}║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Version:${NC}  ${VERSION}"
echo -e "  ${BOLD}Output:${NC}   ${BUILD_DIR}/"
echo ""

# List built files
echo -e "  ${BOLD}Files:${NC}"
ls -1 "$BUILD_DIR"/ | while read file; do
  size=$(ls -lh "${BUILD_DIR}/${file}" | awk '{print $5}')
  echo -e "    - ${file} (${size})"
done

echo ""
echo -e "To run: ${CYAN}./${BUILD_DIR}/logxp${NC}"

# Update latest directory
LATEST_DIR="${BASE_DIR}/latest"
echo ""
echo -e "${CYAN}==>${NC} Updating latest directory..."
rm -rf "$LATEST_DIR"
mkdir -p "$LATEST_DIR"
cp -r "$BUILD_DIR"/* "$LATEST_DIR"/
echo -e "${GREEN}✓${NC} Updated: ${LATEST_DIR}/"

# Create version file in latest directory
VERSION_FILE="${LATEST_DIR}/VERSION"
echo "$VERSION" > "$VERSION_FILE"
echo -e "${GREEN}✓${NC} Created: ${VERSION_FILE} (${VERSION})"

# If release mode, show release instructions
if [ "$RELEASE_MODE" = true ]; then
  echo ""
  echo -e "${CYAN}Release Instructions:${NC}"
  echo "  1. Create a git tag: git tag v${VERSION}"
  echo "  2. Push the tag: git push origin v${VERSION}"
  echo "  3. Create a GitHub release with these binaries"
  echo "  4. Latest binaries also available in: ${LATEST_DIR}/"
  echo ""
fi
