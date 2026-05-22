/**
 * Income Module
 * 
 * Handles income UI rendering and calculations.
 */

const Income = {
    /**
     * Renders income entries in the income container
     */
    render() {
        const container = document.getElementById('income-container');
        container.innerHTML = '';

        let incomes = DataStore.currentMonth?.incomes || [];

        if (incomes.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">Nenhuma receita cadastrada</p>';
        } else {
            // Sort incomes by date ascending (all = 0, so it appears first)
            incomes = [...incomes].sort((a, b) => {
                const dateA = (a.plannedDate === 'all' || !a.plannedDate) ? 0 : parseInt(a.plannedDate, 10);
                const dateB = (b.plannedDate === 'all' || !b.plannedDate) ? 0 : parseInt(b.plannedDate, 10);
                return dateA - dateB;
            });

            for (const income of incomes) {
                const card = this.createIncomeCard(income);
                container.appendChild(card);
            }
        }

        this.renderDailyActuals();
        this.updateTotals();
    },

    /**
     * Renders the daily actual income grid
     */
    renderDailyActuals() {
        const grid = document.getElementById('daily-income-grid');
        if (!grid) return;

        grid.innerHTML = '';

        if (!DataStore.currentMonth) return;

        const { year, month } = DataStore.currentMonth;
        const daysInMonth = getDaysInMonth(year, month);
        const dailyActuals = DataStore.currentMonth.dailyActualIncome || {};

        const fragment = document.createDocumentFragment();

        for (let d = 1; d <= daysInMonth; d++) {
            const item = document.createElement('div');
            item.className = 'daily-income-item';

            // Determine special statuses
            const dateObj = new Date(year, month - 1, d);
            const dayOfWeek = dateObj.getDay();
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            // Check for Holiday
            if (DataStore.holidays && DataStore.holidays.includes(dateStr)) {
                item.classList.add('is-holiday');
            }

            // Check for Weekend
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                item.classList.add('is-weekend');
            }

            // Calculate Grid Column (Standard Calendar: Sun=1, Sat=7)
            item.style.gridColumnStart = dayOfWeek + 1;

            // Check for Today
            const now = new Date();
            if (now.getDate() === d && now.getMonth() === (month - 1) && now.getFullYear() === year) {
                item.classList.add('is-today');
            }

            const rawValue = dailyActuals[d];
            // Format if value exists and is not zero, else empty
            let displayValue = '';
            if (rawValue && rawValue > 0) {
                // Formatting: Thousands separator, 2 decimals, NO "R$"
                displayValue = rawValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }

            // const dayOfWeek = new Date(year, month - 1, d).getDay(); // Already calculated above
            const weekdayInitial = getWeekdayName(dayOfWeek).charAt(0);

            item.innerHTML = `
                <div class="daily-item-header">
                    <label>${d}${weekdayInitial}</label>
                </div>
            `;

            const valDiv = document.createElement('div');
            valDiv.className = 'daily-income-value';
            valDiv.textContent = displayValue;
            valDiv.dataset.day = d;
            valDiv.style.textAlign = 'center';
            valDiv.style.fontWeight = 'bold';
            valDiv.style.padding = '8px 0';
            valDiv.style.backgroundColor = 'transparent';
            valDiv.style.color = 'white';
            valDiv.style.marginTop = 'auto'; // push to bottom inside flex container
            valDiv.style.pointerEvents = 'none'; // so click passes to item
            
            item.appendChild(valDiv);
            
            item.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    await Modals.openDailyIncomeDetailsModal(d);
                } catch (err) {
                    console.error('Error opening modal:', err);
                    if (window.api && window.api.showMessage) {
                        window.api.showMessage('Erro interno: ' + err.message, 'error');
                    }
                }
            }, true); // use capture just in case

            fragment.appendChild(item);
        }

        grid.appendChild(fragment);
    },

    /**
     * Initialize Income module listeners
     */
    init() {
        document.getElementById('add-income-btn').addEventListener('click', () => {
            Modals.openIncomeModal();
        });
    },

    /**
     * Creates an income card element
     * @param {Object} income - The income data
     */
    createIncomeCard(income) {
        const card = document.createElement('div');
        card.className = 'income-card';
        card.dataset.incomeId = income.id;

        const dateLabel = income.plannedDate === 'all' || !income.plannedDate ? 'all' : `Dia ${income.plannedDate}`;

        let totalReceived = 0;
        let receivedDates = [];
        const details = DataStore.currentMonth?.dailyActualIncomeDetails || {};
        for (const [dayKey, itemsArray] of Object.entries(details)) {
            for (const item of itemsArray) {
                if (item.incomeId === income.id) {
                    totalReceived += (item.amount || 0);
                    if (!receivedDates.includes(dayKey)) {
                        receivedDates.push(dayKey);
                    }
                }
            }
        }
        
        receivedDates.sort((a, b) => parseInt(a) - parseInt(b));
        const receivedDatesStr = receivedDates.length > 0 ? `Dia ${receivedDates.join(', ')}` : '-';

        const isUnplannedText = income.isUnplanned
            ? '<br><span style="font-size: 11px; color: #ff6b6b;">(não prevista)</span>' 
            : '';

        let isPastDue = false;
        const todayDate = new Date();
        todayDate.setHours(0,0,0,0);
        
        const year = DataStore.currentMonth?.year || todayDate.getFullYear();
        const month = DataStore.currentMonth?.month || (todayDate.getMonth() + 1);

        let effectiveDay = income.plannedDate;
        if (effectiveDay === -1) {
            effectiveDay = getNextWorkingDay(year, month, 1, DataStore.holidays || []);
        } else if (effectiveDay > 0) {
            effectiveDay = getEffectiveDate(year, month, income, DataStore.holidays || []);
        }

        if (typeof effectiveDay === 'number' && effectiveDay > 0) {
            const plannedDateObj = new Date(year, month - 1, effectiveDay);
            if (plannedDateObj < todayDate) isPastDue = true;
        } else if (income.plannedDate === -1) {
            isPastDue = true;
        } else if (year < todayDate.getFullYear() || (year === todayDate.getFullYear() && month < todayDate.getMonth() + 1)) {
            isPastDue = true;
        }

        const isFuture = income.isFutureReminder || income.plannedDate === 0;
        const needsBlink = isPastDue && (totalReceived < income.plannedAmount) && !income.isUnplanned && !isFuture;

        const plannedDateHtml = (!income.isUnplanned && !isFuture) ? `<div style="font-weight: bold; color: #ADD8E6; margin-bottom: 2px;">[${dateLabel}]</div>` : `<div style="height: 16.5px; margin-bottom: 2px;"></div>`;
        const receivedDateHtml = totalReceived > 0 ? `<div style="color: var(--success-color);">[${receivedDatesStr}]</div>` : '';

        const plannedHtml = (!income.isUnplanned && !isFuture)
            ? `<div class="income-planned" style="margin-bottom: 2px;"><span style="font-size: 11px; margin-right: 4px; opacity: 0.9;">Planejada:</span>${formatCurrency(income.plannedAmount)}</div>` 
            : `<div style="height: 16.5px; margin-bottom: 2px;"></div>`;

        const futureHtml = isFuture
            ? `<div class="income-future" style="color: #87ceeb; text-align: right; font-family: 'Consolas', monospace; padding-right: 10px; font-weight: bold;">
                 ${formatCurrency(income.plannedAmount)}
               </div>`
            : `<div></div>`;

        card.innerHTML = `
            <div class="income-description ${needsBlink ? 'blink-alert' : ''}" title="${income.description}">
                ${income.description}${isUnplannedText}
            </div>
            ${futureHtml}
            <div class="income-dates">
                ${plannedDateHtml}
                ${receivedDateHtml}
            </div>
            <div class="income-amounts">
                ${plannedHtml}
                ${totalReceived > 0 ? `<div class="income-received"><span style="font-size: 11px; margin-right: 4px; opacity: 0.9;">Efetiva:</span>${formatCurrency(totalReceived)}</div>` : ''}
            </div>
        `;

        card.addEventListener('click', () => {
            if (income.isUnplanned) {
                if (typeof showToast === 'function') {
                    showToast('Receitas não previstas só podem ser editadas pelo popup diário.', 'warning');
                } else if (window.api && window.api.showMessage) {
                    window.api.showMessage('Receitas não previstas só podem ser editadas pelo popup diário.', 'warning');
                }
                return;
            }
            Modals.openIncomeModal(income);
        });

        return card;
    },

    /**
     * Updates the income totals display
     */
    updateTotals() {
        const totals = DataStore.calculateTotals();
        if (!totals) return;

        document.getElementById('total-planned-income').textContent = formatCurrency(totals.plannedIncome);
        document.getElementById('total-received-income').textContent = formatCurrency(totals.receivedIncome);
    },

    /**
     * Calculates daily income distribution
     * @returns {Object} Income per day
     */
    getDailyDistribution() {
        if (!DataStore.currentMonth) return {};

        const { year, month } = DataStore.currentMonth;
        const daysInMonth = getDaysInMonth(year, month);
        const settings = DataStore.settings;
        if (!settings) return {};
        const holidays = DataStore.holidays;
        const incomes = DataStore.currentMonth.incomes || [];

        const distribution = {};

        // Initialize distribution with zeros
        for (let d = 1; d <= daysInMonth; d++) distribution[d] = 0;

        // Process 'All Days' Incomes (Distributed)
        const recurringIncomes = incomes.filter(i => !i.isFutureReminder && (!i.plannedDate || i.plannedDate === 'all'));
        let dailyRecurringBase = recurringIncomes.reduce((sum, i) => sum + (i.plannedAmount || 0), 0);

        if (dailyRecurringBase > 0) {
            let bucket = 0;
            const satWeight = (settings.saturdayIncomePercentage ?? 50) / 100;
            const sunWeight = (settings.sundayIncomePercentage ?? 50) / 100;
            const holidayFactor = (settings.holidayIncomePercentage ?? 0) / 100;

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const date = new Date(year, month - 1, day);
                const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
                const isHoliday = holidays.includes(dateStr);

                let generated = 0;

                if (isHoliday) {
                    generated = dailyRecurringBase * holidayFactor;
                } else if (dayOfWeek === 6) { // Saturday
                    generated = dailyRecurringBase * satWeight;
                } else if (dayOfWeek === 0) { // Sunday
                    generated = dailyRecurringBase * sunWeight;
                } else { // Workday
                    generated = dailyRecurringBase;
                }

                if (isHoliday || dayOfWeek === 6 || dayOfWeek === 0) {
                    // Weekend or Holiday: Transfer to bucket
                    bucket += generated;
                } else {
                    // Valid Workday: Get generated + full bucket
                    distribution[day] += generated + bucket;
                    bucket = 0;
                }
            }
            // Note: If month ends on weekend/holiday, bucket is remaining. 
            // In a real app we might carry this over to next month, but specs don't strictly require it yet.
        }

        // Process Dated Incomes (Specific Day)
        const datedIncomes = incomes.filter(i => !i.isFutureReminder && i.plannedDate && i.plannedDate !== 'all');
        for (const income of datedIncomes) {
            const day = Number(income.plannedDate);
            if (day >= 1 && day <= daysInMonth) {
                // Apply "Next Working Day" rule for these incomes as well
                const effectiveDay = getNextWorkingDay(year, month, day, holidays);

                // Add full amount (NO reduction factors) to the effective day
                if (effectiveDay <= daysInMonth) {
                    distribution[effectiveDay] = (distribution[effectiveDay] || 0) + (income.plannedAmount || 0);
                }
            }
        }

        return distribution;
    },

    /**
     * Validates income data
     * @param {Object} income - Income data to validate
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validate(income) {
        const errors = [];

        if (!income.description || income.description.trim() === '') {
            errors.push('A descrição é obrigatória');
        }

        if (!income.isUnplanned && (income.plannedAmount === null || income.plannedAmount === undefined || income.plannedAmount <= 0)) {
            errors.push('O valor previsto é obrigatório e deve ser maior que zero');
        }

        // Validate plannedDate
        if (income.plannedDate !== 'all' && !income.isFutureReminder) {
            const day = Number(income.plannedDate);
            const daysInMonth = DataStore.currentMonth ? getDaysInMonth(DataStore.currentMonth.year, DataStore.currentMonth.month) : 31;

            if (isNaN(day) || day < 1 || day > daysInMonth) {
                errors.push(`Dia previsto deve ser "all" ou um dia válido entre 1 e ${daysInMonth}`);
            }
        }

        if (income.receivedAmount !== null && income.receivedAmount < 0) {
            errors.push('Valor recebido não pode ser negativo');
        }

        if (income.receivedAmount > 0) {
            const now = new Date();
            const today = now.getDate();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            const year = DataStore.currentMonth.year;
            const month = DataStore.currentMonth.month;

            let isFuture = false;

            if (income.receivedDate !== null && income.receivedDate !== undefined && !isNaN(parseInt(income.receivedDate))) {
                const day = parseInt(income.receivedDate);
                const daysInMonth = getDaysInMonth(year, month);
                if (isNaN(day) || day < 1 || day > daysInMonth) {
                    errors.push(`Dia de recebimento inválido. Para este mês, deve ser entre 1 e ${daysInMonth}.`);
                } else if (year > currentYear || (year === currentYear && month > currentMonth) || (year === currentYear && month === currentMonth && day > today)) {
                    isFuture = true;
                }
            } else {
                // Received Date is MISSING
                if (income.plannedDate !== 'all') {
                    // It is mandatory for specific-date incomes
                    errors.push('Data do Recebimento é obrigatória para receitas pontuais com valor recebido.');
                }

                // If it was 'all', we wouldn't be here ideally because fields are blocked, 
                // but if we are, we don't strictly enforce date because it's average, 
                // OR we enforce that it shouldn't be here. 
                // But the requirement says "No caso caso de receita recebida relativa a uma receita esperada pontual... o app deve também requisitar a entrada da data".

                // Also check future for "missing date" implies "today" or generally checks month
                if (year > currentYear || (year === currentYear && month > currentMonth)) {
                    isFuture = true;
                }
            }

            if (isFuture) {
                errors.push('Não é possível inserir valores efetivos em dias futuros');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Initializes event listeners
     */
    init() {
        document.getElementById('add-income-btn').addEventListener('click', () => {
            Modals.openIncomeModal();
        });
    }
};

window.Income = Income;
