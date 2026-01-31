/**
 * Main Process Entry Point for Electron App
 * 
 * This file initializes the Electron app, creates the main window,
 * sets up IPC handlers for communication with the renderer process,
 * manages the application lifecycle, and handles auto-updates.
 */

const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// Configure auto-updater logging
autoUpdater.logger = console;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Data storage paths (initialized after app is ready)
let userDataPath, dataPath, monthsPath, backupsPath, cachePath;


// Initialize paths after app is ready
function initPaths() {
    userDataPath = app.getPath('userData');
    dataPath = require('path').join(userDataPath, 'data');
    monthsPath = require('path').join(dataPath, 'months');
    backupsPath = require('path').join(userDataPath, 'backups');
    cachePath = require('path').join(userDataPath, 'cache');
}

// Ensure directories exist
function ensureDirectories() {
    [dataPath, monthsPath, backupsPath, cachePath].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

// Main window reference
let mainWindow;

/**
 * Creates the main application window
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '..', 'renderer', 'assets', 'icon.png'),
        title: 'MyFinPlan'
    });

    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

/**
 * Creates the application menu
 */
function createMenu() {
    const template = [
        {
            label: 'Arquivo',
            submenu: [
                { label: 'Novo Mês', click: () => mainWindow.webContents.send('menu-new-month') },
                { type: 'separator' },
                { label: 'Importar...', click: () => handleImport() },
                { label: 'Exportar...', click: () => handleExport() },
                { type: 'separator' },
                { label: 'Backup Agora', click: () => mainWindow.webContents.send('menu-backup') },
                { type: 'separator' },
                { label: 'Imprimir', accelerator: 'CmdOrCtrl+P', click: () => mainWindow.webContents.print() },
                { type: 'separator' },
                { label: 'Sair', accelerator: 'Alt+F4', role: 'quit' }
            ]
        },
        {
            label: 'Editar',
            submenu: [
                { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Refazer', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
                { type: 'separator' },
                { label: 'Copiar Mês...', click: () => mainWindow.webContents.send('menu-copy-month') },
                { type: 'separator' },
                { label: 'Categorias...', click: () => mainWindow.webContents.send('menu-categories') }
            ]
        },
        {
            label: 'Visualizar',
            submenu: [
                { label: 'Calendário', click: () => mainWindow.webContents.send('menu-view-calendar') },
                { label: 'Gráficos', click: () => mainWindow.webContents.send('menu-view-charts') },
                { label: 'Resumo', click: () => mainWindow.webContents.send('menu-view-summary') },
                { type: 'separator' },
                { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: 'DevTools', accelerator: 'F12', role: 'toggleDevTools' }
            ]
        },
        {
            label: 'Configurações',
            submenu: [
                { label: 'Preferências...', click: () => mainWindow.webContents.send('menu-settings') }
            ]
        },
        {
            label: 'Ajuda',
            submenu: [
                { label: 'Tutorial', click: () => mainWindow.webContents.send('menu-tutorial') },
                { type: 'separator' },
                { label: 'Verificar Atualizações...', click: () => checkForUpdatesManually() },
                { type: 'separator' },
                { label: 'Sobre', click: () => showAbout() }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

/**
 * Shows the About dialog
 */
function showAbout() {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Sobre',
        message: 'Finanças Pessoais',
        detail: 'Versão 1.0.0\n\nAplicativo para controle de finanças pessoais mensais.'
    });
}

/**
 * Handles file import
 */
async function handleImport() {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Importar Dados',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        mainWindow.webContents.send('import-file', result.filePaths[0]);
    }
}

/**
 * Handles file export
 */
async function handleExport() {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Exportar Dados',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        defaultPath: `financas-export-${new Date().toISOString().slice(0, 10)}.json`
    });

    if (!result.canceled && result.filePath) {
        mainWindow.webContents.send('export-file', result.filePath);
    }
}

// ============== IPC Handlers ==============

/**
 * Sets up all IPC handlers for communication with renderer process.
 * Must be called after app is ready.
 */
function setupIpcHandlers() {
    // File system operations
    ipcMain.handle('get-data-path', () => dataPath);
    ipcMain.handle('get-months-path', () => monthsPath);
    ipcMain.handle('get-cache-path', () => cachePath);

    ipcMain.handle('read-file', async (event, filePath) => {
        try {
            const fullPath = path.isAbsolute(filePath) ? filePath : path.join(dataPath, filePath);
            if (fs.existsSync(fullPath)) {
                const content = await fs.promises.readFile(fullPath, 'utf-8');
                return JSON.parse(content);
            }
            return null;
        } catch (error) {
            console.error('Error reading file:', error);
            return null;
        }
    });

    ipcMain.handle('write-file', async (event, filePath, data) => {
        try {
            const fullPath = path.isAbsolute(filePath) ? filePath : path.join(dataPath, filePath);
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
                await fs.promises.mkdir(dir, { recursive: true });
            }
            await fs.promises.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
            return true;
        } catch (error) {
            console.error('Error writing file:', error);
            return false;
        }
    });

    ipcMain.handle('list-month-files', async () => {
        try {
            if (!fs.existsSync(monthsPath)) return [];
            const files = fs.readdirSync(monthsPath);
            return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
        } catch (error) {
            console.error('Error listing month files:', error);
            return [];
        }
    });

    ipcMain.handle('create-backup', async () => {
        try {
            const timestamp = new Date().toISOString().slice(0, 10);
            const backupName = `backup-${timestamp}.json`;
            const backupFilePath = path.join(backupsPath, backupName);

            // Collect all data
            const backup = {
                timestamp: new Date().toISOString(),
                settings: null,
                categories: null,
                months: {}
            };

            // Read settings
            const settingsFilePath = path.join(dataPath, 'settings.json');
            if (fs.existsSync(settingsFilePath)) {
                backup.settings = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
            }

            // Read categories
            const categoriesFilePath = path.join(dataPath, 'categories.json');
            if (fs.existsSync(categoriesFilePath)) {
                backup.categories = JSON.parse(fs.readFileSync(categoriesFilePath, 'utf-8'));
            }

            // Read all months
            if (fs.existsSync(monthsPath)) {
                const monthFiles = fs.readdirSync(monthsPath);
                for (const file of monthFiles) {
                    if (file.endsWith('.json')) {
                        const monthId = file.replace('.json', '');
                        backup.months[monthId] = JSON.parse(fs.readFileSync(path.join(monthsPath, file), 'utf-8'));
                    }
                }
            }

            fs.writeFileSync(backupFilePath, JSON.stringify(backup, null, 2), 'utf-8');

            // Clean old backups (keep last 5)
            const backupFiles = fs.readdirSync(backupsPath)
                .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
                .sort()
                .reverse();

            for (let i = 5; i < backupFiles.length; i++) {
                fs.unlinkSync(path.join(backupsPath, backupFiles[i]));
            }

            return { success: true, path: backupFilePath };
        } catch (error) {
            console.error('Error creating backup:', error);
            return { success: false, error: error.message };
        }
    });

    // Fetch holidays from BrasilAPI using native fetch (available in Node 18+)
    ipcMain.handle('fetch-holidays', async (event, year, state) => {
        try {
            const cacheFile = path.join(cachePath, `holidays-${year}.json`);

            // Check cache first
            if (fs.existsSync(cacheFile)) {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
                if (cached.fetchedAt && (Date.now() - new Date(cached.fetchedAt).getTime()) < 30 * 24 * 60 * 60 * 1000) {
                    return cached.holidays;
                }
            }

            // Fetch from API using native fetch (Node 18+)
            const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const holidays = await response.json();

            // Cache the result
            fs.writeFileSync(cacheFile, JSON.stringify({
                fetchedAt: new Date().toISOString(),
                holidays: holidays
            }, null, 2), 'utf-8');

            return holidays;
        } catch (error) {
            console.error('Error fetching holidays:', error);
            // Return empty array on error, app will work without holidays
            return [];
        }
    });
}

