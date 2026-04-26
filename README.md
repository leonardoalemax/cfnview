# cfnview - Visualizador de Batalhas Street Fighter

Este projeto é uma aplicação Next.js que permite aos usuários inserir seu ID do Street Fighter, buscar dados paginados de batalhas via API, armazenar em cache no Firebase, e exibir uma listagem das batalhas.

## Tecnologias

- Next.js 13 com App Router
- TypeScript
- Tailwind CSS
- DaisyUI
- Firebase Firestore

## Começando

Primeiro, instale as dependências:

```bash
yarn install
```

Então, execute o servidor de desenvolvimento:

```bash
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para ver o resultado.

## Configuração do Firebase

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Deploy

O jeito mais fácil de fazer deploy da sua app Next.js é usar a [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) dos criadores do Next.js.

Confira nossa [documentação de deploy do Next.js](https://nextjs.org/docs/deployment) para mais detalhes.
