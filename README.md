# APLICAÇÃO PARA GERENCIAMENTO DE AÇÕES BASEADAS EM METAS ESTRATÉGICAS DE SEGURANÇA

Aplicação completa para registrar ações, acompanhar status, progressos e métricas ligadas aos frameworks NIST CSF e ISO 27001. O backend usa Node.js/Express com MongoDB; o frontend é React (Vite) com Tailwind.

## Requisitos
- Node.js 18+ e npm
- MongoDB em execução local ou em URL acessível

## Clonar o projeto
```bash
git clone <sua-url-do-repo> sgsi
cd sgsi
```

## Configurar o backend
1) Entre em `backend` e instale dependências:
```bash
cd backend
npm install
```
2) Crie um arquivo `.env` dentro de `backend` com, no mínimo:
```
PORTA=8000
MONGO_ACCESS=mongodb://localhost:27017/sgsi
JWT_ACCESS=uma_senha_secreta
TOKEN_ADMIN=token_para_criar_admins
CLIENT_URL=http://localhost:5173
```
3) Suba o servidor (usa nodemon no modo dev):
```bash
npm run dev
# ou
npm start
```
O backend ficará disponível em `http://localhost:8000` (mantenha alinhado com `PORTA`).

## Configurar o frontend
1) Em outro terminal, vá para `frontend/SGSI` e instale dependências:
```bash
cd ../frontend/SGSI
npm install
```
2) Ajuste o arquivo `src/utils/apiUrl.js` se o backend não estiver em `http://localhost:8000`.
3) Rode o cliente:
```bash
npm run dev
```
O Vite sobe em `http://localhost:5173` por padrão.

## Fluxo básico de uso
- Crie ou cadastre um usuário admin usando `TOKEN_ADMIN` no cadastro.
- Acesse o frontend, faça login, crie clientes e ações.
- O dashboard exibirá contagens, progresso por framework, funções NIST e controles ISO 27001.

## Estrutura
- `backend/`: API Express, autenticação JWT, uploads, rotas de ações, usuários e empresas.
- `frontend/SGSI/`: React + Vite, telas de Dashboard, Ações, NIST CSF, ISO 27001 e Kanban.
