# Current Plan - Renomear Categoria Não Planejada

- status: done
- goal: Altere a descrição da categoria "Despesas não planejadas" para "Categorias não planejadas". Tornar a cor fixa em violeta (#8a2be2) e inalterável, assim como o nome e proibir sua exclusão.

## Steps
1. [x] Modificar o nome padrão no array de inicialização e no script de migração do `dataStore.js` para "Categorias Não Planejadas" e cor "#8a2be2".
2. [x] Atualizar as checagens e lógicas espalhadas no `categories.js` de 'despesas não planejadas' para 'categorias não planejadas'.
3. [x] Atualizar as lógicas no `modals.js` para a mesma string, e travar edição de nome e cor desta categoria no popup correspondente.
4. [x] Atualizar referências da documentação em `app.js`.
5. [x] Realizar teste de lint e checar a compilação do JS alterado.
