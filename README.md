# WheresMyStuff

[![Made with AI](https://img.shields.io/badge/Made_with-AI_assistance-blue)](AI-USAGE.md)

WheresMyStuff is a full-stack inventory tracker for recording which storage container holds an item. It supports container and item CRUD operations, search, favourites, image uploads, responsive pages, and an application-wide password gate.

Built with assistance from Claude and OpenAI Codex. The requests, edits, mistakes, and authorship breakdown are documented in [AI-USAGE.md](AI-USAGE.md). Security controls and evidence are documented in [SECURITY-CHECKLIST.md](SECURITY-CHECKLIST.md).

## Technology

- React, React Router, Vite, and Tailwind CSS
- Node.js and Express
- Supabase PostgreSQL and Storage
- HTTP Basic Authentication over HTTPS

## Setup

Requirements: Node.js 20 or newer, npm, and a Supabase project.

1. Clone the repository and run `npm install`.
2. In the Supabase SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). This creates the tables, constraints, indexes, RLS configuration, and image bucket.
3. Copy `.env.example` to `.env` and replace every placeholder:

```dotenv
SUPABASE_URL="your Supabase project URL"
SUPABASE_SERVICE_ROLE_KEY="your server-only service-role key"
BASIC_AUTH_USERNAME="your chosen username"
BASIC_AUTH_PASSWORD="a strong unique password"
CLIENT_ORIGIN="http://localhost:5173"
PORT="5000"
```

The service-role key must only be used by the Express server. Never put it in a `VITE_` variable, browser code, Git, or a public hosting setting.

4. Start the API with `npm run api`.
5. In another terminal, start the client with `npm run dev`.
6. Open `http://localhost:5173` and enter the Basic Auth credentials.

For a production-style local run, use `npm run build` followed by `npm start`, then open `http://localhost:5000`. Deploy the combined Node app on an HTTPS host; do not deploy `client/dist` alone because that would bypass the access gate.

## Verification

Run all static checks, API tests, and the production build:

```bash
npm run check
```

`GET /api/health` is protected by the same access gate as every other route and returns `200` only when the database query succeeds. It returns `503` when the database is unavailable.

## API

| Method | Route | Purpose | Success |
| --- | --- | --- | --- |
| GET | `/api/health` | Check API and database | `200` |
| GET/POST | `/api/containers` | List or create containers | `200`/`201` |
| GET/PUT/DELETE | `/api/containers/:id` | Read, replace, or delete a container | `200`/`204` |
| GET/POST | `/api/items` | List or create items | `200`/`201` |
| GET/PUT/DELETE | `/api/items/:id` | Read, replace, or delete an item | `200`/`204` |
| PATCH | `/api/items/:id/favorite` | Change favourite state | `200` |
| POST | `/api/uploads?kind=item` | Upload a validated image up to 5 MB | `201` |

Invalid input returns `400`, missing records return `404`, a non-empty container returns `409` when deletion is attempted, and unexpected database failures return a generic `500` response.

## Usage

- The overview displays containers and favourite items.
- Search filters the currently displayed inventory.
- Open a container to inspect its contents.
- Use **Add Container** or **Add Item** to create records and optionally upload an image.
- Open an item to edit, favourite, move, or delete it.

## Security and deployment

- Keep production credentials only in the hosting provider's encrypted environment settings.
- Put the grader's private credentials in the private workspace `project/README.md`; never commit them here.
- Set `CLIENT_ORIGIN` to the exact production origin and use HTTPS.
- RLS is enabled with no public table policies. The trusted server performs database work with its server-only service-role key after Basic Auth succeeds.
- Rotate any credential immediately if it is ever committed or shared publicly.
