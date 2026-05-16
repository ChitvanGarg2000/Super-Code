## SuperCode Editor

SuperCode Editor is an authenticated AI-assisted playground for building and running starter apps inside the browser. It combines a project dashboard, Monaco-based code editing, WebContainer-powered previews, and Prisma-backed persistence for saved playgrounds.

## Features

- Sign in with Google or GitHub using NextAuth.
- Create, update, duplicate, and delete playgrounds from the dashboard.
- Start from framework templates including React, Next.js, Express, Vue, Hono, Angular, and SvelteKit.
- Edit files with Monaco Editor and language-aware syntax highlighting.
- Run projects in an in-browser WebContainer preview with an integrated terminal.
- Persist playground metadata and file contents in MongoDB through Prisma.

## Tech Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4 and Radix UI / shadcn-style components
- Prisma 6 with MongoDB
- NextAuth v5
- Monaco Editor, WebContainer API, Xterm.js

## Getting Started

### Prerequisites

- Node.js 20 or newer
- pnpm, npm, yarn, or bun
- A MongoDB database connection string
- GitHub OAuth app credentials
- Google OAuth client credentials

### Environment Variables

Create a `.env` file in the project root with the following values:

```bash
DATABASE_URL=
AUTH_SECRET=
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_SECRET=
```

### Install and Run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` in your browser.

## Deployment

- **EC2 (Docker):** see [`EC2_DOCKER_DEPLOYMENT.md`](./EC2_DOCKER_DEPLOYMENT.md)
- **AWS Amplify:** see [`AWS_AMPLIFY_DEPLOYMENT.md`](./AWS_AMPLIFY_DEPLOYMENT.md)

## Available Scripts

- `pnpm dev` - start the development server.
- `pnpm lint` - run ESLint.
- `pnpm generate` - generate the Prisma client and apply the local Prisma import fix.
- `pnpm build` - generate Prisma client, fix imports, and build the app.
- `pnpm build:with-db` - generate Prisma client, fix imports, push Prisma schema, and build the app.
- `pnpm start` - start the production server.

## Project Structure

- `app/` - App Router routes, layouts, landing page, auth screens, dashboard, and playground pages.
- `features/auth/` - sign-in helpers, session helpers, and auth UI.
- `features/dashboard/` - playground management actions and dashboard components.
- `features/playground/` - file explorer, editor, save/load hooks, and playground actions.
- `features/web-containers/` - browser terminal and preview integration.
- `components/` - shared UI components and modal dialogs.
- `lib/` - Prisma client and shared utilities.
- `prisma/schema.prisma` - MongoDB data model for users, accounts, playgrounds, template files, and star marks.
- `supercode-starters/` - starter templates used to generate playground file trees.

## How It Works

1. The landing page routes users into the dashboard.
2. The dashboard lets authenticated users create a playground from a template or open an existing one.
3. Opening a playground loads template structure data, initializes the file explorer, and boots a WebContainer preview.
4. Edits are made in Monaco Editor, saved back through Prisma, and reflected in the generated playground state.

## Notes

- Playground template JSON is generated from the matching folder inside `supercode-starters/`.
- The build step runs `prisma generate`, applies the local Prisma import fix, and then builds Next.js.
- If you need to push the Prisma schema to the database, use `pnpm build:with-db` (or run `pnpm exec prisma db push` separately).
- Authenticated routes are protected by middleware, and `/auth/sign-in` is the public sign-in page.
