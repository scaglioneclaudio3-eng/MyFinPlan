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

        // Set up event listeners FIRST to ensure navigation works immediately
        this.setupEventListeners();
        this.setupMenuListeners();

        // Initialize data store
        try {
            console.log('Checking DataStore:', typeof DataStore);
            if (typeof DataStore === 'undefined') {
                throw new Error('DataStore is undefined. Check if dataStore.js loaded correctly.');
            }
            if (typeof generateId === 'undefined') {
                console.error('generateId is undefined. utils.js failed to load?');
                window.generateId = () => 'uuid-' + Math.random().toString(36).substr(2, 9); // Fallback
            }

            await DataStore.init();

            // Dump DOM after 3 seconds for debugging
            setTimeout(async () => {
                if (window.api && window.api.writeFile) {
                    await window.api.writeFile('dump.html', document.body.innerHTML);
                    console.log('DUMPED DOM TO dump.html');
                }
            }, 3000);

        } catch (error) {
            console.error('DataStore init failed:', error);
            try {
                const debugInfo = {
                    message: error.message,
                    stack: error.stack,
                    dataStoreType: typeof DataStore,
                    windowApi: typeof window.api
                };
                if (window.api && window.api.writeFile) {
                    await window.api.writeFile('debug_error.json', debugInfo);
                }
            } catch (e) {
                console.error('Failed to write debug file:', e);
            }

            // VISIBLE ERROR REPORTING
            document.body.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #1a1d24; color: #fff; font-family: sans-serif; flex-direction: column; text-align: center; padding: 20px;">
                    <h1 style="color: #dc3545; margin-bottom: 20px;">Erro Crítico ao Inicializar</h1>
                    <p style="font-size: 18px; margin-bottom: 10px;">O aplicativo não conseguiu carregar os dados.</p>
                    <p style="color: #aaa; margin-bottom: 30px;">Detalhes: ${error.message}</p>
                    <div style="background: #2d323c; padding: 15px; border-radius: 6px; text-align: left; max-width: 800px; overflow: auto; margin-bottom: 20px;">
                        <code style="color: #e8eaed;">${error.stack}</code>
                    </div>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #4a90d9; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 16px;">Tentar Novamente</button>
                </div>
            `;
            return; // Stop initialization
        }

        // Setup language
        if (window.i18n && DataStore.settings && DataStore.settings.language) {
            window.i18n.setLanguage(DataStore.settings.language);
            const langToggleBtn = document.getElementById('lang-toggle-btn');
            if (langToggleBtn) {
                langToggleBtn.textContent = DataStore.settings.language === 'pt-BR' ? 'EN' : 'PT';
            }
        }

        // Set up year dropdown (3 years range)
        this.setupYearDropdown();

        const monthSelect = document.getElementById('month-select');
        const yearSelect = document.getElementById('year-select');

        if (monthSelect) monthSelect.value = this.currentMonth;
        if (yearSelect) yearSelect.value = this.currentYear;

        // Global error handler for debugging
        window.onerror = function (message, source, lineno, colno, error) {
            console.error('Global error:', error);
            showToast('Erro inesperado: ' + message, 'error');
            return false;
        };

        // Initialize modules safely
        try {
            Categories.init();
        } catch (e) { console.error('Categories init failed', e); }

        try {
            Income.init();
        } catch (e) { console.error('Income init failed', e); }

        try {
            Calendar.init();
        } catch (e) { console.error('Calendar init failed', e); }

        try {
            Charts.init();
        } catch (e) { console.error('Charts init failed', e); }

        try {
            Modals.init();
        } catch (e) { console.error('Modals init failed', e); }

        try {
            PrintModule.init();
        } catch (e) { console.error('PrintModule init failed', e); }

        // Load current month data
        try {
            await this.loadMonth(this.currentYear, this.currentMonth);
        } catch (error) {
            console.error('Failed to load initial month:', error);
            showToast('Erro ao carregar dados do mês inicial. Iniciando vazio.', 'warning');
            // Ensure dataStore has basic structure even if load failed
            if (!DataStore.currentMonth) {
                const monthId = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}`;
                DataStore.currentMonth = {
                    id: monthId,
                    year: this.currentYear,
                    month: this.currentMonth,
                    expenses: [],
                    incomes: [],
                    dailyActualIncome: {},
                    dailyActualIncomeDetails: {},
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
        }

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

        // Update chart month displays
        const monthNames = [
            window.i18n.t('month_1'), window.i18n.t('month_2'), window.i18n.t('month_3'), 
            window.i18n.t('month_4'), window.i18n.t('month_5'), window.i18n.t('month_6'), 
            window.i18n.t('month_7'), window.i18n.t('month_8'), window.i18n.t('month_9'), 
            window.i18n.t('month_10'), window.i18n.t('month_11'), window.i18n.t('month_12')
        ];
        const monthName = monthNames[this.currentMonth - 1] || '';
        const monthText = ` - ${monthName} ${this.currentYear}`;
        document.querySelectorAll('.chart-month-display').forEach(el => {
            el.textContent = monthText;
        });

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



        const exceedsPlanned = document.getElementById('exceeds-planned');
        if (exceedsPlanned) {
            exceedsPlanned.textContent = formatCurrency(totals.exceedsPlanned);
        }
    },

    /**
     * Sets up UI event listeners
     */
    setupEventListeners() {
        // Language Toggle
        const langToggleBtn = document.getElementById('lang-toggle-btn');
        if (langToggleBtn) {
            langToggleBtn.addEventListener('click', () => {
                if (window.i18n) {
                    const newLang = window.i18n.getLanguage() === 'pt-BR' ? 'en-US' : 'pt-BR';
                    window.i18n.setLanguage(newLang);
                }
            });
        }

        window.addEventListener('languageChanged', async (e) => {
            const langToggleBtn = document.getElementById('lang-toggle-btn');
            if (langToggleBtn) {
                langToggleBtn.textContent = e.detail.language === 'pt-BR' ? 'EN' : 'PT';
            }
            if (DataStore && DataStore.settings) {
                DataStore.settings.language = e.detail.language;
                await DataStore.saveSettings();
            }
            this.updateSummary();
            this.renderCurrentView();
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
            let month = parseInt(this.currentMonth) + 1;
            let year = parseInt(this.currentYear);
            if (month > 12) {
                month = 1;
                year++;
            }
            
            const monthSelect = document.getElementById('month-select');
            const yearSelect = document.getElementById('year-select');
            if (monthSelect) monthSelect.value = month;
            if (yearSelect) yearSelect.value = year;

            this.loadMonth(year, month);
        });

        window.api.onMenuCopyMonth(() => {
            Modals.openCopyMonthModal();
        });



        window.api.onMenuSettings(() => {
            Modals.openSettingsModal();
        });

        window.api.onMenuBackup(async () => {
            if (typeof Modals !== 'undefined' && Modals.openBackupModal) {
                Modals.openBackupModal();
            } else {
                showToast('Erro interno: Módulo de modais não carregado.', 'error');
            }
        });



        window.api.onMenuTutorial(() => {
            this.showTutorial();
        });

        window.api.onMenuImport(() => {
            if (typeof Modals !== 'undefined' && Modals.openImportModal) {
                Modals.openImportModal();
            } else {
                showToast('Erro interno: Módulo de modais não carregado.', 'error');
            }
        });

        window.api.onMenuExport(() => {
            if (typeof Modals !== 'undefined' && Modals.openExportModal) {
                Modals.openExportModal();
            } else {
                showToast('Erro interno: Módulo de modais não carregado.', 'error');
            }
        });
    },

    /**
     * Shows the tutorial dialog
     */
    showTutorial() {
        const t = window.i18n ? window.i18n.t : (key) => key;
        const tutorialHtml = `
            <div class="tutorial-content" style="max-height: 70vh; overflow-y: auto; padding-right: 15px;">
                <div class="tutorial-step">
                    <h4>${t('tut_s1_t')}</h4>
                    <p>${t('tut_s1_d')}</p>
                </div>
                <div class="tutorial-step">
                    <h4>${t('tut_s2_t')}</h4>
                    <p>${t('tut_s2_d')}</p>
                </div>
                <div class="tutorial-step">
                    <h4>${t('tut_s3_t')}</h4>
                    <p>${t('tut_s3_d')}</p>
                </div>
                <div class="tutorial-step">
                    <h4>${t('tut_s4_t')}</h4>
                    <p>${t('tut_s4_d')}</p>
                </div>
                <div class="tutorial-step">
                    <h4>${t('tut_s5_t')}</h4>
                    <p>${t('tut_s5_d')}</p>
                </div>
                <div class="tutorial-step">
                    <h4>${t('tut_s6_t')}</h4>
                    <p>${t('tut_s6_d')}</p>
                </div>
                <div class="tutorial-step">
                    <h4>${t('tut_s7_t')}</h4>
                    <p>${t('tut_s7_d')}</p>
                </div>
                <div class="tutorial-step">
                    <h4>${t('tut_s8_t')}</h4>
                    <p>${t('tut_s8_d')}</p>
                </div>
                <div class="tutorial-step">
                    <h4>${t('tut_s9_t')}</h4>
                    <p>${t('tut_s9_d')}</p>
                </div>
            </div>
        `;

        // Create temporary modal
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content modal-lg" id="tutorial-modal-bg">
                <div class="modal-header" style="border-bottom-color: rgba(0,0,0,0.1);">
                    <h3 style="color: #000;">${t('tut_title')}</h3>
                    <button class="modal-close" style="color: #000;">&times;</button>
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
