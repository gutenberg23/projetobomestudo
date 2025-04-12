# Sistema de Ranking para Simulados

## Visão Geral

O sistema de ranking para simulados permite que os alunos vejam sua classificação em relação a outros usuários que realizaram o mesmo simulado. O ranking pode ser configurado como público ou privado pelos administradores do sistema.

## Funcionalidades Implementadas

1. **Ranking por Simulado**: Cada simulado possui seu próprio ranking baseado no desempenho dos alunos.
   
2. **Critérios de Classificação**:
   - Maior número de acertos
   - Menor número de erros (em caso de empate)
   - Ordem de conclusão (em caso de empate nos critérios anteriores)

3. **Visibilidade Configurável**:
   - Administradores podem definir o ranking como público ou privado
   - Rankings públicos são visíveis para todos os usuários
   - Rankings privados são visíveis apenas para administradores

4. **Interface do Usuário**:
   - Botão "Ranking" na página do simulado
   - Destaque para a posição do usuário atual no ranking
   - Medalhas para os três primeiros colocados
   - Exibição de aproveitamento percentual

## Como Usar

### Para Administradores:

1. **Acessar o Simulado**:
   - Navegue até qualquer simulado existente no sistema

2. **Configurar Visibilidade**:
   - Abaixo do botão "Ranking", existe um controle de alternância (switch)
   - Ative ou desative para tornar o ranking público ou privado

3. **Visualizar o Ranking**:
   - Clique no botão "Ranking" para visualizar a classificação completa
   - Os administradores sempre podem ver o ranking, independentemente da configuração de visibilidade

### Para Alunos:

1. **Realizar o Simulado**:
   - Complete o simulado para ser incluído no ranking
   - Seu desempenho será registrado automaticamente após clicar em "Finalizar Simulado"

2. **Acessar o Ranking**:
   - Se o ranking for público, o botão "Ranking" estará visível na página do simulado
   - Clique no botão para visualizar sua posição e o desempenho de outros alunos
   - Sua posição é destacada na tabela

## Implementação Técnica

- Nova tabela no banco de dados para armazenar a visibilidade do ranking
- Função SQL otimizada para calcular a classificação dos alunos
- Controle de acesso baseado em políticas RLS (Row Level Security)
- Interface responsiva e amigável para diferentes dispositivos

## Acesso

- Página do simulado: `/simulado/[id-do-simulado]`
- Página do ranking: `/simulado-ranking/[id-do-simulado]`

---

Para dúvidas adicionais ou suporte, entre em contato com o administrador do sistema. 