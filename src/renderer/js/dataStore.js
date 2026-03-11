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
        { id: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'PESSOAL', color: '#4a90d9', order: 1 },
        { id: '2b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'EXTRA EMPRESA', color: '#50c878', order: 2 },
        { id: '3b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'MORADIA', color: '#ff6b6b', order: 3 },
        { id: '4b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'PRESTAÇÕES/EMPRÉSTIMOS', color: '#ffd93d', order: 4 },
        { id: '5b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'ACORDOS', color: '#6bcb77', order: 5 },
        { id: '6b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'EXTRAS ENERGIA EMPRESA AGDES', color: '#9b59b6', order: 6 },
        { id: '7b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'ADVOGADO/JURÍDICO', color: '#e67e22', order: 7 },
        { id: '8b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'PAGAMENTO DE SALÁRIOS', color: '#3498db', order: 8 },
        { id: '9b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'IMPOSTOS', color: '#e74c3c', order: 9 },
        { id: '0b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'EXTRAS EMPRESA', color: '#1abc9c', order: 10 }
    ],

    /**
     * Initializes the data store
     */
    async init() {
        try {
            await this.loadSettings();
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.settings = { ...this.defaultSettings };
        }

        try {
            await this.loadCategories();
        } catch (error) {
            console.error('Failed to load categories:', error);
            this.categories = [...this.defaultCategories];
        }

        try {
            await this.checkBackup();
        } catch (error) {
            console.error('Backup check failed:', error);
        }
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

            // AUTO-COPY LOGIC: Check previous month for templates
            let prevYear = year;
            let prevMonth = month - 1;
            if (prevMonth === 0) {
                prevMonth = 12;
                prevYear -= 1;
            }
            const prevMonthId = this.getMonthId(prevYear, prevMonth);
            const prevData = await window.api.readFile(`months/${prevMonthId}.json`);

            let copiedCount = 0;
            if (prevData && prevData.expenses) {
                const templates = prevData.expenses.filter(e => e.isTemplate);
                for (const t of templates) {
                    this.currentMonth.expenses.push({
                        id: generateId(),
                        categoryId: t.categoryId,
                        description: t.description, // Keep description
                        plannedAmount: 0, // Reset amount to 0 (displays as "-")
                        plannedDate: t.plannedDate, // Keep date
                        paidAmount: null,
                        paidDate: null,
                        isTemplate: true, // Keep checked
                        specialType: t.specialType || null,
                        userDateOverride: t.userDateOverride || false
                    });
                    copiedCount++;
                }
            }

            await this.saveMonth();

            if (copiedCount > 0) {
                // Defer toast slightly to ensure UI is ready or just fire it
                setTimeout(() => {
                    showToast(`${copiedCount} despesas recorrentes copiadas. Por favor preencha o valor.`, 'info', 5000);
                }, 1000);
            }
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
            plannedDate: income.plannedDate,
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
    /**
     * Calculates totals for the current month up to the present date
     * (Matching the logic of the Cumulative Cash Flow Chart)
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

        const now = new Date();
        const { year, month } = this.currentMonth;
        const daysInMonth = getDaysInMonth(year, month);

        let calculationEndDay;
        const isPastMonth = (year < now.getFullYear()) || (year === now.getFullYear() && month < (now.getMonth() + 1));
        const isFutureMonth = (year > now.getFullYear()) || (year === now.getFullYear() && month > (now.getMonth() + 1));

        if (isPastMonth) {
            calculationEndDay = daysInMonth;
        } else if (isFutureMonth) {
            calculationEndDay = 0; // Future months start at 0? Or should show nothing? 
            // If user wants to see projection, maybe whole month? 
            // "Up to present date" implies 0 for future. But usually people want to see the plan for future.
            // Charts usually show the curve building up.
            // Requirement: "accumulated totals up to the present date the app is running".
            // Strictly interpretted: Future month = Day 0 (start). But maybe "Present Date" relative to month view?
            // Usually "Present Date" means Today.
            // If I am in Next Month, "Today" is before Day 1. So 0.
            calculationEndDay = 0;
        } else {
            calculationEndDay = now.getDate();
        }

        // 1. EXPENSES (Use getExpensesByDay to match Chart placement)
        const expensesByDay = this.getExpensesByDay();

        // Accumulate up to calculationEndDay
        // Limit calculationEndDay to daysInMonth just in case
        const safeEndDay = Math.min(calculationEndDay, daysInMonth);

        for (let d = 1; d <= safeEndDay; d++) {
            if (expensesByDay[d]) {
                totals.plannedExpenses += expensesByDay[d].totalPlanned || 0;
                totals.paidExpenses += expensesByDay[d].totalPaid || 0;
            }
        }

        // Fines (calculated from raw list because 'totalPaid' in daily bucket doesn't separate fines)
        // But fines should also be "up to today"? 
        // Let's iterate expenses again and check "paidDate" <= calculationEndDay maybe?
        // Or just keep total accumulated fines as a global metric? Simple is better.
        // Actually, let's stick to the Chart alignment. Charts don't show fines explicitly.
        // But for Summary: "accumulated figures... up to present date".
        // Let's recalculate fines strictly.
        for (const expense of this.currentMonth.expenses) {
            if (expense.paidAmount > expense.plannedAmount && expense.paidDate) {
                // Check if paid date is within range
                // Simplification: if paidDate is day number
                const pDay = parseInt(expense.paidDate);
                if (!isNaN(pDay) && pDay <= safeEndDay) {
                    totals.accumulatedFines += (expense.paidAmount - expense.plannedAmount);
                }
            }
        }


        // 2. INCOME (Planned) - Reusing logic but simpler loop
        const recurringIncomes = this.currentMonth.incomes.filter(i => {
            const dateStr = String(i.plannedDate || '').toUpperCase();
            return dateStr === 'ALL' || dateStr === '';
        });
        const dailyRecurringBase = recurringIncomes.reduce((sum, i) => sum + (i.plannedAmount || 0), 0);

        // Iterate days to apply weights (Sat/Sun/Holiday)
        const satWeight = (this.settings.saturdayIncomePercentage ?? 50) / 100;
        const sunWeight = (this.settings.sundayIncomePercentage ?? 50) / 100;
        const holidayFactor = (this.settings.holidayIncomePercentage ?? 0) / 100;

        let bucket = 0;

        // Income By Day calculation (Distribution) - Similar to Income.getDailyDistribution but optimized for sum
        for (let d = 1; d <= daysInMonth; d++) {
            // Calculate Planned First
            if (dailyRecurringBase > 0) {
                const date = new Date(year, month - 1, d);
                const dayOfWeek = date.getDay();
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const isHoliday = this.holidays.includes(dateStr);

                let generated = 0;
                if (isHoliday) generated = dailyRecurringBase * holidayFactor;
                else if (dayOfWeek === 6) generated = dailyRecurringBase * satWeight;
                else if (dayOfWeek === 0) generated = dailyRecurringBase * sunWeight;
                else generated = dailyRecurringBase;

                if (isHoliday || dayOfWeek === 6 || dayOfWeek === 0) {
                    bucket += generated;
                } else {
                    const totalDayInc = generated + bucket;
                    bucket = 0;
                    if (d <= safeEndDay) totals.plannedIncome += totalDayInc;
                }
            }
        }

        // Add Dated Incomes (Specific Day) - Filter by Effective Date
        const datedIncomes = this.currentMonth.incomes.filter(i => {
            const ds = String(i.plannedDate || '').toUpperCase();
            return ds !== 'ALL' && ds !== '';
        });

        for (const inc of datedIncomes) {
            const day = Number(inc.plannedDate);
            if (!isNaN(day)) {
                const effectiveDay = getNextWorkingDay(year, month, day, this.holidays);
                if (effectiveDay <= safeEndDay) {
                    totals.plannedIncome += (inc.plannedAmount || 0);
                }
            }
        }

        // 3. EFFECTIVE INCOME (Grid Only - Rule 1.2)
        // Sum Grid values up to safeEndDay
        const dailyActuals = this.currentMonth.dailyActualIncome || {};
        for (let d = 1; d <= safeEndDay; d++) {
            totals.receivedIncome += (dailyActuals[d] || 0);
        }

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

window.DataStore = DataStore;
