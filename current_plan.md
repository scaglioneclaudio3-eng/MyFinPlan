# Current Plan - Correção de visibilidade da categoria Não Categorizadas

- status: done
- goal: Garantir que a categoria "Despesas Não Categorizadas" não seja ocultada por equívoco devido a uma exclusão lógica (`hiddenFrom`) anterior.

## Steps
1. [x] Modificar `DataStore.loadCategories` em `dataStore.js` para garantir que, caso a categoria primária de "Despesas Não Categorizadas" possua a propriedade `hiddenFrom` ativa no banco de dados interno (`categories.json`), ela seja imediatamente deletada.
2. [x] Isso torna a categoria verdadeiramente "imortal" e a forçará a renderizar na tela principal, contornando exclusões acidentais (soft deletes) feitas pelo usuário no passado.