// ============== Auto-Update Functions ==============

/**
 * Sets up auto-update event handlers
 */
function setupAutoUpdater() {
    autoUpdater.on('checking-for-update', () => {
        console.log('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
        console.log('Update available:', info.version);
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Atualização Disponível',
            message: `Uma nova versão (${info.version}) está disponível e será baixada automaticamente.`
        });
    });

    autoUpdater.on('update-not-available', () => {
        console.log('No updates available.');
    });

    autoUpdater.on('download-progress', (progressObj) => {
        console.log(`Download progress: ${progressObj.percent.toFixed(2)}%`);
    });

    autoUpdater.on('update-downloaded', (info) => {
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Atualização Pronta',
            message: `A versão ${info.version} foi baixada. A atualização será instalada ao fechar o aplicativo.`,
            buttons: ['Reiniciar Agora', 'Mais Tarde']
        }).then((result) => {
            if (result.response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });

    autoUpdater.on('error', (error) => {
        console.error('Auto-updater error:', error);
    });
}

/**
 * Manually check for updates
 */
function checkForUpdatesManually() {
    autoUpdater.checkForUpdates().then(() => {
        // The events above will handle the result
    }).catch((err) => {
        console.error('Error checking for updates:', err);
    });
}

// App lifecycle
app.whenReady().then(() => {
    initPaths();
    ensureDirectories();
    setupIpcHandlers();
    setupAutoUpdater();
    createMenu();
    createWindow();

    // Check for updates after window is ready (only in production)
    if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'development') {
        setTimeout(() => {
            autoUpdater.checkForUpdatesAndNotify();
        }, 3000);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
