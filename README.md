# API de Transações

Uma simples API de transações baseada em conceitos RESTful para gestão financeira. 

## Instalação
- Clone o repositório usando o terminal ou bash:
  git clone https://github.com/mfre1re/api-de-transacoes-financeiras-backend.git

- Instale as dependências:
  npm install

Resumo das dependências:
  - **Express:** Framework web para Node.js que intermedeia e facilita a criação de APIs RESTful.
  - **PostgreSQL:** Banco de dados para armazenamento de dados.
  - **Bcrypt:** Biblioteca para a criptografia de senhas.
  - **Jsonwebtoken:** Geração de tokens JWT para autenticação.
  - **Date-fns:** Biblioteca para manipulação de datas.
  - **Nodemon:** Ferramenta para reiniciar automaticamente o servidor durante o desenvolvimento.

Para realizar testes na API foi utilizado o **Insomnia**, uma plataforma de teste de API que oferece uma interface intuitiva para criar, executar e compartilhar solicitações HTTP.

- **Download Insomnia** - (https://insomnia.rest/download)
- **Documentação Insomnia** - (https://docs.insomnia.rest/insomnia/get-started)

## Funcionamento

A API permite o cadastro de usuários, autenticação via token JWT (Json Web Token) e o gerenciamento de categorias e transações financeiras.
Principais endpoints:

- **POST /usuario**: Cadastrar um novo usuário.
- **POST /login**: Autenticar usuário e obter token.
- **GET /categoria**: Listar categorias.
- **GET /usuario**: Obter informações do usuário autenticado.
- **PUT /usuario**: Atualizar informações do usuário autenticado.
- **GET /transacao**: Listar todas as transações do usuário.
- **GET /transacao/extrato**: Obter o extrato de transações.
- **GET /transacao/:id**: Detalhar uma transação específica.
- **POST /transacao**: Cadastrar uma nova transação.
- **PUT /transacao/:id**: Atualizar uma transação existente.
- **DELETE /transacao/:id**: Excluir uma transação.

Para iniciar o servidor localmente, execute `npm run dev` e acesse `http://localhost:3000`.

## Documentações Adicionais

- **Bcrypt (https://www.npmjs.com/package/bcrypt):** 
- **Jsonwebtoken (https://www.npmjs.com/package/jsonwebtoken):**
- **Nodemon (https://www.npmjs.com/package/nodemon):**
- **PostgreSQL (https://www.postgresql.org/docs/):**
  
