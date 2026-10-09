# AI usage record

This record distinguishes generated work from the parts I reviewed, changed, and wrote myself. Commit links point to the repository history so each account can be checked.

## How I used AI

### 1. Initial API structure

- **Tool:** Claude
- **Request:** Create an initial Express and Supabase API from the application's requirements.
- **Output:** A starting `server/server.js` containing explicit container and item routes.
- **What I kept or changed:** I kept the initial route structure after manually exercising it with an API client. I later revised validation, uploads, status handling, and authentication as the requirements developed.
- **Commit:** [7779e88](https://github.com/j-lim45/wheresmystuff/commit/7779e88)

### 2. First home-page implementation

- **Tool:** Claude
- **Request:** Create a bare-bones React home page based on my wireframe and design system.
- **Output:** React components and supporting frontend files for the home page.
- **What I kept or changed:** I kept the components that matched the wireframe, removed generated widgets that were outside its scope, and temporarily commented out unfinished parts before committing.
- **Commit:** [50dcaac](https://github.com/j-lim45/wheresmystuff/commit/50dcaac)

### 3. Image uploads and validation

- **Tool:** OpenAI Codex
- **Request:** Add image uploads for containers and items and improve backend input validation.
- **Output:** Supabase Storage upload logic, file checks, and a `validateEntry` helper in `server/server.js`.
- **What I kept or changed:** I kept the upload and validation implementation after manually testing the routes. I removed generated Playwright artifacts because they were not part of the submitted test setup.
- **Commit:** [6d42534](https://github.com/j-lim45/wheresmystuff/commit/6d42534)

### 4. Tailwind home-page redesign

- **Tool:** OpenAI Codex
- **Request:** Redesign the home page with Tailwind while retaining the wireframe and design-system decisions.
- **Output:** Updated JSX, Tailwind classes, navigation, cards, and shared inventory retrieval code.
- **What I kept or changed:** I retained the useful sidebar, cards, and counters. I removed filler sections, returned the search bar to the wireframe's header position, and merged unnecessary component splits such as the original two-file store implementation.
- **Commit:** [e56309d](https://github.com/j-lim45/wheresmystuff/commit/e56309d)

### 5. Create/edit form

- **Tool:** OpenAI Codex
- **Request:** Design a shared Tailwind form for creating and editing items and containers.
- **Output:** A modal-based `EntryForm` with reusable item/container fields.
- **What I kept or changed:** I kept the shared modal and field structure, removed explanatory text that cluttered the form, and adjusted labels to match the language used elsewhere in the application.
- **Commit:** [338f46e](https://github.com/j-lim45/wheresmystuff/commit/338f46e)

### 6. Item detail page and cards

- **Tool:** OpenAI Codex
- **Request:** Build the Tailwind item detail page and item-card components.
- **Output:** `ItemPage.jsx` and item-card presentation code.
- **What I kept or changed:** I removed generated header/footer text that was not in my design and changed the favourite heart from orange to red. I retained the detail layout and reusable card implementation.
- **Commit:** [1294889](https://github.com/j-lim45/wheresmystuff/commit/1294889)

## Where the AI got it wrong

### 1. It departed from the wireframe

- **AI output:** The generated home page included an extra all-items section, filler text, and a search bar outside the header.
- **Problem:** Those choices contradicted my wireframe and made the overview more crowded than intended.
- **Fix:** I removed the extra content and moved the search bar into the header, while keeping the sidebar and useful item/container counters.
- **Commit:** [e56309d](https://github.com/j-lim45/wheresmystuff/commit/e56309d)

### 2. It used conflicting server ports

- **AI output:** Generated setup and configuration references alternated between ports `3000` and `5000`.
- **Problem:** The client instructions and Express process could point at different ports, causing requests to fail even while both processes appeared to run.
- **Fix:** I searched the project for port `3000` and standardized the API and documentation on port `5000`.
- **Commit:** [4e74d2e](https://github.com/j-lim45/wheresmystuff/commit/4e74d2e)

### 3. It mixed module systems

- **AI output:** One version of `server/server.js` mixed CommonJS `require` calls with ES module `import` syntax.
- **Problem:** The project declares `"type": "module"`, so the mixed syntax produced module/import errors when the application was built and run.
- **Fix:** I made the server consistently use ES module imports and verified that the start script could load it.
- **Commit:** [0257be8](https://github.com/j-lim45/wheresmystuff/commit/0257be8)

## Who wrote what

### Parts I wrote or substantially directed

- **Backend route behaviour — `server/server.js`, [7779e88](https://github.com/j-lim45/wheresmystuff/commit/7779e88):** I worked on the explicit CRUD route behaviour, including reading parameters and request bodies, performing Supabase operations, and returning HTTP responses. The initial scaffold was AI-generated, and I do not claim the later AI-assisted upload and validation helper as solely mine.
- **Frontend API wrapper — `client/src/api.js`, [7779e88](https://github.com/j-lim45/wheresmystuff/commit/7779e88):** I wrote the shared request flow used by the React pages. It centralizes URLs, JSON parsing, non-success errors, and `204 No Content` handling. The later `uploadImage` function was AI-assisted.
- **Search state — `client/src/App.jsx`, `client/src/HomePage.jsx`, and `client/src/ContainerPage.jsx`, [e56309d](https://github.com/j-lim45/wheresmystuff/commit/e56309d):** I connected the `search` state in the application shell to the search field and passed it into the active page. The pages normalize the query and filter names, descriptions, locations, and container names before rendering cards.
- **Container-page layout adjustments — `client/src/ContainerPage.jsx`, [61bf60a](https://github.com/j-lim45/wheresmystuff/commit/61bf60a):** I selected and adjusted the responsive grid, spacing, text wrapping, and card layout by reusing the project's established Tailwind patterns.
- **Favourite-heart colour — `client/src/components/ItemCard.jsx`, [1294889](https://github.com/j-lim45/wheresmystuff/commit/1294889):** I changed the active heart from orange to solid red and retained a neutral outline for items that are not favourites.

### AI-written piece I can explain

- **Validation helper — `server/server.js`, [6d42534](https://github.com/j-lim45/wheresmystuff/commit/6d42534):** Codex helped write `validateEntry`. It rejects missing or overlong names, limits description and location lengths, permits only HTTP(S) image URLs, and requires a Boolean favourite value. Create and update routes call it before querying Supabase and return `400` when it reports a validation message. I kept it after testing representative valid and invalid bodies because server-side validation protects the API even when requests do not come from the React form.
- **Tailwind presentation — most `client/src/**/*.jsx` files, especially [e56309d](https://github.com/j-lim45/wheresmystuff/commit/e56309d), [338f46e](https://github.com/j-lim45/wheresmystuff/commit/338f46e), and [1294889](https://github.com/j-lim45/wheresmystuff/commit/1294889):** AI produced much of the responsive Tailwind styling. The `flex` and `grid` utilities choose layout modes, `gap` and padding utilities establish spacing, breakpoint prefixes change layouts at larger widths, and colour/border utilities create the visual hierarchy. I reviewed the result against my wireframe, removed additions outside the design, and changed individual classes where needed.

## Final review note

The latest security, schema, documentation, and automated-test repairs were made with OpenAI Codex in the final review session. Add the resulting commit link here after committing these changes so the record remains auditable.
