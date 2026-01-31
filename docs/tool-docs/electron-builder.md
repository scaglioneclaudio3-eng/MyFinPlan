# electron-builder Documentation (Windows Portable)

## Installation
```bash
npm install electron-builder --save-dev
```

## Configuration in package.json

```json
{
  "scripts": {
    "dist": "electron-builder -w"
  },
  "build": {
    "appId": "com.excel2desktop.app",
    "productName": "Excel2Desktop App",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": [
        "portable",
        "nsis"
      ]
    },
    "files": [
      "src/**/*",
      "index.html",
      "package.json",
      "node_modules/**/*"
    ]
  }
}
```

## Targets
- **portable**: A single .exe file that runs without installation.
- **nsis**: An installer that installs the app on the system.
- **zip**: A zip archive containing the app files.

## Command Line
- `electron-builder --windows`: Build for Windows.
- `electron-builder --win portable`: Build specifically for portable target.
