// i18n.js

const translations = {
    "pt-BR": {
        // Mês e navegação
        "month_1": "Janeiro",
        "month_2": "Fevereiro",
        "month_3": "Março",
        "month_4": "Abril",
        "month_5": "Maio",
        "month_6": "Junho",
        "month_7": "Julho",
        "month_8": "Agosto",
        "month_9": "Setembro",
        "month_10": "Outubro",
        "month_11": "Novembro",
        "month_12": "Dezembro",
        "btn_prev_month": "Mês Anterior",
        "btn_next_month": "Próximo Mês",
        "btn_today": "Hoje",

        // Abas
        "tab_entries": "Lançamentos",
        "tab_calendar": "Calendário",
        "tab_chart_expenses": "Gráfico: Despesas por Categoria",
        "tab_chart_cashflow": "Gráfico: Fluxos de Caixa Planejado e Efetivo",
        "tab_annual": "Visão Anual",
        "tab_print": "Imprimir Despesas",

        // Painéis Lançamentos
        "panel_planned_expenses": "Despesas Planejadas",
        "panel_daily_expenses": "Despesas Efetivas Diárias",
        "panel_income": "Receitas Esperadas x Receitas Efetivas",
        "panel_daily_income": "Receitas Efetivas Diárias",

        // Tabela Despesas Planejadas
        "col_category": "Categoria",
        "col_expense_future": "Lembrete Despesas Meses Futuros",
        "col_total": "Total",

        // Tabela Receitas
        "col_description": "Descrição",
        "col_income_future": "Lembrete de Receitas<br>em Meses futuros",
        "col_date": "Data",
        "col_values": "Valores",

        // Resumo (Summary Bar)
        "summary_planned_income": "Receita Prevista",
        "summary_received_income": "Receita Recebida",
        "summary_planned_expenses": "Despesas Previstas",
        "summary_paid_expenses": "Despesas Pagas",
        "summary_planned_balance": "Saldo Previsto",
        "summary_actual_balance": "Saldo Efetivo",
        "summary_accumulated_fines": "Multas/Juros Acum.",
        "summary_exceeds_planned": "Excedente ao Planejado",

        // Telas Gráficos e Print
        "title_expense_chart": "Despesas por Categoria",
        "title_cashflow_chart": "Fluxo de Caixa Acumulado",
        "title_annual_evolution": "Evolução Anual",
        "title_annual_categories": "Categorias Visíveis",
        "btn_print": "🖨️ Imprimir",
        "print_report_title": "Relatório de Despesas",
        "print_by_category": "Despesas por Categoria",
        "print_by_date": "Despesas por Dia",
        "print_total_categories": "Total Geral (Categorias)",
        "print_total_planned": "Previsto",
        "print_total_paid": "Pago",
        "print_no_category": "Sem Categoria",
        "print_overdue_first_day": "Atrasado / Primeiro Dia Útil",
        "print_future": "Futuro",
        "print_overdue": "atraso",
        "print_paid": "Pago",
        "print_no_expenses": "Nenhuma despesa para exibir.",

        // Modais - Categoria
        "modal_category_title": "Nova Categoria",
        "lbl_name": "Nome",
        "lbl_color": "Cor",
        "btn_cancel": "Cancelar",
        "btn_save": "Salvar",
        "btn_delete": "Excluir",

        // Modais - Despesa
        "modal_expense_title": "Nova Despesa",
        "lbl_description": "Descrição",
        "lbl_expense_future_rem": "Lembrete Despesas Meses Futuros",
        "lbl_includes_fines": "Inclui multa/juros?",
        "lbl_planned_amount": "Valor Previsto",
        "lbl_planned_date": "Dia Vencimento",
        "lbl_paid_amount": "Valor Pago Efetivo Diário",
        "lbl_paid_dates": "Dia(s) Pago(s)",
        "lbl_special_type": "Especifique abaixo, se despesa trabalhista",
        "lbl_is_template": "Usar como modelo para próximos meses",
        "opt_not_worker": "Não é trabalhista",
        "opt_salary_adv": "Adiantamento Salarial (Dia 20)",
        "opt_inss": "INSS",
        "opt_fgts": "FGTS",
        "opt_5wd": "5º Dia Útil (Salário)",
        "opt_vt": "Vale Transporte",
        "opt_va": "Vale Alimentação",
        "opt_cb": "Cesta Básica",

        // Modais - Receita
        "modal_income_title": "Nova Receita",
        "lbl_income_future_rem": "Lembrete Receitas Meses Futuros",

        // Calendário Dinâmico
        "day_sun": "Dom",
        "day_mon": "Seg",
        "day_tue": "Ter",
        "day_wed": "Qua",
        "day_thu": "Qui",
        "day_fri": "Sex",
        "day_sat": "Sáb",
        "acc_eff_flux": "Fluxo Acum. Efetivo",
        "acc_real_flux": "Fluxo Acum. Efetivo",
        "lbl_planned_lower": "planejado",
        "lbl_paid_lower": "pago",
        "lbl_planned_fem_lower": "planejada",
        "lbl_received_lower": "recebida",
        "acc_plan_flux": "Fluxo Acum. Planejado",
        "flux_plan": "Fluxo Plan",
        "flux_eff": "Fluxo Efetivo",
        "income_plan": "Receita Plan",
        "income_eff": "Receita Efet.",

        // Modais - Copiar Mês
        "modal_copy_month_title": "Copiar Mês",
        "lbl_source_month": "Mês Origem",
        "lbl_target_month": "Mês Destino",
        "lbl_copy_templates_only": "Copiar apenas itens marcados como modelo",
        "btn_copy": "Copiar",

        // Modais - Detalhes do Dia
        "modal_day_income_title": "Detalhamento da Receita do Dia",
        "modal_day_expense_title": "Detalhamento da Despesa do Dia",
        "modal_day_detail_title": "Detalhamento do Dia",
        "day_detail_expenses": "Despesas",
        "day_detail_incomes": "Receitas",
        "day_detail_summary": "Resumo do Dia",

        // Modais - Configurações
        "modal_settings_title": "Configurações",
        "settings_weekend_income": "Receitas Previstas em Fins de Semana e Feriados",
        "settings_transfer_income": "Transferir Porcentagens de Receitas Previstas Médias (datadas \"all\") de Fins de Semana e Feriados para o Primeiro Dia Útil Subsequente",
        "settings_sat_pct": "% Sábado (Esperado)",
        "settings_sun_pct": "% Domingo (Esperado)",
        "settings_hol_pct": "% Feriado (Esperado)",
        "settings_weekend_expense": "Despesas Previstas em Fins de Semana e Feriados",
        "settings_location": "Localização (para feriados)",
        "settings_state": "Estado",
        "settings_city": "Cidade",
        "settings_backup": "Backup Automático",
        "settings_enable_backup": "Ativar backup automático",
        "settings_backup_interval": "Intervalo (dias)",
        "settings_manual_actions": "Ações Manuais",
        "btn_export_csv": "📄 Exportar CSV",
        "btn_export_backup": "💾 Gerar Backup JSON",
        "backup_info_text": "* O backup JSON possibilita restaurar todo o aplicativo na data em que foi gerado, podendo ser salvo em um pendrive ou nuvem para sua segurança.",

        // Worker Choice Modal
        "worker_choice_title": "Ajuste de Data de<br>Despesa Trabalhista",
        "worker_choice_desc": "As datas sugeridas para despesas trabalhistas são:<br>o <strong>5º dia útil</strong> do mês, <strong>dia 15</strong>, <strong>dia 20</strong> ou <strong>dia 30</strong>.",
        "worker_choice_obs": "Obs: Caso a data escolhida recaia em feriados<br>ou fins de semana (sábados e domingos),<br>a despesa deve ser paga no dia útil imediatamente anterior.",
        "worker_choice_question": "Como deseja proceder?",
        "btn_worker_keep": "Manter data inserida",
        "btn_worker_5wd": "Alterar para o 5º dia útil",
        "btn_worker_15": "Alterar para o dia 15",
        "btn_worker_20": "Alterar para o dia 20",
        "btn_worker_30": "Alterar para o dia 30",

        // Delete Category Modal
        "del_cat_title": "Excluir Categoria",
        "del_cat_desc_1": "Você está prestes a excluir a categoria",
        "del_cat_desc_2": "O que você deseja fazer com as despesas, lembretes e históricos associados a ela?",
        "lbl_migrate_to": "Transferir tudo para:",
        "btn_migrate_del": "Migrar Dados e Excluir Categoria",
        "btn_del_perm": "Excluir Permanentemente (Perder Dados)",

        // Delete Past Item Modal
        "del_past_title": "Atenção: Modificação de Dados Antigos",
        "del_past_desc_1": "Você está tentando deletar um item em um mês passado.<br>Deletar este item apagará ele e todas as suas entradas nos meses futuros.",
        "del_past_desc_2": "O que você deseja fazer?",
        "btn_past_edit_desc": "Quero apenas alterar a DESCRIÇÃO",
        "btn_past_edit_cat": "Quero adicionar em OUTRA CATEGORIA",
        "btn_past_delete": "Tenho certeza, quero DELETAR",

        // Tutorial
        "tut_title": "Tutorial",
        "tut_s1_t": "1. Navegação Básica",
        "tut_s1_d": "Use as abas no topo para alternar entre as telas principais: <b>Lançamentos</b> (para inserir dados), <b>Calendário</b>, <b>Gráficos</b> e <b>Impressão/Relatórios</b>.",
        "tut_s2_t": "2. Lançamentos e Despesas Planejadas",
        "tut_s2_d": "Clique no botão '+' de uma categoria para adicionar uma despesa. Você pode <b>reordenar</b> despesas planejadas para organizá-las. <b>Atenção:</b> ao excluir uma categoria ou despesa planejada, todas as entradas correlatas (ex: pagamentos efetivos) serão excluídas em cascata.",
        "tut_s3_t": "3. Alertas de Atraso (Pisca-Pisca) e Rolagem Automática",
        "tut_s3_d": "Quando uma despesa planejada não é paga até o dia de vencimento, ela começará a <b>piscar</b> na tela (o mesmo vale para receitas não recebidas). Além disso, despesas que não forem pagas e nem apagadas durante o mês serão <b>automaticamente transferidas para o dia 1 do mês seguinte</b>.",
        "tut_s4_t": "4. Lembretes e Recorrências",
        "tut_s4_d": "Marque a opção <b>'Lembrete'</b> no popup da despesa para criar um aviso que não afeta o saldo diário padrão até ser pago. Para itens mensais fixos por dia, utilize o dia 'all' (recorrente). Para itens sem categoria específica, insira-os como <b>Despesas Não Categorizadas</b>.",
        "tut_s5_t": "5. Gestão de Categorias",
        "tut_s5_d": "Se você precisar reorganizar as categorias, use a opção <b>Unir Categorias</b>. Ela agrupa duas categorias em uma e move todas as despesas da antiga para a nova categoria de forma segura.",
        "tut_s6_t": "6. Gráficos",
        "tut_s6_d": "A aba Gráficos oferece duas visões: o <b>Gráfico 1</b> foca em Despesas por categoria, mostrando onde você gasta mais. O <b>Gráfico 2</b> foca no Fluxo de Caixa, comparando visualmente as receitas totais contra as despesas ao longo do tempo.",
        "tut_s7_t": "7. Impressão (Página vs. Relatório)",
        "tut_s7_d": "A impressão de tela convencional (Ctrl+P) imprime a interface exata que você está vendo. Já a aba de <b>Impressão/Relatórios</b> organiza todos os dados em um formato limpo, tabular e ideal para exportar para PDF ou enviar para a impressora física.",
        "tut_s8_t": "8. Calendário e Detalhes Diários",
        "tut_s8_d": "No Calendário, a linha rosa mostra seu <b>Fluxo Planejado</b> para o mês todo. A outra mostra o <b>Fluxo Efetivo</b> (apenas até hoje). Clique num dia para abrir o detalhamento completo diário de receitas e despesas.",
        "tut_s9_t": "9. Copiando Meses e Configurações",
        "tut_s9_d": "Use o menu <b>Editar → Copiar Mês</b> para copiar a estrutura atual para o mês seguinte. Nas <b>Configurações</b>, você pode automatizar transferências de lançamentos de fins de semana para dias úteis (considerando feriados) e gerenciar seus backups de segurança.",

        // Modals - Import/Export/Backup
        "imp_title": "Importar Dados",
        "imp_warn": "Atenção: A Importação sobrescreverá dados!",
        "imp_sub": "O sistema aceita dois tipos de arquivos gerados por ele próprio:",
        "imp_m_title": "1. Exportação Manual (Um único mês)",
        "imp_m_desc1": "<strong>Como identificar:</strong> Arquivos com nomes como <code>financas-export-DATA.json</code>, localizados na pasta que você escolheu salvar (ex: Documentos, Downloads).",
        "imp_m_desc2": "<strong>O que faz:</strong> Substitui apenas os dados do mês atual visualizado pelos dados contidos no arquivo.",
        "btn_imp_m": "Importar Exportação Manual",
        "imp_b_title": "2. Backup Automático (Todos os meses)",
        "imp_b_desc1": "<strong>Como identificar:</strong> Arquivos com nomes como <code>backup-DATA.json</code>.",
        "imp_b_desc2": "<strong>O que faz:</strong> Substitui <strong>TODOS</strong> os seus dados atuais pelo backup selecionado.",
        "btn_imp_b": "Restaurar Backup Automático",
        
        "exp_title": "Exportar Dados",
        "exp_sub1": "Exportação Manual de Mês Único",
        "exp_sub2": "Esta ferramenta exporta os dados do mês que você está visualizando agora na tela.",
        "exp_what_title": "O que será exportado?",
        "exp_what_l1": "Todas as <strong>receitas e despesas</strong> do mês atual.",
        "exp_what_l2": "Suas <strong>categorias</strong> personalizadas.",
        "exp_what_l3": "Suas <strong>configurações</strong> gerais.",
        "exp_what_warn": "<strong>Atenção:</strong> Os dados de outros meses NÃO serão incluídos neste arquivo. Se quiser salvar todos os meses de uma vez, use a opção 'Backup Agora' no menu principal.",
        "exp_where_title": "Onde devo guardar?",
        "exp_where_desc": "Recomendamos que você crie uma pasta segura, como no seu <strong>Google Drive, OneDrive ou um Pendrive</strong>, para garantir que você não perca esses dados caso o seu computador tenha algum problema.",
        "btn_exp": "Escolher Local e Exportar",

        "bkp_title": "Fazer Backup",
        "bkp_sub1": "Criação de Backup Rápido",
        "bkp_sub2": "Esta ferramenta cria uma cópia de segurança instantânea de <strong>TODO O SEU SISTEMA</strong>.",
        "bkp_what_title": "O que será salvo?",
        "bkp_what_l1": "Todos os dados de <strong>todos os meses</strong> (passados, atuais e futuros).",
        "bkp_what_l2": "Todas as suas <strong>categorias</strong> e <strong>configurações</strong>.",
        "bkp_where_title": "Para onde vai o arquivo?",
        "bkp_where_desc": "Para facilitar, o aplicativo salvará esse arquivo automaticamente em uma <strong>pasta escondida no seu computador</strong>. Se algum dia precisar voltar atrás (restaurar), a opção 'Arquivo > Importar > Restaurar Backup Automático' saberá exatamente onde procurar!",
        "bkp_where_warn": "<strong>Aviso:</strong> Se o seu computador pifar, esse arquivo também pode ser perdido. Para salvar um backup em um pendrive ou na nuvem, feche essa janela, vá na engrenagem de <strong>Configurações</strong> e use o botão 'Exportar Backup Completo'.",
        "btn_bkp": "Criar Backup Agora"
    },
    "en-US": {
        // Month and navigation
        "month_1": "January",
        "month_2": "February",
        "month_3": "March",
        "month_4": "April",
        "month_5": "May",
        "month_6": "June",
        "month_7": "July",
        "month_8": "August",
        "month_9": "September",
        "month_10": "October",
        "month_11": "November",
        "month_12": "December",
        "btn_prev_month": "Previous Month",
        "btn_next_month": "Next Month",
        "btn_today": "Today",

        // Tabs
        "tab_entries": "Entries",
        "tab_calendar": "Calendar",
        "tab_chart_expenses": "Chart: Expenses by Category",
        "tab_chart_cashflow": "Chart: Planned vs Actual Cashflow",
        "tab_annual": "Annual View",
        "tab_print": "Print Expenses",

        // Entries Panels
        "panel_planned_expenses": "Planned Expenses",
        "panel_daily_expenses": "Daily Actual Expenses",
        "panel_income": "Planned vs Actual Income",
        "panel_daily_income": "Daily Actual Income",

        // Planned Expenses Table
        "col_category": "Category",
        "col_expense_future": "Future Months Expenses Reminder",
        "col_total": "Total",

        // Income Table
        "col_description": "Description",
        "col_income_future": "Future Months<br>Income Reminder",
        "col_date": "Date",
        "col_values": "Values",

        // Summary Bar
        "summary_planned_income": "Planned Income",
        "summary_received_income": "Received Income",
        "summary_planned_expenses": "Planned Expenses",
        "summary_paid_expenses": "Paid Expenses",
        "summary_planned_balance": "Planned Balance",
        "summary_actual_balance": "Actual Balance",
        "summary_accumulated_fines": "Accum. Fines/Interest",
        "summary_exceeds_planned": "Exceeds Planned",

        // Charts and Print screens
        "title_expense_chart": "Expenses by Category",
        "title_cashflow_chart": "Cumulative Cash Flow",
        "title_annual_evolution": "Annual Evolution",
        "title_annual_categories": "Visible Categories",
        "btn_print": "🖨️ Print",
        "print_report_title": "Expenses Report",
        "print_by_category": "Expenses by Category",
        "print_by_date": "Expenses by Date",
        "print_total_categories": "Grand Total (Categories)",
        "print_total_planned": "Planned",
        "print_total_paid": "Paid",
        "print_no_category": "No Category",
        "print_overdue_first_day": "Overdue / First Workday",
        "print_future": "Future",
        "print_overdue": "overdue",
        "print_paid": "Paid",
        "print_no_expenses": "No expenses to display.",

        // Modals - Category
        "modal_category_title": "New Category",
        "lbl_name": "Name",
        "lbl_color": "Color",
        "btn_cancel": "Cancel",
        "btn_save": "Save",
        "btn_delete": "Delete",

        // Modals - Expense
        "modal_expense_title": "New Expense",
        "lbl_description": "Description",
        "lbl_expense_future_rem": "Future Months Expenses Reminder",
        "lbl_includes_fines": "Includes fines/interest?",
        "lbl_planned_amount": "Planned Amount",
        "lbl_planned_date": "Due Date",
        "lbl_paid_amount": "Daily Actual Paid Amount",
        "lbl_paid_dates": "Paid Date(s)",
        "lbl_special_type": "Specify below if it's a labor expense",
        "lbl_is_template": "Use as template for next months",
        "opt_not_worker": "Not labor related",
        "opt_salary_adv": "Salary Advance (20th)",
        "opt_inss": "INSS",
        "opt_fgts": "FGTS",
        "opt_5wd": "5th Working Day (Salary)",
        "opt_vt": "Transportation Voucher",
        "opt_va": "Meal Voucher",
        "opt_cb": "Basic Food Basket",

        // Modals - Income
        "modal_income_title": "New Income",
        "lbl_income_future_rem": "Future Months Income Reminder",

        // Calendário Dinâmico
        "day_sun": "Sun",
        "day_mon": "Mon",
        "day_tue": "Tue",
        "day_wed": "Wed",
        "day_thu": "Thu",
        "day_fri": "Fri",
        "day_sat": "Sat",
        "acc_eff_flux": "Accum. Effective Flux",
        "acc_real_flux": "Actual Accum. Flow",
        "lbl_planned_lower": "planned",
        "lbl_paid_lower": "paid",
        "lbl_planned_fem_lower": "planned",
        "lbl_received_lower": "received",
        "flux_plan": "Planned Flux",
        "flux_eff": "Effective Flux",
        "income_plan": "Planned Income",
        "income_eff": "Effective Income",

        // Modals - Copy Month
        "modal_copy_month_title": "Copy Month",
        "lbl_source_month": "Source Month",
        "lbl_target_month": "Target Month",
        "lbl_copy_templates_only": "Copy only template-marked items",
        "btn_copy": "Copy",

        // Modals - Day Details
        "modal_day_income_title": "Daily Income Details",
        "modal_day_expense_title": "Daily Expense Details",
        "modal_day_detail_title": "Day Details",
        "day_detail_expenses": "Expenses",
        "day_detail_incomes": "Income",
        "day_detail_summary": "Day Summary",

        // Modals - Settings
        "modal_settings_title": "Settings",
        "settings_weekend_income": "Planned Income on Weekends and Holidays",
        "settings_transfer_income": "Transfer Percentages of Average Planned Income (dated \"all\") from Weekends and Holidays to the Subsequent Working Day",
        "settings_sat_pct": "Saturday % (Expected)",
        "settings_sun_pct": "Sunday % (Expected)",
        "settings_hol_pct": "Holiday % (Expected)",
        "settings_weekend_expense": "Planned Expenses on Weekends and Holidays",
        "settings_location": "Location (for holidays)",
        "settings_state": "State",
        "settings_city": "City",
        "settings_backup": "Automatic Backup",
        "settings_enable_backup": "Enable automatic backup",
        "settings_backup_interval": "Interval (days)",
        "settings_manual_actions": "Manual Actions",
        "btn_export_csv": "📄 Export CSV",
        "btn_export_backup": "💾 Generate JSON Backup",
        "backup_info_text": "* The JSON backup allows you to restore the entire application to the date it was generated, and can be saved to a flash drive or cloud for safety.",

        // Worker Choice Modal
        "worker_choice_title": "Labor Expense<br>Date Adjustment",
        "worker_choice_desc": "Suggested dates for labor expenses are:<br>the <strong>5th working day</strong> of the month, <strong>day 15</strong>, <strong>day 20</strong> or <strong>day 30</strong>.",
        "worker_choice_obs": "Note: If the chosen date falls on a holiday<br>or weekend (Saturdays and Sundays),<br>the expense must be paid on the immediately preceding working day.",
        "worker_choice_question": "How would you like to proceed?",
        "btn_worker_keep": "Keep entered date",
        "btn_worker_5wd": "Change to 5th working day",
        "btn_worker_15": "Change to day 15",
        "btn_worker_20": "Change to day 20",
        "btn_worker_30": "Change to day 30",

        // Delete Category Modal
        "del_cat_title": "Delete Category",
        "del_cat_desc_1": "You are about to delete the category",
        "del_cat_desc_2": "What do you want to do with the expenses, reminders and history associated with it?",
        "lbl_migrate_to": "Transfer everything to:",
        "btn_migrate_del": "Migrate Data and Delete Category",
        "btn_del_perm": "Delete Permanently (Lose Data)",

        // Delete Past Item Modal
        "del_past_title": "Warning: Modification of Past Data",
        "del_past_desc_1": "You are trying to delete an item in a past month.<br>Deleting this item will erase it and all its entries in future months.",
        "del_past_desc_2": "What do you want to do?",
        "btn_past_edit_desc": "I just want to change the DESCRIPTION",
        "btn_past_edit_cat": "I want to add to ANOTHER CATEGORY",
        "btn_past_delete": "I am sure I want to DELETE",

        // Tutorial
        "tut_title": "Tutorial",
        "tut_s1_t": "1. Basic Navigation",
        "tut_s1_d": "Use the top tabs to switch between the main screens: <b>Entries</b> (to input data), <b>Calendar</b>, <b>Charts</b>, and <b>Print/Reports</b>.",
        "tut_s2_t": "2. Entries and Planned Expenses",
        "tut_s2_d": "Click the '+' button of a category to add an expense. You can <b>reorder</b> planned expenses to organize them. <b>Attention:</b> when deleting a category or planned expense, all related entries (e.g. actual payments) will be cascaded deleted.",
        "tut_s3_t": "3. Overdue Alerts (Blinking) and Auto-Rollover",
        "tut_s3_d": "When a planned expense isn't paid by its due date, it will start <b>blinking</b> on screen (same for unreceived income). Also, expenses not paid or deleted during the month will be <b>automatically transferred to day 1 of the following month</b>.",
        "tut_s4_t": "4. Reminders and Recurrences",
        "tut_s4_d": "Check the <b>'Reminder'</b> option in the expense popup to create an alert that doesn't affect standard daily balance until paid. For fixed daily monthly items, use the day 'all' (recurring). For items without specific category, input them as <b>Uncategorized Expenses</b>.",
        "tut_s5_t": "5. Categories Management",
        "tut_s5_d": "If you need to reorganize categories, use the <b>Merge Categories</b> option. It safely groups two categories into one and moves all expenses from the old to the new category.",
        "tut_s6_t": "6. Charts",
        "tut_s6_d": "The Charts tab offers two views: <b>Chart 1</b> focuses on Expenses by category, showing where you spend more. <b>Chart 2</b> focuses on Cash Flow, visually comparing total income against expenses over time.",
        "tut_s7_t": "7. Printing (Page vs. Report)",
        "tut_s7_d": "Conventional screen printing (Ctrl+P) prints the exact interface you're seeing. The <b>Print/Reports</b> tab organizes all data into a clean, tabular format ideal for PDF export or sending to physical printers.",
        "tut_s8_t": "8. Calendar and Daily Details",
        "tut_s8_d": "In the Calendar, the pink line shows your <b>Planned Flow</b> for the whole month. The other shows the <b>Actual Flow</b> (only up to today). Click a day to open the full daily breakdown of income and expenses.",
        "tut_s9_t": "9. Copying Months and Settings",
        "tut_s9_d": "Use the <b>Edit → Copy Month</b> menu to copy current structure to the next month. In <b>Settings</b>, you can automate moving weekend entries to workdays (considering holidays) and manage security backups.",

        // Modals - Import/Export/Backup
        "imp_title": "Import Data",
        "imp_warn": "Warning: Importing will overwrite data!",
        "imp_sub": "The system accepts two types of files generated by itself:",
        "imp_m_title": "1. Manual Export (Single month)",
        "imp_m_desc1": "<strong>How to identify:</strong> Files named like <code>financas-export-DATE.json</code>, located in the folder you chose to save (e.g. Documents, Downloads).",
        "imp_m_desc2": "<strong>What it does:</strong> Replaces only the data of the currently viewed month with the data in the file.",
        "btn_imp_m": "Import Manual Export",
        "imp_b_title": "2. Auto Backup (All months)",
        "imp_b_desc1": "<strong>How to identify:</strong> Files named like <code>backup-DATE.json</code>.",
        "imp_b_desc2": "<strong>What it does:</strong> Replaces <strong>ALL</strong> your current data with the selected backup.",
        "btn_imp_b": "Restore Auto Backup",
        
        "exp_title": "Export Data",
        "exp_sub1": "Manual Single Month Export",
        "exp_sub2": "This tool exports the data of the month you are viewing on screen right now.",
        "exp_what_title": "What will be exported?",
        "exp_what_l1": "All <strong>income and expenses</strong> of the current month.",
        "exp_what_l2": "Your custom <strong>categories</strong>.",
        "exp_what_l3": "Your general <strong>settings</strong>.",
        "exp_what_warn": "<strong>Warning:</strong> Data from other months WILL NOT be included in this file. If you want to save all months at once, use the 'Backup Now' option in the main menu.",
        "exp_where_title": "Where should I keep it?",
        "exp_where_desc": "We recommend creating a secure folder, such as in your <strong>Google Drive, OneDrive, or a USB stick</strong>, to ensure you don't lose this data if your computer has issues.",
        "btn_exp": "Choose Location and Export",

        "bkp_title": "Create Backup",
        "bkp_sub1": "Quick Backup Creation",
        "bkp_sub2": "This tool creates an instant backup of <strong>YOUR ENTIRE SYSTEM</strong>.",
        "bkp_what_title": "What will be saved?",
        "bkp_what_l1": "All data from <strong>all months</strong> (past, current, and future).",
        "bkp_what_l2": "All your <strong>categories</strong> and <strong>settings</strong>.",
        "bkp_where_title": "Where will the file go?",
        "bkp_where_desc": "For convenience, the app will automatically save this file in a <strong>hidden folder on your computer</strong>. If you ever need to restore it, the 'File > Import > Restore Auto Backup' option will know exactly where to look!",
        "bkp_where_warn": "<strong>Warning:</strong> If your computer breaks, this file might also be lost. To save a backup on a USB stick or cloud, close this window, go to the <strong>Settings</strong> gear, and use the 'Export Full Backup' button.",
        "btn_bkp": "Create Backup Now"
    }
};

