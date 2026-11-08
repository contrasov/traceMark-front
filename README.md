# traceMark

<div align="center">

![Vue](https://img.shields.io/badge/Vue.js-3-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vue Router](https://img.shields.io/badge/Vue_Router-4-EA4AAA?style=for-the-badge&logo=vuerouter&logoColor=white)

</div>

**traceMark** é uma rede social focada em publicar imagens de fotógrafos autônomos que registram corridas de rua.

Projeto desenvolvido para o trabalho de nuvem.

## Como rodar

Pré-requisitos: Node.js ≥ 20.19 e a [tracemark-api](../tracemark-api) rodando (padrão `http://localhost:3333`).

```bash
npm install
cp .env.example .env.local   # ajuste VITE_API_URL se a API estiver em outro endereço
npm run dev                  # http://localhost:5173
```

| Script | Função |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checagem de tipos + build de produção (`dist/`) |
| `npm run preview` | Serve o build de produção |

## Ambiente completo local

Para testar com upload real e marca-d'água, suba os três repositórios:

```bash
# tracemark-api
docker compose --profile storage up -d --wait && npm run db:migrate && npm run storage:setup && npm run dev
# tracemark-worker
docker compose up -d --wait && npm run dev          # Worker
npm run dev:s3-events                               # emula o evento S3 → Lambda (outro terminal)
# traceMark-front
npm run dev
```

Crie uma conta de **Fotógrafo** para publicar e outra de **Corredor** para ver o mural com marca-d'água.

## Organização

| Pasta | Responsabilidade |
|---|---|
| `src/api/` | Cliente HTTP e funções de cada recurso da API (`auth`, `users`, `photos`, `feed`, `comments`, `notifications`) |
| `src/store/` | Estado global: sessão, notificações, tema e eventos do mural |
| `src/composables/` | `usePolling`: atualização periódica do mural e das notificações |
| `src/pages/` | Telas (mural, foto, perfil, usuário, notificações, configurações, login/cadastro) |
| `src/components/` | Componentes reutilizáveis |

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL da API |
| `VITE_POLLING_INTERVAL_MS` | Intervalo de atualização do mural e das notificações (padrão 10000) |
| `VITE_MAX_PHOTOS_PER_UPLOAD` | Fotos por publicação; deve ser igual ao `MAX_PHOTOS_PER_UPLOAD` da API |
