/**
 * Preload Script for Electron
 * 
 * This script runs in a separate context before the renderer process loads.
 * It exposes a limited, safe API from the main process to the renderer.
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * API exposed to the renderer process via window.api
 */
contextBridge.exposeInMainWorld('api', {
    // File operations
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
    listMonthFiles: () => ipcRenderer.invoke('list-month-files'),

    // Paths
    getDataPath: () => ipcRenderer.invoke('get-data-path'),
    getMonthsPath: () => ipcRenderer.invoke('get-months-path'),
    getCachePath: () => ipcRenderer.invoke('get-cache-path'),

    // Backup
    createBackup: () => ipcRenderer.invoke('create-backup'),

    // Holidays
    fetchHolidays: (year, state) => ipcRenderer.invoke('fetch-holidays', year, state),

    // Menu event listeners
    onMenuNewMonth: (callback) => ipcRenderer.on('menu-new-month', callback),
    onMenuCopyMonth: (callback) => ipcRenderer.on('menu-copy-month', callback),
    onMenuCategories: (callback) => ipcRenderer.on('menu-categories', callback),
    onMenuSettings: (callback) => ipcRenderer.on('menu-settings', callback),
    onMenuBackup: (callback) => ipcRenderer.on('menu-backup', callback),
    onMenuViewCalendar: (callback) => ipcRenderer.on('menu-view-calendar', callback),
    onMenuViewCharts: (callback) => ipcRenderer.on('menu-view-charts', callback),
    onMenuViewSummary: (callback) => ipcRenderer.on('menu-view-summary', callback),
    onMenuTutorial: (callback) => ipcRenderer.on('menu-tutorial', callback),
    onImportFile: (callback) => ipcRenderer.on('import-file', (event, path) => callback(path)),
    onExportFile: (callback) => ipcRenderer.on('export-file', (event, path) => callback(path)),

    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
