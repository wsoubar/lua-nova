# Lua Nova — Controle de notas escolares

Aplicação Angular para acompanhar notas de quatro turmas (6º ao 9º ano). Os dados são armazenados no navegador usando `localStorage`.

## Executar localmente

Requisitos: Node.js 20.19+ ou 22.12+ e npm.

```bash
npm install
npm start
```

A aplicação ficará disponível em http://localhost:4200.

## Regras de avaliação

Cada aluno tem duas notas por matéria, de 0 a 10 e com o mesmo peso. A média é (nota 1 + nota 2) / 2. Média igual ou superior a 6 significa aprovação, equivalente a uma soma mínima de 12 pontos.

## Dados

Na primeira abertura, a aplicação carrega turmas demonstrativas do 6º ao 9º ano, com cinco alunos fictícios por turma e seis matérias. As alterações ficam neste navegador. Use “Restaurar dados de exemplo” para apagar as notas e recuperar os dados iniciais.
