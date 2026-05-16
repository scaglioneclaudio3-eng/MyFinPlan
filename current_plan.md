# Current Plan - Formatação Lembrete Despesas Futuras

- status: done
- goal: Ajustar o painel de despesas planejadas para alterar a exibição de "Lembrete despesas meses futuros:" para "Futuro:" e exibir o valor nesta mesma linha de texto, retirando-o da coluna de valores. Além disso, reforçar a validação da data destas despesas para exigir o mês com três letras e, opcionalmente, "dia, mês".

## Steps
1. [x] Modificar em `categories.js` a exibição da label de despesas futuras para "Futuro:" e incluir o `plannedAmountObjStr` direto nesta string.
2. [x] Remover as variáveis de renderização de valor planejado e pago nas colunas do quadro para `isFutureReminder`, de modo que a coluna de valores fique vazia nestes itens.
3. [x] Modificar em `modals.js` a validação e processamento do submit de formulário (`saveExpenseFromForm`) de despesas para impor uso do formato "(dia), (mês)" onde o mês tem 3 letras.
4. [x] Atualizar o placeholder de ajuda no campo de data da modal para exibir as novas instruções de formatação.
