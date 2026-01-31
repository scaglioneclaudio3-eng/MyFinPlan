
// Mock environment
global.window = {};
global.document = {
    getElementById: (id) => {
        if (!elements[id]) elements[id] = createMockElement(id);
        return elements[id];
    },
    createElement: (tag) => createMockElement(tag),
    querySelectorAll: () => [],
    body: { appendChild: () => { } }
};

const elements = {};
function createMockElement(id) {
    return {
        id,
        classList: { add: () => { }, remove: () => { } },
        style: {},
        dataset: {},
        innerHTML: '',
        textContent: '',
        appendChild: () => { },
        querySelector: () => ({ remove: () => { }, insertBefore: () => { } }),
        querySelectorAll: () => [],
        replaceWith: () => { }, // Mock replaceWith
        cloneNode: () => ({ addEventListener: () => { } }),
        addEventListener: () => { }
    };
}

global.DataStore = {
    currentMonth: {
        year: 2024,
        month: 1,
        dailyActualIncomeDetails: { 10: [] },
        monthId: '2024-01'
    }
};

global.Modals = {
    open: (id) => console.log(`[Modals] Open ${id}`)
};

// Load the manager code
const fs = require('fs');
const path = require('path');
const managerPath = path.join(__dirname, '../src/renderer/js/dailyIncomeManager.js');
const managerCode = fs.readFileSync(managerPath, 'utf8');

// The file content starts with `window.DailyIncomeManager = ...`
// In the eval context, `window` must be defined.
eval(managerCode);

// Map to global for convenience in this script
if (global.window.DailyIncomeManager) {
    global.DailyIncomeManager = global.window.DailyIncomeManager;
}

async function debug() {
    console.log('--- START DEBUG ---');

    // 1. Init
    console.log('1. calling init()');
    try {
        global.DailyIncomeManager.init();
    } catch (e) {
        console.error('Init failed:', e);
    }

    // 2. Open Modal
    console.log('2. calling openModal(10)');
    const start = process.hrtime();

    try {
        global.DailyIncomeManager.openModal(10);
    } catch (e) {
        console.error('OpenModal CRASHED:', e);
    }

    const end = process.hrtime(start);
    console.log(`OpenModal finished in ${end[1] / 1000000}ms`);

    console.log('--- END DEBUG ---');
}

debug();
