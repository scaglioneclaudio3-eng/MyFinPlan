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
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),

    getYearData: (year) => ipcRenderer.invoke('get-year-data', year),
    exportCsv: (csvContent) => ipcRenderer.invoke('export-csv', csvContent),
    createBackupDialog: (data) => ipcRenderer.invoke('create-backup-dialog', data),
    
    // Listeners
    createBackup: () => ipcRenderer.invoke('create-backup'),
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
    onMenuImport: (callback) => ipcRenderer.on('menu-import', callback),
    triggerImportFile: (type) => ipcRenderer.invoke('trigger-import-file', type),
    onMenuExport: (callback) => ipcRenderer.on('menu-export', callback),
    createExportDialog: (data) => ipcRenderer.invoke('create-export-dialog', data),

    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

    // UI
    showMessage: (message, type) => ipcRenderer.invoke('show-message', message, type),
    showConfirm: (message) => ipcRenderer.invoke('show-confirm', message)
});
