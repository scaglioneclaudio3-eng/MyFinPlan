# Current Plan - Restringir Formatação Lembrete Despesas Futuras

- status: done
- goal: Garantir que despesas planejadas normais aceitem apenas um número do dia do mês (ou os termos "all" e "fds"), proibindo estritamente a entrada de formatos como o mês por escrito (ex: "jan"). Formatos textuais de meses futuros agora só são aceitos quando a caixa "Lembrete Despesas Meses Futuros" estiver devidamente selecionada.

## Steps
1. [x] Modificar em `modals.js` a validação de data (`saveExpenseFromForm`) de despesas não futuras para usar regex restritivo de números.
2. [x] Adicionar checagem matemática para garantir que o número numérico é <= ao limite de dias do mês, com exceção de `-1`.
3. [x] Exibir os alertas/toast apropriados informando os erros do usuário com clareza.
4. [x] Compilar código JavaScript com ferramentas de teste do Node para prevenir quebras.
