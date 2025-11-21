#!/bin/bash

#
# macOS Desktop Settings Manager
# Configures macOS settings for improved performance
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="$HOME/.macos-settings-backup"
CONFIG_FILE="${CONFIG_FILE:-./settings.conf}"

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_macos() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "This script is designed for macOS only."
        exit 1
    fi
}

backup_settings() {
    print_info "Backing up current settings to $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"
    
    # Backup current defaults
    defaults read > "$BACKUP_DIR/defaults-$(date +%Y%m%d-%H%M%S).plist" 2>/dev/null || true
    
    print_info "Backup completed."
}

apply_performance_settings() {
    print_info "Applying performance settings..."
    
    # Disable animations
    print_info "Disabling window animations..."
    defaults write NSGlobalDomain NSAutomaticWindowAnimationsEnabled -bool false
    defaults write -g QLPanelAnimationDuration -float 0
    defaults write com.apple.dock autohide-time-modifier -float 0
    defaults write com.apple.dock autohide-delay -float 0
    defaults write com.apple.dock expose-animation-duration -float 0.1
    
    # Reduce transparency
    print_info "Reducing transparency..."
    defaults write com.apple.universalaccess reduceTransparency -bool true
    
    # Disable Dashboard
    print_info "Disabling Dashboard..."
    defaults write com.apple.dashboard mcx-disabled -bool true
    
    # Disable Mission Control animations
    print_info "Disabling Mission Control animations..."
    defaults write com.apple.dock expose-animation-duration -float 0.1
    
    # Speed up launchpad animations
    print_info "Speeding up Launchpad animations..."
    defaults write com.apple.dock springboard-show-duration -float 0.1
    defaults write com.apple.dock springboard-hide-duration -float 0.1
    
    # Disable opening and closing window animations
    print_info "Disabling opening and closing window animations..."
    defaults write NSGlobalDomain NSAutomaticWindowAnimationsEnabled -bool false
    
    # Accelerate Mission Control animations
    print_info "Accelerating Mission Control animations..."
    defaults write com.apple.dock expose-animation-duration -float 0.1
    
    # Remove the auto-hiding Dock delay
    print_info "Removing auto-hiding Dock delay..."
    defaults write com.apple.dock autohide-delay -float 0
    
    # Speed up animation when hiding/showing the Dock
    print_info "Speeding up Dock show/hide animations..."
    defaults write com.apple.dock autohide-time-modifier -float 0.5
    
    # Disable the "Are you sure you want to open this application?" dialog
    print_info "Disabling application quarantine dialog..."
    defaults write com.apple.LaunchServices LSQuarantine -bool false
    
    # Increase window resize speed for Cocoa applications
    print_info "Increasing window resize speed..."
    defaults write NSGlobalDomain NSWindowResizeTime -float 0.001
    
    print_info "Performance settings applied successfully!"
}

apply_finder_settings() {
    print_info "Applying Finder settings..."
    
    # Show hidden files
    defaults write com.apple.finder AppleShowAllFiles -bool true
    
    # Show all filename extensions
    defaults write NSGlobalDomain AppleShowAllExtensions -bool true
    
    # Show path bar
    defaults write com.apple.finder ShowPathbar -bool true
    
    # Show status bar
    defaults write com.apple.finder ShowStatusBar -bool true
    
    # Use list view in all Finder windows by default
    defaults write com.apple.finder FXPreferredViewStyle -string "Nlsv"
    
    # Avoid creating .DS_Store files on network or USB volumes
    defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool true
    defaults write com.apple.desktopservices DSDontWriteUSBStores -bool true
    
    # Disable the warning when changing a file extension
    defaults write com.apple.finder FXEnableExtensionChangeWarning -bool false
    
    print_info "Finder settings applied!"
}

