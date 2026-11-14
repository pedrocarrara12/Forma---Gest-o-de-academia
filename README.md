# Forma — Gestão de academia

Projeto acadêmico de Pedro Carrara de Figueiredo para Desenvolvimento de Aplicações Interativas com React.

## Executar

Requer Node.js 22.12+ e npm. Na pasta do projeto:

```sh
npm install
npm run dev
```

Abra http://127.0.0.1:5173. O comando inicia Vite e a API em http://127.0.0.1:3001 juntos.

Login: `gestor@forma.local`, senha: `forma123`.

```sh
npm test
npm run build
```

`npm run preview` serve somente o frontend compilado; para a aplicação integrada local, use `npm run dev`.

## Funcionalidades

- Dashboard com contagem de alunos e situação das matrículas.
- Criar, listar, buscar, filtrar, visualizar, editar e excluir alunos.
- Matrícula única por aluno, com plano, início, vencimento e cancelamento.
- CRUD de planos; exclusão bloqueada se houver aluno vinculado.
- Consulta ao ViaCEP, cache com React Query e endereço editável manualmente.
- Rotas privadas, sessão validada no servidor e logout acessível em desktop e mobile.
- Mensagens de sucesso após cadastro, edição e exclusão, com tratamento de falhas sem apagar o formulário.
- Layout responsivo, estados vazios, erros, carregamento e confirmação de exclusão.

Os planos iniciais são ilustrativos: Essencial (1 mês), Performance (3 meses) e Completo (12 meses). A base começa sem alunos. Cadastre dados fictícios para apresentação.

## Persistência e limites

A API usa `data/db.json`, criado automaticamente e ignorado pelo Git. Escritas são sequenciais e substituem o arquivo após gravação temporária. Reiniciar preserva os registros. A conta de demonstração é criada em `data/auth.json`, com hash scrypt e salt. Sessões ficam no servidor por oito horas; o navegador recebe cookie HttpOnly e SameSite=Strict. Todas as rotas de alunos e planos exigem sessão. O servidor valida a origem das escritas e bloqueia o login por quinze minutos após cinco erros por endereço. Reiniciar encerra as sessões. A API escuta somente em 127.0.0.1; esta entrega destina-se à avaliação local com credenciais públicas e dados fictícios.

O preço representa o valor total do plano, sem cobrança ou pagamentos. Não há treinos, presença ou histórico de renovações. Alterar um plano altera sua exibição para todos os alunos vinculados; as datas das matrículas existentes não são recalculadas.

## Evidências dos requisitos

| Requisito | Implementação |
| --- | --- |
| Arrow functions, destructuring, spread/rest, imports, template literals | Componentes, serviços e regras da API |
| Props, estado, JSX e renderização condicional | Componentes de tabela, formulários e estados de consulta |
| useState e useEffect | Formulários, consulta da sessão e preenchimento de endereço |
| Hook personalizado | useForm, useRecords e useSave |
| Context API | AuthProvider |
| Formulário controlado | Cadastro de aluno |
| Formulário não controlado | Login e planos, usando FormData |
| Promises, Fetch, GET/POST/PUT/DELETE | src/api.js e API Node |
| API real + React Query | ViaCEP, consulta explícita por CEP |
| React Router e rotas privadas | Shell e rotas de lista, detalhes e edição |
| Componentes terceiros | Componentes de ícones Lucide React |
| Promise.race e AbortController | Timeout de 8 segundos e propagação do cancelamento do React Query |



## Testes e estrutura

`npm test` executa oito testes de regras, autenticação, API, persistência, timeout e cancelamento. `npm run test:e2e` executa cinco testes de navegador e inicia automaticamente servidores nas portas 5175 e 3003 com base temporária isolada. Requer Google Chrome instalado e internet para o ViaCEP real. Não altera os cadastros locais. `npm run build` valida a compilação. `npm run format` formata o código.

As páginas ficam em `src/pages`; os componentes em `src/components`; os contextos em `src/context`; os Hooks em `src/hooks`. No servidor, autenticação, rotas, validação e persistência possuem módulos próprios.

Endpoints de autenticação: `POST /api/auth/login`, `GET /api/auth/session` e `POST /api/auth/logout`. Os recursos `/api/students` e `/api/plans` mantêm GET/POST na coleção e GET/PUT/DELETE por identificador. Escritas exigem Origin permitido, inclusive via clientes HTTP. Origens padrão: http://127.0.0.1:5173 e http://localhost:5173. As variáveis opcionais `PORT`, `DATA_DIR` e `APP_ORIGINS` controlam a API; mantenha a configuração padrão para avaliar.

As capturas dos testes são salvas em `test-results`, diretório ignorado pelo Git.

Créditos: React, Vite, React Router, TanStack Query, Lucide, DM Sans, ViaCEP, Playwright, Prettier e ReportLab.
