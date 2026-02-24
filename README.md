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
![10acb407-b714-42eb-ae60-8c18c1a4b45a](https://github.com/user-attachments/assets/c52d9232-ed42-4ad3-ae10-b9b2ecf23607)
![2b9a7fe6-bf5a-4b68-a976-4775a54d5c45](https://github.com/user-attachments/assets/8c3c9468-1aab-4ada-af07-eb9df0f39950)
![07773e0c-2b23-4f67-b74c-15a059d4e158](https://github.com/user-attachments/assets/93837807-b78b-4b0c-bd2d-66770229703a)




Estudante de Sistemas de Informação  
Foco em Desenvolvimento Backend

---
