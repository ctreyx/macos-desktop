# macOS Desktop Settings Manager

A powerful shell script to configure macOS desktop settings for improved performance and productivity.

## Features

- 🚀 **Performance Optimization**: Disable animations and reduce transparency for faster UI
- 🔧 **Finder Enhancements**: Show hidden files, extensions, and status bars
- 🎯 **Dock Customization**: Configure size, auto-hide, and behavior
- 👆 **Trackpad Settings**: Enable tap-to-click and three-finger drag
- 💾 **Backup & Restore**: Safely backup settings before making changes
- ⚙️ **Modular Application**: Apply only the settings you need

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/ctreyx/macos-desktop.git
   cd macos-desktop
   ```

2. Make the script executable (if not already):
   ```bash
   chmod +x macos-settings.sh
   ```

## Usage

### Apply All Settings

Apply all performance, Finder, Dock, and trackpad settings with backup and restart:

```bash
./macos-settings.sh --apply --backup --restart
```

### Apply Specific Settings

Apply only performance settings:

```bash
./macos-settings.sh --performance --restart
```

Apply only Finder settings:

```bash
./macos-settings.sh --finder --restart
```

Apply Dock and trackpad settings:

```bash
./macos-settings.sh --dock --trackpad --restart
```

### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--apply` | `-a` | Apply all performance settings |
| `--performance` | `-p` | Apply performance-specific settings only |
| `--finder` | `-f` | Apply Finder settings only |
| `--dock` | `-d` | Apply Dock settings only |
| `--trackpad` | `-t` | Apply trackpad settings only |
| `--backup` | `-b` | Backup current settings before applying |
| `--restart` | `-r` | Restart affected applications after applying |
| `--help` | `-h` | Show help message |

## What Gets Changed

### Performance Settings

- ✅ Disables window animations
- ✅ Reduces transparency effects
- ✅ Disables Dashboard
- ✅ Speeds up Mission Control animations
- ✅ Removes Dock auto-hide delay
- ✅ Increases window resize speed
- ✅ Accelerates Launchpad animations

### Finder Settings

- ✅ Shows hidden files
- ✅ Shows all filename extensions
- ✅ Shows path bar
- ✅ Shows status bar
- ✅ Uses list view by default
- ✅ Prevents .DS_Store files on network/USB volumes
- ✅ Disables file extension change warning

### Dock Settings

- ✅ Sets icon size to 48 pixels
- ✅ Enables auto-hide
- ✅ Minimizes windows to application icon
- ✅ Shows indicator lights for open applications
- ✅ Hides recent applications

### Trackpad Settings

- ✅ Enables tap to click
- ✅ Enables three-finger drag

## Configuration

Modify `settings.conf` to customize default values for your preferences.

## Backup

When you run the script with the `--backup` flag, it creates a backup of your current settings in:

```
~/.macos-settings-backup/defaults-YYYYMMDD-HHMMSS.plist
```

## Requirements

- macOS (any recent version)
- Bash shell

## Safety

This script uses the standard macOS `defaults` command to modify system preferences. All changes can be reverted by:

1. Restoring from backup
2. Manually changing settings in System Preferences
3. Using the `defaults delete` command for specific keys

## Examples

**Quick performance boost:**
```bash
./macos-settings.sh -p -r
```

**Full setup with backup:**
```bash
./macos-settings.sh -a -b -r
```

**Customize Finder only:**
```bash
./macos-settings.sh --finder --restart
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Disclaimer

This script modifies system settings. While all changes are reversible, please review the script and create a backup before running it on your system.
