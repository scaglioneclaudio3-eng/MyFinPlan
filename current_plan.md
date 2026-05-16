# Current Plan - Padronizar Lembretes Futuros

- status: done
- goal: Padronizar o cabeçalho fixo da categoria para mostrar a soma total dos lembretes de despesas futuras formatado com o mesmo tamanho e estilo dos demais valores. Também, remover o prefixo `Futuro:` da descrição para que a fonte e aparência acompanhem de forma exata as despesas planejadas normais.

## Steps
1. [x] Modificar em `categories.js` a exibição do `futureTotalHtml` no cabeçalho. Ao invés da lista separada por `|`, agora mostra o valor único somado e formatado como moeda.
2. [x] Aplicar `font-size: 0.9em;` e `font-weight: bold;` ao `futureTotalHtml` no cabeçalho.
3. [x] Remover a tag `<span class="text-muted">Futuro:</span>` de `descriptionDisplay`, equiparando 100% a fonte e texto da linha da despesa com as linhas convencionais.
4. [x] Compilar código e validar com o Node.
5. [x] Adicionar label "futuro:" e alinhar a estrutura visual do `futureTotalHtml` no cabeçalho com os demais subtotais.
6. [x] Atribuir `font-family: 'Consolas', monospace;` ao `futureAmountHtml` na tabela para que seus números tenham exata mesma proporção visual dos demais valores.
