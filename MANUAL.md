# Manual do Usuário - MyFinPlan

Este aplicativo ajuda você a gerenciar suas finanças mensais, permitindo o controle de despesas e receitas com visualização em calendário e gráficos.

## Instalação

Para instalar o aplicativo:
1. Localize o arquivo `MyFinPlan Setup 1.0.1.exe` na pasta `dist`.
2. Dê um duplo clique no arquivo para iniciar o instalador.
3. Siga as instruções na tela. Você poderá escolher o diretório de instalação.
4. O instalador criará um atalho na sua Área de Trabalho para facilitar o acesso.

## Como Usar

### 1. Navegação
No topo da tela, você encontrará:
- **Seleção de Mês/Ano:** Mude o mês que está visualizando.
- **Abas de Visualização:**
  - **Lançamentos:** Onde você insere seus dados.
  - **Calendário:** Visão mensal dos compromissos financeiros.
  - **Gráfico 1/2:** Visualizações visuais de gastos e fluxo de caixa.

### 2. Lançamentos (Despesas)
- Clique no botão **"+"** ao lado de uma categoria para adicionar uma nova despesa.
- **Campos:** Descrição, Valor Previsto e Dia Vencimento (Use **-1** para contas atrasadas e **0** para lembretes).
- **Despesas Não Planejadas:** Você também pode adicionar despesas não planejadas clicando em um dia no painel "Despesas Efetivas Diárias" para abrir o popup de detalhes daquele dia.
- Ao clicar em uma despesa, você poderá informar o valor pago e a data (suportando inclusive pagamentos divididos em vários dias). Valores de "planejado" e "pago" são exibidos lado a lado na interface principal.

### 3. Receitas
- **Receitas Esperadas:** Podem ser adicionadas usando o botão **"+"**. Você pode editar os valores de receitas esperadas a qualquer momento diretamente na tabela.
- **Renda Efetiva Diária:** No fim da página de Lançamentos, há uma grade com todos os dias do mês (fundo azul). Clique em qualquer dia para abrir o popup detalhado, onde você pode facilmente lançar e ajustar suas receitas reais.

### 4. Calendário e Visualizações
- Alterne entre Lançamentos, Calendário e Gráficos usando as abas no topo.
- No **Calendário**, os fins de semana recebem destaque visual escurecido.
- Você pode acompanhar o **Fluxo Acumulado Planejado** (rosa, exibido em todos os dias do mês) e o **Fluxo Acumulado Efetivo** (calculado e visível apenas até a data atual).

### 5. Detalhes Diários
No calendário (ou nos painéis diários de efetivos), clique em um dia para visualizar um popup com todas as atividades financeiras e os resumos de receitas e despesas exatos daquele dia.

### 6. Lançamentos Recorrentes ("ALL") e Feriados
- Entradas definidas com o dia "all" (ou recorrentes) afetam todos os dias do mês.
- Receitas em fins de semana podem ter porcentagens específicas definidas nas Configurações.
- Lançamentos previstos para cair em fins de semana ou feriados podem ser movidos automaticamente para o próximo dia útil, dependendo de suas preferências.

### 7. Copiando Meses
Para facilitar a criação de novos planejamentos, use o menu **Editar → Copiar Mês** para replicar a estrutura e despesas de um mês para o outro.

### 8. Configurações
No menu de configurações (engrenagem), você ajusta:
- Porcentagem de renda recebida aos sábados e domingos.
- Transferência ou não de lançamentos de fins de semana/feriados para dias úteis (com indicação da sua localidade para feriados).
- Frequência e processos de backup do banco de dados.


