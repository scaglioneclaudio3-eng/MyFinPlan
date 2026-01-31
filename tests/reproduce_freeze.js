
// Mock window.api
global.window = {
    api: {
        readFile: async () => null, // Return empty or mock
        writeFile: async () => true,
        fetchHolidays: async () => []
    }
};

// Mock document
global.document = {
    getElementById: (id) => ({
        innerHTML: '',
        value: '',
        textContent: '',
        appendChild: () => { },
        addEventListener: () => { },
        dataset: {},
        classList: { add: () => { }, remove: () => { } },
        style: {}
    }),
    createElement: () => ({
        innerHTML: '',
        className: '',
        dataset: {},
        appendChild: () => { },
        addEventListener: () => { },
        querySelector: () => ({ addEventListener: () => { } }),
        querySelectorAll: () => []
    }),
    querySelectorAll: () => []
};

// Paste Utils code (simplified)
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}
function generateId() { return 'id-' + Math.random(); }
function formatCurrency(v) { return 'R$ ' + v; }
function getWeekdayName() { return 'Seg'; }
function isWeekend() { return false; }
function getEffectiveDate() { return 1; }
function getNextWorkingDay() { return 1; }

// Paste relevant DataStore code (simplified)
const DataStore = {
    settings: {
        saturdayIncomePercentage: 50,
        sundayIncomePercentage: 50,
        holidayIncomeReductionPercentage: 100
    },
    currentMonth: {
        year: 2024,
        month: 1,
        expenses: [],
        incomes: [],
        dailyActualIncome: {},
        dailyActualIncomeDetails: {},
        id: '2024-01'
    },
    holidays: [],

    async saveMonth() {
        console.log('Saving month...');
        await window.api.writeFile('path', this.currentMonth);
        console.log('Month saved.');
    },

    async updateDailyIncomeDetails(day, entries) {
        console.log('Updating daily details for day', day);
        if (!this.currentMonth.dailyActualIncomeDetails) {
            this.currentMonth.dailyActualIncomeDetails = {};
        }
        this.currentMonth.dailyActualIncomeDetails[day] = entries;

        const total = entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        if (!this.currentMonth.dailyActualIncome) {
            this.currentMonth.dailyActualIncome = {};
        }
        this.currentMonth.dailyActualIncome[day] = total;

        await this.saveMonth();
    },

    calculateTotals() {
        console.log('Calculating totals...');
        // Simplified calculation logic from read file
        const daysInMonth = 31;
        let sum = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            // some calc
            sum += 1;
        }
        console.log('Totals calculated.');
        return { plannedIncome: 100, receivedIncome: 50, plannedExpenses: 0, paidExpenses: 0, plannedBalance: 0, actualBalance: 0, accumulatedFines: 0 };
    }
};

// Paste relevant Income code (simplified)
const Income = {
    render() {
        console.log('Income.render start');
        this.renderDailyActuals();
        this.updateTotals();
        console.log('Income.render end');
    },
    renderDailyActuals() {
        console.log('renderDailyActuals start');
        const daysInMonth = 31;
        for (let d = 1; d <= daysInMonth; d++) {
            // Creating elements mock
        }
        console.log('renderDailyActuals end');
    },
    updateTotals() {
        DataStore.calculateTotals();
    }
};

const App = {
    updateSummary() {
        console.log('App.updateSummary start');
        DataStore.calculateTotals();
        console.log('App.updateSummary end');
    }
};

// Test the flow
async function test() {
    console.log('Starting test...');
    const day = 5;
    const entries = [{ description: 'Test', amount: 100 }];

    const start = Date.now();
    await DataStore.updateDailyIncomeDetails(day, entries);
    Income.render();
    App.updateSummary();
    const end = Date.now();

    console.log(`Finished in ${end - start}ms`);
}

test();
