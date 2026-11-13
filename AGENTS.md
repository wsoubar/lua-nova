# AGENTS.md — Lua Nova

Use português do Brasil nas conversas, documentação e interface. Preserve comandos, APIs e identificadores em sua grafia original.

## Projeto e estrutura

Aplicação Angular 20 com TypeScript e componente standalone, sem backend ou Angular Router. Gerencia notas escolares e persiste dados no navegador.

- `src/app/app.component.ts`: modelos, signals, cálculos e persistência.
- `src/app/app.component.html`: interface e formulários com `FormsModule`.
- `src/styles.css`: estilos globais e responsividade.
- `src/index.html`: documento inicial e fontes externas.
- `angular.json`: configuração de build e servidor.
- `.github/workflows/deploy-pages.yml`: publicação no GitHub Pages.

## Desenvolvimento

Use Node.js 22.12+ na linha 22 e `npm ci` para instalar as dependências do lockfile.

```bash
npm start
npm run build
npm run build -- --base-href /lua-nova/
```

O servidor local usa a porta 4200. Não há scripts de lint ou testes automatizados configurados. Após mudanças funcionais, execute o build pertinente e valide no navegador os fluxos afetados; informe separadamente o que foi verificado e eventuais bloqueios. Para alterações apenas documentais, revise o conteúdo e execute `git diff --check`.

## Regras e manutenção

- Os dados de exemplo abrangem uma Turma A do 1º ao 9º ano, com cinco alunos fictícios por turma. No carregamento de dados antigos, acrescente apenas turmas ausentes do 1º ao 5º ano, preservando os dados existentes e evitando duplicações.
- Preserve signals e valores derivados com `computed`; mantenha atualizações de estado imutáveis.
- Cada matéria tem de 1 a 4 avaliações entre 0 e 10, com pesos iguais; quantidade global configurável, padrão: 2. Notas de avaliações excedentes são preservadas e desconsideradas nos cálculos até serem reativadas. Média mínima para aprovação configurável globalmente de 0 a 10, com até uma casa decimal; padrão: 6. Nota ausente é `null`, diferente de zero.
- Preserve a chave `lua-nova-school-data-v1` e os dados existentes. Mudanças de formato exigem estratégia de migração.
- A persistência é local a cada navegador e origem. Não prometa sincronização entre dispositivos.
- Mantenha rótulos acessíveis nos campos e verifique a responsividade quando alterar a interface.
- Prefira mudanças pequenas; evite bibliotecas, refatorações e funcionalidades fora do escopo.
- Preserve alterações preexistentes. Faça commit e push somente quando solicitados para a tarefa atual.
- Antes de remover aplicações, ferramentas ou arquivos associados, apresente caminhos e efeitos e aguarde autorização explícita posterior ao plano.

## Publicação

O workflow publica após push na `main` ou execução manual. O build usa `/lua-nova/` e envia `dist/lua-nova/browser`. Preserve esse caminho ao alterar a configuração. As fontes são carregadas externamente pelo navegador; a incorporação no build está desativada. Não versione `dist`, `node_modules`, `.angular` ou credenciais.

