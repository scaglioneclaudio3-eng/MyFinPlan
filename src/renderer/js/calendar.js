/**
 * Calendar Module
 * 
 * Handles calendar view rendering and interactions.
 */

const Calendar = {
    /**
     * Renders the calendar view
     */
    render() {
        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';

        if (!DataStore.currentMonth) return;

        const { year, month } = DataStore.currentMonth;
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
        const todayDate = isCurrentMonth ? today.getDate() : -1;

        // Get expense data
        const expensesByDay = DataStore.getExpensesByDay();
        const incomeByDay = Income.getDailyDistribution();
        const holidays = DataStore.holidays;

        // Render weekday headers
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        for (const day of weekdays) {
            const header = document.createElement('div');
            header.className = 'calendar-weekday';
            header.textContent = day;
            grid.appendChild(header);
        }

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            grid.appendChild(empty);
        }

        let accEffectiveFlux = 0;
        let accPlannedFlux = 0;
        
        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const actualExpense = DataStore.currentMonth.dailyActualExpense?.[day] || 0;
            const actualIncome = DataStore.currentMonth.dailyActualIncome?.[day] || 0;
            accEffectiveFlux += (actualIncome - actualExpense);

            const plannedExpense = expensesByDay[day]?.totalPlanned || 0;
            const plannedIncome = incomeByDay[day] || 0;
            accPlannedFlux += (plannedIncome - plannedExpense);

            const dayCell = this.createDayCell(day, {
                year,
                month,
                isToday: day === todayDate,
                isWeekend: isWeekend(year, month, day),
                isHoliday: holidays.includes(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`),
                expenses: expensesByDay[day]?.expenses || [],
                totalPlanned: plannedExpense,
                totalPaid: actualExpense,
                income: plannedIncome,
                actualIncome: actualIncome,
                accEffectiveFlux: accEffectiveFlux,
                accPlannedFlux: accPlannedFlux
            });
            grid.appendChild(dayCell);
        }
    },

    /**
     * Creates a day cell element
     * @param {number} day - The day number
     * @param {Object} data - Day data (expenses, income, flags)
     */
    createDayCell(day, data) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';

        if (data.isToday) cell.classList.add('today');
        if (data.isWeekend) cell.classList.add('weekend');
        if (data.isHoliday) cell.classList.add('holiday');

        // Add click event for expansion
        cell.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDayDetails(day, data);
        });

        // Calculate daily totals
        const expenseTotal = data.totalPlanned || 0;
        const paidTotal = data.totalPaid || 0;

        const actualIncome = data.actualIncome || 0;
        const fluxPlan = data.income - expenseTotal;
        const fluxEfetivo = actualIncome - paidTotal;
        const accEffectiveFlux = data.accEffectiveFlux || 0;
        const accPlannedFlux = data.accPlannedFlux || 0;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentDate = now.getDate();
        const cellDate = new Date(data.year, data.month - 1, day);
        const todayDateObj = new Date(currentYear, currentMonth - 1, currentDate);
        const isFutureDay = cellDate > todayDateObj;

        cell.innerHTML = `
            <div class="calendar-day-header">
                <span class="calendar-day-number">${day}</span>
                <div style="display: flex; gap: 4px;">
                    ${!isFutureDay ? `
                    <span class="calendar-day-balance ${accEffectiveFlux >= 0 ? 'positive' : 'negative'}" style="display: flex; flex-direction: column; align-items: flex-end; line-height: 1.1;">
                        <span style="font-size: 8px; opacity: 0.7; text-transform: uppercase;">Fluxo Acum. Efetivo</span>
                        <span style="font-size: 11px;">${formatCurrency(accEffectiveFlux)}</span>
                    </span>
                    ` : ''}
                    <span class="calendar-day-balance planned-pink" style="display: flex; flex-direction: column; align-items: flex-end; line-height: 1.1;">
                        <span style="font-size: 8px; opacity: 0.7; text-transform: uppercase;">Fluxo Acum. Planejado</span>
                        <span style="font-size: 11px;">${formatCurrency(accPlannedFlux)}</span>
                    </span>
                </div>
            </div>
            <div class="calendar-day-content">
                <div class="calendar-flux-item plan">
                    <span>Fluxo Plan</span>
                    <span class="amount">${formatCurrency(fluxPlan)}</span>
                </div>
                <div class="calendar-flux-item efetivo">
                    <span>Fluxo Efetivo</span>
                    <span class="amount">${formatCurrency(fluxEfetivo)}</span>
                </div>
                
                ${this.renderExpensePairs(data.expenses, day)}

                <div class="calendar-income-item-v2 plan">
                    <span>Receita Plan</span>
                    <span class="amount">${formatCurrency(data.income)}</span>
                </div>
                <div class="calendar-income-item-v2 efetivo">
                    <span>Receita Efet.</span>
                    <span class="amount">${formatCurrency(actualIncome)}</span>
                </div>
            </div>
        `;

        return cell;
    },

    /**
     * Shows the expanded day detail modal
     * @param {number} day - The day number
     * @param {Object} data - Day data
     */
    showDayDetails(day, data) {
        const modal = document.getElementById('day-detail-modal');
        const title = document.getElementById('day-detail-title');
        const expenseList = document.getElementById('day-detail-expenses');
        const incomeList = document.getElementById('day-detail-incomes');
        const summary = document.getElementById('day-detail-summary');

        title.textContent = `Detalhamento do Dia ${day}/${DataStore.currentMonth.month}/${DataStore.currentMonth.year}`;

        // Render expenses planeadas (all of them, not just 5)
        let expensesHtml = '';
        if (data.expenses && data.expenses.length > 0) {
            expensesHtml += `<h5 style="margin-top: 5px; margin-bottom: 5px; color: #ffca28; font-size: 13px;">Despesas Planejadas:</h5>`;
            expensesHtml += this.renderExpensePairs(data.expenses, day, true);
        }

        // Render despesas efetivas (pagas)
        const actualExpenseDetails = DataStore.currentMonth.dailyActualExpenseDetails?.[day] || {};
        const allMonthExpenses = DataStore.currentMonth.expenses || [];
        const categories = DataStore.categories || [];
        
        let actualExpensesList = [];
        for (const [catId, items] of Object.entries(actualExpenseDetails)) {
            const category = categories.find(c => c.id === catId);
            for (const item of items) {
                let desc = item.description;
                if (!item.isExtra) {
                    const originalExpense = allMonthExpenses.find(e => e.id === item.expenseId);
                    if (originalExpense) {
                        desc = originalExpense.description;
                    }
                }
                actualExpensesList.push({
                    description: desc,
                    amount: item.amount,
                    category: category
                });
            }
        }

        if (actualExpensesList.length > 0) {
            expensesHtml += `<h5 style="margin-top: 15px; margin-bottom: 5px; color: var(--success-color); font-size: 13px;">Despesas Efetivas:</h5>`;
            expensesHtml += actualExpensesList.map(item => `
                <div class="calendar-expense-item">
                    <div class="line-a">
                        <span class="description" style="border-left: 6px solid ${item.category?.color || '#888'}; padding-left: 4px;">
                            ${item.description}
                        </span>
                        <span class="amount" style="background-color: ${item.category?.color || '#888'}; padding: 0 4px; border-radius: 2px;">${formatCurrency(item.amount)}</span>
                    </div>
                </div>
            `).join('');
        }

        if (expensesHtml === '') {
            expensesHtml = '<div class="calendar-expense-item"><div class="line-a"><span class="description">Nenhuma despesa registrada</span></div></div>';
        }

        expenseList.innerHTML = expensesHtml;

        // Render income details
        const incomeDetails = DataStore.currentMonth.dailyActualIncomeDetails?.[day] || [];
        const monthIncomes = DataStore.currentMonth.incomes || [];
        if (incomeDetails.length > 0) {
            incomeList.innerHTML = incomeDetails.map(item => {
                let desc = item.description;
                if (!desc && item.incomeId) {
                    const originalIncome = monthIncomes.find(i => i.id === item.incomeId);
                    if (originalIncome) {
                        desc = originalIncome.description;
                    }
                }
                return `
                <div class="calendar-expense-item">
                    <div class="line-a">
                        <span class="description" style="border-left: 6px solid var(--success-color); padding-left: 4px;">${desc || 'Receita Efetiva'}</span>
                        <span class="amount" style="background-color: var(--success-color); padding: 0 4px; border-radius: 2px;">${formatCurrency(item.amount)}</span>
                    </div>
                </div>
            `}).join('');
        } else {
            incomeList.innerHTML = `<div class="calendar-expense-item"><div class="line-a"><span class="description">Nenhuma receita efetiva registrada</span></div></div>`;
        }

        // Render summary
        const expenseTotal = data.totalPlanned || 0;
        const paidTotal = DataStore.currentMonth.dailyActualExpense?.[day] || 0;
        const actualIncome = DataStore.currentMonth.dailyActualIncome?.[day] || 0;
        const fluxPlan = data.income - expenseTotal;
        const fluxEfetivo = actualIncome - paidTotal;

        summary.innerHTML = `
            <div class="detail-summary-item">
                <span class="label">Receita Plan</span>
                <span class="value">${formatCurrency(data.income)}</span>
            </div>
            <div class="detail-summary-item">
                <span class="label">Receita Efetiva</span>
                <span class="value positive">${formatCurrency(actualIncome)}</span>
            </div>
            <div class="detail-summary-item">
                <span class="label">Despesas Plan</span>
                <span class="value">${formatCurrency(expenseTotal)}</span>
            </div>
            <div class="detail-summary-item">
                <span class="label">Despesas Pagas</span>
                <span class="value negative">${formatCurrency(paidTotal)}</span>
            </div>
            <hr>
            <div class="detail-summary-item">
                <span class="label">Fluxo Plan</span>
                <span class="value ${fluxPlan >= 0 ? 'positive' : 'negative'}">${formatCurrency(fluxPlan)}</span>
            </div>
            <div class="detail-summary-item">
                <span class="label">Fluxo Efetivo</span>
                <span class="value ${fluxEfetivo >= 0 ? 'positive' : 'negative'}">${formatCurrency(fluxEfetivo)}</span>
            </div>
        `;

        Modals.open('day-detail-modal');
    },

    /**
     * Renders expense item pairs for a day
     * @param {Array} expenses - Array of expenses
     * @param {number} day - Current day in view
     * @param {boolean} showAll - If true, ignore the 5 item limit
     */
    renderExpensePairs(expenses, day, showAll = false) {
        if (expenses.length === 0) {
            return showAll ? '<div class="calendar-expense-item"><div class="line-a"><span class="description">Nenhuma despesa registrada</span></div></div>' : '';
        }

        const today = new Date();
        const currentYear = DataStore.currentMonth.year;
        const currentMonth = DataStore.currentMonth.month;

        const limit = showAll ? expenses.length : 5;

        return expenses.slice(0, limit).map(expense => {
            // Logic for coloring Planned Amount background
            let amountBgClass = '';
            
            // Check if due date passed (simplistic check for planned vs today)
            const dueDate = new Date(currentYear, currentMonth - 1, expense.plannedDate);
            if (dueDate < today) {
                amountBgClass = 'bg-bright-red';
            }

            return `
                <div class="calendar-expense-item">
                    <div class="line-a">
                        <span class="description" style="border-left: 6px solid ${expense.category?.color || '#888'}; padding-left: 4px;">
                            ${expense.description}
                        </span>
                        <span class="amount ${amountBgClass}" style="background-color: ${expense.category?.color || '#888'};">${formatCurrency(expense.plannedAmount)}</span>
                    </div>
                </div>
            `;
        }).join('') + (!showAll && expenses.length > 5 ? `<small style="font-size:8px; text-align:center;">+${expenses.length - 5} mais</small>` : '');
    },

    /**
     * Initializes the calendar
     */
    init() {
        // Calendar is rendered when view is switched
    }
};

window.Calendar = Calendar;
