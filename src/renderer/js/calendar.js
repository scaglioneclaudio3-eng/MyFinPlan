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

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = this.createDayCell(day, {
                year,
                month,
                isToday: day === todayDate,
                isWeekend: isWeekend(year, month, day),
                isHoliday: holidays.includes(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`),
                isHoliday: holidays.includes(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`),
                expenses: expensesByDay[day]?.expenses || [],
                totalPlanned: expensesByDay[day]?.totalPlanned || 0,
                totalPaid: expensesByDay[day]?.totalPaid || 0,
                income: incomeByDay[day] || 0
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

        const actualIncome = DataStore.currentMonth.dailyActualIncome?.[day] || 0;
        const fluxPlan = data.income - expenseTotal;
        const fluxEfetivo = actualIncome - paidTotal;

        cell.innerHTML = `
            <div class="calendar-day-header">
                <span class="calendar-day-number">${day}</span>
                <span class="calendar-day-balance ${fluxEfetivo >= 0 ? 'positive' : 'negative'}">
                    ${formatCurrency(fluxEfetivo)}
                </span>
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

        // Render expenses (all of them, not just 5)
        expenseList.innerHTML = this.renderExpensePairs(data.expenses, day, true);

        // Render income details
        const incomeDetails = DataStore.currentMonth.dailyActualIncomeDetails?.[day] || [];
        if (incomeDetails.length > 0) {
            incomeList.innerHTML = incomeDetails.map(item => `
                <div class="calendar-expense-item">
                    <div class="line-a">
                        <span class="description">${item.description}</span>
                        <span class="amount">${formatCurrency(item.amount)}</span>
                    </div>
                </div>
            `).join('');
        } else {
            incomeList.innerHTML = `<div class="calendar-expense-item"><div class="line-a"><span class="description">Nenhuma receita efetiva registrada</span></div></div>`;
        }

        // Render summary
        const expenseTotal = data.totalPlanned || 0;
        const paidTotal = data.totalPaid || 0;
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
            const isPaid = expense.paidDate !== null && expense.paidDate !== undefined;
            const paidAmount = expense.paidAmount || 0;
            const isPartial = paidAmount > 0 && paidAmount < expense.plannedAmount;

            // Payment date logic for "Late"
            let isLate = false;
            if (isPaid) {
                const paidDateStr = String(expense.paidDate);
                if (paidDateStr.includes('/')) {
                    // Different month case - always considered late for simplicity or different month
                    // (The prompt says: "In case payment is made late, in another month...")
                    isLate = true;
                } else {
                    const paidDay = parseInt(paidDateStr);
                    if (!isNaN(paidDay) && paidDay > expense.plannedDate) {
                        isLate = true;
                    }
                }
            }

            // Determine background color
            if (!isPaid) {
                // Check if due date passed
                const dueDate = new Date(currentYear, currentMonth - 1, expense.plannedDate);
                if (dueDate < today) {
                    amountBgClass = 'bg-bright-red';
                }
            } else {
                if (isPartial || isLate) {
                    amountBgClass = 'bg-bright-yellow';
                }
            }

            // Handle date display
            let dateDisplay = '-';
            if (isPaid) {
                dateDisplay = expense.paidDate;
            }

            return `
                <div class="calendar-expense-item">
                    <div class="line-a">
                        <span class="description" style="border-left: 6px solid ${expense.category?.color || '#888'}; padding-left: 4px;">
                            ${expense.description}
                        </span>
                        <span class="amount ${amountBgClass}">${formatCurrency(expense.plannedAmount)}</span>
                    </div>
                    <div class="line-b">
                        <span class="payment-status">Pago: ${dateDisplay}</span>
                        <span class="amount">${formatCurrency(paidAmount)}</span>
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
