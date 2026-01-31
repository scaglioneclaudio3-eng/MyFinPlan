# Personal Finance Desktop App - Refined Specification

## 1. Overview

A desktop Electron application for personal finance management that replicates and improves upon the functionality of the legacy Excel spreadsheet (`legacy/excel_app.xlsx`). The app enables users to track monthly expenses, income, and cash flow with visual calendar views and charts.

**Language:** Portuguese (Brazilian)  
**Currency:** BRL (R$)  
**Platform:** Windows (Electron)

---

## 2. Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Electron |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Charts | Chart.js |
| Data Storage | Local JSON files |
| Holiday API | BrasilAPI (feriados) |
| Build Tool | electron-builder |

---

## 3. Data Model

### 3.1 Expense Category
```json
{
  "id": "uuid",
  "name": "string",
  "color": "#hexcode",
  "order": "number"
}
```

### 3.2 Expense Entry
```json
{
  "id": "uuid",
  "categoryId": "uuid",
  "description": "string",
  "plannedAmount": "number",
  "plannedDate": "number (1-31, -1 for late, 0 for future)",
  "paidAmount": "number | null",
  "paidDate": "number | null",
  "isTemplate": "boolean"
}
```

### 3.3 Income Entry
```json
{
  "id": "uuid",
  "description": "string",
  "plannedAmount": "number",
  "plannedDate": "number (1-31) | 'ALL'",
  "receivedAmount": "number | null",
  "receivedDate": "number | null",
  "dailyReceipts": "{ [day: number]: number } | null" // For recurring income
}
```

### 3.4 Month Data
```json
{
  "id": "YYYY-MM",
  "year": "number",
  "month": "number (1-12)",
  "expenses": "ExpenseEntry[]",
  "incomes": "IncomeEntry[]",
  "dailyActualIncome": "{ [day: number]: number }",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

### 3.5 Settings
```json
{
  "transferWeekendIncomeToMonday": "boolean",
  "saturdayIncomePercentage": "number (0-100)",
  "sundayIncomePercentage": "number (0-100)",
  "state": "string (UF code)",
  "city": "string",
  "backupEnabled": "boolean",
  "backupIntervalDays": "number"
}
```

---

## 4. Core Features

### 4.1 Expense & Income Entry

**Expense Fields:**
| Column | Description | Validation |
|--------|-------------|------------|
| Descrição | Expense description | Required, text only |
| A Pagar | Planned amount | Required, positive number |
| Dia (vencimento) | Due date | -1, 0, or 1-31 |
| Pago | Amount paid | Optional, positive number |
| Dia (pagamento) | Date paid | Optional, 1-31 |

**Income Fields:**
| Column | Description | Validation |
|--------|-------------|------------|
| Descrição | Income description | Required |
| Valor | Planned Amount | Required |
| Dia Previsto | Planned Date | "ALL" for recurring, or 1-31 for specific date |
| Recebido | Amount Received | Optional |
| Dia (rec) | Date Received | Optional |

**Income Logic Types:**
1.  **Recurring Income ("ALL"):**
    -   Value applies to **every working day**.
    -   **Weekends:** Amount multiplied by configured % (Sat/Sun). Result transferred to **following Monday**.
    -   **Holidays:** 0 income.
    -   **Monday Holidays:** Weekend accumulation transferred to **Tuesday**.
2.  **Dated Income (1-31):**
    -   Full amount applies to the specific day.
    -   Ignores weekend/holiday logic (applies even if date is a holiday).

**Special date values (Expenses):**
- `-1`: Late payments from previous months (shown on first working day)
- `0`: Future reminders (shown in separate list, not in calendar)
- `1-31`: Normal payment dates

**Color coding for payment status (P/AP column):**
- 🟢 Green: 100% paid
- 🔴 Red: Unpaid or partial payment after due date
- No color: Before due date

### 4.1 Expense & Income Entry

... (existing validation table) ...

**Override Logic for Worker Expenses:**
- **Target Types:** Worker salaries (`FIFTH_WORKING_DAY`, `SALARY_ADVANCE`), FGTS, INSS, Cesta Básica (CB), Vale Transporte (VT).
- **Trigger:** If any of these are entered on a date other than the 15th or the last day of the month.
- **Action:** Show a popup asking the user to:
    1. Keep the entered date.
    2. Switch to the 15th.
    3. Switch to the last day of the month.
- **Logic for User Choice:**
    - If the user choice (preferred date) falls on a weekend or holiday, the expense is moved to the **immediately preceding** working day.
    - This user preference overrides existing "typical" offset logic (like "2 WD before").

### 4.3 Calendar View

- **Day Click Interaction:**
    - Clicking once on a calendar day box opens a popup/modal.
    - The popup is significantly larger (approx. 3x the diameter/size of a day box).
    - Content: Full list of expenses, detailed income breakdown, and daily balances.


### 4.2 Category Management

Users can:
- Create new categories with custom name and color
- Edit existing category name/color
- Delete categories (with confirmation, moves expenses to "Uncategorized")
- Reorder categories via drag-and-drop

**Default categories (from Excel):**
1. PESSOAL
2. EXTRA EMPRESA
3. MORADIA
4. PRESTAÇÕES/EMPRÉSTIMOS
5. ACORDOS
6. EXTRAS ENERGIA EMPRESA AGDES
7. ADVOGADO/JURÍDICO
8. PAGAMENTO DE SALÁRIOS
9. IMPOSTOS
10. EXTRAS EMPRESA

### 4.3 Calendar View

- **Background colors:**
    - Today: Bright Yellow (`#FFFF00`)
    - Holidays: Light Blue (`#D1E8FF`)
    - Normal days: Light Cream (`#FFFDD0`)