let currentLanguage = 'pt-BR'; // default

function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        applyTranslations();
        
        // Disparar evento customizado para notificar outras partes do app
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        
        if (window.api && window.api.changeLanguage) {
            window.api.changeLanguage(lang);
        }
    }
}

function getLanguage() {
    return currentLanguage;
}

function t(key) {
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
        return translations[currentLanguage][key];
    }
    // Fallback para pt-BR
    if (translations['pt-BR'] && translations['pt-BR'][key]) {
        return translations['pt-BR'][key];
    }
    return key; // Retorna a própria chave se não encontrar a tradução
}

function applyTranslations() {
    try {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = t(key);
            
            if (typeof translation !== 'string') {
                console.warn('Translation is not a string for key:', key, translation);
                return;
            }

            if (translation.includes('<')) {
                el.innerHTML = translation;
            } else {
                if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
                    el.value = translation;
                } else if (el.tagName === 'INPUT' && el.type === 'text') {
                    if (el.hasAttribute('placeholder')) {
                        el.placeholder = translation;
                    } else {
                        el.textContent = translation;
                    }
                } else {
                    el.textContent = translation;
                }
            }
        });

        updateSelectsI18n();
    } catch (err) {
        console.error('Error in applyTranslations:', err);
    }
}

function updateSelectsI18n() {
    const monthSelect = document.getElementById('month-select');
    if (monthSelect) {
        for (let i = 0; i < monthSelect.options.length; i++) {
            const val = monthSelect.options[i].value;
            if (val >= 1 && val <= 12) {
                monthSelect.options[i].text = t('month_' + val);
            }
        }
    }
    
    // Atualizar placeholders manuais
    const expenseDate = document.getElementById('expense-planned-date');
    if (expenseDate) {
        expenseDate.placeholder = currentLanguage === 'en-US' ? 'all, fds or 1-31' : 'all, fds ou 1-31';
        expenseDate.title = currentLanguage === 'en-US' ? "Type 'all' for daily, 'fds' for weekends, 1-31: Day" : "Digite 'all' para diário, 'fds' para finais de semana, 1-31: Dia";
        const smallDesc = expenseDate.parentElement.querySelector('small');
        if (smallDesc) smallDesc.textContent = currentLanguage === 'en-US' ? "1-31: Day, all: Daily, fds: Weekends" : "1-31: Dia, all: Diária, fds: Fins de Semana";
    }

    const incomeDate = document.getElementById('income-planned-date');
    if (incomeDate) {
        incomeDate.placeholder = currentLanguage === 'en-US' ? 'all or 1-31' : 'all ou 1-31';
        incomeDate.title = currentLanguage === 'en-US' ? "Type 'all' for recurring or a day (1-31)" : "Digite 'all' para recorrente ou um dia (1-31)";
    }

    // Hide worker expense detailing in English
    const specialTypeSelect = document.getElementById('expense-special-type');
    if (specialTypeSelect && specialTypeSelect.parentElement) {
        if (currentLanguage === 'en-US') {
            specialTypeSelect.parentElement.style.display = 'none';
            specialTypeSelect.value = '';
        } else {
            specialTypeSelect.parentElement.style.display = 'block';
        }
    }
}

window.i18n = {
    setLanguage,
    getLanguage,
    t,
    applyTranslations
};
