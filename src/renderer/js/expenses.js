/**
 * Expenses Module
 * 
 * Additional expense-related functionality.
 */

const Expenses = {
    /**
     * Gets all expenses grouped by their effective date
     * @returns {Object} Expenses grouped by effective day
     */
    getByEffectiveDate() {
        return DataStore.getExpensesByDay();
    },

    /**
     * Gets future expense reminders (day 0)
     * @returns {Array} List of future expense reminders
     */
    getFutureReminders() {
        if (!DataStore.currentMonth) return [];
        return DataStore.currentMonth.expenses.filter(e => e.plannedDate === 0);
    },

    /**
     * Gets late payments from previous months (day -1)
     * @returns {Array} List of late payments
     */
    getLatePayments() {
        if (!DataStore.currentMonth) return [];
        return DataStore.currentMonth.expenses.filter(e => e.plannedDate === -1);
    },

    /**
     * Gets overdue expenses (past due date, not fully paid)
     * @returns {Array} List of overdue expenses
     */
    getOverdue() {
        // With independent daily actual expenses, individual planned expenses
        // are no longer tracked for payment status.
        return [];
    },

    /**
     * Calculates the average expense amount
     * @returns {number} Average amount
     */
    getAverageAmount() {
        if (!DataStore.currentMonth || DataStore.currentMonth.expenses.length === 0) return 0;

        const validExpenses = DataStore.currentMonth.expenses.filter(e => e.plannedAmount > 0);
        if (validExpenses.length === 0) return 0;

        const total = validExpenses.reduce((sum, e) => sum + e.plannedAmount, 0);
        return total / validExpenses.length;
    },

    /**
     * Validates expense data before saving
     * @param {Object} expense - Expense data to validate
     * @returns {Object} { valid: boolean, errors: string[], warnings: string[] }
     */
    validate(expense) {
        const errors = [];
        const warnings = [];

        // Required fields
        if (!expense.description || expense.description.trim() === '') {
            errors.push('Descrição é obrigatória');
        }

        if (expense.plannedAmount === null || expense.plannedAmount === undefined || expense.plannedAmount < 0) {
            errors.push('Valor previsto deve ser um número positivo');
        }

        if (expense.plannedDate === null || expense.plannedDate === undefined) {
            errors.push('Dia de vencimento é obrigatório');
        }

        // Date validation
        if (expense.plannedDate !== null && expense.plannedDate !== undefined) {
            if (expense.plannedDate !== 'all' && expense.plannedDate !== 'fds') {
                const daysInMonth = getDaysInMonth(DataStore.currentMonth.year, DataStore.currentMonth.month);
                if (expense.plannedDate > daysInMonth) {
                    errors.push(`Dia inválido. Este mês tem apenas ${daysInMonth} dias.`);
                }
                if (expense.plannedDate < -1) {
                    errors.push('Dia deve ser -1 (atrasado), 0 (futuro), 1-31, all ou fds');
                }
            }
        }

        // Paid amount validation
        if (expense.paidAmount !== null && expense.paidAmount < 0) {
            errors.push('Valor pago não pode ser negativo');
        }

        if (expense.paidAmount > 0 && (!expense.paidDate || expense.paidDate.toString().trim() === '')) {
            errors.push('Data de pagamento é obrigatória quando há valor pago');
        }

        // Paid date validation
        if (expense.paidAmount > 0) {
            const now = new Date();
            const today = now.getDate();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            const year = DataStore.currentMonth.year;
            const month = DataStore.currentMonth.month;

            let isFuture = false;

            if (expense.paidDate !== null && expense.paidDate !== undefined && expense.paidDate !== '') {
                if (typeof expense.paidDate === 'string' && expense.paidDate.includes('/')) {
                    const parts = expense.paidDate.split('/');
                    const day = parseInt(parts[0]);
                    const monthPart = parseInt(parts[1]);

                    if (isNaN(day) || day < 1 || day > 31 || isNaN(monthPart) || monthPart < 1 || monthPart > 12) {
                        errors.push('Data de pagamento inválida. Use o formato Dia/Mês (ex: 15/02).');
                    } else {
                        const paidDateObj = new Date(year, monthPart - 1, day);
                        // Reset hours to compare only dates
                        const compareDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        if (paidDateObj > compareDate) {
                            isFuture = true;
                        }
                    }
                } else {
                    const day = parseInt(expense.paidDate);
                    const daysInMonth = getDaysInMonth(year, month);
                    if (isNaN(day) || day < 1 || day > daysInMonth) {
                        errors.push(`Dia de pagamento inválido. Para este mês, deve ser entre 1 e ${daysInMonth}.`);
                        if (year > currentYear || (year === currentYear && month > currentMonth) || (year === currentYear && month === currentMonth && day > today)) {
                            isFuture = true;
                        }
                    }
                }
            } else {
                // If amount is paid but no date, it defaults to today or first day, 
                // but usually the app requires a date or assumes current context.
                // If it's a future month, even without specific day, it's future.
                if (year > currentYear || (year === currentYear && month > currentMonth)) {
                    isFuture = true;
                }
            }

            if (isFuture) {
                errors.push('não é possível inserir valores efetivos em dias futuros');
            }
        }

        // New Check: Date present but no amount
        if ((expense.paidDate && expense.paidDate.toString().trim() !== '') && (expense.paidAmount === null || expense.paidAmount <= 0)) {
            errors.push('Valor pago é obrigatório quando há data de pagamento');
        }

        // Warnings
        const average = this.getAverageAmount();
        if (average > 0 && expense.plannedAmount > average * 10) {
            warnings.push(`Valor muito alto comparado à média (${formatCurrency(average)}). Verifique se não é um erro de digitação.`);
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    },

    /**
     * Renders the future expenses panel
     */
    renderFuturePanel() {
        /*
        const panel = document.getElementById('future-expenses');
        const list = document.getElementById('future-expenses-list');
        const reminders = this.getFutureReminders();

        if (reminders.length === 0) {
            panel.classList.add('hidden');
            return;
        }

        panel.classList.remove('hidden');
        list.innerHTML = '';

        for (const expense of reminders) {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${expense.description}</strong><br>
                <small>${formatCurrency(expense.plannedAmount)}</small>
            `;
            list.appendChild(li);
        }
        */
    }
};

window.Expenses = Expenses;
