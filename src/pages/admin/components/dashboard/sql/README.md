# Funções SQL para o Dashboard

Este diretório contém as funções SQL necessárias para o funcionamento do dashboard administrativo.

## Como aplicar estas funções no Supabase

1. Acesse o console do Supabase
2. Vá para a seção "SQL Editor"
3. Crie uma nova query
4. Cole o conteúdo do arquivo `questoes_por_disciplina.sql`
5. Execute a query para criar a função

## Função get_questoes_por_disciplina

Esta função retorna as 10 disciplinas com mais questões cadastradas no sistema. Ela é utilizada no gráfico de barras do dashboard.

A função agrupa as questões pelo campo `discipline` da tabela `questoes` e conta o número de registros para cada disciplina.

### Exemplo de uso

```sql
SELECT * FROM get_questoes_por_disciplina();
```

### Resultado esperado

| disciplina             | total_questoes |
|------------------------|----------------|
| Direito Constitucional | 1200           |
| Direito Administrativo | 950            |
| Português              | 850            |
| ... etc ...            | ...            | 