apply_dock_settings() {
    print_info "Applying Dock settings..."
    
    # Set the icon size of Dock items
    defaults write com.apple.dock tilesize -int 48
    
    # Enable auto-hide
    defaults write com.apple.dock autohide -bool true
    
    # Minimize windows into their application's icon
    defaults write com.apple.dock minimize-to-application -bool true
    
    # Show indicator lights for open applications
    defaults write com.apple.dock show-process-indicators -bool true
    
    # Don't show recent applications in Dock
    defaults write com.apple.dock show-recents -bool false
    
    print_info "Dock settings applied!"
}

apply_trackpad_settings() {
    print_info "Applying trackpad settings..."
    
    # Enable tap to click
    defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad Clicking -bool true
    defaults write NSGlobalDomain com.apple.mouse.tapBehavior -int 1
    
    # Enable three finger drag
    defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad TrackpadThreeFingerDrag -bool true
    defaults write com.apple.AppleMultitouchTrackpad TrackpadThreeFingerDrag -bool true
    
    print_info "Trackpad settings applied!"
}

restart_affected_apps() {
    print_info "Restarting affected applications..."
    
    # Restart Finder
    killall Finder 2>/dev/null || true
    
    # Restart Dock
    killall Dock 2>/dev/null || true
    
    # Restart SystemUIServer
    killall SystemUIServer 2>/dev/null || true
    
    print_info "Applications restarted!"
}

show_usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

macOS Desktop Settings Manager - Configure macOS settings for improved performance

OPTIONS:
    -a, --apply          Apply all performance settings
    -p, --performance    Apply performance-specific settings only
    -f, --finder         Apply Finder settings only
    -d, --dock           Apply Dock settings only
    -t, --trackpad       Apply trackpad settings only
    -b, --backup         Backup current settings before applying
    -r, --restart        Restart affected applications after applying
    -h, --help           Show this help message

EXAMPLES:
    $(basename "$0") --apply --backup --restart
    $(basename "$0") -p -r
    $(basename "$0") --finder --dock

EOF
}

# Main
main() {
    local apply_all=false
    local apply_performance=false
    local apply_finder=false
    local apply_dock=false
    local apply_trackpad=false
    local do_backup=false
    local do_restart=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -a|--apply)
                apply_all=true
                shift
                ;;
            -p|--performance)
                apply_performance=true
                shift
                ;;
            -f|--finder)
                apply_finder=true
                shift
                ;;
            -d|--dock)
                apply_dock=true
                shift
                ;;
            -t|--trackpad)
                apply_trackpad=true
                shift
                ;;
            -b|--backup)
                do_backup=true
                shift
                ;;
            -r|--restart)
                do_restart=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Check if running on macOS
    check_macos
    
    # If no specific settings selected, show usage
    if [[ "$apply_all" == false ]] && \
       [[ "$apply_performance" == false ]] && \
       [[ "$apply_finder" == false ]] && \
       [[ "$apply_dock" == false ]] && \
       [[ "$apply_trackpad" == false ]]; then
        show_usage
        exit 0
    fi
    
    # Backup if requested
    if [[ "$do_backup" == true ]]; then
        backup_settings
    fi
    
    # Apply settings
    if [[ "$apply_all" == true ]]; then
        apply_performance_settings
        apply_finder_settings
        apply_dock_settings
        apply_trackpad_settings
    else
        [[ "$apply_performance" == true ]] && apply_performance_settings
        [[ "$apply_finder" == true ]] && apply_finder_settings
        [[ "$apply_dock" == true ]] && apply_dock_settings
        [[ "$apply_trackpad" == true ]] && apply_trackpad_settings
    fi
    
    # Restart applications if requested
    if [[ "$do_restart" == true ]]; then
        restart_affected_apps
    else
        print_warning "Some changes require restarting Finder, Dock, and SystemUIServer."
        print_warning "Run with --restart flag or log out and log back in to see all changes."
    fi
    
    print_info "Done! Your macOS desktop settings have been updated."
}

# Run main function
main "$@"
