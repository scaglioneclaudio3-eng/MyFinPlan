/**
 * Data Store Module
 * 
 * Manages data persistence using the Electron IPC API.
 * Handles settings, categories, and month data.
 */

const DataStore = {
    // Current state
    settings: null,
    categories: [],
    currentMonth: null,
    holidays: [],

    // Default settings
    defaultSettings: {
        transferWeekendIncomeToMonday: true,
        saturdayIncomePercentage: 50,
        sundayIncomePercentage: 50,
        holidayIncomePercentage: 0,
        state: 'SP',
        city: '',
        backupEnabled: true,
        backupIntervalDays: 7,
        lastBackupDate: null
    },

    // Default categories (from Excel)
    defaultCategories: [
        { id: generateId(), name: 'PESSOAL', color: '#4a90d9', order: 1 },
        { id: generateId(), name: 'EXTRA EMPRESA', color: '#50c878', order: 2 },
        { id: generateId(), name: 'MORADIA', color: '#ff6b6b', order: 3 },
        { id: generateId(), name: 'PRESTAÇÕES/EMPRÉSTIMOS', color: '#ffd93d', order: 4 },
        { id: generateId(), name: 'ACORDOS', color: '#6bcb77', order: 5 },
        { id: generateId(), name: 'EXTRAS ENERGIA EMPRESA AGDES', color: '#9b59b6', order: 6 },
        { id: generateId(), name: 'ADVOGADO/JURÍDICO', color: '#e67e22', order: 7 },
        { id: generateId(), name: 'PAGAMENTO DE SALÁRIOS', color: '#3498db', order: 8 },
        { id: generateId(), name: 'IMPOSTOS', color: '#e74c3c', order: 9 },
        { id: generateId(), name: 'EXTRAS EMPRESA', color: '#1abc9c', order: 10 }
    ],

    /**
     * Initializes the data store
     */
    async init() {
        await this.loadSettings();
        await this.loadCategories();
        await this.checkBackup();
    },

    /**
     * Loads settings from disk
     */
    async loadSettings() {
        const data = await window.api.readFile('settings.json');
        if (data) {
            this.settings = { ...this.defaultSettings, ...data };
        } else {
            this.settings = { ...this.defaultSettings };
            await this.saveSettings();
        }
        return this.settings;
    },

    /**
     * Saves settings to disk
     */
    async saveSettings() {
        await window.api.writeFile('settings.json', this.settings);
    },

    /**
     * Loads categories from disk
     */
    async loadCategories() {
        const data = await window.api.readFile('categories.json');
        if (data && data.length > 0) {
            this.categories = data;
        } else {
            this.categories = [...this.defaultCategories];
            await this.saveCategories();
        }
        return this.categories;
    },

    /**
     * Saves categories to disk
     */
    async saveCategories() {
        await window.api.writeFile('categories.json', this.categories);
    },

    /**
     * Adds a new category
     * @param {Object} category - Category data
     */
    async addCategory(category) {
        const newCategory = {
            id: generateId(),
            name: category.name,
            color: category.color,
            order: this.categories.length + 1
        };
        this.categories.push(newCategory);
        await this.saveCategories();
        return newCategory;
    },

    /**
     * Updates an existing category
     * @param {string} id - Category ID
     * @param {Object} updates - Updated data
     */
    async updateCategory(id, updates) {
        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            this.categories[index] = { ...this.categories[index], ...updates };
            await this.saveCategories();
            return this.categories[index];
        }
        return null;
    },

    /**
     * Deletes a category
     * @param {string} id - Category ID
     */
    async deleteCategory(id) {
        this.categories = this.categories.filter(c => c.id !== id);
        await this.saveCategories();
    },

    /**
     * Gets a month ID string from year and month
     * @param {number} year - The year
     * @param {number} month - The month (1-12)
     * @returns {string} Month ID in YYYY-MM format
     */
    getMonthId(year, month) {
        return `${year}-${String(month).padStart(2, '0')}`;
    },

    /**
     * Loads month data from disk
     * @param {number} year - The year
     * @param {number} month - The month (1-12)
     */
    async loadMonth(year, month) {
        const monthId = this.getMonthId(year, month);
        const data = await window.api.readFile(`months/${monthId}.json`);

        if (data) {
            this.currentMonth = data;
        } else {
            // Create new month
            this.currentMonth = {
                id: monthId,
                year: year,
                month: month,
                expenses: [],
                incomes: [],
                dailyActualIncome: {},
                dailyActualIncomeDetails: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await this.saveMonth();
        }

        // Load holidays for this year
        await this.loadHolidays(year);

        return this.currentMonth;
    },

    /**
     * Saves current month data to disk
     */
    async saveMonth() {
        if (!this.currentMonth) return;

        this.currentMonth.updatedAt = new Date().toISOString();
        const monthId = this.currentMonth.id;
        await window.api.writeFile(`months/${monthId}.json`, this.currentMonth);
    },

    /**
     * Adds an expense to the current month
     * @param {Object} expense - Expense data
     */
    async addExpense(expense) {
        const newExpense = {
            id: generateId(),
            categoryId: expense.categoryId,
            description: expense.description,
            plannedAmount: expense.plannedAmount,
            plannedDate: expense.plannedDate,
            paidAmount: expense.paidAmount || null,
            paidDate: expense.paidDate || null,
            isTemplate: expense.isTemplate || false,
            specialType: expense.specialType || null,
            userDateOverride: expense.userDateOverride || false
        };
        this.currentMonth.expenses.push(newExpense);
        await this.saveMonth();
        return newExpense;
    },

    /**
     * Updates an expense
     * @param {string} id - Expense ID
     * @param {Object} updates - Updated data
     */
    async updateExpense(id, updates) {
        const index = this.currentMonth.expenses.findIndex(e => e.id === id);
        if (index !== -1) {
            this.currentMonth.expenses[index] = {
                ...this.currentMonth.expenses[index],
                ...updates
            };
            await this.saveMonth();
            return this.currentMonth.expenses[index];
        }
        return null;
    },

    /**
     * Deletes an expense
     * @param {string} id - Expense ID
     */
    async deleteExpense(id) {
        this.currentMonth.expenses = this.currentMonth.expenses.filter(e => e.id !== id);
        await this.saveMonth();
    },

    /**
     * Adds an income to the current month
     * @param {Object} income - Income data
     */
    async addIncome(income) {
        const newIncome = {
            id: generateId(),
            description: income.description,
            plannedAmount: income.plannedAmount,
            receivedAmount: income.receivedAmount || null,
            receivedDate: income.receivedDate || null
        };
        this.currentMonth.incomes.push(newIncome);
        await this.saveMonth();
        return newIncome;
    },

    /**
     * Updates an income
     * @param {string} id - Income ID
     * @param {Object} updates - Updated data
     */
    async updateIncome(id, updates) {
        const index = this.currentMonth.incomes.findIndex(i => i.id === id);
        if (index !== -1) {
            this.currentMonth.incomes[index] = {
                ...this.currentMonth.incomes[index],
                ...updates
            };
            await this.saveMonth();
            return this.currentMonth.incomes[index];
        }
        return null;
    },

    /**
     * Deletes an income
     * @param {string} id - Income ID
     */
    async deleteIncome(id) {
        this.currentMonth.incomes = this.currentMonth.incomes.filter(i => i.id !== id);
        await this.saveMonth();
    },

    /**
     * Updates daily actual income for a specific day
     * @param {number} day - The day (1-31)
     * @param {number} amount - The amount received
     */
    async updateDailyActualIncome(day, amount) {
        if (!this.currentMonth.dailyActualIncome) {
            this.currentMonth.dailyActualIncome = {};
        }
        this.currentMonth.dailyActualIncome[day] = amount;
        await this.saveMonth();
    },

    /**
     * Updates daily income details and recalculates the total for that day
     * @param {number} day - The day (1-31)
     * @param {Array} entries - Array of { description, amount }
     */
    async updateDailyIncomeDetails(day, entries) {
        if (!this.currentMonth.dailyActualIncomeDetails) {
            this.currentMonth.dailyActualIncomeDetails = {};
        }

        this.currentMonth.dailyActualIncomeDetails[day] = entries;

        // Calculate total
        const total = entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);

        if (!this.currentMonth.dailyActualIncome) {
            this.currentMonth.dailyActualIncome = {};
        }

        this.currentMonth.dailyActualIncome[day] = total;

        await this.saveMonth();
    },

    /**
     * Loads holidays for a year
     * @param {number} year - The year
     */
    async loadHolidays(year) {
        try {
            const holidays = await window.api.fetchHolidays(year, this.settings.state);
            this.holidays = holidays.map(h => h.date);
        } catch (error) {
            console.error('Failed to load holidays:', error);
            this.holidays = [];
        }
        return this.holidays;
    },

    /**
     * Copies expenses from one month to another
     * @param {string} sourceMonthId - Source month ID
     * @param {string} targetMonthId - Target month ID
     * @param {boolean} onlyTemplates - If true, only copy template items
     */
    async copyMonth(sourceMonthId, targetMonthId, onlyTemplates = false) {
        const source = await window.api.readFile(`months/${sourceMonthId}.json`);
        if (!source) return false;

        let target = await window.api.readFile(`months/${targetMonthId}.json`);

        const [targetYear, targetMonth] = targetMonthId.split('-').map(Number);

        if (!target) {
            target = {
                id: targetMonthId,
                year: targetYear,
                month: targetMonth,
                expenses: [],
                incomes: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }

        // Copy expenses
        const expensesToCopy = onlyTemplates
            ? source.expenses.filter(e => e.isTemplate)
            : source.expenses;

        for (const expense of expensesToCopy) {
            target.expenses.push({
                id: generateId(),
                categoryId: expense.categoryId,
                description: expense.description,
                plannedAmount: expense.plannedAmount,
                plannedDate: expense.plannedDate,
                paidAmount: null,
                paidDate: null,
                isTemplate: expense.isTemplate,
                specialType: expense.specialType || null,
                userDateOverride: expense.userDateOverride || false
            });
        }

        // Copy incomes
        for (const income of source.incomes) {
            target.incomes.push({
                id: generateId(),
                description: income.description,
                plannedAmount: income.plannedAmount,
                receivedAmount: null,
                receivedDate: null
            });
        }

        // Daily actual income is NOT copied

        target.updatedAt = new Date().toISOString();
        await window.api.writeFile(`months/${targetMonthId}.json`, target);

        return true;
    },

    /**
     * Gets list of all saved months
     */
    async getAvailableMonths() {
        return await window.api.listMonthFiles();
    },

    /**
     * Checks if backup is needed and runs it
     */
    async checkBackup() {
        if (!this.settings.backupEnabled) return;

        const lastBackup = this.settings.lastBackupDate
            ? new Date(this.settings.lastBackupDate)
            : null;
        const now = new Date();

        if (!lastBackup ||
            (now - lastBackup) > this.settings.backupIntervalDays * 24 * 60 * 60 * 1000) {
            await this.createBackup();
        }
    },

    /**
     * Creates a backup
     */
    async createBackup() {
        const result = await window.api.createBackup();
        if (result.success) {
            this.settings.lastBackupDate = new Date().toISOString();
            await this.saveSettings();
            showToast('Backup criado com sucesso!', 'success');
        }
        return result;
    },

    /**
     * Calculates totals for the current month
     */
    calculateTotals() {
        if (!this.currentMonth || !this.settings) return null;

        const totals = {
            plannedExpenses: 0,
            paidExpenses: 0,
            plannedIncome: 0,
            receivedIncome: 0,
            plannedBalance: 0,
            actualBalance: 0,
            accumulatedFines: 0
        };

        // Calculate expenses
        for (const expense of this.currentMonth.expenses) {
            if (expense.plannedDate !== 0) { // Exclude future reminders (day 0)
                const planned = expense.plannedAmount || 0;
                const paid = expense.paidAmount || 0;

                totals.plannedExpenses += planned;
                totals.paidExpenses += paid;

                // Fines/Interest is the difference when paid > planned
                if (paid > planned) {
                    totals.accumulatedFines += (paid - planned);
                }
            }
        }

        const now = new Date();
        const { year, month } = this.currentMonth;
        const daysInMonth = getDaysInMonth(year, month);

        let calculationEndDay;
        const isPastMonth = (year < now.getFullYear()) || (year === now.getFullYear() && month < (now.getMonth() + 1));
        const isFutureMonth = (year > now.getFullYear()) || (year === now.getFullYear() && month > (now.getMonth() + 1));

        if (isPastMonth) {
            calculationEndDay = daysInMonth;
        } else if (isFutureMonth) {
            calculationEndDay = 0;
        } else {
            calculationEndDay = now.getDate();
        }

        // Calculate income
        const recurringIncomes = this.currentMonth.incomes.filter(i => {
            const dateStr = String(i.plannedDate || '').toUpperCase();
            return dateStr === 'ALL' || dateStr === '';
        });
        const datedIncomes = this.currentMonth.incomes.filter(i => {
            const dateStr = String(i.plannedDate || '').toUpperCase();
            return dateStr !== 'ALL' && dateStr !== '';
        });

        const sumAll = recurringIncomes.reduce((sum, i) => sum + (i.plannedAmount || 0), 0);

        // Factors for Sat/Sun
        const satFactor = Number(this.settings.saturdayIncomePercentage ?? 50) / 100;
        const sunFactor = Number(this.settings.sundayIncomePercentage ?? 50) / 100;
        const holidayPercentage = Number(this.settings.holidayIncomePercentage ?? 0); // Default 0 to avoid "all" assumption if logic missing
        const holidayFactor = holidayPercentage / 100;

        let totalContributionDays = 0;

        for (let d = 1; d <= calculationEndDay; d++) {
            const date = new Date(year, month - 1, d);
            const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isHoliday = this.holidays.includes(dateStr);

            if (isHoliday) {
                // Holidays generate "ALL" revenue adjusted by the factor (1 - reduction)
                totalContributionDays += holidayFactor;
                continue;
            }

            if (dayOfWeek === 0) { // Sunday
                totalContributionDays += sunFactor;
            } else if (dayOfWeek === 6) { // Saturday
                totalContributionDays += satFactor;
            } else { // Working day
                totalContributionDays += 1;
            }
        }

        // Dynamic planned income for recurring part
        const recurringExpected = sumAll * totalContributionDays;

        // Planned income for dated part (only if day is <= calculationEndDay)
        // AND considering effective day (next working day rules)
        const datedPlanned = datedIncomes
            .filter(i => {
                const day = parseInt(i.plannedDate);
                if (isNaN(day)) return false;

                // Get effective date (moved to next business day if weekend/holiday)
                const effectiveDay = getNextWorkingDay(year, month, day, this.holidays);

                return effectiveDay <= calculationEndDay;
            })
            .reduce((sum, i) => sum + (i.plannedAmount || 0), 0);

        totals.plannedIncome = recurringExpected + datedPlanned;

        // Base zero received income (daily entries only)
        totals.receivedIncome = Object.values(this.currentMonth.dailyActualIncome || {})
            .reduce((sum, amount) => sum + (amount || 0), 0);

        // Calculate balances
        totals.plannedBalance = totals.plannedIncome - totals.plannedExpenses;
        totals.actualBalance = totals.receivedIncome - totals.paidExpenses;

        return totals;
    },

    /**
     * Gets expenses grouped by day with effective dates
     */
    getExpensesByDay() {
        if (!this.currentMonth) return {};

        const { year, month } = this.currentMonth;
        const daysInMonth = getDaysInMonth(year, month);
        const byDay = {};

        // Initialize all days
        for (let d = 1; d <= daysInMonth; d++) {
            byDay[d] = {
                expenses: [],
                income: 0,
                plannedIncome: 0,
                totalPlanned: 0,
                totalPaid: 0
            };
        }

        // Special day for late payments (-1)
        byDay[-1] = { expenses: [], income: 0, plannedIncome: 0, totalPlanned: 0, totalPaid: 0 };
        // Special day for future reminders (0)
        byDay[0] = { expenses: [], income: 0, plannedIncome: 0, totalPlanned: 0, totalPaid: 0 };

        // Group expenses
        for (const expense of this.currentMonth.expenses) {
            const category = this.categories.find(c => c.id === expense.categoryId);

            // 1. Determine Effective Due Date (for Planned Flow & List Display)
            let effectiveDueDay = expense.plannedDate;
            if (effectiveDueDay > 0) {
                effectiveDueDay = getEffectiveDate(year, month, expense, this.holidays);
            } else if (effectiveDueDay === -1) {
                effectiveDueDay = getNextWorkingDay(year, month, 1, this.holidays);
            }

            // A) Add to the list only at the Due Date (so user sees the bill where it's due)
            if (byDay[effectiveDueDay]) {
                byDay[effectiveDueDay].expenses.push({
                    ...expense,
                    originalDay: expense.plannedDate,
                    effectiveDay: effectiveDueDay,
                    category: category
                });

                // B) Add to Planned Flow at the Due Date
                byDay[effectiveDueDay].totalPlanned += (expense.plannedAmount || 0);
            }

            // 2. Determine Payment Date (for Effective Flow)
            if (expense.paidAmount && expense.paidAmount > 0 && expense.paidDate) {
                // Parse the paid date. Assuming format is usually just day number "D" or maybe "DD/MM".
                // If it's a day number in current month, we allocate cash flow there.
                let paymentDay = -100; // invalid defaults

                const dateStr = String(expense.paidDate).trim();

                if (dateStr.match(/^\d+$/)) {
                    // Simple day number
                    const d = parseInt(dateStr);
                    if (d >= 1 && d <= daysInMonth) {
                        paymentDay = d;
                    }
                }
                // Note: If format is "DD/MM", and it's not the current month, we do NOT 
                // subtract from current month's daily flow (visually), 
                // because that cash event happens in another month.
                // If the user entered "5/2" (5th Feb) and we are in Jan, it shouldn't show in Jan 5th.

                if (byDay[paymentDay]) {
                    byDay[paymentDay].totalPaid += expense.paidAmount;
                }
            }
        }

        return byDay;
    }
};
