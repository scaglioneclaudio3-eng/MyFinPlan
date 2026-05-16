# Current Plan - Remover Opção de Receita Não Planejada do Popup

- status: done
- goal: Retirar dos popups de receitas esperadas a opção de serem marcadas como "receitas não planejadas", já que agora devem ser obrigatoriamente registradas no quadro "Receitas Efetivas Diárias".

## Steps
1. [x] Remover o elemento do checkbox (`#income-is-unplanned`) no arquivo `src/renderer/index.html`.
2. [x] Modificar a lógica do `src/renderer/js/modals.js` para que não cause erros sem a presença do checkbox, forçando a flag `isUnplanned` para `false` no modal de adição e salvamento de novas receitas esperadas.
3. [x] Verificar a integridade do código usando análise estática do Node.
