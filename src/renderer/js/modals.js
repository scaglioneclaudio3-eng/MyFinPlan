/**
 * Modals Module
 * 
 * Handles all modal dialogs in the application.
 */

const Modals = {
    /**
     * Opens a modal by ID
     * @param {string} modalId - The modal element ID
     */
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    },

    /**
     * Closes a modal by ID
     * @param {string} modalId - The modal element ID
     */
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    },

    /**
     * Closes all open modals
     */
    closeAll() {
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
    },

    /**
     * Opens the category modal for add/edit
     * @param {Object|null} category - Existing category to edit, or null for new
     */
    openCategoryModal(category = null) {
        const modal = document.getElementById('category-modal');
        const title = document.getElementById('category-modal-title');
        const nameInput = document.getElementById('category-name');
        const colorInput = document.getElementById('category-color');
        const form = document.getElementById('category-form');

        if (category) {
            title.textContent = 'Editar Categoria';
            nameInput.value = category.name;
            colorInput.value = category.color;
            form.dataset.categoryId = category.id;
        } else {
            title.textContent = 'Nova Categoria';
            nameInput.value = '';
            colorInput.value = '#4a90d9';
            delete form.dataset.categoryId;
        }

        this.open('category-modal');
        nameInput.focus();
    },

    /**
     * Opens the expense modal for add/edit
     * @param {Object|null} expense - Existing expense to edit, or null for new
     * @param {string} categoryId - Category ID for new expenses
     */
    openExpenseModal(expense = null, categoryId = null) {
        const modal = document.getElementById('expense-modal');
        const title = document.getElementById('expense-modal-title');
        const form = document.getElementById('expense-form');
        const deleteBtn = document.getElementById('delete-expense-btn');

        // Reset form
        form.reset();

        document.getElementById('expense-id').value = expense?.id || '';
        document.getElementById('expense-category-id').value = categoryId || expense?.categoryId || '';

        if (expense) {
            title.textContent = 'Editar Despesa';
            document.getElementById('expense-description').readOnly = false;
            document.getElementById('expense-planned-amount').readOnly = false;
            document.getElementById('expense-planned-date').readOnly = false;

            document.getElementById('expense-description').value = expense.description || '';
            document.getElementById('expense-planned-amount').value = expense.plannedAmount || '';
            document.getElementById('expense-planned-date').value = expense.plannedDate ?? '';
            document.getElementById('expense-is-template').checked = expense.isTemplate || false;
            document.getElementById('expense-special-type').value = expense.specialType || '';
            deleteBtn.style.display = 'block';
            title.textContent = 'Editar Lançamento';

            // Calculator para Valor Efetivo Pago e Dias
            let totalPaid = 0;
            let paidDays = [];
            const details = DataStore.currentMonth?.dailyActualExpenseDetails || {};
            for (const [dayKey, catData] of Object.entries(details)) {
                let dayHasPayment = false;
                for (const catArray of Object.values(catData)) {
                    for (const item of catArray) {
                        if (item.expenseId === expense.id) {
                            totalPaid += (item.amount || 0);
                            dayHasPayment = true;
                        }
                    }
                }
                if (dayHasPayment) paidDays.push(dayKey);
            }
            
            document.getElementById('expense-paid-amount').value = totalPaid > 0 ? totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
            document.getElementById('expense-paid-dates').value = paidDays.length > 0 ? paidDays.join(', ') : '';
        } else {
            title.textContent = 'Nova Despesa';
            deleteBtn.style.display = 'none';
            document.getElementById('expense-paid-amount').value = '';
            document.getElementById('expense-paid-dates').value = '';
        }

        // Manage visibility of planned fields for "Não Planejadas"
        const activeCatId = categoryId || expense?.categoryId || '';
        let isUnplanned = false;
        if (activeCatId) {
            const cat = DataStore.categories.find(c => c.id === activeCatId);
            if (cat && cat.name.toLowerCase() === 'não planejadas') {
                isUnplanned = true;
            }
        }

        const plannedAmountInput = document.getElementById('expense-planned-amount');
        const plannedDateInput = document.getElementById('expense-planned-date');
        const plannedRow = plannedAmountInput.closest('.form-row');
        
        if (isUnplanned) {
            plannedRow.style.display = 'none';
            plannedAmountInput.required = false;
            plannedDateInput.required = false;
            
            // Set some valid defaults so the form can still submit if needed
            plannedAmountInput.value = 0;
            plannedDateInput.value = expense?.plannedDate || 1; 
        } else {
            plannedRow.style.display = '';
            plannedAmountInput.required = true;
            plannedDateInput.required = true;
        }

        this.open('expense-modal');

        document.getElementById('expense-description').focus();

        // Initialize blocking state
        this.toggleExpenseBlocking();
    },

    /**
     * Toggles blocking of payment fields based on planned date (0 = future reminder)
     * @param {string|number} plannedDateValue - The value of the planned date input
     */
    toggleExpenseBlocking() {
        // Application State
        const specialTypeInput = document.getElementById('expense-special-type');
        if (specialTypeInput) {
            const plannedDateInput = document.getElementById('expense-planned-date');
            const plannedDateValue = (plannedDateInput.value || '').toString().trim().toLowerCase();
            const isAll = plannedDateValue === 'all';
            const isFds = plannedDateValue === 'fds';

            if (isAll || isFds) {
                specialTypeInput.disabled = true;
                specialTypeInput.value = '';
                specialTypeInput.title = 'Despesas diárias/fds não podem ser trabalhistas';
            } else {
                specialTypeInput.disabled = false;
                specialTypeInput.title = '';
            }
        }
    },

    /**
     * Opens the Income modal
     * @param {Object} income - Income data to edit (optional)
     */
    openIncomeModal(income = null) {
        const form = document.getElementById('income-form');
        form.reset();
        document.getElementById('income-id').value = '';
        document.getElementById('income-modal-title').textContent = income ? 'Editar Receita' : 'Nova Receita';
        document.getElementById('delete-income-btn').style.display = income ? 'block' : 'none';

        if (income) {
            document.getElementById('income-id').value = income.id;
            document.getElementById('income-description').readOnly = false;
            document.getElementById('income-planned-amount').readOnly = false;
            document.getElementById('income-planned-date').readOnly = false;
            document.getElementById('income-description').value = income.description;

            // Format numbers for text input (comma as decimal)
            const formatForInput = (val) => {
                if (val === null || val === undefined) return '';
                // Ensure it's a number string with comma for decimal
                return val.toString().replace('.', ',');
            };

            document.getElementById('income-planned-amount').value = formatForInput(income.plannedAmount);
            document.getElementById('income-planned-date').value = income.plannedDate;

            // Calculator para Valor Efetivo Recebido e Dias
            let totalReceived = 0;
            let receivedDays = [];
            const details = DataStore.currentMonth?.dailyActualIncomeDetails || {};
            for (const [dayKey, itemsArray] of Object.entries(details)) {
                let dayHasReceipt = false;
                for (const item of itemsArray) {
                    if (item.incomeId === income.id) {
                        totalReceived += (item.amount || 0);
                        dayHasReceipt = true;
                    }
                }
                if (dayHasReceipt) receivedDays.push(dayKey);
            }
            
            document.getElementById('income-received-amount').value = totalReceived > 0 ? totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
            document.getElementById('income-received-date').value = receivedDays.length > 0 ? receivedDays.join(', ') : '';
        } else {
            document.getElementById('income-planned-date').readOnly = false;
            document.getElementById('income-planned-amount').readOnly = false;
            document.getElementById('income-description').readOnly = false;
            document.getElementById('income-planned-date').value = ''; // Default for new income (empty allows editing)
            document.getElementById('income-received-amount').value = '';
            document.getElementById('income-received-date').value = '';
        }

        this.open('income-modal');
        document.getElementById('income-description').focus();
    },

    /**
     * Opens the settings modal
     */
    openSettingsModal() {
        const settings = DataStore.settings;

        document.getElementById('setting-weekend-transfer').checked = settings.transferWeekendIncomeToMonday;
        document.getElementById('setting-saturday-pct').value = settings.saturdayIncomePercentage;
        document.getElementById('setting-sunday-pct').value = settings.sundayIncomePercentage;
        document.getElementById('setting-holiday-percentage').value = settings.holidayIncomePercentage ?? 0;
        document.getElementById('setting-expense-saturday-pct').value = settings.saturdayExpensePercentage ?? 100;
        document.getElementById('setting-expense-sunday-pct').value = settings.sundayExpensePercentage ?? 100;
        document.getElementById('setting-expense-holiday-pct').value = settings.holidayExpensePercentage ?? 100;
        document.getElementById('setting-state').value = settings.state || '';
        document.getElementById('setting-city').value = settings.city || '';
        document.getElementById('setting-backup-enabled').checked = settings.backupEnabled;
        document.getElementById('setting-backup-days').value = settings.backupIntervalDays;

        this.open('settings-modal');
    },

    /**
     * Opens the daily income details modal
     * @param {number} day - The day of the month
     */
    openDailyIncomeDetailsModal(day) {
        const modal = document.getElementById('daily-income-details-modal');
        const title = document.getElementById('daily-income-details-title');
        const container = document.getElementById('daily-income-entries');
        const saveBtn = document.getElementById('save-daily-income-btn');

        // Date Validation
        const now = new Date();
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const year = parseInt(DataStore.currentMonth.year);
        const month = parseInt(DataStore.currentMonth.month);
        const selectedDate = new Date(year, month - 1, parseInt(day));

        // Future check: selectedDate > todayDate
        const isFuture = selectedDate > todayDate;

        modal.dataset.day = day;

        // Reset modal state
        modal.classList.remove('read-only-mode');
        saveBtn.style.display = 'inline-block';
        if (document.getElementById('daily-income-warning')) {
            document.getElementById('daily-income-warning').remove();
        }

        if (isFuture) {
            title.textContent = `Detalhamento (Somente Leitura - Data Futura)`;
            modal.classList.add('read-only-mode');
            saveBtn.style.display = 'none';

            // Add warning
            const warning = document.createElement('div');
            warning.id = 'daily-income-warning';
            warning.className = 'alert alert-danger';
            warning.style.marginBottom = '10px';
            warning.style.textAlign = 'center';
            warning.textContent = 'Não é possível inserir valores efetivos em datas futuras.';

            const modalBody = modal.querySelector('.modal-body') || modal.querySelector('.modal-content');
            const header = modal.querySelector('.modal-header');
            if (header) header.after(warning);
        } else {
            title.textContent = `Detalhamento da Receita do Dia ${day}/${DataStore.currentMonth.month}`;
        }

        const allMonthIncomes = DataStore.currentMonth.incomes || [];
        
        if (!DataStore.currentMonth.dailyActualIncomeDetails) {
            DataStore.currentMonth.dailyActualIncomeDetails = {};
        }
        const existingDetails = DataStore.currentMonth.dailyActualIncomeDetails[day] || [];

        let html = `
            <div class="expense-detail-category-group category-card expanded" style="margin-bottom: 15px; border-left: 6px solid #4a90d9;">
                <div class="category-header" style="cursor: default;">
                    <span class="category-color" style="background-color: #4a90d9"></span>
                    <span class="category-name">Receitas Planejadas / Extras</span>
                </div>
                <div class="category-expenses" style="display: block;">
                    <table class="expense-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Descrição da Receita</th>
                                <th class="amount" style="width: 140px;">Valor Efetivo (R$)</th>
                            </tr>
                        </thead>
                        <tbody id="planned-incomes-tbody">
        `;

        allMonthIncomes.forEach(plannedInc => {
            const savedActual = existingDetails.find(a => a.incomeId === plannedInc.id);
            const actualValue = savedActual ? savedActual.amount : '';
            html += `
                <tr class="expense-detail-row planned-income" data-income-id="${plannedInc.id}">
                    <td>${plannedInc.description} <span style="font-size: 10px; color: #aaa;">(${plannedInc.plannedDate === 'all' ? 'Freq.' : `${plannedInc.plannedDate}`})</span></td>
                    <td class="amount">
                        <input type="number" step="0.01" class="editable-input actual-amount-input form-control" placeholder="0,00" value="${actualValue}" style="width: 100%; padding: 4px;" ${isFuture ? 'disabled' : ''}>
                    </td>
                </tr>
            `;
        });

        const extraActuals = existingDetails.filter(a => a.isExtra);
        extraActuals.forEach(extra => {
            html += `
                <tr class="expense-detail-row extra-income">
                    <td>
                        <input type="text" class="editable-input extra-desc-input form-control" placeholder="Descrição (Extra)" value="${extra.description}" style="width: 100%; padding: 4px;" ${isFuture ? 'disabled' : ''}>
                    </td>
                    <td class="amount">
                        <input type="number" step="0.01" class="editable-input actual-amount-input form-control" placeholder="0,00" value="${extra.amount}" style="width: 100%; padding: 4px;" ${isFuture ? 'disabled' : ''}>
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        container.querySelectorAll('.actual-amount-input').forEach(input => {
            input.addEventListener('input', () => this.updateDailyIncomeModalTotal());
        });

        if (!isFuture) {
            const globalAddExtraBtn = document.createElement('button');
            globalAddExtraBtn.type = 'button';
            globalAddExtraBtn.className = 'btn btn-outline btn-sm global-add-unplanned-btn';
            globalAddExtraBtn.style = 'margin-top: 15px; width: 100%; padding: 10px; font-weight: bold; border-style: dashed; border-radius: 8px;';
            globalAddExtraBtn.innerHTML = '+ Adicionar Outras Receitas Não Previstas';
            container.appendChild(globalAddExtraBtn);

            const unplannedContainer = document.createElement('div');
            unplannedContainer.id = 'unplanned-new-incomes-container';
            unplannedContainer.style = 'margin-top: 10px;';
            container.appendChild(unplannedContainer);

            globalAddExtraBtn.addEventListener('click', () => {
                const extraDiv = document.createElement('div');
                extraDiv.className = 'expense-detail-row global-extra-income';
                extraDiv.style = 'display: flex; margin-bottom: 8px; align-items: center; border: 1px solid var(--border-color); padding: 8px; border-radius: 4px;';
                extraDiv.innerHTML = `
                    <input type="text" class="editable-input extra-desc-input form-control" placeholder="Descrição (Não Prevista)" style="flex: 1; margin-right: 10px; padding: 6px;">
                    <input type="number" step="0.01" class="editable-input actual-amount-input form-control" placeholder="Valor Efetivo" style="width: 130px; margin-right: 10px; padding: 6px;">
                    <button type="button" class="btn-remove-global-extra" title="Remover" style="background: none; border: none; font-size: 1.5em; color: var(--danger-color); cursor: pointer;">&times;</button>
                `;
                
                extraDiv.querySelector('.btn-remove-global-extra').addEventListener('click', () => {
                    extraDiv.remove();
                    this.updateDailyIncomeModalTotal();
                });
                extraDiv.querySelector('.actual-amount-input').addEventListener('input', () => this.updateDailyIncomeModalTotal());

                unplannedContainer.appendChild(extraDiv);
                extraDiv.querySelector('.extra-desc-input').focus();
            });
        }

        this.updateDailyIncomeModalTotal();
        this.open('daily-income-details-modal');
    },

    updateDailyExpenseModalTotal() {
        let total = 0;
        const modal = document.getElementById('daily-expense-details-modal');
        modal.querySelectorAll('.actual-amount-input').forEach(input => {
            const val = parseFloat(input.value) || 0;
            total += val;
        });
        document.getElementById('daily-expense-modal-total').textContent = formatCurrency(total);
    },

    updateDailyIncomeModalTotal() {
        let total = 0;
        const modal = document.getElementById('daily-income-details-modal');
        if (modal) {
            modal.querySelectorAll('.actual-amount-input').forEach(input => {
                const val = parseFloat(input.value) || 0;
                total += val;
            });
            const totalSpan = document.getElementById('daily-income-modal-total');
            if (totalSpan) totalSpan.textContent = formatCurrency(total);
        }
    },

    async openDailyExpenseDetailsModal(day) {
        try {
            const modal = document.getElementById('daily-expense-details-modal');
            const title = document.getElementById('daily-expense-details-title');
            const container = document.getElementById('daily-expense-categories-container');
            const saveBtn = document.getElementById('save-daily-expense-btn');

            // Validation
            const now = new Date();
            const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const year = parseInt(DataStore.currentMonth.year);
            const month = parseInt(DataStore.currentMonth.month);
            const selectedDate = new Date(year, month - 1, parseInt(day));
            const isFuture = selectedDate > todayDate;

            modal.dataset.day = day;
            title.textContent = isFuture 
                ? `Detalhamento da Despesa (Somente Leitura - Futuro)` 
                : `Detalhamento da Despesa do Dia ${day}/${String(month).padStart(2, '0')}`;
            
            container.innerHTML = '';
            saveBtn.style.display = isFuture ? 'none' : 'inline-block';

            const categories = [...DataStore.categories].sort((a, b) => a.order - b.order);
            const expensesByDay = DataStore.getExpensesByDay();
            const allMonthExpenses = DataStore.currentMonth.expenses || [];
            
            if(!DataStore.currentMonth.dailyActualExpenseDetails) {
                DataStore.currentMonth.dailyActualExpenseDetails = {};
            }
            const existingDetails = DataStore.currentMonth.dailyActualExpenseDetails[day] || {};

            categories.forEach(cat => {
                const catPlanned = allMonthExpenses.filter(e => e.categoryId === cat.id);
                const catActuals = existingDetails[cat.id] || [];

                // Skip rendering if category has no planned expenses today and we are in future (read-only)
                if (isFuture && catPlanned.length === 0 && catActuals.length === 0) return;

                const catDiv = document.createElement('div');
                catDiv.className = 'expense-detail-category-group category-card expanded';
                catDiv.dataset.categoryId = cat.id;
                catDiv.style = `margin-bottom: 15px; border-left: 6px solid ${cat.color};`;

                let html = `
                    <div class="category-header" style="cursor: default;">
                        <span class="category-color" style="background-color: ${cat.color}"></span>
                        <span class="category-name">${cat.name}</span>
                    </div>
                    <div class="category-expenses" style="display: block;">
                        <table class="expense-table" style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th class="amount" style="width: 140px;">Valor Pago (R$)</th>
                                </tr>
                            </thead>
                            <tbody class="planned-items-container" data-cat-id="${cat.id}">
                `;

                catPlanned.forEach(plannedExp => {
                    const savedActual = catActuals.find(a => a.expenseId === plannedExp.id);
                    const actualValue = savedActual ? savedActual.amount : '';
                    html += `
                        <tr class="expense-detail-row planned-expense" data-expense-id="${plannedExp.id}">
                            <td>${plannedExp.description}</td>
                            <td class="amount">
                                <input type="number" step="0.01" class="editable-input actual-amount-input form-control" placeholder="0,00" value="${actualValue}" style="width: 100%; padding: 4px;" ${isFuture ? 'disabled' : ''}>
                            </td>
                        </tr>
                    `;
                });

                const extraActuals = catActuals.filter(a => a.isExtra);
                extraActuals.forEach(extra => {
                    html += `
                        <tr class="expense-detail-row extra-expense">
                            <td>
                                <input type="text" class="editable-input extra-desc-input form-control" placeholder="Descrição (Extra)" value="${extra.description}" style="width: 100%; padding: 4px;" ${isFuture ? 'disabled' : ''}>
                            </td>
                            <td class="amount">
                                <input type="number" step="0.01" class="editable-input actual-amount-input form-control" placeholder="0,00" value="${extra.amount}" style="width: 100%; padding: 4px;" ${isFuture ? 'disabled' : ''}>
                            </td>
                        </tr>
                    `;
                });

                html += `
                            </tbody>
                        </table>
                        ${!isFuture ? `<button type="button" class="btn btn-outline btn-sm btn-add-extra-cat" style="margin-top: 5px; width: 100%; border-style: dashed; border-radius: 4px;">+ Adicionar Despesa Efetiva</button>` : ''}
                    </div>
                `;
                
                catDiv.innerHTML = html;
                
                catDiv.querySelectorAll('.actual-amount-input').forEach(input => {
                    input.addEventListener('input', () => this.updateDailyExpenseModalTotal());
                });

                if (!isFuture) {
                    const addExtraBtn = catDiv.querySelector('.btn-add-extra-cat');
                    if (addExtraBtn) {
                        addExtraBtn.addEventListener('click', () => {
                            const tbody = catDiv.querySelector('tbody');
                            const tr = document.createElement('tr');
                            tr.className = 'expense-detail-row extra-expense';
                            tr.innerHTML = `
                                <td>
                                    <input type="text" class="editable-input extra-desc-input form-control" placeholder="Descrição da Despesa Efetiva" style="width: 100%; padding: 4px;">
                                </td>
                                <td class="amount">
                                    <input type="number" step="0.01" class="editable-input actual-amount-input form-control" placeholder="0,00" style="width: 100%; padding: 4px;">
                                </td>
                            `;
                            tr.querySelector('.actual-amount-input').addEventListener('input', () => this.updateDailyExpenseModalTotal());
                            tbody.appendChild(tr);
                            tr.querySelector('.extra-desc-input').focus();
                        });
                    }
                }

                container.appendChild(catDiv);
            });

            if (!isFuture) {
                const globalAddExtraBtn = document.createElement('button');
                globalAddExtraBtn.type = 'button';
                globalAddExtraBtn.className = 'btn btn-outline btn-sm global-add-unplanned-btn';
                globalAddExtraBtn.style = 'margin-top: 15px; width: 100%; padding: 10px; font-weight: bold; border-style: dashed; border-radius: 8px;';
                globalAddExtraBtn.innerHTML = '+ Adicionar Nova Despesa Não Planejada';
                container.appendChild(globalAddExtraBtn);

                const unplannedContainer = document.createElement('div');
                unplannedContainer.id = 'unplanned-new-entries-container';
                unplannedContainer.style = 'margin-top: 10px;';
                container.appendChild(unplannedContainer);

                globalAddExtraBtn.addEventListener('click', () => {
                    const extraDiv = document.createElement('div');
                    extraDiv.className = 'expense-detail-row global-extra-expense';
                    extraDiv.style = 'display: flex; margin-bottom: 8px; align-items: center; border: 1px solid var(--border-color); padding: 8px; border-radius: 4px;';
                    extraDiv.innerHTML = `
                        <input type="text" class="editable-input extra-desc-input form-control" placeholder="Descrição (Não Planejada)" style="flex: 1; margin-right: 10px; padding: 6px;">
                        <input type="number" step="0.01" class="editable-input actual-amount-input form-control" placeholder="Valor Pago" style="width: 130px; margin-right: 10px; padding: 6px;">
                        <button type="button" class="btn-remove-global-extra" title="Remover" style="background: none; border: none; font-size: 1.5em; color: var(--danger-color); cursor: pointer;">&times;</button>
                    `;
                    
                    extraDiv.querySelector('.btn-remove-global-extra').addEventListener('click', () => {
                        extraDiv.remove();
                        this.updateDailyExpenseModalTotal();
                    });
                    extraDiv.querySelector('.actual-amount-input').addEventListener('input', () => this.updateDailyExpenseModalTotal());

                    unplannedContainer.appendChild(extraDiv);
                    extraDiv.querySelector('.extra-desc-input').focus();
                });
            }

        if (container.children.length === 0) {
            container.innerHTML = '<p class="text-muted text-center" style="padding: 20px;">Nenhuma categoria configurada ou dados não disponíveis.</p>';
        }

        this.updateDailyExpenseModalTotal();
        this.open('daily-expense-details-modal');

        const computedStyle = window.getComputedStyle(modal);

        } catch (e) {
            console.error(e);
            if (window.api && window.api.showMessage) {
                window.api.showMessage('Erro fatal ao renderizar o modal:\n' + e.message + '\n\n' + e.stack, 'error');
            }
        }
    },



    /**
     * Opens the copy month modal
     */
    async openCopyMonthModal() {
        const sourceSelect = document.getElementById('copy-source-month');
        const targetSelect = document.getElementById('copy-target-month');

        // Get available months
        const months = await DataStore.getAvailableMonths();

        // Populate source dropdown
        sourceSelect.innerHTML = months.map(m => {
            const [year, month] = m.split('-');
            return `<option value="${m}">${getMonthName(parseInt(month))} ${year}</option>`;
        }).join('');

        // Populate target dropdown with future options
        const currentDate = new Date();
        targetSelect.innerHTML = '';

        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
            const monthId = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = `${getMonthName(date.getMonth() + 1)} ${date.getFullYear()}`;
            targetSelect.innerHTML += `<option value="${monthId}">${label}</option>`;
        }

        this.open('copy-month-modal');
    },

    /**
     * Initializes modal event handlers
     */
    init() {
        // Close button handlers
        document.querySelectorAll('.modal-close, [data-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', () => this.closeAll());
        });

        // Click outside to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAll();
                }
            });
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });

        // Category form submission
        document.getElementById('category-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('category-name').value.trim();
            const color = document.getElementById('category-color').value;
            const categoryId = e.target.dataset.categoryId;

            if (!name) {
                showToast('Nome é obrigatório', 'error');
                return;
            }

            if (categoryId) {
                await DataStore.updateCategory(categoryId, { name, color });
                showToast('Categoria atualizada', 'success');
            } else {
                await DataStore.addCategory({ name, color });
                showToast('Categoria criada', 'success');
            }

            this.closeAll();
            Categories.render();
        });

        // Listen for changes in planned date AND amount to toggle blocking
        document.getElementById('expense-planned-date').addEventListener('input', () => {
            this.toggleExpenseBlocking();
        });
        document.getElementById('expense-planned-amount').addEventListener('input', () => {
            this.toggleExpenseBlocking();
        });

        // Block deleted - no toggling income blocking anymore

        // --- Enter Key Validation Listeners for Income ---

        // 1. Planned Amount -> Check Date
        document.getElementById('income-planned-amount').addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent submit if needed, or just validate
                if (e.target.value && !document.getElementById('income-planned-date').value) {
                    await window.api.showMessage('por favor insira a data', 'warning');
                    document.getElementById('income-planned-date').focus();
                }
            }
        });

        // 2. Planned Date -> Check Amount
        document.getElementById('income-planned-date').addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.target.value && !document.getElementById('income-planned-amount').value) {
                    await window.api.showMessage('por favor insira a receita', 'warning');
                    document.getElementById('income-planned-amount').focus();
                }
            }
        });

        // Check deleted - No received enter key validation anymore

        // Expense form submission
        document.getElementById('expense-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const specialType = document.getElementById('expense-special-type').value || null;
            const plannedDateInput = document.getElementById('expense-planned-date').value.trim().toLowerCase();
            let plannedDate = 0;
            if (plannedDateInput === 'all' || plannedDateInput === 'fds') {
                plannedDate = plannedDateInput;
            } else {
                plannedDate = parseInt(plannedDateInput) || 0;
            }

            // Check for worker expense non-standard dates
            const isWorkerExpense = ['SALARY_ADVANCE', 'INSS', 'FGTS', 'FIFTH_WORKING_DAY', 'VALE_TRANSPORTE', 'VALE_ALIMENTACAO', 'CESTA_BASICA'].includes(specialType);
            const daysInMonth = getDaysInMonth(DataStore.currentMonth.year, DataStore.currentMonth.month);
            const isStandardDate = plannedDate === 15 || plannedDate === daysInMonth || plannedDate === 'all' || plannedDate === 'fds';

            if (isWorkerExpense && !isStandardDate) {
                // Store form data temporarily to use after choice
                this.pendingExpense = {
                    categoryId: document.getElementById('expense-category-id').value,
                    description: document.getElementById('expense-description').value.trim(),
                    plannedAmount: parseFloat(document.getElementById('expense-planned-amount').value) || 0,
                    plannedDate: plannedDate,
                    isTemplate: document.getElementById('expense-is-template').checked,
                    specialType: specialType,
                    id: document.getElementById('expense-id').value
                };
                this.open('worker-choice-modal');
                return;
            }

            await this.saveExpenseFromForm();
        });

        // Worker choice modal handlers
        document.getElementById('worker-choice-keep').addEventListener('click', async () => {
            if (this.pendingExpense) {
                this.pendingExpense.userDateOverride = true;
                await this.finalizePendingExpense();
            }
        });

        document.getElementById('worker-choice-15').addEventListener('click', async () => {
            if (this.pendingExpense) {
                this.pendingExpense.plannedDate = 15;
                this.pendingExpense.userDateOverride = false;
                await this.finalizePendingExpense();
            }
        });

        document.getElementById('worker-choice-last').addEventListener('click', async () => {
            if (this.pendingExpense) {
                const daysInMonth = getDaysInMonth(DataStore.currentMonth.year, DataStore.currentMonth.month);
                this.pendingExpense.plannedDate = daysInMonth;
                this.pendingExpense.userDateOverride = false;
                await this.finalizePendingExpense();
            }
        });

        // Delete expense button
        document.getElementById('delete-expense-btn').addEventListener('click', async () => {
            const expenseId = document.getElementById('expense-id').value;
            if (expenseId && await window.api.showConfirm('Tem certeza que deseja excluir esta despesa?')) {
                await DataStore.deleteExpense(expenseId);
                showToast('Despesa excluída', 'success');
                this.closeAll();
                Categories.render();
                App.updateSummary();
            }
        });

        // Income form submission
        document.getElementById('income-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            // Parse planned date
            const plannedDateInput = document.getElementById('income-planned-date').value.trim().toLowerCase();
            let plannedDate = 'all';

            if (plannedDateInput === 'all') {
                plannedDate = 'all';
            } else {
                const day = parseInt(plannedDateInput);
                const daysInMonth = getDaysInMonth(DataStore.currentMonth.year, DataStore.currentMonth.month);

                if (!isNaN(day) && day >= 1 && day <= daysInMonth) {
                    plannedDate = day;
                } else if (document.getElementById('income-planned-date').value.trim() === '') {
                    // Allow empty during intermediate editing
                    plannedDate = null;
                } else {
                    showToast(`Dia previsto inválido. Digite "all" ou um dia entre 1 e ${daysInMonth}.`, 'error');
                    return;
                }
            }

            const description = document.getElementById('income-description').value.trim();

            // Helper parsing for text inputs
            const parseAmount = (val) => {
                if (!val) return NaN;
                // Robust parsing: remove dots (thousands), replace comma (decimal)
                return parseFloat(val.replace(/\./g, '').replace(',', '.'));
            };

            const plannedAmountVal = document.getElementById('income-planned-amount').value;
            const plannedAmount = parseAmount(plannedAmountVal);

            const receivedAmountVal = document.getElementById('income-received-amount').value;
            const receivedAmount = receivedAmountVal ? parseAmount(receivedAmountVal) : NaN;

            const receivedDateVal = document.getElementById('income-received-date').value;
            const receivedDate = receivedDateVal ? parseInt(receivedDateVal) : null;

            // --- STRICT VALIDATION RULES ---

            // Rule 1: Planned Amount and Date must form a complete pair
            const hasPlannedAmount = !isNaN(plannedAmount) && plannedAmount > 0;
            const hasPlannedDate = plannedDate !== null && plannedDate !== '';

            if ((hasPlannedAmount && !hasPlannedDate) || (!hasPlannedAmount && hasPlannedDate)) {
                await window.api.showMessage('Não é permitido salvar sem conjuntos completos de receita e data', 'warning');
                return;
            }

            // Enforce presence of at least planned data
            if (!hasPlannedAmount && !hasPlannedDate) {
                await window.api.showMessage('Por favor insira a receita e a data prevista', 'warning');
                return;
            }

            // Rule 2: Received Amount and Date must form a complete pair (if any is entered)
            const hasReceivedAmount = !isNaN(receivedAmount);
            const hasReceivedDate = receivedDate !== null && !isNaN(receivedDate);

            if ((hasReceivedAmount && !hasReceivedDate) || (!hasReceivedAmount && hasReceivedDate)) {
                await window.api.showMessage('Não é permitido salvar sem conjuntos completos de receita e data', 'warning');
                return;
            }

            // Rule 3: Cannot have Received Data without Planned Data
            if ((hasReceivedAmount || hasReceivedDate) && (!hasPlannedAmount || !hasPlannedDate)) {
                await window.api.showMessage('Não é permitido incluir data ou correspondente receita recebida sem antes completar receita esperada e correspondente data', 'warning');
                return;
            }

            // --- Rule 4: Consistency Check with Daily Actual Income ---
            if (hasReceivedAmount && hasReceivedDate) {
                const day = receivedDate;
                // Get the limit (Daily Actual Income for this day)
                const dailyLimit = DataStore.currentMonth.dailyActualIncome?.[day] || 0;

                // Sum all OTHER incomes for this day
                const currentIncomeId = document.getElementById('income-id').value;
                const otherIncomesTotal = DataStore.currentMonth.incomes
                    .filter(inc => inc.receivedDate === day && inc.id !== currentIncomeId)
                    .reduce((sum, inc) => sum + (inc.receivedAmount || 0), 0);

                if ((otherIncomesTotal + receivedAmount) > dailyLimit) {
                    await window.api.showMessage('Erro: receita recebida no painel maior que total recebido no dia', 'error');
                    return;
                }
            }

            const income = {
                description: description,
                plannedAmount: plannedAmount || 0,
                plannedDate: plannedDate,
                receivedAmount: hasReceivedAmount ? receivedAmount : null,
                receivedDate: hasReceivedDate ? receivedDate : null
            };

            // Validate
            const validation = Income.validate(income);
            if (!validation.valid) {
                await window.api.showMessage(validation.errors[0], 'warning');
                return;
            }

            const incomeId = document.getElementById('income-id').value;

            if (incomeId) {
                await DataStore.updateIncome(incomeId, income);
                showToast('Receita atualizada', 'success');
            } else {
                await DataStore.addIncome(income);
                showToast('Receita adicionada', 'success');
            }

            this.closeAll();
            Income.render();
            App.updateSummary();
        });

        // Delete income button
        document.getElementById('delete-income-btn').addEventListener('click', async () => {
            const incomeId = document.getElementById('income-id').value;
            if (incomeId && await window.api.showConfirm('Tem certeza que deseja excluir esta receita?')) {
                await DataStore.deleteIncome(incomeId);
                showToast('Receita excluída', 'success');
                this.closeAll();
                Income.render();
                App.updateSummary();
            }
        });

        // Settings form submission
        document.getElementById('settings-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            DataStore.settings.transferWeekendIncomeToMonday = document.getElementById('setting-weekend-transfer').checked;
            DataStore.settings.saturdayIncomePercentage = parseInt(document.getElementById('setting-saturday-pct').value) || 50;
            DataStore.settings.sundayIncomePercentage = parseInt(document.getElementById('setting-sunday-pct').value) || 50;
            DataStore.settings.holidayIncomePercentage = parseInt(document.getElementById('setting-holiday-percentage').value) || 0;
            DataStore.settings.saturdayExpensePercentage = parseInt(document.getElementById('setting-expense-saturday-pct').value) ?? 100;
            DataStore.settings.sundayExpensePercentage = parseInt(document.getElementById('setting-expense-sunday-pct').value) ?? 100;
            DataStore.settings.holidayExpensePercentage = parseInt(document.getElementById('setting-expense-holiday-pct').value) ?? 100;
            DataStore.settings.state = document.getElementById('setting-state').value;
            DataStore.settings.city = document.getElementById('setting-city').value;
            DataStore.settings.backupEnabled = document.getElementById('setting-backup-enabled').checked;
            DataStore.settings.backupIntervalDays = parseInt(document.getElementById('setting-backup-days').value) || 7;

            await DataStore.saveSettings();

            // Reload holidays if state changed
            if (DataStore.currentMonth) {
                await DataStore.loadHolidays(DataStore.currentMonth.year);
            }

            showToast('Configurações salvas', 'success');
            this.closeAll();
        });

        // Copy month form submission
        document.getElementById('copy-month-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const sourceMonth = document.getElementById('copy-source-month').value;
            const targetMonth = document.getElementById('copy-target-month').value;
            const onlyTemplates = document.getElementById('copy-only-templates').checked;

            if (!sourceMonth || !targetMonth) {
                showToast('Selecione os meses de origem e destino', 'error');
                return;
            }

            if (sourceMonth === targetMonth) {
                showToast('Origem e destino não podem ser iguais', 'error');
                return;
            }

            const success = await DataStore.copyMonth(sourceMonth, targetMonth, onlyTemplates);

            if (success) {
                showToast('Mês copiado com sucesso', 'success');
                this.closeAll();
            } else {
                showToast('Erro ao copiar mês', 'error');
            }
        });

        // Daily Income Details logic
        document.getElementById('save-daily-income-btn').addEventListener('click', async () => {
            const saveBtn = document.getElementById('save-daily-income-btn');
            try {
                saveBtn.disabled = true;
                saveBtn.textContent = 'Salvando...';

                const modal = document.getElementById('daily-income-details-modal');
                const day = parseInt(modal.dataset.day);
                
                const entriesToSave = [];
                let totalDaySum = 0;
                const incomesToDelete = [];

                modal.querySelectorAll('.planned-income').forEach(row => {
                    const incId = row.dataset.incomeId;
                    const amount = parseFloat(row.querySelector('.actual-amount-input').value);
                    
                    const inc = DataStore.currentMonth.incomes.find(i => i.id === incId);
                    const isUnplanned = inc && inc.isUnplanned;
                    
                    if (!isNaN(amount) && amount > 0) {
                        entriesToSave.push({ incomeId: incId, amount: amount });
                        totalDaySum += amount;
                        if (isUnplanned && inc) {
                            inc.plannedAmount = amount;
                        }
                    } else {
                        if (isUnplanned && inc) {
                            incomesToDelete.push(incId);
                        }
                    }
                });

                modal.querySelectorAll('.extra-income').forEach(row => {
                    const desc = row.querySelector('.extra-desc-input').value.trim();
                    const amount = parseFloat(row.querySelector('.actual-amount-input').value);
                    if (!isNaN(amount) && amount > 0) {
                        entriesToSave.push({ description: desc || 'Receita Extra', amount: amount, isExtra: true });
                        totalDaySum += amount;
                    }
                });

                const globalExtras = document.querySelectorAll('#unplanned-new-incomes-container .global-extra-income');
                if (globalExtras.length > 0) {
                    for (const row of globalExtras) {
                        const desc = row.querySelector('.extra-desc-input').value.trim();
                        const amount = parseFloat(row.querySelector('.actual-amount-input').value);
                        if (!isNaN(amount) && amount > 0) {
                            const descFinal = desc || 'Receita Não Prevista';

                            const newInc = await DataStore.addIncome({
                                description: descFinal,
                                plannedAmount: amount,
                                plannedDate: day,
                                receivedAmount: null,
                                receivedDate: null,
                                isUnplanned: true
                            });
                            
                            entriesToSave.push({
                                incomeId: newInc.id,
                                amount: amount
                            });
                            
                            totalDaySum += amount;
                        }
                    }
                }

                if (incomesToDelete.length > 0) {
                    DataStore.currentMonth.incomes = DataStore.currentMonth.incomes.filter(i => !incomesToDelete.includes(i.id));
                }

                if (!DataStore.currentMonth.dailyActualIncomeDetails) {
                    DataStore.currentMonth.dailyActualIncomeDetails = {};
                }
                if (!DataStore.currentMonth.dailyActualIncome) {
                    DataStore.currentMonth.dailyActualIncome = {};
                }

                DataStore.currentMonth.dailyActualIncomeDetails[day] = entriesToSave;
                DataStore.currentMonth.dailyActualIncome[day] = totalDaySum;

                const savePromise = DataStore.saveMonth();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Tempo limite excedido ao salvar')), 5000)
                );

                await Promise.race([savePromise, timeoutPromise]);

                this.closeAll();
                Income.render();
                App.updateSummary();
                showToast(`Renda do dia ${day} atualizada`, 'success');
            } catch (error) {
                console.error('Erro ao salvar renda diária:', error);
                await window.api.showMessage(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`, 'error');
                showToast('Erro ao salvar dados. Tente novamente.', 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Salvar';
            }
        });

        // Daily Expense Details Modal logic
        document.getElementById('save-daily-expense-btn').addEventListener('click', async () => {
            const saveBtn = document.getElementById('save-daily-expense-btn');
            try {
                saveBtn.disabled = true;
                saveBtn.textContent = 'Salvando...';

                const modal = document.getElementById('daily-expense-details-modal');
                const day = parseInt(modal.dataset.day);
                const container = document.getElementById('daily-expense-categories-container');
                
                const detailsToSave = {};
                let totalDaySum = 0;
                const expensesToDelete = [];

                const catGroups = Array.from(container.querySelectorAll('.expense-detail-category-group'));
                for (const catDiv of catGroups) {
                    const catId = catDiv.querySelector('.planned-items-container').dataset.catId;
                    const catItems = [];

                    catDiv.querySelectorAll('.planned-expense').forEach(row => {
                        const expId = row.dataset.expenseId;
                        const amount = parseFloat(row.querySelector('.actual-amount-input').value);
                        
                        const exp = DataStore.currentMonth.expenses.find(e => e.id === expId);
                        let isUnplanned = false;
                        if (exp) {
                            const cat = DataStore.categories.find(c => c.id === exp.categoryId);
                            if (cat && cat.name.toLowerCase() === 'não planejadas') {
                                isUnplanned = true;
                            }
                        }

                        if (!isNaN(amount) && amount > 0) {
                            catItems.push({ expenseId: expId, amount: amount });
                            totalDaySum += amount;
                            if (isUnplanned && exp) {
                                exp.plannedAmount = amount;
                            }
                        } else {
                            if (isUnplanned && exp) {
                                expensesToDelete.push(expId);
                            }
                        }
                    });

                    const extraExps = Array.from(catDiv.querySelectorAll('.extra-expense'));
                    for (const row of extraExps) {
                        const desc = row.querySelector('.extra-desc-input').value.trim();
                        const amount = parseFloat(row.querySelector('.actual-amount-input').value);
                        if (!isNaN(amount) && amount > 0) {
                            const descFinal = desc || 'Despesa Efetiva';
                            const newExp = await DataStore.addExpense({
                                categoryId: catId,
                                description: descFinal,
                                plannedAmount: 0,
                                plannedDate: day,
                                paidAmount: amount,
                                paidDate: day,
                                isTemplate: false
                            });
                            catItems.push({ expenseId: newExp.id, amount: amount });
                            totalDaySum += amount;
                        }
                    }

                    if (catItems.length > 0) {
                        detailsToSave[catId] = catItems;
                    }
                }

                const globalExtras = document.querySelectorAll('#unplanned-new-entries-container .global-extra-expense');
                if (globalExtras.length > 0) {
                    let unplannedCat = DataStore.categories.find(c => c.name.toLowerCase() === 'não planejadas');
                    if (!unplannedCat) {
                        unplannedCat = await DataStore.addCategory({ name: 'Não Planejadas', color: '#e74c3c' });
                    }

                    for (const row of globalExtras) {
                        const desc = row.querySelector('.extra-desc-input').value.trim();
                        const amount = parseFloat(row.querySelector('.actual-amount-input').value);
                        if (!isNaN(amount) && amount > 0) {
                            const descFinal = desc || 'Despesa Não Planejada';

                            const newExp = await DataStore.addExpense({
                                categoryId: unplannedCat.id,
                                description: descFinal,
                                plannedAmount: 0,
                                plannedDate: day,
                                paidAmount: amount,
                                paidDate: day,
                                isTemplate: false
                            });
                            
                            if (!detailsToSave[unplannedCat.id]) {
                                detailsToSave[unplannedCat.id] = [];
                            }
                            detailsToSave[unplannedCat.id].push({
                                expenseId: newExp.id,
                                amount: amount
                            });
                            
                            totalDaySum += amount;
                        }
                    }
                }

                if (expensesToDelete.length > 0) {
                    DataStore.currentMonth.expenses = DataStore.currentMonth.expenses.filter(e => !expensesToDelete.includes(e.id));
                }

                if (!DataStore.currentMonth.dailyActualExpenseDetails) {
                    DataStore.currentMonth.dailyActualExpenseDetails = {};
                }
                if (!DataStore.currentMonth.dailyActualExpense) {
                    DataStore.currentMonth.dailyActualExpense = {};
                }

                DataStore.currentMonth.dailyActualExpenseDetails[day] = detailsToSave;
                DataStore.currentMonth.dailyActualExpense[day] = totalDaySum;

                // Synchronize paid amounts back to the core expenses array correctly
                DataStore.currentMonth.expenses.forEach(e => {
                    e.paidAmount = null;
                    e.paidDate = null;
                });
                
                const allDetails = DataStore.currentMonth.dailyActualExpenseDetails;
                for (const [dayKey, dayCatGroups] of Object.entries(allDetails)) {
                    for (const catDetails of Object.values(dayCatGroups)) {
                        for (const item of catDetails) {
                            const eId = item.expenseId;
                            const e = DataStore.currentMonth.expenses.find(x => x.id === eId);
                            if (e) {
                                e.paidAmount = (e.paidAmount || 0) + (item.amount || 0);
                                if (!e.paidDate) {
                                    e.paidDate = dayKey;
                                } else {
                                    const dates = e.paidDate.toString().split(', ').map(s=>s.trim());
                                    if (!dates.includes(dayKey.toString())) {
                                        dates.push(dayKey);
                                        dates.sort((a,b) => parseInt(a) - parseInt(b));
                                        e.paidDate = dates.join(', ');
                                    }
                                }
                            }
                        }
                    }
                }

                // Save internally
                const savePromise = DataStore.saveMonth();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Tempo limite excedido ao salvar')), 5000)
                );
                await Promise.race([savePromise, timeoutPromise]);

                // Update UI elements dependent on expense totals
                Categories.renderDailyActualExpenses();
                Categories.render(); 
                App.updateSummary();
                if (document.getElementById('calendar-view').classList.contains('active')) {
                    Calendar.render();
                }

                this.closeAll();
                showToast(`Despesas do dia ${day} salvas`, 'success');
            } catch (error) {
                console.error('Erro ao salvar despesa diária:', error);
                await window.api.showMessage(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`, 'error');
                showToast('Erro ao salvar dados', 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Salvar';
            }
        });
    },

    /**
     * Saves expense data collected from the form
     */
    async saveExpenseFromForm() {
        const plannedDateInput = document.getElementById('expense-planned-date').value.trim().toLowerCase();
        let plannedDate = 0;
        if (plannedDateInput === 'all' || plannedDateInput === 'fds') {
            plannedDate = plannedDateInput;
        } else {
            plannedDate = parseInt(plannedDateInput) || 0;
        }

        const expense = {
            categoryId: document.getElementById('expense-category-id').value,
            description: document.getElementById('expense-description').value.trim(),
            plannedAmount: parseFloat(document.getElementById('expense-planned-amount').value) || 0,
            plannedDate: plannedDate,
            paidAmount: null,
            paidDate: null,
            isTemplate: document.getElementById('expense-is-template').checked,
            specialType: document.getElementById('expense-special-type').value || null
        };

        const expenseId = document.getElementById('expense-id').value;
        await this.handleSaveExpense(expenseId, expense);
    },

    /**
     * Finalizes the save of a pending expense (after choice)
     */
    async finalizePendingExpense() {
        const expenseId = this.pendingExpense.id;
        const expense = { ...this.pendingExpense };
        delete expense.id;

        await this.handleSaveExpense(expenseId, expense);
        this.pendingExpense = null;
    },

    /**
     * Common logic to save or update an expense
     */
    async handleSaveExpense(id, data) {
        // Validate
        const validation = Expenses.validate(data);
        if (!validation.valid) {
            await window.api.showMessage(validation.errors[0], 'error');
            return;
        }

        if (validation.warnings.length > 0) {
            if (!await window.api.showConfirm(validation.warnings[0] + '\n\nDeseja continuar?')) {
                return;
            }
        }

        if (id) {
            await DataStore.updateExpense(id, data);
            showToast('Despesa atualizada', 'success');
        } else {
            await DataStore.addExpense(data);
            showToast('Despesa adicionada', 'success');
        }

        this.closeAll();
        Categories.render();
        App.updateSummary();
    }
};

window.Modals = Modals;
