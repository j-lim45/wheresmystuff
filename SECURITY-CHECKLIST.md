# Security checklist

## Anything I found and fixed

This review showed me that the server could start without Basic Auth credentials and that its health route did not actually test the database connection. I changed startup to require both gate credentials, made credential comparison timing-safe, and updated the health route to return success only after a database query succeeds. I also added server-side UUID and container-ID validation and automated checks for unauthenticated requests and invalid input.

## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | Yes | `.gitignore` contains `.env`; `git check-ignore -v .env` confirms the rule and `git ls-files .env` returns nothing. |
| 2 | A `.env.example` with placeholder values only is committed | Yes | The tracked `.env.example` contains placeholder credentials and non-secret localhost/port defaults only. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | Yes | Credentials are read through `process.env`; the only literal test password is isolated mock data in `server/server.test.js`. |
| 4 | Git history is clean: I searched `git log -p` for password, secret, api key and `postgres://` | Yes | The history search found configuration names and placeholders but no credential value or PostgreSQL connection string. |
| 5 | Any credential that was ever committed has been rotated | N/A | No real credential was found in tracked files or Git history, so there is no known committed credential to rotate. |
| 6 | Production credentials live only in my hosting provider's environment settings | No | The repository is prepared for environment variables, but the hosting provider's private settings cannot be verified from this clone. |

## GitHub Actions

This project has no `.github/workflows` directory, so every row in this section is marked N/A.

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 7 | No secret value is written literally in any workflow YAML file | N/A | There are no GitHub Actions workflow YAML files. |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | N/A | No workflow reads credentials because the project has no workflows. |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and I opened a recent run's log to confirm | N/A | There are no workflow steps or run logs to inspect. |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | N/A | No workflow creates or uploads build artifacts. |
| 11 | Third-party actions are pinned to a commit SHA, not a moveable tag | N/A | No first-party or third-party actions are configured. |
| 12 | Secret scanning and push protection are enabled on the repository | N/A | Per this section's instruction, this is N/A because the project has no workflows; repository-level protection should still be checked manually. |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Every query taking user input uses parameters, never string concatenation | Yes | `server/server.js` supplies values to Supabase `.eq()`, `.insert()`, and `.update()` methods and never constructs SQL strings. |
| 14 | The database is not open to the whole internet, or is reachable only by the app | Yes | `supabase/schema.sql` enables RLS on both tables and creates no anonymous/public table policies. |
| 15 | The database user the app connects as has only the permissions it needs | No | The Express server currently uses a Supabase service-role key, which is server-only but broader than a least-privilege database role. |
| 16 | Seed and sample data is invented, not real people's data | N/A | The schema creates no seed or sample records. |
| 17 | Debug, seed and reset routes are removed before going public | Yes | `server/server.js` defines only health, upload, inventory CRUD, static-file, and not-found routes. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | Yes | `createApp` installs HTTP Basic Authentication before registering any API or static-file route. |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on, and I tested it signed out | No | RLS is enabled in `supabase/schema.sql`, but a signed-out test against the deployed Supabase project has not been recorded here. |
| 20 | If Zero Trust: tjakoen.s@gmail.com is on the access policy. If an app password: the credentials are in my private workspace `project/README.md` | No | This app uses a password gate, but `project/README.md` is not present in this workspace. |
| 21 | The gate covers every route, including the ones that only change data | Yes | Authentication middleware precedes every route, and `server/server.test.js` confirms that a request without credentials receives `401`. |
| 22 | The credentials for the gate are environment variables, not in source | Yes | `server/server.js` reads `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` from the environment and refuses startup when either is missing. |

## Input and output

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 23 | Input from the user is validated on the server, not only in the browser | Yes | Express validates required fields, lengths, URL protocols, UUIDs, Booleans, upload size, MIME allowlists, and image signatures. |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | Yes | React renders stored values as JSX text, and `client/src` contains no `dangerouslySetInnerHTML` or raw HTML insertion. |
| 25 | Error responses do not expose stack traces, file paths or connection details | Yes | API handlers return fixed generic messages and never serialize caught database errors, stack traces, or `error.message`. |
| 26 | CORS is not a wildcard on routes that change data | Yes | `server/server.js` restricts CORS to `CLIENT_ORIGIN`, defaulting to the exact local Vite origin. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | Yes | Searches of tracked project text and commit subjects/bodies found none of these identifiers. |
| 28 | No classmate's personal data in the repository | Yes | The repository contains application code, generic documentation, and no classmate records or identifying sample data. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | Yes | `package-lock.json` resolves packages from `registry.npmjs.org`, and `.gitignore` excludes `node_modules`. |
| 30 | Images, fonts and other assets are mine, licensed, or credited | No | The origin or licence of every image and SVG is not documented in the repository yet. |
| 31 | Repository visibility is deliberate, and I checked it after my last push | No | The remote is `j-lim45/wheresmystuff`, but its current visibility and a post-push check cannot be verified locally. |
