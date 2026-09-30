# WheresMyStuff

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
```

5. Run the API with `npm run api`
6. Create/Split a new terminal then run the app with `npm run dev`
7. Open the app in the browser using the link `http://localhost:5173/`


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