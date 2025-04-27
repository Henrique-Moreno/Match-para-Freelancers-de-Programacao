# Match para Freelancers de Programação

## Descrição do Projeto

O *Match para Freelancers de Programação* é uma plataforma web que conecta clientes a freelancers de programação, permitindo a criação e gerenciamento de projetos. Utiliza um backend em Python com Flask, um frontend em React com TypeScript, e SQLite para persistência de dados. Clientes publicam projetos, freelancers enviam propostas, e administradores gerenciam usuários e processos.

## Backend

O backend foi desenvolvido em Python com Flask, organizado em camadas para modularidade. A pasta `app` contém subdiretórios como `controllers` (`ClientController`, `FreelancerController`, `AdminController`) para gerenciar rotas (`/client/login`, `/admin/projects`), `services` para lógica de negócio (ex.: validação de credenciais), `models` para entidades (ex.: `User`, `Project`, `Proposal`) com SQLAlchemy, e `routes` para organizar blueprints. A autenticação usa tokens JWT, garantindo que clientes criem projetos, freelancers enviem propostas e administradores gerenciem o sistema.

## Frontend

O frontend foi construído com React, TypeScript, HTML e CSS, usando Vite. A pasta `src` organiza as telas em `pages` ( `sign.tsx` para login de clientes/freelancers, `AdminSign.tsx` para administradores, `ClientDashboard.tsx`, `FreelancerDashboard.tsx`, `AdminDashboard.tsx`) e componentes reutilizáveis em `components` (`Button.tsx`, `HeaderLinkButton.tsx`). A pasta `api` contém `axios.ts`, que gerencia requisições HTTP ao backend, incluindo tokens JWT para autenticação. O frontend permite que clientes criem projetos, freelancers enviem propostas e administradores gerenciem dados, com atualizações dinâmicas via API.

## Como Rodar o Projeto

### Pré-requisitos

- **Python 3.8+**: Baixe e instale em [python.org](https://www.python.org/downloads/).
- **Node.js 16+**: Baixe e instale em [nodejs.org](https://nodejs.org/).
- **Git**: Para clonar o repositório (opcional).

### Backend

1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```
2. Crie um ambiente virtual:
   ```bash
   python -m venv venv
   ```
3. Ative o ambiente virtual:
   - No Windows:
     ```bash
     venv\Scripts\activate
     ```
   - No Linux/Mac:
     ```bash
     source venv/bin/activate
     ```
4. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
5. Execute o servidor Flask:
   ```bash
   python run.py
   ```
   O backend estará rodando em `http://localhost:8080`.

### Frontend

1. Navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   O frontend estará rodando em `http://localhost:5173`.

## Resumo

O *Match para Freelancers de Programação* facilita a conexão entre clientes e freelancers, com suporte para publicação de projetos, envio de propostas e administração. O backend gerencia lógica e segurança com Flask e JWT, o frontend oferece uma interface responsiva com React, e o SQLite armazena os dados.