#!/bin/bash

# =============================================================================
# Automatize monorepo - macOS development environment setup script.
#
# Installs and configures all tools required to develop and run the Automatize
# monorepo on a macOS machine using Homebrew as the system package manager.
#
# Installs: Homebrew, Git, Node.js (latest), pnpm (latest), turbo (latest)
#
# How to run:
#   chmod +x scripts/setup-macos.sh
#   ./scripts/setup-macos.sh
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Colors
# ---------------------------------------------------------------------------
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m'

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

total_steps=9
current_step=0
failures=()

write_step() {
    current_step=$((current_step + 1))
    echo ""
    echo -e "${CYAN}>> Step ${current_step}/${total_steps} - $1${NC}"
}

write_success() {
    echo -e "  ${GREEN}[OK] $1${NC}"
}

write_warn() {
    echo -e "  ${YELLOW}[--] $1${NC}"
}

write_fail() {
    echo -e "  ${RED}[!!] $1${NC}"
}

write_info() {
    echo -e "  ${WHITE}$1${NC}"
}

# ---------------------------------------------------------------------------
# STEP 0: Print banner
# ---------------------------------------------------------------------------

echo ""
echo -e "${CYAN}=======================================================${NC}"
echo -e "${CYAN}  Automatize - macOS Dev Environment Setup${NC}"
echo -e "${CYAN}=======================================================${NC}"
echo ""

# ---------------------------------------------------------------------------
# STEP 1: Install / upgrade Homebrew
# ---------------------------------------------------------------------------

write_step "Homebrew"

if command -v brew &>/dev/null; then
    write_warn "Homebrew already installed - upgrading..."
    brew update && brew upgrade || true
    write_success "Homebrew upgraded."
else
    write_info "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add Homebrew to PATH for Apple Silicon
    if [[ -f /opt/homebrew/bin/brew ]]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> "$HOME/.zprofile"
    fi

    write_success "Homebrew installed."
fi

# ---------------------------------------------------------------------------
# STEP 2: Refresh shell environment
# ---------------------------------------------------------------------------

write_step "Shell environment refresh"

if [[ -f /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
elif [[ -f /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
fi

write_success "Shell environment refreshed."

# ---------------------------------------------------------------------------
# STEP 3: Install / upgrade Git
# ---------------------------------------------------------------------------

write_step "Git"

if command -v git &>/dev/null; then
    git_version=$(git --version)
    write_warn "Git already installed ($git_version) - upgrading..."
    brew upgrade git 2>/dev/null || brew install git
else
    write_info "Running: brew install git"
    brew install git
fi

write_success "Git ready."

# ---------------------------------------------------------------------------
# STEP 4: Configure Git for LF line endings
# ---------------------------------------------------------------------------

write_step "Git configuration (LF line endings)"

git config --global core.autocrlf false
git config --global core.eol lf
write_success "core.autocrlf=false and core.eol=lf set globally."

# ---------------------------------------------------------------------------
# STEP 5: Install / upgrade Node.js (latest)
# ---------------------------------------------------------------------------

write_step "Node.js (latest)"

if command -v node &>/dev/null; then
    node_version=$(node --version)
    write_warn "Node.js already installed ($node_version) - upgrading to latest..."
    brew upgrade node 2>/dev/null || brew install node
else
    write_info "Running: brew install node"
    brew install node
fi

write_success "Node.js ready."

# ---------------------------------------------------------------------------
# STEP 6: Refresh shell so node/npm are available
# ---------------------------------------------------------------------------

write_step "Shell environment refresh (post-Node.js)"

if [[ -f /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
elif [[ -f /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
fi

write_success "Shell environment refreshed."

# ---------------------------------------------------------------------------
# STEP 7: Install / upgrade pnpm (latest)
# ---------------------------------------------------------------------------

write_step "pnpm (latest)"

if command -v pnpm &>/dev/null; then
    pnpm_version=$(pnpm --version)
    write_warn "pnpm already installed ($pnpm_version) - updating to latest..."
else
    write_info "Running: npm install -g pnpm@latest"
fi

npm install -g pnpm@latest
write_success "pnpm ready."

# ---------------------------------------------------------------------------
# STEP 8: Install / upgrade Turbo (latest)
# ---------------------------------------------------------------------------

write_step "Turbo (latest)"

if command -v turbo &>/dev/null; then
    turbo_version=$(turbo --version)
    write_warn "Turbo already installed ($turbo_version) - updating to latest..."
else
    write_info "Running: npm install -g turbo"
fi

npm install -g turbo
write_success "Turbo ready."

# ---------------------------------------------------------------------------
# STEP 9: Validation
# ---------------------------------------------------------------------------

write_step "Validation"

echo ""
echo -e "  ${WHITE}Validation results:${NC}"
echo -e "  ${WHITE}-------------------${NC}"

declare -A tools=(
    ["node"]="Node.js"
    ["npm"]="npm"
    ["pnpm"]="pnpm"
    ["git"]="Git"
    ["turbo"]="Turbo"
)

declare -A version_flags=(
    ["node"]="--version"
    ["npm"]="--version"
    ["pnpm"]="--version"
    ["git"]="--version"
    ["turbo"]="--version"
)

for cmd in node npm pnpm git turbo; do
    label="${tools[$cmd]}"
    flag="${version_flags[$cmd]}"
    if command -v "$cmd" &>/dev/null; then
        version=$("$cmd" "$flag" 2>&1 | head -n1)
        printf "  ${GREEN}[+] %-10s %s${NC}\n" "$label" "$version"
    else
        printf "  ${RED}[x] %-10s NOT FOUND${NC}\n" "$label"
        failures+=("$label")
    fi
done

# ---------------------------------------------------------------------------
# Summary banner
# ---------------------------------------------------------------------------

echo ""
echo -e "${CYAN}=======================================================${NC}"

if [ ${#failures[@]} -gt 0 ]; then
    echo -e "${RED}  Setup completed with errors.${NC}"
    echo ""
    echo -e "${RED}  The following steps failed:${NC}"
    for f in "${failures[@]}"; do
        echo -e "${RED}    - $f${NC}"
    done
    echo ""
    echo -e "${YELLOW}  Please review the output above, fix the issues, and re-run the script.${NC}"
    echo -e "${CYAN}=======================================================${NC}"
    echo ""
    exit 1
else
    echo -e "${GREEN}  All tools installed and verified successfully!${NC}"
    echo ""
    echo -e "${WHITE}  Next steps:${NC}"
    echo -e "${WHITE}    1. Open a NEW terminal (to pick up PATH changes)${NC}"
    echo -e "${WHITE}    2. Navigate to your project root${NC}"
    echo -e "${WHITE}    3. Copy and fill in your environment variables:${NC}"
    echo -e "${WHITE}         cp .env.example .env  (edit with your Supabase credentials)${NC}"
    echo -e "${WHITE}    4. Install dependencies:   pnpm install${NC}"
    echo -e "${WHITE}    5. Start the dev server:   pnpm dev${NC}"
    echo ""
    echo -e "${GREEN}  Happy coding!${NC}"
    echo -e "${CYAN}=======================================================${NC}"
    echo ""
    exit 0
fi
