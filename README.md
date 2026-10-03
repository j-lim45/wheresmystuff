# WheresMyStuff

[![Made with AI](https://img.shields.io/badge/Made_with-AI_assistance-blue)](AI-USAGE.md)

## 1. Overview

WheresMyStuff is a tracker app that lets users keep track of where they put their things inside different storage containers. It is designed for organized people who store many items across different containers and want an easy way to find them.

## 2. Setup and Installation

### Prerequisites

Install the following before running the project:

- Node.js
- npm

Check external resources on how to install the dependencies.    

1. Download the repository or clone it using Git
2. Open the project folder in a terminal
3. Run `npm install`
4. Create an `.env` file in the project folder and add these lines

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
BASIC_AUTH_USERNAME=your_chosen_username
BASIC_AUTH_PASSWORD=your_chosen_password
```

5. Run the API with `npm run api`
6. Create/Split a new terminal then run the app with `npm run dev`
7. Open the app in the browser using the link `http://localhost:5173/`

Build with `npm run build` and start with `npm start`. Express serves both the
frontend and API on `PORT` (default `5000`), behind HTTP Basic Authentication.
Deploy this Node app on an HTTPS host; do not deploy the frontend separately as
a public static site. Leave `VITE_API_URL` unset so requests use the same origin.

Set `SUPABASE_URL`, `SUPABASE_KEY`, `BASIC_AUTH_USERNAME`, and
`BASIC_AUTH_PASSWORD` in your hosting provider's environment settings. Missing
login credentials prevent the server from starting. Usernames cannot contain
a colon. The browser asks for credentials when you open the hosted app.
See [MDN's HTTP authentication guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication).

Keep the actual login credentials in your private workspace `project/README.md`
and share that file privately with the grader. The `project/` directory and local
`.env` files are ignored by Git. Never add real credentials to this README or
force-add ignored files. Vite's development server is for local use only; use
the Express server for the protected deployment.

## 3. Features and Usage

### Home Page

The Home Page displays all containers and favorited items.

- Use the search bar to find things.
- View containers through container cards.
- Select **Add Container** to create a container.
- View favorited items through item cards.

### Container Page

The Container Page shows all items stored inside a selected container.

- View container information.
- View the items inside the container.
- Select **Add Item** to add an item.
- Select an item to view or edit it.

### Create Item

Allows the user to create a new item by entering information such as its name, description, and container/location.

### Create Container

Allows the user to create a new storage container by entering its name, description, and location.

### Edit Item

Allows the user to update information about an existing item and save the changes.

## 4. Screenshots

### Home Page



### Container Page



### Create/Edit Forms
