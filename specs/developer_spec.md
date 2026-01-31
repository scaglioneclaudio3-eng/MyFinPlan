# Desktop App for Personal Finances

## Overview

### Objective

The ultimate goal is to allow the user to enter their expected monthly expenses, including the amounts and payment dates. Based on this information, the application will generate a monthly calendar that displays, on a day-by-day basis:

- Payments due
- Amounts already paid
- Amounts still to be paid
- Overdue payments
- Partially paid items
- Income received
- Income expected to be received

### Visualizations

Using this data, the application will generate:

1. Daily Expense Breakdown (Stacked Bar Chart)

A stacked bar chart representing, for each day of the month, the different categories of expected expenses.

2. Monthly Cash Flow Comparison (Cumulative Chart)

A second chart showing, on a cumulative basis throughout the month:

- Planned payments vs. actual payments
- Daily balances calculated as:
    - Expected income minus expected expenses
    Received income minus paid expenses

This chart will compare planned (forecasted) values with actual (executed) values, providing a clear view of financial performance over time.

## Requirements (mandatory)

- app built must be a desktop electron app
- How to build? App is already working as an excel spreadsheet (legacy/excel.xlsx), so just convert it to an electron app with same functionality but way better user experience
- dont implement authentication/authorization

## Features

- the app must have a main window with a menu bar, with the following options:
    - File
    - Edit
    - View
    - Help
    - Exit
    - About
    - Settings
    - Import
    - Export
    - Print
    - Exit

- the app will create an easy to read calendar where each day of the month will include its planned expenses, its planned income and the resulting cash flow. On the weekends and local and national holidays the app will transfer the expenses to the next working day, except salary payments, where the app will transfer such payments to the preceding working day 

- the app will also warn the user in case the user has not paid an expense or received income, either partially or totally on the expected day. 

- The app should not allow the user to enter wrong data, such as numbers instead of text and vice-versa, and warn the user in case the user enters figures too large compared to the other amounts generally entered by the user, appearing to be a typing error. 

- the app should not allow the user to enter impossible data, such as a payment dates larger than the number of the days of the month.






