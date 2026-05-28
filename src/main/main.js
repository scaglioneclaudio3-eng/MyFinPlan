/**
 * Main Process Entry Point for Electron App
 * 
 * This file initializes the Electron app, creates the main window,
 * sets up IPC handlers for communication with the renderer process,
 * manages the application lifecycle, and handles auto-updates.
 */

const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');


// Set app name explicitly for dialogs
app.setName('MyFinPlan');

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

const menuTranslations = {
    'pt-BR': {
        file: 'Arquivo',
        import: 'Importar...',
        export: 'Exportar...',
        backup: 'Backup Agora',
        print: 'Imprimir',
        quit: 'Sair',
        edit: 'Editar',
        copyMonth: 'Copiar Mês...',
        settings: 'Configurações',
        preferences: 'Preferências...',
        help: 'Ajuda',
        tutorial: 'Tutorial',
        about: 'Sobre',
        aboutMsg: 'Aplicativo para controle de finanças pessoais mensais.'
    },
    'en-US': {
        file: 'File',
        import: 'Import...',
        export: 'Export...',
        backup: 'Backup Now',
        print: 'Print',
        quit: 'Quit',
        edit: 'Edit',
        copyMonth: 'Copy Month...',
        settings: 'Settings',
        preferences: 'Preferences...',
        help: 'Help',
        tutorial: 'Tutorial',
        about: 'About',
        aboutMsg: 'Application for personal monthly finance control.'
    }
};

let currentMenuLang = 'pt-BR';

/**
 * Creates the application menu
 */
