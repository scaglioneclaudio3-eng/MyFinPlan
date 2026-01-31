/**
 * Print Module
 * 
 * Handles rendering of printable expense reports.
 */

const PrintModule = {
    /**
     * Initializes the print module
     */
    init() {
        const printBtn = document.getElementById('print-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }
    },

    /**
     * Renders the print view with current month data
     */
    render() {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('pt-BR');

        // Add current date to titles
        const catTitle = document.querySelector('#print-by-category h2');
        if (catTitle) {
            // Reset to base title first to prevent appending multiple times
            if (catTitle.innerHTML.includes(' - <span')) {
                const baseTitle = catTitle.innerHTML.split(' - <span')[0];
                catTitle.innerHTML = baseTitle;
            }
            catTitle.innerHTML += ` - <span>${formattedDate}</span>`;
        }

        const dateTitle = document.querySelector('#print-by-date h2');
        if (dateTitle) {
            // Reset to base title first
            if (dateTitle.innerHTML.includes(' - <span')) {
                const baseTitle = dateTitle.innerHTML.split(' - <span')[0];
                dateTitle.innerHTML = baseTitle;
            }
            dateTitle.innerHTML += ` - <span>${formattedDate}</span>`;
        }

        this.renderByCategory();
        this.renderByDate();
    },

    /**
     * Helper to get payment status string
     */
    getPaymentStatus(expense) {
        if (expense.paidAmount > 0) {
            if (expense.paidDate) {
                if (typeof expense.paidDate === 'string' && expense.paidDate.includes('/')) {
                    return expense.paidDate; // Already DD/MM
                }
                // If it's just a day number
                const month = DataStore.currentMonth?.month || (new Date().getMonth() + 1);
                return `${expense.paidDate}/${month.toString().padStart(2, '0')}`;
            }
            return 'Pago'; // Fallback if no date but paid
        }

        // Not paid fully
        const today = new Date();
        // Clear time part
        today.setHours(0, 0, 0, 0);

        const year = DataStore.currentMonth?.year || today.getFullYear();
        const month = DataStore.currentMonth?.month || (today.getMonth() + 1);

        let dueDate;

        if (expense.plannedDate === -1) {
            // "Atrasado" from previous months. 
            // It's already overdue by definition.
            return 'atraso';
        } else if (expense.plannedDate === 0) {
            // Future reminder.
            return '-';
        } else {
            // Regular day 1-31
            dueDate = new Date(year, month - 1, expense.plannedDate);
        }

        if (dueDate < today) {
            return 'atraso';
        } else {
            return '-';
        }
    },

    /**
     * Renders expenses grouped by category
     */
    renderByCategory() {
        const container = document.getElementById('print-category-container');
        if (!container) return;

        container.innerHTML = '';

        const categories = [...DataStore.categories].sort((a, b) => a.order - b.order);
        let grandTotalPlanned = 0;
        let grandTotalPaid = 0;

        // Filter categories that have expenses
        const activeCategories = categories.filter(category => {
            const expenses = DataStore.currentMonth?.expenses.filter(e => e.categoryId === category.id) || [];
            return expenses.length > 0;
        });

        if (activeCategories.length === 0) {
            container.innerHTML = '<p>Nenhuma despesa para exibir.</p>';
            return;
        }

        activeCategories.forEach(category => {
            const expenses = DataStore.currentMonth.expenses.filter(e => e.categoryId === category.id);

            // Calculate totals for this category
            const totalPlanned = expenses.reduce((sum, e) => sum + (e.plannedAmount || 0), 0);
            const totalPaid = expenses.reduce((sum, e) => sum + (e.paidAmount || 0), 0);

            grandTotalPlanned += totalPlanned;
            grandTotalPaid += totalPaid;

            const categorySection = document.createElement('div');
            categorySection.className = 'print-category-section';

            // Helper to determine if a color is light or dark (to adjust text color if needed, though request is specifically white text on dark tonalidade)
            // But user said "dark tonalidade". If category is yellow (#FFFF00), white text is unreadable.
            // Assumption: User implies they want *the* background to be dark. 
            // If I just use the category color, it might be light. 
            // Transforming category color to a "dark version" might be better, or just using the color and assuming it's dark enough.
            // However, "leaving category blocks with dark background" might mean "make the background dark (e.g. dark grey) and maybe use the category color for accents?"
            // OR "use the category color, but make it dark".
            // Let's assume the user wants the block to be the category color, and if that color isn't dark, we should probably darken it.
            // But simplicity first: Use the hex color. If it's too light, it might be an issue. 
            // Let's try to darken the color logic if we can, or just use it. 
            // Actually, "tonalidade escura" might mean "Please make the background dark".
            // Let's mix the category color with black (shade).

            // Helper to mix color with black
            const darkenColor = (hex, percent) => {
                let r = parseInt(hex.substring(1, 3), 16);
                let g = parseInt(hex.substring(3, 5), 16);
                let b = parseInt(hex.substring(5, 7), 16);

                r = Math.floor(r * (100 - percent) / 100);
                g = Math.floor(g * (100 - percent) / 100);
                b = Math.floor(b * (100 - percent) / 100);

                return `rgb(${r}, ${g}, ${b})`;
            };

            // However, if I change the color too much, it loses identity. 
            // Use the original color but maybe force a dark background? 
            // Let's stick to using the category color but ensure it's not too transparent. 
            // Or better, let's just set the background to the category color and text to white.
            // For bright colors (Yellow), this is bad. 
            // Let's trust the user's intent for "dark background" and maybe just use a dark grey background with a colored left border? 
            // "deixe a cor de fundo dos blocos ... com tonalidade escura" -> "leave the background color of the blocks ... with a dark tone".
            // This implies the background IS the color. 
            // Let's just use the category color directly.

            const bgColor = category.color; // Solid color

            let html = `
                <div style="background-color: ${bgColor}; color: #ffffff; padding: 10px; border-radius: 8px; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin-bottom: 20px;">
                    <h3 style="border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; margin-top: 0; color: #fff;">
                        ${category.name}
                    </h3>
                    <table class="print-table" style="color: #ffffff; border-color: rgba(255,255,255,0.3);">
                        <thead style="color: #ffffff;">
                            <tr style="border-bottom: 1px solid #ffffff;">
                                <th class="col-description" style="border-bottom: 1px solid #ffffff;">Descrição</th>
                                <th class="col-date text-right" style="border-bottom: 1px solid #ffffff;">Vencimento</th>
                                <th class="col-amount text-right" style="border-bottom: 1px solid #ffffff;">Valor Previsto</th>
                                <th class="col-amount text-right" style="border-bottom: 1px solid #ffffff;">Valor Pago</th>
                                <th class="col-status text-center" style="border-bottom: 1px solid #ffffff;">Data Pagamento</th>
                            </tr>
                        </thead>
                        <tbody style="background-color: #ffffff; color: #000000;">
            `;

            const year = DataStore.currentMonth?.year || new Date().getFullYear();
            const month = DataStore.currentMonth?.month || (new Date().getMonth() + 1);
            const holidays = DataStore.holidays || [];

            expenses.forEach(expense => {
                const paidAmount = expense.paidAmount ? formatCurrency(expense.paidAmount) : '-';

                let dateDisplay = expense.plannedDate;
                if (dateDisplay === 0) {
                    dateDisplay = 'Futuro';
                } else if (dateDisplay === -1) {
                    dateDisplay = getNextWorkingDay(year, month, 1, holidays);
                }

                html += `
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td class="col-description" style="border-bottom: 1px solid #ddd;">${expense.description}</td>
                        <td class="col-date text-right" style="border-bottom: 1px solid #ddd;">${dateDisplay}</td>
                        <td class="col-amount text-right" style="border-bottom: 1px solid #ddd;">${formatCurrency(expense.plannedAmount)}</td>
                        <td class="col-amount text-right" style="border-bottom: 1px solid #ddd;">${paidAmount}</td>
                        <td class="col-status text-center" style="border-bottom: 1px solid #ddd;">${this.getPaymentStatus(expense)}</td>
                    </tr>
                `;
            });

            html += `
                    <tr class="subtotal-row">
                        <td colspan="2" class="text-right font-bold" style="border-top: 2px solid #000; color: #000; background-color: #f9f9f9;">Total:</td>
                        <td class="col-amount text-right font-bold" style="border-top: 2px solid #000; color: #000; background-color: #f9f9f9;">${formatCurrency(totalPlanned)}</td>
                        <td class="col-amount text-right font-bold" style="border-top: 2px solid #000; color: #000; background-color: #f9f9f9;">${formatCurrency(totalPaid)}</td>
                        <td class="col-status" style="border-top: 2px solid #000; background-color: #f9f9f9;"></td>
                    </tr>
                    </tbody>
                </table>
                </div> <!-- Close background div -->
            `;

            categorySection.innerHTML = html;
            container.appendChild(categorySection);
        });

        // Add Grand Total for Categories
        const totalDiv = document.createElement('div');
        totalDiv.className = 'print-grand-total';
        totalDiv.innerHTML = `
            <h3>Total Geral (Categorias)</h3>
            <div class="total-row">
                <span>Previsto: <strong>${formatCurrency(grandTotalPlanned)}</strong></span>
                <span style="margin-left: 20px;">Pago: <strong>${formatCurrency(grandTotalPaid)}</strong></span>
            </div>
        `;
        container.appendChild(totalDiv);
    },

    /**
     * Renders expenses ordered by date, grouped by day with alternating colors
     */
    renderByDate() {
        const container = document.getElementById('print-date-container');
        if (!container) return;

        container.innerHTML = '';

        const expenses = [...(DataStore.currentMonth?.expenses || [])];

        if (expenses.length === 0) {
            container.innerHTML = '<p>Nenhuma despesa para exibir.</p>';
            return;
        }

        const year = DataStore.currentMonth?.year || new Date().getFullYear();
        const month = DataStore.currentMonth?.month || (new Date().getMonth() + 1);
        const holidays = DataStore.holidays || [];

        // Helper to get sort value and display date
        const getDateInfo = (plannedDate) => {
            if (plannedDate === -1) {
                return {
                    sortValue: -1,
                    display: getNextWorkingDay(year, month, 1, holidays),
                    label: 'Atrasado / Primeiro Dia Útil'
                };
            }
            if (plannedDate === 0) {
                return {
                    sortValue: 999,
                    display: 'Futuro',
                    label: 'Futuro'
                };
            }
            return {
                sortValue: plannedDate,
                display: plannedDate,
                label: `Dia ${plannedDate}`
            };
        };

        // Group expenses by date
        const groupedExpenses = {};
        expenses.forEach(expense => {
            const dateInfo = getDateInfo(expense.plannedDate);
            const key = dateInfo.sortValue;

            if (!groupedExpenses[key]) {
                groupedExpenses[key] = {
                    info: dateInfo,
                    items: []
                };
            }
            groupedExpenses[key].items.push(expense);
        });

        // Sort groups
        const sortedKeys = Object.keys(groupedExpenses).sort((a, b) => Number(a) - Number(b));

        // Render groups with alternating colors
        sortedKeys.forEach((key, index) => {
            const group = groupedExpenses[key];
            const bgClass = index % 2 === 0 ? 'day-bg-blue' : 'day-bg-green';

            const dayContainer = document.createElement('div');
            dayContainer.className = `print-day-container ${bgClass}`;

            let html = `
                <div class="print-day-header">${group.info.label}</div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th class="col-description">Descrição</th>
                            <th class="col-category">Categoria</th>
                            <th class="text-right col-amount">Valor Previsto</th>
                            <th class="text-right col-amount">Valor Pago</th>
                            <th class="text-center col-status">Data Pagamento</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            group.items.forEach(expense => {
                const category = DataStore.categories.find(c => c.id === expense.categoryId);
                const categoryName = category ? category.name : 'Sem Categoria';
                const paidAmount = expense.paidAmount ? formatCurrency(expense.paidAmount) : '-';

                html += `
                    <tr>
                        <td class="col-description">${expense.description}</td>
                        <td class="col-category">${categoryName}</td>
                        <td class="text-right col-amount">${formatCurrency(expense.plannedAmount)}</td>
                        <td class="text-right col-amount">${paidAmount}</td>
                        <td class="text-center col-status">${this.getPaymentStatus(expense)}</td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
            `;

            dayContainer.innerHTML = html;
            container.appendChild(dayContainer);
        });
    }
};
