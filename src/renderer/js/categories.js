/**
 * Categories Module
 * 
 * Handles category UI rendering and interactions.
 */

const Categories = {
    /**
     * Renders all categories in the categories container
     */
    render() {
        const container = document.getElementById('categories-container');
        container.innerHTML = '';

        const sortedCategories = [...DataStore.categories].sort((a, b) => a.order - b.order);

        for (const category of sortedCategories) {
            const card = this.createCategoryCard(category);
            container.appendChild(card);
        }
    },

    /**
     * Creates a category card element
     * @param {Object} category - The category data
     */
    createCategoryCard(category) {
        const expenses = DataStore.currentMonth?.expenses.filter(e => e.categoryId === category.id) || [];

        // Split expenses into current and future (reminders)
        const currentExpenses = expenses.filter(e => e.plannedDate !== 0);
        const futureExpenses = expenses.filter(e => e.plannedDate === 0);

        const currentTotal = currentExpenses.reduce((sum, e) => sum + (e.plannedAmount || 0), 0);

        // Map to formatted values string
        const futureValues = futureExpenses.map(e => formatCurrency(e.plannedAmount || 0));
        const futureValuesDisplay = futureValues.join(' | ');

        const card = document.createElement('div');
        card.className = 'category-card';
        card.dataset.categoryId = category.id;

        // HTML for Future Total Column (only if > 0 items)
        // Using a distinct class for styling
        const futureTotalHtml = futureValues.length > 0
            ? `<span class="category-future-total" title="Lembretes Futuros: ${futureValuesDisplay}">${futureValuesDisplay}</span>`
            : '<span class="category-future-total"></span>'; // Placeholder to keep alignment if needed, or empty

        card.innerHTML = `
            <div class="category-header">
                <span class="category-color" style="background-color: ${category.color}"></span>
                <span class="category-name">${category.name}</span>
                ${futureTotalHtml}
                <span class="category-total">${formatCurrency(currentTotal)}</span>
                <div class="category-actions">
                    <button class="edit-category-btn" title="Editar">✏️</button>
                    <button class="delete-category-btn" title="Excluir">🗑️</button>
                    <button class="toggle-category-btn" title="Expandir">▼</button>
                </div>
            </div>
            <div class="category-expenses">
                ${this.createExpenseTable(expenses, category)}
            </div>
        `;

        // Event listeners
        const header = card.querySelector('.category-header');
        const toggleBtn = card.querySelector('.toggle-category-btn');
        const editBtn = card.querySelector('.edit-category-btn');
        const deleteBtn = card.querySelector('.delete-category-btn');

        header.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                card.classList.toggle('expanded');
                toggleBtn.textContent = card.classList.contains('expanded') ? '▲' : '▼';
            }
        });

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.toggle('expanded');
            toggleBtn.textContent = card.classList.contains('expanded') ? '▲' : '▼';
        });

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            Modals.openCategoryModal(category);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.confirmDelete(category);
        });

        return card;
    },

    /**
     * Creates the expense table HTML for a category
     * @param {Array} expenses - The expenses in this category
     * @param {Object} category - The category
     */
    createExpenseTable(expenses, category) {
        if (expenses.length === 0) {
            return `
                <p class="text-center text-muted">Nenhuma despesa nesta categoria</p>
                <button class="add-expense-btn" data-category-id="${category.id}">+ Adicionar Despesa</button>
            `;
        }

        const today = new Date().getDate();
        const year = DataStore.currentMonth?.year || new Date().getFullYear();
        const month = DataStore.currentMonth?.month || (new Date().getMonth() + 1);
        const holidays = DataStore.holidays || [];

        let html = `
            <table class="expense-table">
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th class="amount">A Pagar</th>
                        <th class="date">Dia</th>
                        <th class="amount">Pago</th>
                        <th class="date">Dia</th>
                        <th class="status">%</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (const expense of expenses) {
            const percentage = expense.plannedAmount > 0
                ? Math.round((expense.paidAmount || 0) / expense.plannedAmount * 100)
                : 0;

            // Calculate effective day for status check
            let effectiveDay = expense.plannedDate;
            if (effectiveDay === -1) {
                effectiveDay = getNextWorkingDay(year, month, 1, holidays);
            } else if (effectiveDay > 0) {
                effectiveDay = getEffectiveDate(year, month, expense, holidays);
            }

            let statusClass = '';
            let statusText = '-';

            // Use effectiveDay for logic (but keep plannedDate > 0 check to exclude separate reminders if desired, 
            // logically reminder is plannedDate === 0, so effectiveDay check handles > 0 implicitly if we want same behavior)
            // Wait, reminder is 0. -1 is first working day.
            // If expense.plannedDate is 0, effectiveDay remains 0.

            if (effectiveDay > 0 && effectiveDay <= today) {
                if (percentage >= 100) {
                    statusClass = 'paid';
                    statusText = '100%';
                } else if (percentage > 0) {
                    statusClass = 'partial';
                    statusText = `${percentage}%`;
                } else {
                    statusClass = 'overdue';
                    statusText = '0%';
                }
            } else if (expense.paidAmount > 0) {
                statusClass = 'paid';
                statusText = `${percentage}%`;
            }

            // Prefix description for future expenses
            const descriptionDisplay = expense.plannedDate === 0
                ? `<span class="text-muted">Lembrete desp. futura:</span> ${expense.description}`
                : expense.description;

            html += `
                <tr data-expense-id="${expense.id}" data-category-id="${category.id}">
                    <td>${descriptionDisplay}</td>
                    <td class="amount">${formatCurrency(expense.plannedAmount)}</td>
                    <td class="date">${expense.plannedDate === 0 ? 'Futuro' : expense.plannedDate}</td>
                    <td class="amount">${expense.paidAmount ? formatCurrency(expense.paidAmount) : '-'}</td>
                    <td class="date">${expense.paidDate || '-'}</td>
                    <td class="status">
                        ${statusText !== '-' ? `<span class="status-badge ${statusClass}">${statusText}</span>` : '-'}
                    </td>
                </tr>
            `;
        }

        html += `
                </tbody>
            </table>
            <button class="add-expense-btn" data-category-id="${category.id}">+ Adicionar Despesa</button>
        `;

        return html;
    },

    /**
     * Confirms category deletion
     * @param {Object} category - The category to delete
     */
    async confirmDelete(category) {
        const expenseCount = DataStore.currentMonth?.expenses.filter(e => e.categoryId === category.id).length || 0;

        const message = expenseCount > 0
            ? `Tem certeza que deseja excluir a categoria "${category.name}"? ${expenseCount} despesa(s) serão movidas para "Sem Categoria".`
            : `Tem certeza que deseja excluir a categoria "${category.name}"?`;

        if (confirm(message)) {
            await DataStore.deleteCategory(category.id);
            this.render();
            showToast('Categoria excluída', 'success');
        }
    },

    /**
     * Initializes event listeners
     */
    init() {
        // Add category button
        document.getElementById('add-category-btn').addEventListener('click', () => {
            Modals.openCategoryModal();
        });

        // Delegate expense row clicks and add buttons
        document.getElementById('categories-container').addEventListener('click', (e) => {
            const row = e.target.closest('tr[data-expense-id]');
            if (row) {
                const expenseId = row.dataset.expenseId;
                const categoryId = row.dataset.categoryId;
                const expense = DataStore.currentMonth?.expenses.find(ex => ex.id === expenseId);
                if (expense) {
                    Modals.openExpenseModal(expense, categoryId);
                }
            }

            const addBtn = e.target.closest('.add-expense-btn');
            if (addBtn) {
                const categoryId = addBtn.dataset.categoryId;
                Modals.openExpenseModal(null, categoryId);
            }
        });
    }
};
