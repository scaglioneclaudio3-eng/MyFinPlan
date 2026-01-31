# Electron-Builder & GitHub Releases Documentation

## Overview
This document contains key information for packaging Electron apps with electron-builder and publishing to GitHub Releases with auto-updates.

## Key Dependencies
- `electron-builder`: Builds the app packages (NSIS installer, portable, etc.)
- `electron-updater`: Handles auto-update functionality

## Auto-Updatable Targets for Windows
- **NSIS** (default): Supports auto-updates ✓
- **Portable**: Does NOT support auto-updates ✗

## Quick Setup Guide for Auto-Updates

1. Install `electron-updater` as an app dependency
2. Configure the `publish` options in `package.json`
3. Build the application (creates metadata .yml files)
4. Use autoUpdater from `electron-updater` (not Electron's built-in):
   ```javascript
   const { autoUpdater } = require("electron-updater");
   ```
5. Call `autoUpdater.checkForUpdatesAndNotify()`

**Note**: Do not call `setFeedURL`. electron-builder automatically creates `app-update.yml` file on build.

## package.json Build Configuration Example

```json
{
  "build": {
    "appId": "com.example.app",
    "productName": "My App",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "nsis": {
      "oneClick": false,
      "allowElevation": true,
      "allowToChangeInstallationDirectory": true,
      "installerIcon": "path/to/icon.ico",
      "uninstallerIcon": "path/to/icon.ico",
      "installerHeaderIcon": "path/to/icon.ico"
    },
    "publish": {
      "provider": "github",
      "owner": "github-username",
      "repo": "repo-name"
    }
  }
}
```

## GitHub Actions Workflow

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Electron app
        run: npm run build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Publish to GitHub Releases
        run: npm run publish
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Portable App Notes

- Portable apps do NOT support auto-updates
- Environment variables available for portable apps:
  - `PORTABLE_EXECUTABLE_FILE` - path to the portable executable
  - `PORTABLE_EXECUTABLE_DIR` - directory where it's located
  - `PORTABLE_EXECUTABLE_APP_FILENAME` - sanitized app name

## Version Management

- Version is read from `package.json`
- Git tags should match the version (e.g., `v1.0.0`)
- Use semver format

## References
- https://www.electron.build/configuration
- https://www.electron.build/auto-update
- https://www.electron.build/nsis
- https://www.electron.build/publish
