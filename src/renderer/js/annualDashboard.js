/**
 * Annual Dashboard functionality (Original Theme, Straight lines)
 */

let annualChartInstance = null;
let annualChartData = null;
let visibleCategories = new Set();
let allCategoryIds = [];

const chartColors = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
    '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
    '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
];

async function initializeAnnualDashboard() {
    const year = document.getElementById('year-select').value || new Date().getFullYear();
    const data = await window.api.getYearData(year);

    // Add general aggregates
    const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // We will aggregate expenses per category
    const categoriesMap = new Map(); // id -> { name, color, data: [12 months of values] }
    
    // Default categories
    categoriesMap.set('total_income', { name: 'Total Receitas', color: '#28a745', data: new Array(12).fill(0) });
    categoriesMap.set('total_expense', { name: 'Total Despesas', color: '#dc3545', data: new Array(12).fill(0) });

    for (let m = 0; m < 12; m++) {
        const monthId = `${year}-${String(m + 1).padStart(2, '0')}`;
        const monthData = data.months[monthId];
        if (!monthData) continue;

        let monthIncome = 0;
        let monthExpense = 0;

        // Incomes
        if (monthData.incomes) {
            for (const inc of monthData.incomes) {
                const received = (typeof inc.receivedAmount === 'number') ? inc.receivedAmount : (inc.plannedAmount || 0);
                monthIncome += received;
            }
        }

        // Expenses
        if (monthData.expenses) {
            for (const exp of monthData.expenses) {
                // If the expense has actual payments, sum them
                let paid = 0;
                if (monthData.dailyActualExpenseDetails) {
                    for (const day in monthData.dailyActualExpenseDetails) {
                        const items = monthData.dailyActualExpenseDetails[day][exp.categoryId];
                        if (items) {
                            for (const item of items) {
                                if (item.expenseId === exp.id) {
                                    paid += item.amount;
                                }
                            }
                        }
                    }
                } else {
                    paid = exp.paidAmount || 0;
                }

                if (paid === 0) {
                    paid = exp.plannedAmount || 0; // fallback to planned if not paid yet
                }

                monthExpense += paid;

                // Aggregate by category
                if (!categoriesMap.has(exp.categoryId)) {
                    const cat = data.categories.find(c => c.id === exp.categoryId);
                    categoriesMap.set(exp.categoryId, {
                        name: cat ? cat.name : 'Desconhecida',
                        color: cat ? cat.color : chartColors[categoriesMap.size % chartColors.length],
                        data: new Array(12).fill(0)
                    });
                }
                categoriesMap.get(exp.categoryId).data[m] += paid;
            }
        }

        categoriesMap.get('total_income').data[m] = monthIncome;
        categoriesMap.get('total_expense').data[m] = monthExpense;
    }

    annualChartData = {
        labels: monthLabels,
        categories: categoriesMap
    };

    allCategoryIds = Array.from(categoriesMap.keys());
    if (visibleCategories.size === 0) {
        visibleCategories.add('total_income');
        visibleCategories.add('total_expense');
    }

    renderAnnualToggles();
    renderAnnualChart();
}

function renderAnnualToggles() {
    const container = document.getElementById('annual-category-toggles');
    if (!container) return;
    container.innerHTML = '';

    for (const id of allCategoryIds) {
        const cat = annualChartData.categories.get(id);
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '8px';
        label.style.cursor = 'pointer';
        label.style.fontSize = '14px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = visibleCategories.has(id);
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                visibleCategories.add(id);
            } else {
                visibleCategories.delete(id);
            }
            updateAnnualChart();
        });

        const colorBox = document.createElement('span');
        colorBox.style.width = '12px';
        colorBox.style.height = '12px';
        colorBox.style.display = 'inline-block';
        colorBox.style.backgroundColor = cat.color;
        colorBox.style.borderRadius = '2px';

        const textNode = document.createTextNode(cat.name);

        label.appendChild(checkbox);
        label.appendChild(colorBox);
        label.appendChild(textNode);
        container.appendChild(label);
    }
}

function renderAnnualChart() {
    const canvas = document.getElementById('annual-chart');
    if (!canvas) return;

    if (annualChartInstance) {
        annualChartInstance.destroy();
    }

    const datasets = [];
    for (const id of allCategoryIds) {
        if (!visibleCategories.has(id)) continue;

        const cat = annualChartData.categories.get(id);
        datasets.push({
            label: cat.name,
            data: cat.data,
            borderColor: cat.color,
            backgroundColor: cat.color + '33', // 20% opacity
            tension: 0, // STRAIGHT LINES (requested by user)
            fill: false,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        });
    }

    annualChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: annualChartData.labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // We use the custom sidebar toggles
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                        }
                    }
                }
            }
        }
    });
}

function updateAnnualChart() {
    renderAnnualChart();
}

window.addEventListener('DOMContentLoaded', () => {
    // Add logic to refresh annual chart when tab is clicked
    const annualTabBtn = document.querySelector('[data-view="annual"]');
    if (annualTabBtn) {
        annualTabBtn.addEventListener('click', () => {
            initializeAnnualDashboard();
        });
    }

    // Update if year changes while on annual tab
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
        yearSelect.addEventListener('change', () => {
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab && activeTab.dataset.view === 'annual') {
                initializeAnnualDashboard();
            }
        });
    }
});
