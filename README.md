# Clínica+ | Sistema de Agendamento Médico

Sistema completo de agendamento médico com autenticação JWT, controle de permissões (Paciente/Admin) e painel administrativo.

Projeto desenvolvido com foco em prática de backend estruturado, segurança e organização de código.

---

# Tecnologias Utilizadas

Backend
- Node.js
- Express
- MySQL
- JWT (Autenticação)
- Bcrypt (Criptografia de senha)
- Validator (Validação de e-mail)

Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

---

 Funcionalidades

 Paciente
- Cadastro com validação de e-mail
- Login com geração de token JWT
- Agendar consulta
- Cancelar agendamento
- Visualizar seus próprios agendamentos

 Admin
- Acesso restrito via tipo de usuário
- Visualização de todos os agendamentos
- Alteração de status:
  - Agendado
  - Confirmado
  - Cancelado
  - Finalizado
- Dashboard com contadores de status

---

 Segurança Implementada

- Senhas criptografadas com bcrypt
- Proteção de rotas com middleware JWT
- Diferenciação de permissões por tipo de usuário
- Validação de e-mail no backend
- Controle de acesso ao painel admin

---

Estrutura do Projeto
backend/
├── routes/
├── middlewares/
├── db/
└── server.js

frontend/
├── admin/
├── auth/
├── paciente/
├── css/
└── js/

Banco de Dados

Banco MySQL com as seguintes tabelas principais:
- usuario
- medico
- agendamento
Relacionamentos com chave estrangeira para integridade dos dados.

---
Como Rodar o Projeto
1️⃣ Clone o repositório

git clone https://github.com/MarcusSilvaCode/agendamento-clinica.git

2️⃣ Instale as dependências
cd backend
npm install

3️⃣ Configure o .env
Crie um arquivo `.env` na pasta backend:
JWT_SECRET=sua_chave_super_secreta

4️⃣ Execute o servidor
node server.js

Servidor rodará em:
http://localhost:3000

---

Objetivo do Projeto

Este projeto foi desenvolvido para consolidar conhecimentos em:

- Autenticação e autorização
- Estruturação de backend profissional
- Organização MVC
- Segurança com JWT
- Controle de permissões
- Integração Frontend + Backend
- Boas práticas de API REST

---

Desenvolvido por

Marcus Silva  
Estudante de Sistemas de Informação  
Foco em Desenvolvimento Backend

---