- **Calendar Box Content (Daily):**
    1.  **Header Balance (Major Number):** Daily actual cash flow (**Fluxo Efetivo**).
    2.  **Fluxo Plan:** Daily planned cash flow (Planned Income - Planned Expenses) for that specific day.
    3.  **Fluxo Efetivo:** Daily actual cash flow (Actual Income - Paid Expenses) for that specific day.
    3.  **Expense Pairs:**
        - **Line A:** `[Description] R$ [Planned Amount]`
            - Background color of the **amount** changes based on status:
                - **No color:** Paid in full AND on time.
                - **Bright Yellow:** Partial payment OR late payment.
                - **Bright Red:** Unpaid (and due date passed).
        - **Line B:** `Pago: [Day]` (or `Day/Month`) and the **Paid Amount**.
    4.  **Receita Plan:** Total planned income for the specific day (daily value).
    5.  **Receita Efet.:** Total actual income for the specific day (daily value).

- **Payment Date Logic:**
    - Format: `[Day]` if in the current month; `[Day]/[Month]` if in a different month.
    - Blank date field implies the payment was not made.

- Salaries on 5th working day → Calculated day (Saturdays count, Sundays/Holidays don't)
- VT, VA, CB → **2 working days before** the anchor (15th or Last Day)
- Salary Advance (20th), INSS, FGTS on weekends/holidays → Move to **previous** working day
- Other Expenses on weekends/holidays → Move to **next** working day

### 4.4 Monthly Summary Table

Compact view showing 7 days per row (like a calendar), with each day cell containing the structured data defined in section 4.3. Lines should be closer to each other to accommodate as many lines as possible.

### 4.5 Charts

#### Chart 1: Daily Expense Breakdown (Stacked Bar)
- X-axis: Days 1-31
- Y-axis: Amount (R$)
- Stacks: One color per expense category
- Shows planned expenses per category per day

#### Chart 2: Cumulative Cash Flow Comparison
- X-axis: Days 1-31
- Y-axis: Cumulative amount (R$)
- Series (6 bars per day, grouped):
  1. Planned Expenses (light)
  2. Paid Expenses (dark)
  3. Planned Income (light)
  4. Received Income (dark)
  5. Planned Balance (light)
  6. Actual Balance (dark)

### 4.6 Month Navigation

- Support for up to **36 months** (3 years)
- Month/year selector dropdown
- Previous/Next navigation buttons
- Quick jump to current month

### 4.7 Template System

- Copy all expenses from one month to another
- Option to copy only template-marked expenses
- Clears `paidAmount` and `paidDate` when copying

### 4.8 Holiday Integration

**Source:** BrasilAPI (`https://brasilapi.com.br/api/feriados/v1/{ano}`)

**Types fetched:**
- National holidays
- State holidays (based on settings.state)
- Municipal holidays (based on settings.city)

**Caching:** Cache holidays per year locally

---

## 5. Input Validation & Warnings

| Validation | Behavior |
|------------|----------|
| Text in number fields | Block input, show error |
| Number in text fields | Block input, show error |
| Date > days in month | Show error, prevent save |
| Amount > 10x average | Show warning (possible typo) |
| Negative amounts | Block input (except day field for -1) |
| Empty required fields | Highlight field, prevent save |

---

## 6. Settings Panel

- **Weekend income transfer:** Toggle (Y/N) to transfer weekend income to Monday
- **Weekend percentages:** Saturday % and Sunday % of daily income
- **Location:** State (dropdown) and City (text) for holiday lookup
- **Backup:** Enable/disable automatic backups, backup frequency

---

## 7. Menu Bar

| Menu | Items |
|------|-------|
| Arquivo | Novo Mês, Importar, Exportar, Backup, Imprimir, Sair |
| Editar | Desfazer, Refazer, Copiar Mês, Categorias |
| Visualizar | Calendário, Gráficos, Resumo |
| Configurações | Preferências |
| Ajuda | Sobre, Tutorial |

---

## 8. Data Persistence

### File Structure
```
%APPDATA%/excel2desktop-app/
├── data/
│   ├── settings.json
│   ├── categories.json
│   └── months/
│       ├── 2026-01.json
│       ├── 2026-02.json
│       └── ...
├── backups/
│   └── backup-2026-01-24.zip
└── cache/
    └── holidays-2026.json
```

### Backup Strategy
- Automatic backup on configurable interval (default: 7 days)
- Backup creates ZIP of entire `data/` folder
- Keep last 5 backups, delete older ones

---

## 9. UI/UX Guidelines

- **Color scheme:** Professional dark/light mode toggle
- **Blue cells:** Editable input fields (matching Excel convention)
- **Typography:** Clear, readable fonts (Inter or system fonts)
- **Responsive tables:** Horizontal scroll for wide data
- **Tooltips:** Help text on hover for complex fields
- **Keyboard navigation:** Tab between fields, Enter to save

---

## 10. Future Considerations (Out of Scope)

The following are explicitly NOT included in this version:
- ❌ Authentication/authorization
- ❌ Cloud sync
- ❌ Multi-user support
- ❌ Mobile app
- ❌ Multiple currencies

---

## 11. File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | camelCase.js | `expenseTable.js` |
| Styles | kebab-case.css | `expense-table.css` |
| Data files | kebab-case.json | `2026-01.json` |
| Test files | *.test.js | `expenseTable.test.js` |