function createMenu(lang = 'pt-BR') {
    currentMenuLang = lang;
    const t = menuTranslations[lang] || menuTranslations['pt-BR'];

    const template = [
        {
            label: t.file,
            submenu: [
                { label: t.import, click: () => mainWindow && mainWindow.webContents.send('menu-import') },
                { label: t.export, click: () => mainWindow && mainWindow.webContents.send('menu-export') },
                { type: 'separator' },
                { label: t.backup, click: () => mainWindow && mainWindow.webContents.send('menu-backup') },
                { type: 'separator' },
                { label: t.print, accelerator: 'CmdOrCtrl+P', click: () => mainWindow && mainWindow.webContents.print({ landscape: true, printBackground: true }) },
                { type: 'separator' },
                { label: t.quit, accelerator: 'Alt+F4', role: 'quit' }
            ]
        },
        {
            label: t.edit,
            submenu: [
                { label: t.copyMonth, click: () => mainWindow && mainWindow.webContents.send('menu-copy-month') }
            ]
        },

        {
            label: t.settings,
            submenu: [
                { label: t.preferences, click: () => mainWindow && mainWindow.webContents.send('menu-settings') }
            ]
        },
        {
            label: t.help,
            submenu: [
                { label: t.tutorial, click: () => mainWindow && mainWindow.webContents.send('menu-tutorial') },
                { type: 'separator' },
                { label: t.about, click: () => showAbout() }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function showAbout() {
    const t = menuTranslations[currentMenuLang] || menuTranslations['pt-BR'];
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: t.about,
        message: 'Finanças Pessoais',
        detail: `Versão 1.0.0\n\n${t.aboutMsg}`
    });
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

    ipcMain.handle('trigger-import-file', async (event, type) => {
        let openPath = undefined;
        if (type === 'backup' && backupsPath) {
            openPath = backupsPath;
        }
        
        const result = await dialog.showOpenDialog(mainWindow, {
            title: 'Importar Dados',
            filters: [{ name: 'JSON', extensions: ['json'] }],
            properties: ['openFile'],
            defaultPath: openPath
        });

        if (!result.canceled && result.filePaths.length > 0) {
            try {
                const content = await fs.promises.readFile(result.filePaths[0], 'utf-8');
                return JSON.parse(content);
            } catch (error) {
                console.error('Error parsing import file:', error);
                throw new Error('Falha ao processar o arquivo. Ele não é um JSON válido.');
            }
        }
        return null;
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

    ipcMain.handle('get-year-data', async (event, year) => {
        try {
            const data = {
                categories: [],
                months: {}
            };
            const catPath = path.join(dataPath, 'categories.json');
            if (fs.existsSync(catPath)) {
                data.categories = JSON.parse(await fs.promises.readFile(catPath, 'utf-8'));
            }
            if (fs.existsSync(monthsPath)) {
                const files = fs.readdirSync(monthsPath);
                for (const file of files) {
                    if (file.startsWith(`${year}-`) && file.endsWith('.json')) {
                        const monthId = file.replace('.json', '');
                        const content = await fs.promises.readFile(path.join(monthsPath, file), 'utf-8');
                        data.months[monthId] = JSON.parse(content);
                    }
                }
            }
            return data;
        } catch (error) {
            console.error('Error getting year data:', error);
            return { categories: [], months: {} };
        }
    });

    ipcMain.handle('export-csv', async (event, csvContent) => {
        const result = await dialog.showSaveDialog(mainWindow, {
            title: 'Exportar CSV',
            defaultPath: `financas-${new Date().toISOString().slice(0,10)}.csv`,
            filters: [{ name: 'CSV', extensions: ['csv'] }]
        });
        if (!result.canceled && result.filePath) {
            await fs.promises.writeFile(result.filePath, '\ufeff' + csvContent, 'utf8');
            return true;
        }
        return false;
    });

    ipcMain.handle('create-backup-dialog', async (event, backupData) => {
        const result = await dialog.showSaveDialog(mainWindow, {
            title: 'Salvar Backup JSON',
            defaultPath: `financas-backup-${new Date().toISOString().slice(0,10)}.json`,
            filters: [{ name: 'JSON', extensions: ['json'] }]
        });
        if (!result.canceled && result.filePath) {
            await fs.promises.writeFile(result.filePath, JSON.stringify(backupData, null, 2), 'utf8');
            return true;
        }
        return false;
    });

    ipcMain.handle('create-export-dialog', async (event, exportData) => {
        const result = await dialog.showSaveDialog(mainWindow, {
            title: 'Exportar Mês Atual (JSON)',
            defaultPath: `financas-export-${new Date().toISOString().slice(0, 10)}.json`,
            filters: [{ name: 'JSON', extensions: ['json'] }]
        });
        if (!result.canceled && result.filePath) {
            await fs.promises.writeFile(result.filePath, JSON.stringify(exportData, null, 2), 'utf8');
            return true;
        }
        return false;
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

    // Show message dialog (replacing native alert for better title control)
    ipcMain.handle('show-message', async (event, message, type = 'info') => {
        const result = await dialog.showMessageBox(mainWindow, {
            type: type,
            title: 'MyFinPlan',
            message: message,
            buttons: ['OK']
        });
        return result;
    });

    // Show confirmation dialog (replacing native confirm)
    ipcMain.handle('show-confirm', async (event, message) => {
        const result = await dialog.showMessageBox(mainWindow, {
            type: 'question',
            title: 'MyFinPlan',
            message: message,
            buttons: ['Sim', 'Não'],
            defaultId: 0,
            cancelId: 1
        });
        // Return true if "Sim" (index 0) was clicked
        return result.response === 0;
    });

    ipcMain.on('change-language', (event, lang) => {
        createMenu(lang);
    });
}




app.whenReady().then(() => {
    initPaths();
    ensureDirectories();
    setupIpcHandlers();
    
    // Read initial language
    let lang = 'pt-BR';
    try {
        const settingsPath = path.join(dataPath, 'settings.json');
        if (fs.existsSync(settingsPath)) {
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            if (settings.language) lang = settings.language;
        }
    } catch (e) { console.error(e); }

    createMenu(lang);
    createWindow();

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
