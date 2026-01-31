/**
 * Main Application Entry Point
 * 
 * Initializes all modules and handles global application state.
 */

const App = {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    currentView: 'entry',

    /**
     * Initializes the application
     */
    async init() {
        console.log('Initializing application...');

        // Initialize data store
        await DataStore.init();

        // Set up year dropdown (3 years range)
        this.setupYearDropdown();

        // Set current month/year in selectors
        document.getElementById('month-select').value = this.currentMonth;
        document.getElementById('year-select').value = this.currentYear;

        // Load current month data
        await this.loadMonth(this.currentYear, this.currentMonth);

        // Initialize modules
        Categories.init();
        Income.init();
        Calendar.init();
        Charts.init();
        Modals.init();
        PrintModule.init();

        // Set up event listeners
        this.setupEventListeners();
        this.setupMenuListeners();

        // Render initial view
        this.renderCurrentView();

        console.log('Application initialized');
    },

    /**
     * Sets up the year dropdown with a 3-year range
     */
    setupYearDropdown() {
        const select = document.getElementById('year-select');
        const currentYear = new Date().getFullYear();

        select.innerHTML = '';
        for (let year = currentYear - 1; year <= currentYear + 2; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        }
    },

    /**
     * Loads month data and refreshes the UI
     * @param {number} year - The year
     * @param {number} month - The month (1-12)
     */
    async loadMonth(year, month) {
        this.currentYear = year;
        this.currentMonth = month;

        await DataStore.loadMonth(year, month);

        this.renderCurrentView();
        this.updateSummary();
        // Expenses.renderFuturePanel();

        // Check for overdue items
        const overdue = Expenses.getOverdue();
        if (overdue.length > 0) {
            showToast(`Atenção: ${overdue.length} despesa(s) em atraso!`, 'warning', 5000);
        }
    },

    /**
     * Renders the current view
     */
    renderCurrentView() {
        // Hide all views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

        // Show selected view
        const view = document.getElementById(`${this.currentView}-view`);
        if (view) {
            view.classList.add('active');
        }

        // Highlight tab
        const tab = document.querySelector(`.tab-btn[data-view="${this.currentView}"]`);
        if (tab) {
            tab.classList.add('active');
        }

        // Render view-specific content
        switch (this.currentView) {
            case 'entry':
                Categories.render();
                Income.render();
                break;
            case 'calendar':
                Calendar.render();
                break;
            case 'charts-1':
                Charts.renderExpensesChart();
                break;
            case 'charts-2':
                Charts.renderCashflowChart();
                break;
            case 'print':
                PrintModule.render();
                break;
        }
    },

    /**
     * Updates the summary bar totals
     */
    updateSummary() {
        const totals = DataStore.calculateTotals();
        if (!totals) return;

        document.getElementById('total-planned-income').textContent = formatCurrency(totals.plannedIncome);
        document.getElementById('total-received-income').textContent = formatCurrency(totals.receivedIncome);
        document.getElementById('total-planned-expenses').textContent = formatCurrency(totals.plannedExpenses);
        document.getElementById('total-paid-expenses').textContent = formatCurrency(totals.paidExpenses);

        const plannedBalance = document.getElementById('planned-balance');
        plannedBalance.textContent = formatCurrency(Math.abs(totals.plannedBalance));
        plannedBalance.className = 'summary-value ' + (totals.plannedBalance >= 0 ? 'positive' : 'negative');

        const actualBalance = document.getElementById('actual-balance');
        actualBalance.textContent = formatCurrency(Math.abs(totals.actualBalance));
        actualBalance.className = 'summary-value ' + (totals.actualBalance >= 0 ? 'positive' : 'negative');

        const accumulatedFines = document.getElementById('accumulated-fines');
        if (accumulatedFines) {
            accumulatedFines.textContent = formatCurrency(totals.accumulatedFines);
        }
    },

    /**
     * Sets up UI event listeners
     */
    setupEventListeners() {
        // Month navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            let month = this.currentMonth - 1;
            let year = this.currentYear;
            if (month < 1) {
                month = 12;
                year--;
            }
            document.getElementById('month-select').value = month;
            document.getElementById('year-select').value = year;
            this.loadMonth(year, month);
        });

        document.getElementById('next-month').addEventListener('click', () => {
            let month = this.currentMonth + 1;
            let year = this.currentYear;
            if (month > 12) {
                month = 1;
                year++;
            }
            document.getElementById('month-select').value = month;
            document.getElementById('year-select').value = year;
            this.loadMonth(year, month);
        });

        document.getElementById('today-btn').addEventListener('click', () => {
            const now = new Date();
            document.getElementById('month-select').value = now.getMonth() + 1;
            document.getElementById('year-select').value = now.getFullYear();
            this.loadMonth(now.getFullYear(), now.getMonth() + 1);
        });

        // Month/year selectors
        document.getElementById('month-select').addEventListener('change', (e) => {
            const month = parseInt(e.target.value);
            const year = parseInt(document.getElementById('year-select').value);
            this.loadMonth(year, month);
        });

        document.getElementById('year-select').addEventListener('change', (e) => {
            const year = parseInt(e.target.value);
            const month = parseInt(document.getElementById('month-select').value);
            this.loadMonth(year, month);
        });

        // View tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentView = btn.dataset.view;
                this.renderCurrentView();
            });
        });
    },

    /**
     * Sets up menu event listeners from main process
     */
    setupMenuListeners() {
        window.api.onMenuNewMonth(() => {
            const now = new Date();
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            this.loadMonth(nextMonth.getFullYear(), nextMonth.getMonth() + 1);
        });

        window.api.onMenuCopyMonth(() => {
            Modals.openCopyMonthModal();
        });

        window.api.onMenuCategories(() => {
            Modals.openCategoryModal();
        });

        window.api.onMenuSettings(() => {
            Modals.openSettingsModal();
        });

        window.api.onMenuBackup(async () => {
            const result = await DataStore.createBackup();
            if (result.success) {
                showToast('Backup criado com sucesso!', 'success');
            } else {
                showToast('Erro ao criar backup: ' + result.error, 'error');
            }
        });

        window.api.onMenuViewCalendar(() => {
            this.currentView = 'calendar';
            this.renderCurrentView();
        });

        window.api.onMenuViewCharts(() => {
            this.currentView = 'charts-1';
            this.renderCurrentView();
        });

        window.api.onMenuViewSummary(() => {
            this.currentView = 'entry';
            this.renderCurrentView();
        });

        window.api.onMenuTutorial(() => {
            this.showTutorial();
        });

        window.api.onImportFile(async (filePath) => {
            try {
                const data = await window.api.readFile(filePath);
                if (data && data.months) {
                    // Import logic here
                    showToast('Dados importados com sucesso!', 'success');
                    this.loadMonth(this.currentYear, this.currentMonth);
                }
            } catch (error) {
                showToast('Erro ao importar: ' + error.message, 'error');
            }
        });

        window.api.onExportFile(async (filePath) => {
            try {
                const exportData = {
                    exportedAt: new Date().toISOString(),
                    settings: DataStore.settings,
                    categories: DataStore.categories,
                    currentMonth: DataStore.currentMonth
                };
                await window.api.writeFile(filePath, exportData);
                showToast('Dados exportados com sucesso!', 'success');
            } catch (error) {
                showToast('Erro ao exportar: ' + error.message, 'error');
            }
        });
    },

    /**
     * Shows the tutorial dialog
     */
    showTutorial() {
        const tutorialHtml = `
            <div class="tutorial-content">
                <div class="tutorial-step">
                    <h4>1. Adicionando Despesas</h4>
                    <p>Clique no botão + ao lado de uma categoria para adicionar uma nova despesa. 
                    Preencha a descrição, valor previsto e dia de vencimento.</p>
                </div>
                <div class="tutorial-step">
                    <h4>2. Datas Especiais</h4>
                    <ul>
                        <li><strong>Dia -1:</strong> Pagamentos atrasados do mês anterior</li>
                        <li><strong>Dia 0:</strong> Lembretes de despesas futuras</li>
                        <li><strong>Dia 1-31:</strong> Data normal de vencimento</li>
                    </ul>
                </div>
                <div class="tutorial-step">
                    <h4>3. Registrando Pagamentos</h4>
                    <p>Clique em uma despesa para editar e informar o valor pago e a data do pagamento.</p>
                </div>
                <div class="tutorial-step">
                    <h4>4. Visualizações</h4>
                    <p>Use as abas no topo para alternar entre Lançamentos, Calendário e Gráficos.</p>
                </div>
                <div class="tutorial-step">
                    <h4>5. Copiando Meses</h4>
                    <p>Use o menu Editar → Copiar Mês para copiar despesas de um mês para outro.</p>
                </div>
                <div class="tutorial-step">
                    <h4>6. Detalhes do Calendário</h4>
                    <p>No calendário clique em um dia para visualizar em detalhes as atividades financeiras e os correspondentes resumos do dia.</p>
                </div>
                <div class="tutorial-step">
                    <h4>7. Regras de Receitas em Fins de Semana e Feriados</h4>
                    <p>Receitas previstas e efetivas em fins de semana e feriados são inseridas pelo App no primeiro subsequente dia útil.</p>
                </div>
                <div class="tutorial-step">
                    <h4>8. Receitas Previstas Recorrentes (ALL)</h4>
                    <p>Receitas previstas definidas com dia "all" são médias previstas pelo usuário e se aplicam a todos os dias do mês, e sábados, domingos e feriados seguem porcentagens dessas receitas, conforme o especificado em configurações.</p>
                </div>
                <div class="tutorial-step">
                    <h4>9. Renda Efetiva Diária</h4>
                    <p>No final da página de Lançamentos, há uma grade com todos os dias do mês. Digite aqui o valor que efetivamente entrou em conta em cada dia. Estes campos possuem fundo azul.</p>
                </div>
                <div class="tutorial-step">
                    <h4>10. Configurações</h4>
                    <p>No menu Configurações você pode ajustar:</p>
                    <ul style="list-style-type: none; padding-left: 0;">
                        <li>a) porcentagem de renda recebida em fins de semana;</li>
                        <li>b) transferência automática para o primeiro dia útil subsequente;</li>
                        <li>c) localização para feriados;</li>
                        <li>d) frequência de backup.</li>
                    </ul>
                </div>

            </div>
        `;

        // Create temporary modal
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h3>Tutorial</h3>
                    <button class="modal-close">&times;</button>
                </div>
                ${tutorialHtml}
            </div>
        `;

        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        document.body.appendChild(modal);
    }
}
// Expose App globally to ensure access from other modules
window.App = App;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
