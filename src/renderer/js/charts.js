/**
 * Charts Module
 * 
 * Handles chart rendering using Chart.js.
 */

const Charts = {
    expensesChart: null,
    cashflowChart: null,

    /**
     * Creates a diagonal hatching pattern for bars
 * @param {string} color - The base color
 * @returns {CanvasPattern}
 */
    createDiagonalPattern(color) {
        const shape = document.createElement('canvas');
        shape.width = 10;
        shape.height = 10;
        const c = shape.getContext('2d');

        c.strokeStyle = color;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(2, 0);
        c.lineTo(10, 8);
        c.stroke();
        c.beginPath();
        c.moveTo(0, 8);
        c.lineTo(2, 10);
        c.stroke();

        return c.createPattern(shape, 'repeat');
    },

    /**
     * Renders both charts
     */
    render() {
        this.renderExpensesChart();
        this.renderCashflowChart();
    },

    /**
     * Renders the stacked bar chart for expenses by category per day
     */
    renderExpensesChart() {
        const canvas = document.getElementById('expenses-chart');
        const ctx = canvas.getContext('2d');

        if (this.expensesChart) {
            this.expensesChart.destroy();
        }

        if (!DataStore.currentMonth) return;

        const { year, month } = DataStore.currentMonth;
        const daysInMonth = getDaysInMonth(year, month);
        const expensesByDay = DataStore.getExpensesByDay();

        // Create labels (days 1-31 with weekday initial)
        const labels = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dayOfWeek = new Date(year, month - 1, d).getDay();
            const weekdayInitial = getWeekdayName(dayOfWeek).charAt(0);
            labels.push(`${d}${weekdayInitial}`);
        }

        // Create datasets per category
        const datasets = [];
        const categories = DataStore.categories;

        for (const category of categories) {
            const data = [];

            for (let d = 1; d <= daysInMonth; d++) {
                const dayExpenses = expensesByDay[d]?.expenses || [];
                const categoryTotal = dayExpenses
                    .filter(e => e.categoryId === category.id)
                    .reduce((sum, e) => sum + (e.plannedAmount || 0), 0);
                data.push(categoryTotal);
            }

            // Only add if there's data
            if (data.some(v => v > 0)) {
                datasets.push({
                    label: category.name,
                    data: data,
                    backgroundColor: category.color,
                    borderColor: category.color,
                    borderWidth: 1
                });
            }
        }

        this.expensesChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        bottom: 20
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#5d5843',
                            font: { size: 11 }
                        }
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { color: '#ccbe8b' },
                        ticks: { color: '#5d5843' }
                    },
                    y: {
                        stacked: true,
                        grid: { color: '#ccbe8b' },
                        ticks: {
                            color: '#5d5843',
                            callback: (value) => formatCurrency(value)
                        }
                    }
                }
            }
        });
    },

    /**
     * Renders the cumulative cash flow comparison chart
     */
    renderCashflowChart() {
        const canvas = document.getElementById('cashflow-chart');
        const ctx = canvas.getContext('2d');

        if (this.cashflowChart) {
            this.cashflowChart.destroy();
        }

        if (!DataStore.currentMonth) return;

        const { year, month } = DataStore.currentMonth;
        const daysInMonth = getDaysInMonth(year, month);
        const expensesByDay = DataStore.getExpensesByDay();
        const incomeByDay = Income.getDailyDistribution();

        // Create labels (days 1-31 with weekday initial)
        const labels = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dayOfWeek = new Date(year, month - 1, d).getDay();
            const weekdayInitial = getWeekdayName(dayOfWeek).charAt(0);
            labels.push(`${d}${weekdayInitial}`);
        }

        // Calculate cumulative values
        const plannedExpenses = [];
        const paidExpenses = [];
        const plannedIncome = [];
        const receivedIncome = [];
        const plannedBalance = [];
        const actualBalance = [];

        let cumPlannedExp = 0;
        let cumPaidExp = 0;
        let cumPlannedInc = 0;
        let cumReceivedInc = 0;

        // Pre-calculate received income by day
        const incomes = DataStore.currentMonth.incomes || [];
        const dailyActuals = DataStore.currentMonth.dailyActualIncome || {};
        const receivedByDay = {};

        // Add received amounts from dated income objects
        for (const inc of incomes) {
            if (inc.receivedAmount > 0 && inc.receivedDate) {
                receivedByDay[inc.receivedDate] = (receivedByDay[inc.receivedDate] || 0) + inc.receivedAmount;
            }
        }

        // Add amounts from the daily actual income grid
        for (const day in dailyActuals) {
            receivedByDay[day] = (receivedByDay[day] || 0) + (dailyActuals[day] || 0);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dayExpenses = expensesByDay[d]?.expenses || [];
            const dayIncome = incomeByDay[d] || 0;
            const dayReceived = receivedByDay[d] || 0;

            // Planned and paid expenses
            const dayPlannedExp = dayExpenses.reduce((sum, e) => sum + (e.plannedAmount || 0), 0);
            const dayPaidExp = dayExpenses.reduce((sum, e) => sum + (e.paidAmount || 0), 0);

            cumPlannedExp += dayPlannedExp;
            cumPaidExp += dayPaidExp;
            cumPlannedInc += dayIncome;
            cumReceivedInc += dayReceived;

            plannedExpenses.push(cumPlannedExp);
            paidExpenses.push(cumPaidExp);
            plannedIncome.push(cumPlannedInc);
            receivedIncome.push(cumReceivedInc);
            plannedBalance.push(cumPlannedInc - cumPlannedExp);
            actualBalance.push(cumReceivedInc - cumPaidExp);
        }


        this.cashflowChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Receita Prevista',
                        data: plannedIncome,
                        backgroundColor: 'rgba(40, 167, 69, 0.5)',
                        borderColor: 'rgba(40, 167, 69, 1)',
                        borderWidth: 1,
                        stack: 'income'
                    },
                    {
                        label: 'Receita Recebida',
                        data: receivedIncome,
                        backgroundColor: 'rgba(40, 167, 69, 1)',
                        borderColor: 'rgba(40, 167, 69, 1)',
                        borderWidth: 1,
                        stack: 'income-actual'
                    },
                    {
                        label: 'Despesa Prevista',
                        data: plannedExpenses.map(v => -v),
                        backgroundColor: 'rgba(255, 182, 193, 0.7)', // Pink
                        borderColor: 'rgba(255, 105, 180, 1)', // Hot Pink
                        borderWidth: 1,
                        stack: 'expense'
                    },
                    {
                        label: 'Despesa Paga',
                        data: paidExpenses.map(v => -v),
                        backgroundColor: 'rgba(220, 53, 69, 1)',
                        borderColor: 'rgba(220, 53, 69, 1)',
                        borderWidth: 1,
                        stack: 'expense-actual'
                    },
                    {
                        label: 'Saldo Previsto',
                        data: plannedBalance,
                        type: 'line',
                        borderColor: '#00008B', // Dark Blue
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        pointRadius: 3,
                        tension: 0.1
                    },
                    {
                        label: 'Saldo Efetivo',
                        data: actualBalance,
                        type: 'line',
                        borderColor: 'rgba(74, 144, 217, 1)',
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        pointRadius: 3,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        bottom: 20
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#5d5843',
                            font: { size: 11 }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: '#ccbe8b' },
                        ticks: { color: '#5d5843' }
                    },
                    y: {
                        grid: { color: '#ccbe8b' },
                        ticks: {
                            color: '#5d5843',
                            callback: (value) => formatCurrency(Math.abs(value))
                        }
                    }
                }
            }
        });
    },

    /**
     * Initializes charts
     */
    init() {
        // Charts are rendered when view is switched
    }
};
