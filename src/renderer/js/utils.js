/**
 * Utility Functions
 * 
 * Common helper functions used throughout the application.
 */

/**
 * Formats a number as Brazilian currency (R$)
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
    if (value === null || value === undefined) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

/**
 * Parses a Brazilian currency string to number
 * @param {string} str - The currency string
 * @returns {number} Parsed number
 */
function parseCurrency(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
}

/**
 * Gets the number of days in a given month
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @returns {number} Number of days
 */
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

/**
 * Gets the day of week for the first day of a month (0=Sunday, 6=Saturday)
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @returns {number} Day of week
 */
function getFirstDayOfMonth(year, month) {
    return new Date(year, month - 1, 1).getDay();
}

/**
 * Checks if a given date is a weekend
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @param {number} day - The day
 * @returns {boolean} True if weekend
 */
function isWeekend(year, month, day) {
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Gets the weekday name in Portuguese
 * @param {number} dayOfWeek - Day of week (0-6)
 * @returns {string} Weekday name
 */
function getWeekdayName(dayOfWeek) {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[dayOfWeek];
}

/**
 * Gets the month name in Portuguese
 * @param {number} month - The month (1-12)
 * @returns {string} Month name
 */
function getMonthName(month) {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
}

/**
 * Generates a UUID v4
 * @returns {string} UUID string
 */
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Gets the next working day from a given date
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @param {number} day - The starting day
 * @param {Array} holidays - Array of holiday dates (format: "YYYY-MM-DD")
 * @returns {number} The next working day in the month
 */
function getNextWorkingDay(year, month, day, holidays = []) {
    const daysInMonth = getDaysInMonth(year, month);
    let currentDay = day;

    while (currentDay <= daysInMonth) {
        const date = new Date(year, month - 1, currentDay);
        const dayOfWeek = date.getDay();
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

        // Check if it's a weekend or holiday
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
            return currentDay;
        }
        currentDay++;
    }

    // If we reach end of month, return the original day
    return day;
}

/**
 * Gets the previous working day from a given date
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @param {number} day - The starting day
 * @param {Array} holidays - Array of holiday dates (format: "YYYY-MM-DD")
 * @returns {number} The previous working day in the month
 */
function getPreviousWorkingDay(year, month, day, holidays = []) {
    let currentDay = day;

    while (currentDay >= 1) {
        const date = new Date(year, month - 1, currentDay);
        const dayOfWeek = date.getDay();
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
            return currentDay;
        }
        currentDay--;
    }

    return day;
}

/**
 * Gets the 5th working day of a given month
 * Saturdays count as working days, Sundays and Holidays do not.
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @param {Array} holidays - Array of holiday dates (format: "YYYY-MM-DD")
 * @returns {number} The 5th working day
 */
function getFifthWorkingDay(year, month, holidays = []) {
    const daysInMonth = getDaysInMonth(year, month);
    let workingDaysCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Sunday is 0. Holidays are excluded. 
        // Saturday (6) counts as working day.
        if (dayOfWeek !== 0 && !holidays.includes(dateStr)) {
            workingDaysCount++;
            if (workingDaysCount === 5) {
                return day;
            }
        }
    }

    return 5; // Fallback
}

/**
 * Gets a working day shifted by a number of working days
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @param {number} baseDay - The starting day
 * @param {number} shift - Number of working days to shift (negative for past)
 * @param {Array} holidays - Array of holiday dates (format: "YYYY-MM-DD")
 * @returns {number} The shifted day
 */
function getShiftedWorkingDay(year, month, baseDay, shift, holidays = []) {
    let currentDay = baseDay;
    let remainingShift = Math.abs(shift);
    const direction = shift > 0 ? 1 : -1;
    const daysInMonth = getDaysInMonth(year, month);

    while (remainingShift > 0 && currentDay >= 1 && currentDay <= daysInMonth) {
        currentDay += direction;
        if (currentDay < 1 || currentDay > daysInMonth) break;

        const date = new Date(year, month - 1, currentDay);
        const dayOfWeek = date.getDay();
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

        // Saturdays (6) count as working days for labor expenses.
        if (dayOfWeek !== 0 && !holidays.includes(dateStr)) {
            remainingShift--;
        }
    }

    return Math.max(1, Math.min(daysInMonth, currentDay));
}

/**
 * Calculates the effective date for an expense considering weekends/holidays
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @param {Object} expense - The expense object
 * @param {Array} holidays - Array of holiday dates
 * @returns {number} The effective day
 */
function getEffectiveDate(year, month, expense, holidays = []) {
    const plannedDay = expense.plannedDay || expense.plannedDate || 0;
    if (plannedDay <= 0) return plannedDay; // -1 or 0 are special

    const daysInMonth = getDaysInMonth(year, month);
    const baseDay = Math.min(plannedDay, daysInMonth);

    // Rule for user explicit override for worker expenses
    if (expense.userDateOverride) {
        const date = new Date(year, month - 1, baseDay);
        const dayOfWeek = date.getDay();
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(baseDay).padStart(2, '0')}`;

        const isHoliday = holidays.includes(dateStr);
        const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;

        if (isWeekendDay || isHoliday) {
            return getPreviousWorkingDay(year, month, baseDay, holidays);
        }
        return baseDay;
    }

    // Rule for 5th Working Day
    if (expense.specialType === 'FIFTH_WORKING_DAY') {
        return getFifthWorkingDay(year, month, holidays);
    }

    // Rule for Vale Transporte (VT) & Vale Alimentação (VA)
    if (expense.specialType === 'VALE_TRANSPORTE' || expense.specialType === 'VALE_ALIMENTACAO') {
        return getShiftedWorkingDay(year, month, baseDay, -2, holidays);
    }

    // Rule for Cesta Básica (CB)
    if (expense.specialType === 'CESTA_BASICA') {
        return getShiftedWorkingDay(year, month, daysInMonth, -2, holidays);
    }

    const date = new Date(year, month - 1, baseDay);
    const dayOfWeek = date.getDay();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(baseDay).padStart(2, '0')}`;

    const isHoliday = holidays.includes(dateStr);
    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;

    // Rule for Salary Advance (20th), INSS, FGTS: Move to PREVIOUS working day
    const isPreviousRule = expense.specialType === 'SALARY_ADVANCE' ||
        expense.specialType === 'INSS' ||
        expense.specialType === 'FGTS';

    if (isWeekendDay || isHoliday) {
        if (isPreviousRule) {
            return getPreviousWorkingDay(year, month, baseDay, holidays);
        } else {
            // Default rule: move to NEXT working day (for other expenses)
            return getNextWorkingDay(year, month, baseDay, holidays);
        }
    }

    return baseDay;
}

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Debounce function
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Validates that a value is within expected range (warns if too high)
 * @param {number} value - The value to check
 * @param {number} average - The average for comparison
 * @param {number} threshold - Multiplier threshold (default 10x)
 * @returns {boolean} True if value might be a typo
 */
function isPossibleTypo(value, average, threshold = 10) {
    if (average === 0) return false;
    return value > average * threshold;
}
