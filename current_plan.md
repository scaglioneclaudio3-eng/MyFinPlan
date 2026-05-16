# Current Plan - Coluna Separada para Lembretes Futuros

- status: done
- goal: Criar uma nova coluna na tabela de despesas planejadas com o título "Lembrete despesas meses futuros" e exibir o valor nela, destacando com a cor azul céu para diferenciar da descrição e da coluna principal de valores do mês atual.

## Steps
1. [x] Modificar em `categories.js` a renderização do `<thead>` da tabela de despesas para incluir uma nova coluna `<th>` com título de Lembrete.
2. [x] Ajustar os tamanhos de coluna no elemento `<colgroup>` (`auto`, `140px`, `175px`, `90px`) para comportar a nova separação sem quebrar a proporção.
3. [x] Remover o valor da string `descriptionDisplay`.
4. [x] Criar uma nova variável `futureAmountHtml` populada somente para despesas do tipo lembrete (`isFutureReminder`), utilizando a cor `skyblue` (#87ceeb).
5. [x] Renderizar no `<tbody>` o conteúdo das 4 colunas para cada despesa perfeitamente alinhadas no layout.
6. [x] Testar compilação do JavaScript com Node.js para prevenir falhas.
7. [x] Remover título redundante da coluna em `categories.js` pois o título principal já cobre essa área.
