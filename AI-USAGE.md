# AI-USAGE.md

## How I used AI

### Entry 1
- 09/27/2026 using Claude
- Give an intial API backend file based on the initial requirements of the application (see attached files)
- A modified `server.js` file
- Since the backend is mostly placeholder for now, I kept all of it, while I tested the backend routes using an API client. Requirements will change as the app is developed
- Commit hash 7779e88

### Entry 2
- 09/26/2026 using Claude
- Give a barebones Home Page UI based on the attached Wireframe and Design System file
- Window files and React components for the Home Page
- All the files that were still visible in the added files in the commit were kept, other files such as widgets not included in the wireframe were removed, and certain components were commented out in the home page before they were added in the repository
- Commit hash 50dcaac

### Entry 3
- 09/30/2026 using Codex
- Improve the backend API by adding the upload image feature for both containers and items
- A modified `server.js` file with image upload baked into existing functions and better input validation
- Everything from the file was kept after manually testing the routes, removed some Playwright tests artifacts, since it seems satisfactory enough for my use case
- Commit hash 6d42534

### Entry 4
- 09/30/2026 using Codex
- Redesign the Home Page UI using the Tailwind framework while still maintainting most of the Wireframe and Design System aspects as well
- Modified JSX files and an added function that facilitates retrieval of items and containers in a separate file
- Components and design aspects that match the actual wireframe was kept, since generated files do not 100% follow the actual wireframe. Sidebar element was kept however, while multiple that could work as one file were merged, such as Store.jsx which originally was two separate files, to have less bloated file quantities
- Commit hash e56309d

### Entry 5
- 10/01/2026 using Codex
- Design the Create/Edit entry form component using Tailwind
- A modal component using TailwindCSS elements in the entry form file
- Some text elements that seemed like clutter in the form was removed, some text were adjusted to fit what I want to display
- Commit hash 338f46e

### Entry 6
- 10/01/2026 using Codex
- Design the item page components using Tailwind
- JSX files for the item page and cards
- Text elements that were not supposed to be there (additional components added by AI) were removed like header and footer text. Color of heart icon was changed to reflect wireframe more. Everything else was kept.
- Commit hash 1294889

## Where the AI got it wrong
- e56309d: The AI doesn't seem to follow the wireframe strictly. It tries to make its own version by adding some elements it thinks it should be in. Although the raw version of the frontend without human intervention is not in the actual commit, elements such as text filler or unneccessary elements such as all items section in home page were added, which were then removed after further checking. The search bar was also in the wrong place, not being in the header. It was then moved to the header in line with the wireframe. Some elements such as the sidebar and container/item counter were kept.
- 4e74d2e: The AI gave conflicting numbers on the port for the Express app to listen to. In some instances, the .env file was pointing to port 5000, while the app was actually listening to port 3000. I searched for every instance that listed port 3000 and and changed it to 5000 to resolve port conflicts.
- 0257be8c: The AI was inconsistent on the import style in one file, specifically in `server.js`, since it used both CommonJS and ESM for importing modules. This was fixed manually after building the app and receving import conflict errors.

## Who wrote what (30 points)

### Backend API routes
  - File: server/server.js
  - Commit: 7779e88
  - I wrote the main API routes for creating, retrieving, updating, and deleting containers and items. These routes read request parameters and bodies, perform the corresponding Supabase queries, handle database errors, and return suitable HTTP status codes. I kept each operation as an explicit Express route because this makes the behaviour of each endpoint straightforward to follow and test. The image-upload logic and the later validateEntry helper were AI-assisted and are not included in my claim for this part.
### Frontend API interface
  - File: client/src/api.js
  - Commit: 7779e88
  - I wrote the shared request function and the API methods used for containers, items, and favourites. The shared function sends requests, converts successful responses from JSON, handles 204 No Content, and turns unsuccessful responses into errors that the interface can display. I structured the file this way so that React components do not need to repeat URLs, HTTP methods, JSON conversion, and error handling. The uploadImage function was AI-written and is not included as my own work.
### Search state and its connection to the pages
  - File: (Most .jsx files that uses states)
  - Commit: Most commits committing said .jsx files
  - I wrote the state declarations such as const [search, setSearch] = useState('') and connected this value to the search bar and page components. For the home page, since the 
### Container page layout adjustments
  - File: client/src/ContainerPage.jsx
  - Commit: 61bf60a
  - I adjusted the Container page by reusing Tailwind classNames from other parts of the project and testing which combinations worked with the container page. These classes control the responsive two-column container summary, spacing, text wrapping, and item-card grid. Reusing established classes keeps the Container page visually consistent with the rest of the application instead of introducing a separate styling pattern.
### Favourite-heart colour
  - File: client/src/components/ItemCard.jsx
  - Commit: 1294889
  - I changed the favorited heart from orange colour, text-[#f0b66d], to text-red-500. When an item is favorited, the icon uses fill="currentColor", so the heart becomes solid red. When it is not favorited, it uses text-stone-200 with fill="none", producing a neutral outlined heart. I made this change because originally I thought of the heart icon should be red and not orange as generated. The wireframe did not show it but I had it in mind when designing it.
### Entry validation helper
  - File: server/server.js
  - Commit: 6d42534
  - The AI helped write the validateEntry function, adding more edge cases and making it clean, such as the HTTP checker and boolean checker, and I kept it after reviewing and testing its behaviour. It checks that the name exists, is text, and is no longer than 120 characters. It also limits descriptions to 2000 characters and locations to 200 characters. If an image URL is provided, it verifies that the value is a valid URL using either HTTP or HTTPS. It also confirms that is_favorited, when supplied, is a Boolean rather than an arbitrary value. Through an API client, it also returned a specific error message when validation fails and returns null when the input is valid. The create and update routes call it before sending information to Supabase and returns code 400 if it finds a problem. I kept this implementation because it covers invalid input scenarios that I had not initially considered, since I was not familiar with all of the possible test cases that might happen
### Tailwind CSS
  - File: (Most classNames and CSS)
  - Commit: Most .jsx files containing Tailwind
  - Most of the Tailwind styling in the project was generated with AI assistance. This includes the responsive layouts, spacing, colours, borders, typography, modal presentation, cards, navigation elements, buttons, and form controls. I made sure that it matches closely the wireframe made through Figma, and some design system elements if it still looked valid. I reviewed the generated classes, removed unnecessary interface elements, and modified parts that did not match my wireframe or strayed much from the intended design. I kept its implementation since Tailwind is a common and widely used CSS framework for responsive styling. The keywords `flex`, `gap`, and `grid` are common responsive attributes carried over from Vanilla CSS, and alignment keywords such as `justify-center` and `items-center` are also based on flexbox.